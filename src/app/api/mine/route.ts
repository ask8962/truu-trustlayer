import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ── Step 1: Fetch repos + languages from GitHub ─────────────────────
async function fetchGitHubData(username: string) {
  const headers: HeadersInit = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
};

  // Fetch repos (up to 100, sorted by recent push)
  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
    { headers }
  );
  if (reposRes.status === 403 || reposRes.status === 429) {
    const resetHeader = reposRes.headers.get('x-ratelimit-reset');
    const retryMins = resetHeader ? Math.ceil((parseInt(resetHeader) * 1000 - Date.now()) / 60000) : 5;
    throw new Error(`GitHub API rate limited. Try again in ${retryMins} minute${retryMins === 1 ? '' : 's'}.`);
  }
  if (!reposRes.ok) throw new Error(`GitHub repos API failed: ${reposRes.status}`);
  const repos = await reposRes.json();

  // For each repo, fetch its languages breakdown
  const repoData = await Promise.all(
    repos.slice(0, 20).map(async (repo: Record<string, string | number | boolean>) => {
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
          topics: (repo as Record<string, string[]>).topics || [],
          is_fork: repo.fork,
          updated_at: repo.pushed_at,
        };
      } catch {
        return { name: repo.name, languages: [], languageBytes: {}, description: '' };
      }
    })
  );

  // Fetch recent push events for commit activity
  const eventsRes = await fetch(
    `https://api.github.com/users/${username}/events/public?per_page=100`,
    { headers }
  );
  const events = eventsRes.ok ? await eventsRes.json() : [];
  const pushEvents = events
    .filter((e: Record<string, string>) => e.type === 'PushEvent')
    .slice(0, 30);

  // Aggregate all languages with byte counts
  const languageTotals: Record<string, number> = {};
  for (const repo of repoData) {
    if (repo.languageBytes) {
      for (const [lang, bytes] of Object.entries(repo.languageBytes as Record<string, number>)) {
        languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
      }
    }
  }

  // Collect all unique topics
  const allTopics = [...new Set(repoData.flatMap(r => (r.topics as string[]) || []))];

  // Hard Data Constraints
  const ownedRepos = repoData.filter(r => !r.is_fork);
  const forkedRepos = repoData.filter(r => r.is_fork);
  const ownedStars = ownedRepos.reduce((acc, r) => acc + (r.stars as number || 0), 0);

  return {
    repos: repoData,
    repoCount: repos.length,
    ownedReposCount: ownedRepos.length,
    forkedReposCount: forkedRepos.length,
    ownedStars,
    pushEventsCount: pushEvents.length,
    languageTotals,
    topics: allTopics,
  };
}

// ── Step 2: Call Groq AI to extract & categorize skills ─────────────
async function extractSkillsWithGroq(githubData: Record<string, unknown>) {
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
    (githubData.repos as Array<Record<string, unknown>>).map(r => ({
      name: r.name,
      description: r.description,
      languages: r.languages,
      stars: r.stars,
      topics: r.topics,
      is_fork: r.is_fork
    }))
  )}
- Recent Push Events: ${githubData.pushEventsCount} in the last 90 days

**CRITICAL RULES:**
1. If the developer has fewer than 2 OWNED repositories OR fewer than 5 recent push events, data is too weak. You MUST return exactly: {"error": "Insufficient activity for reliable verification."}
2. Do NOT infer expertise from language byte tags alone. A language tag on a fork or empty repo means NOTHING.
3. If the profile is mostly forks (${githubData.forkedReposCount} forks vs ${githubData.ownedReposCount} owned), heavily penalize all confidence scores.
4. "Master" or "Expert" proficiency requires multiple owned repos, stars (${githubData.ownedStars} total), and high recent activity.
5. High confidence (>80%) requires owned repositories with stars and consistent recent push events.
6. Return a JSON array of skill objects OR the error object.
7. Each skill must have: "skillName", "proficiency", "confidence", "category"
8. proficiency MUST be one of: "Novice", "Practitioner", "Expert", "Master"
9. confidence is a number 0-100 representing empirical proof.
10. category MUST be one of: "Language", "Framework", "Architecture", "Database", "DevOps", "Runtime", "API"
11. Return 3-10 skills maximum. Cut out the weak ones.
12. Return ONLY valid JSON, no markdown formatting, no explanations. Your output MUST be a JSON object with exactly two keys: "summary" and "skills", OR the error object.

**Example Error Output:**
{"error": "Insufficient activity for reliable verification."}

