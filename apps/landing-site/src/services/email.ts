import nodemailer from 'nodemailer';

// ── Gmail SMTP Configuration ─────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || `Velanova <${process.env.SMTP_USER}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ── Shared wrapper & header/footer ───────────────────────────────────────────
function wrap(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;">
  <tr><td align="center" style="padding:40px 20px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#18181b;border-radius:16px;border:1px solid #27272a;overflow:hidden;">
      <!-- Header -->
      <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #27272a;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td><span style="font-size:24px;font-weight:600;color:#fafafa;letter-spacing:-0.5px;">✦ Velanova</span></td>
          </tr>
        </table>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:40px;">${body}</td></tr>
      <!-- Footer -->
      <tr><td style="padding:24px 40px;border-top:1px solid #27272a;text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;color:#71717a;">© ${new Date().getFullYear()} Velanova by Nexolve Technologies India. All rights reserved.</p>
        <p style="margin:0;font-size:12px;">
          <a href="${APP_URL}/terms" style="color:#a1a1aa;text-decoration:none;">Terms</a>
          <span style="color:#3f3f46;margin:0 8px;">·</span>
          <a href="${APP_URL}/privacy" style="color:#a1a1aa;text-decoration:none;">Privacy</a>
          <span style="color:#3f3f46;margin:0 8px;">·</span>
          <a href="${APP_URL}/contact" style="color:#a1a1aa;text-decoration:none;">Contact</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function btn(href: string, label: string, color = '#fafafa', bg = '#6366f1'): string {
  return `<a href="${href}" style="display:inline-block;padding:14px 28px;background:${bg};color:${color};font-weight:600;font-size:15px;text-decoration:none;border-radius:10px;margin:8px 0;">${label}</a>`;
}

function heading(text: string, color = '#fafafa'): string {
  return `<h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:${color};line-height:1.3;">${text}</h1>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#a1a1aa;line-height:1.6;">${text}</p>`;
}

function card(content: string): string {
  return `<div style="background:#27272a;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #3f3f46;">${content}</div>`;
}

// ── Core send function ───────────────────────────────────────────────────────
async function sendEmail(template: EmailTemplate) {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: template.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    console.log('[Email] Sent successfully:', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error('[Email] Exception:', error);
    return { success: false, error };
  }
}

// ── Email Verification ───────────────────────────────────────────────────────
export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'Verify your email – Velanova',
    html: wrap(`
      ${heading('Verify your email')}
      ${para(`Hi ${name || 'there'},`)}
      ${para('Thanks for signing up for Velanova! Click the button below to verify your email address and activate your account.')}
      <div style="text-align:center;margin:28px 0;">
        ${btn(verifyUrl, 'Verify Email Address')}
      </div>
      ${para('This link expires in <strong style="color:#fafafa;">24 hours</strong>. If you didn\'t create this account, you can safely ignore this email.')}
      ${card(`<p style="margin:0;font-size:13px;color:#71717a;word-break:break-all;">Or paste this URL in your browser:<br/><a href="${verifyUrl}" style="color:#818cf8;">${verifyUrl}</a></p>`)}
    `),
  });
}

// ── Email Verified Confirmation ──────────────────────────────────────────────
export async function sendEmailVerifiedConfirmation(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Email verified – Welcome to Velanova! ✓',
    html: wrap(`
      ${heading("You're verified! ✓", '#10b981')}
      ${para(`Hey ${name || 'there'}, your email has been verified successfully.`)}
      ${para('Your Velanova account is now fully active. You can sign in and start exploring.')}
      <div style="text-align:center;margin:28px 0;">
        ${btn(`${APP_URL}/login`, 'Sign In Now')}
      </div>
    `),
  });
}

