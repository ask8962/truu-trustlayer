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

  return {
    repos: repoData,
    repoCount: repos.length,
    pushEvents,
    languageTotals,
    topics: allTopics,
  };
}

// ── Step 2: Call Groq AI to extract & categorize skills ─────────────
async function extractSkillsWithGroq(githubData: Record<string, unknown>) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error('GROQ_API_KEY not set');

  const prompt = `You are a senior developer skill analyzer for TRUU — an AI-powered developer verification platform.

Analyze the following GitHub data for a developer and extract their technical skills.

**GitHub Data:**
- Total Repositories: ${(githubData.repos as Array<unknown>).length}
- Language Breakdown (bytes): ${JSON.stringify(githubData.languageTotals)}
- Repository Topics: ${JSON.stringify(githubData.topics)}
- Repository Details: ${JSON.stringify(
    (githubData.repos as Array<Record<string, unknown>>).map(r => ({
      name: r.name,
      description: r.description,
      languages: r.languages,
      stars: r.stars,
      topics: r.topics,
    }))
  )}
- Recent Push Events: ${(githubData.pushEvents as Array<unknown>).length} in the last 90 days

**RULES:**
1. Return a JSON array of skill objects.
2. Each skill must have: "skillName", "proficiency", "confidence", "category"
3. proficiency MUST be one of: "Novice", "Practitioner", "Expert", "Master"
4. confidence is a number 0-100 representing how certain you are
5. category MUST be one of: "Language", "Framework", "Architecture", "Database", "DevOps", "Runtime", "API"
6. Base proficiency on: language byte count, repo count using it, recency, and project complexity
7. Only include skills with confidence >= 50
8. Return 5-15 skills maximum
9. DO NOT include any explanation, ONLY the JSON array.

**Example output:**
[
  {"skillName": "JavaScript", "proficiency": "Expert", "confidence": 92.5, "category": "Language"},
  {"skillName": "React", "proficiency": "Practitioner", "confidence": 74.2, "category": "Framework"}
]

Return ONLY the JSON array, nothing else.`;

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

  // Parse JSON from the response (handle markdown code blocks)
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Could not parse skills JSON from Groq response');

  return JSON.parse(jsonMatch[0]);
}

// ── Step 3: The API Route Handler ───────────────────────────────────
export async function POST() {
  try {
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

    // 1. Fetch GitHub data
    const githubData = await fetchGitHubData(githubUsername);

    // 2. Extract skills with Groq AI
    const skills = await extractSkillsWithGroq(githubData as Record<string, unknown>);

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

    // 5. Update trust score based on skills
    const trustScore = Math.min(
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

    await supabase.from('users').update({ trust_score: trustScore }).eq('id', user.id);

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
