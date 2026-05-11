import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    // Hardcode the target email here
    const targetEmail = 'ganukishor@gmail.com'; // <-- REPLACE THIS IF IT IS NOT YOUR GMAIL

    const data = await resend.emails.send({
      from: 'TRUU <onboarding@resend.dev>',
      to: targetEmail,
      subject: 'TRUU Resend Test Email',
      html: '<p>If you are reading this, Resend is successfully integrated into TRUU!</p>',
    });

    console.log('[RESEND TEST SUCCESS]', data);
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('[RESEND TEST FAILURE]', error);
    return NextResponse.json({ success: false, error: error.message, fullError: error }, { status: 500 });
  }
}
