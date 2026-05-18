import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Admin client to bypass RLS (this route is called by DB trigger, not a user)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Fetch GitHub Data (same logic as main mine route) ───────────────
async function fetchGitHubData(username: string) {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  };

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
    { headers }
  );
  if (!reposRes.ok) throw new Error(`GitHub API failed: ${reposRes.status}`);
  const repos = await reposRes.json();

  const repoData = await Promise.all(
    repos.slice(0, 20).map(async (repo: Record<string, any>) => {
      try {
        const langRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/languages`,
          { headers }
        );
        const languages = langRes.ok ? await langRes.json() : {};
        return {
          name: repo.name,
          description: repo.description || '',
          languages: Object.keys(languages),
          languageBytes: languages,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          topics: repo.topics || [],
          is_fork: repo.fork,
          updated_at: repo.pushed_at,
        };
      } catch {
        return { name: repo.name, languages: [], languageBytes: {}, description: '' };
      }
    })
  );

  const eventsRes = await fetch(
    `https://api.github.com/users/${username}/events/public?per_page=100`,
    { headers }
  );
  const events = eventsRes.ok ? await eventsRes.json() : [];
  const pushEvents = events
    .filter((e: Record<string, string>) => e.type === 'PushEvent')
    .slice(0, 30);

  const languageTotals: Record<string, number> = {};
  for (const repo of repoData) {
    if (repo.languageBytes) {
      for (const [lang, bytes] of Object.entries(repo.languageBytes as Record<string, number>)) {
        languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
      }
    }
  }

  const allTopics = [...new Set(repoData.flatMap(r => (r.topics as string[]) || []))];
  const ownedRepos = repoData.filter(r => !r.is_fork);
  const forkedRepos = repoData.filter(r => r.is_fork);
  const ownedStars = ownedRepos.reduce((acc, r) => acc + (r.stars as number || 0), 0);

  // Fetch READMEs for top 3 owned repos (by stars/activity)
  const topOwnedRepos = [...ownedRepos]
    .sort((a, b) => (b.stars as number) - (a.stars as number))
    .slice(0, 3);
    
  const readmes = await Promise.all(
    topOwnedRepos.map(async (repo) => {
      try {
        const readmeRes = await fetch(
          `https://api.github.com/repos/${username}/${repo.name}/readme`,
          { headers }
        );
        if (!readmeRes.ok) return { repo: repo.name, content: 'No README found.' };
        const readmeData = await readmeRes.json();
        const decodedContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
        return { repo: repo.name, content: decodedContent.substring(0, 1500) }; // Truncate to save tokens
      } catch {
        return { repo: repo.name, content: 'Error fetching README.' };
      }
    })
  );

  return {
    repos: repoData,
    repoCount: repos.length,
    ownedReposCount: ownedRepos.length,
    forkedReposCount: forkedRepos.length,
    ownedStars,
    pushEventsCount: pushEvents.length,
    languageTotals,
    topics: allTopics,
    readmes,
  };
}

// ── Call Groq AI ────────────────────────────────────────────────────
async function extractSkillsWithGroq(githubData: Record<string, any>) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error('GROQ_API_KEY not set');

  const prompt = `You are a STRICT, unforgiving senior developer auditor for TRUU — an AI-powered developer verification platform.
Your job is to protect the credibility of the platform. You must ruthlessly scrutinize the following GitHub data and extract ONLY genuinely proven technical skills.

**GitHub Data:**
- Total Owned Repositories: ${githubData.ownedReposCount}
- Total Forked Repositories: ${githubData.forkedReposCount}
- Total Stars on Owned Repositories: ${githubData.ownedStars}
- Language Breakdown (bytes): ${JSON.stringify(githubData.languageTotals)}
- Repository Topics: ${JSON.stringify(githubData.topics)}
- Repository Details: ${JSON.stringify(
    githubData.repos.map((r: any) => ({
      name: r.name, description: r.description, languages: r.languages,
      stars: r.stars, is_fork: r.is_fork
    })).slice(0, 10)
  )}
- Top Repository README Snippets (for Deep Context): ${JSON.stringify(githubData.readmes)}
- Recent Push Events: ${githubData.pushEventsCount} in the last 90 days

**CRITICAL RULES:**
1. If the developer has fewer than 2 OWNED repositories OR fewer than 5 recent push events, data is too weak. You MUST return exactly: {"error": "Verification Failed: Insufficient authored commits or original repositories. TRUU requires a minimum baseline of engineering activity."}
2. Read the Top Repository README Snippets carefully. Use them to judge system design capability, documentation quality, and true project complexity. Do NOT infer expertise from simple byte counts alone.
3. If the profile is mostly forks (${githubData.forkedReposCount} forks vs ${githubData.ownedReposCount} owned), explicitly fail verification for advanced skills.
4. "Master" or "Expert" proficiency requires complex projects documented in READMEs, multiple owned repos, stars, and high recent activity.
5. Return a JSON object with "summary" and "skills", OR the error object.
6. Each skill must have: "skillName", "proficiency", "verificationTier", "evidence", "category"
7. proficiency MUST be one of: "Novice", "Practitioner", "Expert", "Master"
8. verificationTier MUST be one of: "Strong", "Moderate", "Weak". (Use Strong only if backed by READMEs and high commit volume).
9. evidence MUST be a clear, 1-sentence explanation of WHY this skill was verified (e.g., "Detected in 45 commits across 2 owned repositories including usage of Context API").
10. category MUST be one of: "Language", "Framework", "Architecture", "Database", "DevOps", "Runtime", "API"
11. Return 3-10 skills maximum. Cut out the weak ones.
12. Return ONLY valid JSON, no markdown formatting, no explanations.

**Example Error Output:**
{"error": "Verification Failed: Insufficient authored commits or original repositories. TRUU requires a minimum baseline of engineering activity."}

**Example Success Output:**
{
  "summary": "This developer actively contributes to high-complexity React projects...",
  "skills": [
    {"skillName": "JavaScript", "proficiency": "Expert", "verificationTier": "Strong", "evidence": "Primary language in 3 owned repositories with over 150 recent commits.", "category": "Language"},
    {"skillName": "React", "proficiency": "Practitioner", "verificationTier": "Moderate", "evidence": "Detected via dependency trees in 2 active projects.", "category": "Framework"}
  ]
}`;

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Groq API failed (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '{}';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse JSON from Groq response');

  return JSON.parse(jsonMatch[0]);
}

// ── Webhook Handler (called by Supabase DB Trigger) ─────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, github_username, secret } = body;

    // Verify webhook secret
    if (secret !== process.env.MINE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user_id || !github_username) {
      return NextResponse.json({ error: 'Missing user_id or github_username' }, { status: 400 });
    }

    console.log(`[AUTO-MINE] Triggered for @${github_username} (${user_id})`);

    // 1. Fetch GitHub data
    const githubData = await fetchGitHubData(github_username);

    // 2. Extract skills with Groq AI
    const aiResult = await extractSkillsWithGroq(githubData);

    if (aiResult.error) {
      console.warn(`[AUTO-MINE] Rejected @${github_username}: ${aiResult.error}`);
      await supabaseAdmin.from('users').update({ trust_score: 0 }).eq('id', user_id);
      return NextResponse.json({ success: false, error: aiResult.error });
    }

    const skills = aiResult.skills || [];
    const aiSummary = aiResult.summary || '';

    // 3. Save skills
    const skillRows = skills.map(
      (skill: { skillName: string; proficiency: string; verificationTier: string; evidence: string; category: string }) => ({
        user_id,
        skill_name: skill.skillName,
        proficiency_level: skill.proficiency,
        verification_tier: skill.verificationTier,
        evidence_log: { reason: skill.evidence },
        category: skill.category,
        proof_jwt: `truu_${Buffer.from(
          JSON.stringify({ skill: skill.skillName, prof: skill.proficiency, tier: skill.verificationTier, user: github_username, ts: Date.now() })
        ).toString('base64')}`,
      })
    );

    await supabaseAdmin.from('skills').delete().eq('user_id', user_id);
    await supabaseAdmin.from('skills').insert(skillRows);

    // 4. Calculate trust score via RPC (falls back to inline if RPC doesn't exist yet)
    let trustScore = 0;
    try {
      const { data: rpcScore } = await supabaseAdmin.rpc('calculate_trust_score', { p_user_id: user_id });
      trustScore = rpcScore ?? 0;
    } catch {
      const v_commits = githubData.pushEventsCount || 0;
      const v_repos = githubData.ownedReposCount + githubData.forkedReposCount || 0;
      const baseScore = Math.min(150, v_commits * 0.1) + Math.min(100, v_repos * 5);
      
      trustScore = Math.min(1000, Math.round(
        baseScore + skills.reduce((acc: number, s: any) => {
          const m = s.proficiency === 'Master' ? 40 : s.proficiency === 'Expert' ? 30 : s.proficiency === 'Practitioner' ? 20 : 10;
          const t = s.verificationTier === 'Strong' ? 1.0 : s.verificationTier === 'Moderate' ? 0.7 : s.verificationTier === 'Weak' ? 0.3 : 0.5;
          return acc + t * m * 1.5;
        }, 0)
      ));
    }

    await supabaseAdmin.from('users').update({ trust_score: trustScore }).eq('id', user_id);

    // 5. Log activity
    await supabaseAdmin.from('activities').insert({
      user_id,
      type: 'mining',
      message: `Auto-miner analyzed ${githubData.repoCount} repos — ${skills.length} skills detected`,
    });

    // 6. Cache profile
    const avgConfidence = skills.length > 0
      ? skills.reduce((acc: number, s: any) => acc + s.confidence, 0) / skills.length
      : 0;

    await supabaseAdmin.from('mined_profiles').upsert({
      user_id,
      trust_score: trustScore,
      avg_confidence: avgConfidence,
      repos_analyzed: githubData.ownedReposCount + githubData.forkedReposCount,
      commits_analyzed: githubData.pushEventsCount,
      ai_summary: aiSummary,
      raw_evidence: skills,
      mined_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'user_id' });

    console.log(`[AUTO-MINE] Success for @${github_username}: ${skills.length} skills, score=${trustScore}`);

    return NextResponse.json({
      success: true,
      skills_detected: skills.length,
      trust_score: trustScore,
    });
  } catch (error) {
    console.error('[AUTO-MINE] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