// ── Welcome Email (on first signup) ──────────────────────────────────────────
export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Velanova! 🎉',
    html: wrap(`
      ${heading('Welcome to Velanova, ' + (name || 'there') + '!')}
      ${para("We're excited to have you on board. Velanova is your AI adoption &amp; governance platform — connect databases, add AI providers, and query everything in natural language.")}
      
      ${card(`
        <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#fafafa;">Getting Started</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding:6px 0;font-size:14px;color:#a1a1aa;">1.</td><td style="padding:6px 8px;font-size:14px;color:#a1a1aa;"><strong style="color:#fafafa;">Download the Desktop App</strong> — available for macOS, Windows &amp; Linux</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#a1a1aa;">2.</td><td style="padding:6px 8px;font-size:14px;color:#a1a1aa;"><strong style="color:#fafafa;">Connect Databases</strong> — link your PostgreSQL, MySQL, MongoDB &amp; more</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#a1a1aa;">3.</td><td style="padding:6px 8px;font-size:14px;color:#a1a1aa;"><strong style="color:#fafafa;">Add AI Providers</strong> — use your own API keys (BYOK)</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#a1a1aa;">4.</td><td style="padding:6px 8px;font-size:14px;color:#a1a1aa;"><strong style="color:#fafafa;">Start Querying</strong> — ask anything in plain English</td></tr>
        </table>
      `)}
      
      <div style="text-align:center;margin:28px 0;">
        ${btn(`${APP_URL}/download`, 'Download Desktop App')}
      </div>
      ${para('Need help? Check out our <a href="' + APP_URL + '/docs" style="color:#818cf8;text-decoration:none;">documentation</a> or reply to this email.')}
    `),
  });
}

// ── License Delivery ─────────────────────────────────────────────────────────
export async function sendLicenseEmail(email: string, licenseKey: string, planType: string) {
  return sendEmail({
    to: email,
    subject: 'Your Velanova License Key 🔑',
    html: wrap(`
      ${heading('Your License Key is Ready!')}
      ${para(`Thank you for subscribing to the <strong style="color:#fafafa;">${planType}</strong> plan.`)}
      
      ${card(`
        <p style="margin:0 0 8px;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">License Key</p>
        <p style="margin:0;font-size:18px;font-weight:600;color:#fafafa;font-family:monospace;background:#18181b;padding:12px;border-radius:8px;text-align:center;letter-spacing:1px;">${licenseKey}</p>
        <p style="margin:12px 0 0;font-size:13px;color:#71717a;">Keep this key secure. You'll need it to activate the desktop app.</p>
      `)}
      
      ${card(`
        <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#fafafa;">Activation Steps</p>
        <ol style="margin:0;padding-left:20px;color:#a1a1aa;font-size:14px;line-height:1.8;">
          <li>Open the Velanova Desktop App</li>
          <li>Click <strong style="color:#fafafa;">"Activate License"</strong></li>
          <li>Paste your license key</li>
          <li>Click <strong style="color:#fafafa;">"Activate"</strong></li>
        </ol>
      `)}
      
      <div style="text-align:center;margin:28px 0;">
        ${btn(`${APP_URL}/download`, 'Download Desktop App')}
      </div>
      ${para('Your license can be activated on up to <strong style="color:#fafafa;">3 devices</strong> simultaneously.')}
    `),
  });
}

// ── Payment Confirmation ─────────────────────────────────────────────────────
export async function sendPaymentConfirmationEmail(
  email: string,
  amount: number,
  planType: string,
  billingCycle: string
) {
  const formattedAmount = (amount / 100).toFixed(2);
  return sendEmail({
    to: email,
    subject: 'Payment Confirmed – Velanova ✓',
    html: wrap(`
      ${heading('Payment Successful! ✓', '#10b981')}
      ${para('Your subscription is now active. Here are your payment details:')}
      
      ${card(`
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#71717a;">Plan</td>
            <td style="padding:8px 0;font-size:14px;color:#fafafa;text-align:right;font-weight:600;">${planType}</td>
          </tr>
          <tr><td colspan="2" style="border-bottom:1px solid #3f3f46;"></td></tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#71717a;">Billing Cycle</td>
            <td style="padding:8px 0;font-size:14px;color:#fafafa;text-align:right;">${billingCycle}</td>
          </tr>
          <tr><td colspan="2" style="border-bottom:1px solid #3f3f46;"></td></tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#71717a;">Amount</td>
            <td style="padding:8px 0;font-size:16px;color:#10b981;text-align:right;font-weight:700;">$${formattedAmount}</td>
          </tr>
          <tr><td colspan="2" style="border-bottom:1px solid #3f3f46;"></td></tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#71717a;">Date</td>
            <td style="padding:8px 0;font-size:14px;color:#fafafa;text-align:right;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
        </table>
      `)}
      
      ${para('A detailed invoice has been sent to your billing email.')}
    `),
  });
}

