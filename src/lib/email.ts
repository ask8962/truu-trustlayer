import { Resend } from 'resend';

// Use dummy key if not provided so the app doesn't crash in local dev
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_123456');

export type EmailTemplateType = 'CHALLENGE_SENT' | 'CHALLENGE_ACCEPTED' | 'MINING_COMPLETED' | 'PROFILE_SHARED';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export const sendProductEmail = async (type: EmailTemplateType, data: any, toEmail: string) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[EMAIL MOCK] Would have sent ${type} email to ${toEmail}`);
    return { success: true, mocked: true };
  }

  let payload: EmailPayload;

  switch (type) {
    case 'CHALLENGE_SENT':
      payload = {
        to: toEmail,
        subject: `⚔️ ${data.challengerName} challenged you to a TRUU Skill Duel!`,
        html: `
          <div style="font-family: monospace; padding: 20px; background-color: #000; color: #fff; border-radius: 8px;">
            <h2 style="color: #8B5CF6;">You've been challenged!</h2>
            <p><strong>${data.challengerName}</strong> (@${data.challengerUsername}) has initiated an AI-verified Skill Duel against you.</p>
            <p>Do your GitHub skills stack up against theirs?</p>
            <a href="${data.duelUrl}" style="display: inline-block; padding: 12px 24px; background-color: #8B5CF6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              View the Duel
            </a>
          </div>
        `,
      };
      break;
    
    case 'CHALLENGE_ACCEPTED':
      payload = {
        to: toEmail,
        subject: `🔥 ${data.opponentName} accepted your Skill Duel!`,
        html: `
          <div style="font-family: monospace; padding: 20px; background-color: #000; color: #fff; border-radius: 8px;">
            <h2 style="color: #F59E0B;">Duel Accepted!</h2>
            <p><strong>${data.opponentName}</strong> has answered your challenge.</p>
            <a href="${data.duelUrl}" style="display: inline-block; padding: 12px 24px; background-color: #F59E0B; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              See the Results
            </a>
          </div>
        `,
      };
      break;

    case 'MINING_COMPLETED':
      payload = {
        to: toEmail,
        subject: `✅ TRUU Ambient Mining Completed`,
        html: `
          <div style="font-family: monospace; padding: 20px; background-color: #000; color: #fff; border-radius: 8px;">
            <h2 style="color: #10B981;">Mining Complete</h2>
            <p>Your GitHub repositories have been successfully processed by the Ambient Miner.</p>
            <p><strong>${data.skillsFound}</strong> new skill credentials have been verified and added to your passport.</p>
            <a href="${data.dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              View Dashboard
            </a>
          </div>
        `,
      };
      break;

    case 'PROFILE_SHARED':
      payload = {
        to: toEmail,
        subject: `👀 Your TRUU Passport is getting noticed!`,
        html: `
          <div style="font-family: monospace; padding: 20px; background-color: #000; color: #fff; border-radius: 8px;">
            <h2 style="color: #3B82F6;">Profile Shared</h2>
            <p>Someone just shared your TRUU Capability Passport!</p>
            <p>Keep building your Trust Score to climb the ranks.</p>
          </div>
        `,
      };
      break;

    default:
      throw new Error(`Unknown email template: ${type}`);
  }

  try {
    const data = await resend.emails.send({
      from: 'TRUU <notifications@truu.id>', // Ensure this domain is verified in Resend
      ...payload,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};
