import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return new Response('Username is required', { status: 400 });
    }

    const supabase = await createClient();

    // Fetch user data
    const { data: userData } = await supabase
      .from('users')
      .select('id, github_username, trust_score')
      .ilike('github_username', username)
      .single();

    if (!userData) {
      return new Response('User not found', { status: 404 });
    }

    // Fetch top 3 skills
    const { data: skills } = await supabase
      .from('skills')
      .select('skill_name, proficiency_level, confidence')
      .eq('user_id', userData.id)
      .order('confidence', { ascending: false })
      .limit(3);

    const trustScore = userData.trust_score || 0;
    const avatarUrl = `https://github.com/${username}.png`;
    const topSkills = skills || [];

    // Font setup (optional, using default sans for now)

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(139,92,246,0.3), transparent)',
            fontFamily: 'sans-serif',
            color: 'white',
            padding: '40px',
          }}
        >
          {/* Logo / Branding */}
          <div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: '-0.05em' }}>TRUU</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
            {/* Avatar */}
            <img
              src={avatarUrl}
              alt={username}
              width={160}
              height={160}
              style={{
                borderRadius: '50%',
                border: '4px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '24px',
              }}
            />

            {/* Username & Trust Score */}
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '48px', fontWeight: 'bold' }}>
              <span style={{ color: '#a1a1aa' }}>@</span>
              {username}
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '24px',
                padding: '16px 32px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                border: '2px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '9999px',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
              }}
            >
              <span style={{ fontSize: '24px', color: '#a1a1aa', marginRight: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Trust Score</span>
              <span style={{ fontSize: '56px', fontWeight: 900, color: '#c084fc' }}>{Math.round(trustScore)}</span>
            </div>

            {/* Top Skills */}
            {topSkills.length > 0 && (
              <div style={{ display: 'flex', marginTop: '40px', gap: '16px' }}>
                {topSkills.map((skill: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      padding: '12px 24px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      fontSize: '20px',
                      fontWeight: 600,
                    }}
                  >
                    {skill.skill_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('OG Image Generation Error:', e.message);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
