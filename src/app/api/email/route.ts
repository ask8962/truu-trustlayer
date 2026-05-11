import { NextResponse } from 'next/server';
import { sendProductEmail, EmailTemplateType } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

// Use admin client to lookup emails if needed (bypassing RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data, targetUsername, targetEmail }: { type: EmailTemplateType, data: any, targetUsername?: string, targetEmail?: string } = body;

    let finalEmail = targetEmail;

    // If we only have a username (e.g. for a Challenge), look up their email in Supabase
    if (!finalEmail && targetUsername) {
      const { data: userRecord } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('github_username', targetUsername)
        .single();
      
      if (userRecord?.email) {
        finalEmail = userRecord.email;
      } else {
        return NextResponse.json({ success: false, error: 'User email not found or user not registered.' }, { status: 404 });
      }
    }

    if (!finalEmail) {
      return NextResponse.json({ success: false, error: 'No target email provided or resolved.' }, { status: 400 });
    }

    const result = await sendProductEmail(type, data, finalEmail);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, mocked: result.mocked });
  } catch (error: any) {
    console.error('API Email Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