**Example Success Output:**
{
  "summary": "This developer actively contributes to high-complexity React projects...",
  "skills": [
    {"skillName": "JavaScript", "proficiency": "Expert", "confidence": 85.5, "category": "Language"},
    {"skillName": "React", "proficiency": "Practitioner", "confidence": 65.0, "category": "Framework"}
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
  const content = data.choices?.[0]?.message?.content || '[]';

  // Check for special error object
  const errorMatch = content.match(/\{[\s\S]*"error"[\s\S]*\}/);
  if (errorMatch) {
    try {
      const errObj = JSON.parse(errorMatch[0]);
      if (errObj.error) return errObj;
    } catch (e) {
      // Ignore parse error and try array fallback
    }
  }

  // Parse JSON object from the response (handle markdown code blocks)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse skills JSON from Groq response');

  return JSON.parse(jsonMatch[0]);
}

// ── Step 3: The API Route Handler ───────────────────────────────────
export async function POST(request: Request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // Body is optional
    }
    const force = (body as any).force === true;

    const supabase = await createClient();
    let {
      data: { user },
    } = await supabase.auth.getUser();

    // If no authenticated user (e.g., dev testing), allow a dev user via env var
    if (!user && process.env.DEV_USER_ID) {
      // Construct a minimal user object compatible with the rest of the code
      user = {
        id: process.env.DEV_USER_ID,
        user_metadata: {
          user_name: process.env.DEV_GITHUB_USERNAME || 'unknown',
        },
      } as any;
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const githubUsername =
      user.user_metadata?.user_name ||
      user.user_metadata?.preferred_username ||
      'unknown';

    // 0. Check Cache First
    if (!force) {
      const { data: cached } = await supabase
        .from('mined_profiles')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString())
        .single();
      
      if (cached) {
        return NextResponse.json({
          success: true,
          cached: true,
          skills_detected: cached.raw_evidence?.length || 0,
          trust_score: cached.trust_score,
          skills: cached.raw_evidence
        });
      }
    }

    // 1. Fetch GitHub data
    const githubData = await fetchGitHubData(githubUsername);

    // 2. Extract skills with Groq AI
    const skillsOrError = await extractSkillsWithGroq(githubData as Record<string, unknown>);

    if (skillsOrError.error) {
      console.warn(`[STRICT MINER] Rejected profile @${githubUsername}: ${skillsOrError.error}`);
      
      // Enforce harsh 0 trust score and wipe old skills on rejection
      await supabase.from('skills').delete().eq('user_id', user.id);
      await supabase.from('users').update({ trust_score: 0 }).eq('id', user.id);
      
      return NextResponse.json({
        success: false,
        error: skillsOrError.error
      }, { status: 400 });
    }

    const aiResult = skillsOrError;
    const skills = aiResult.skills || [];
    const aiSummary = aiResult.summary || '';

    // 3. Generate proof hashes and upsert into Supabase
    const skillRows = skills.map(
      (skill: { skillName: string; proficiency: string; confidence: number; category: string }) => ({
        user_id: user.id,
        skill_name: skill.skillName,
        proficiency_level: skill.proficiency,
        confidence: skill.confidence,
        category: skill.category,
        proof_jwt: `truu_${Buffer.from(
          JSON.stringify({
            skill: skill.skillName,
            prof: skill.proficiency,
            conf: skill.confidence,
            user: githubUsername,
            ts: Date.now(),
          })
        ).toString('base64')}`,
      })
    );

    // Delete old skills for this user and insert fresh ones
    await supabase.from('skills').delete().eq('user_id', user.id);
    const { error: insertError } = await supabase.from('skills').insert(skillRows);

    if (insertError) {
      console.error('Supabase skills insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save skills', details: insertError.message }, { status: 500 });
    }

    // 4. Log mining activity
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'mining',
      message: `Ambient miner analyzed ${githubData.repoCount} repos — ${skills.length} skills detected`,
    });

    // 5. Update trust score — use DB function if available, otherwise inline fallback
    let trustScore = 0;
    try {
      const { data: rpcScore } = await supabase.rpc('calculate_trust_score', { p_user_id: user.id });
      trustScore = rpcScore ?? 0;
    } catch {
      trustScore = Math.min(
        1000,
        Math.round(
          skills.reduce(
            (acc: number, s: { confidence: number; proficiency: string }) => {
              const profMultiplier =
                s.proficiency === 'Master' ? 4 : s.proficiency === 'Expert' ? 3 : s.proficiency === 'Practitioner' ? 2 : 1;
              return acc + s.confidence * profMultiplier * 0.3;
            },
            0
          )
        )
      );
    }

    await supabase.from('users').update({ trust_score: trustScore }).eq('id', user.id);

    // Trigger Mining Completed email
    if (user.email) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      fetch(`${siteUrl}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MINING_COMPLETED',
          targetEmail: user.email,
          data: {
            skillsFound: skills.length,
            dashboardUrl: `${siteUrl}/user-dashboard`,
          }
        })
      }).catch(err => console.error('Failed to trigger mining complete email:', err));
    }

    const avgConfidence = skills.length > 0 
      ? skills.reduce((acc: number, s: any) => acc + s.confidence, 0) / skills.length 
      : 0;

    // Cache the result in mined_profiles
    const { error: cacheError } = await supabase.from('mined_profiles').upsert({
      user_id: user.id,
      trust_score: trustScore,
      avg_confidence: avgConfidence,
      repos_analyzed: githubData.ownedReposCount + githubData.forkedReposCount,
      commits_analyzed: githubData.pushEventsCount,
      ai_summary: aiSummary,
      raw_evidence: skills,
      mined_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }, { onConflict: 'user_id' });

    if (cacheError) {
      console.error('Failed to cache mined profile:', cacheError);
      // We don't fail the request if caching fails
    }

    return NextResponse.json({
      success: true,
      message: `Mining complete — ${skills.length} skills detected`,
      skills_detected: skills.length,
      trust_score: trustScore,
      skills: skills,
    });
  } catch (error) {
    console.error('Mining error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