// ── Payment Reminder ─────────────────────────────────────────────────────────
export async function sendPaymentReminderEmail(
  email: string,
  planType: string,
  dueDate: string,
  amount: number
) {
  const formattedAmount = (amount / 100).toFixed(2);
  return sendEmail({
    to: email,
    subject: 'Payment Reminder – Velanova',
    html: wrap(`
      ${heading('Payment Due Soon')}
      ${para(`Your <strong style="color:#fafafa;">${planType}</strong> subscription payment of <strong style="color:#fafafa;">$${formattedAmount}</strong> is due on <strong style="color:#fafafa;">${new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.`)}
      ${para('Please make sure your payment method is up to date to avoid interruption.')}
      <div style="text-align:center;margin:28px 0;">
        ${btn(`${APP_URL}/subscribe`, 'Update Payment Method')}
      </div>
    `),
  });
}

// ── Payment Failed ───────────────────────────────────────────────────────────
export async function sendPaymentFailedEmail(email: string, errorMessage: string) {
  return sendEmail({
    to: email,
    subject: 'Payment Failed – Action Required',
    html: wrap(`
      ${heading('Payment Failed', '#ef4444')}
      ${para("We couldn't process your latest payment.")}
      ${card(`<p style="margin:0;font-size:14px;color:#fca5a5;">Error: ${errorMessage}</p>`)}
      ${para('Please update your payment method to keep your subscription active.')}
      <div style="text-align:center;margin:28px 0;">
        ${btn(`${APP_URL}/subscribe`, 'Update Payment Method', '#fafafa', '#ef4444')}
      </div>
    `),
  });
}

// ── Password Reset ───────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
  return sendEmail({
    to: email,
    subject: 'Reset your password – Velanova',
    html: wrap(`
      ${heading('Reset Your Password')}
      ${para('You requested a password reset for your Velanova account. Click the button below to create a new password.')}
      <div style="text-align:center;margin:28px 0;">
        ${btn(resetUrl, 'Reset Password')}
      </div>
      ${para('This link expires in <strong style="color:#fafafa;">1 hour</strong>. If you didn\'t request this, you can safely ignore this email.')}
      ${card(`<p style="margin:0;font-size:13px;color:#71717a;word-break:break-all;">Or paste this URL in your browser:<br/><a href="${resetUrl}" style="color:#818cf8;">${resetUrl}</a></p>`)}
    `),
  });
}

// ── Usage Alert ──────────────────────────────────────────────────────────────
export async function sendUsageAlertEmail(
  email: string,
  usagePercent: number,
  usageType: string,
  currentUsage: number,
  limit: number
) {
  const isOver = usagePercent >= 100;
  return sendEmail({
    to: email,
    subject: `Usage Alert: ${usagePercent}% of ${usageType} limit reached`,
    html: wrap(`
      ${heading(`Usage Alert: ${usagePercent}% Used`, isOver ? '#ef4444' : '#f59e0b')}
      ${para(`You've used <strong style="color:#fafafa;">${usagePercent}%</strong> of your ${usageType} limit this billing cycle.`)}
      ${card(`
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding:6px 0;font-size:14px;color:#71717a;">Current Usage</td><td style="text-align:right;font-size:14px;color:#fafafa;font-weight:600;">${currentUsage.toLocaleString()}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#71717a;">Plan Limit</td><td style="text-align:right;font-size:14px;color:#fafafa;">${limit.toLocaleString()}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#71717a;">Remaining</td><td style="text-align:right;font-size:14px;color:${isOver ? '#ef4444' : '#10b981'};font-weight:600;">${Math.max(0, limit - currentUsage).toLocaleString()}</td></tr>
        </table>
      `)}
      ${isOver ? para("You've exceeded your plan limit. Overage charges may apply.") : para('Consider upgrading to avoid overage charges.')}
      <div style="text-align:center;margin:28px 0;">
        ${btn(`${APP_URL}/pricing`, 'View Plans')}
      </div>
    `),
  });
}

// ── Cancellation ─────────────────────────────────────────────────────────────
export async function sendCancellationEmail(email: string, endDate: string) {
  return sendEmail({
    to: email,
    subject: 'Subscription Cancelled – Velanova',
    html: wrap(`
      ${heading('Subscription Cancelled')}
      ${para('Your Velanova subscription has been cancelled.')}
      ${card(`
        <ul style="margin:0;padding-left:20px;color:#a1a1aa;font-size:14px;line-height:2;">
          <li>Access continues until <strong style="color:#fafafa;">${new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></li>
          <li>Your license stays active until end of billing period</li>
          <li>No further charges will be made</li>
          <li>Data retained for 30 days after expiry</li>
        </ul>
      `)}
      ${para("We're sorry to see you go. If you change your mind, you can reactivate anytime.")}
      <div style="text-align:center;margin:28px 0;">
        ${btn(`${APP_URL}/subscribe`, 'Reactivate Subscription')}
      </div>
    `),
  });
}
