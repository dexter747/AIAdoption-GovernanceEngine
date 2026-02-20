import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'Velanova <noreply@velanova.com>';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Resend
 */
async function sendEmail(template: EmailTemplate) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: template.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error('[Email] Send error:', error);
      return { success: false, error };
    }

    console.log('[Email] Sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Exception:', error);
    return { success: false, error };
  }
}

/**
 * Welcome email on signup
 */
export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Velanova! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Welcome to Velanova, ${name}!</h1>
        <p>Thank you for joining Velanova - your AI adoption & governance platform.</p>
        
        <h2>Getting Started</h2>
        <ol>
          <li><strong>Download the Desktop App:</strong> Visit our download page to get started</li>
          <li><strong>Connect Your Databases:</strong> Link your existing systems</li>
          <li><strong>Add AI Providers:</strong> Configure your AI API keys</li>
          <li><strong>Start Querying:</strong> Ask questions in natural language</li>
        </ol>

        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/download" 
             style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Download Desktop App
          </a>
        </div>

        <p>Need help? Visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/docs">documentation</a> or reply to this email.</p>
        
        <p>Best regards,<br>The Velanova Team</p>
      </div>
    `,
  });
}

/**
 * License delivery email
 */
export async function sendLicenseEmail(
  email: string,
  licenseKey: string,
  planType: string
) {
  return sendEmail({
    to: email,
    subject: 'Your Velanova License Key 🔑',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Your License Key is Ready!</h1>
        <p>Thank you for subscribing to Velanova ${planType} plan.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your License Key:</h3>
          <code style="font-size: 16px; background: white; padding: 12px; display: block; border-radius: 4px;">
            ${licenseKey}
          </code>
          <p style="margin-top: 10px; font-size: 14px; color: #666;">
            Keep this key secure. You'll need it to activate the desktop app.
          </p>
        </div>

        <h2>Activation Instructions:</h2>
        <ol>
          <li>Open the Velanova Desktop App</li>
          <li>Click "Activate License"</li>
          <li>Paste your license key above</li>
          <li>Click "Activate"</li>
        </ol>

        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/download" 
             style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Download Desktop App
          </a>
        </div>

        <p><strong>Important:</strong> Your license can be activated on up to 3 devices simultaneously.</p>
        
        <p>Questions? Contact us at support@velanova.com</p>
      </div>
    `,
  });
}

/**
 * Payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  email: string,
  amount: number,
  planType: string,
  billingCycle: string
) {
  const formattedAmount = (amount / 100).toFixed(2);
  
  return sendEmail({
    to: email,
    subject: 'Payment Confirmation - Velanova',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Payment Successful! ✓</h1>
        <p>Thank you for your payment. Your subscription is now active.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Payment Details:</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Plan:</strong></td>
              <td>${planType}</td>
            </tr>
            <tr>
              <td><strong>Billing Cycle:</strong></td>
              <td>${billingCycle}</td>
            </tr>
            <tr>
              <td><strong>Amount:</strong></td>
              <td>$${formattedAmount}</td>
            </tr>
            <tr>
              <td><strong>Date:</strong></td>
              <td>${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <p>Your invoice has been sent to your billing email.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/billing" 
             style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Invoice
          </a>
        </div>
      </div>
    `,
  });
}

/**
 * Payment failed email
 */
export async function sendPaymentFailedEmail(email: string, errorMessage: string) {
  return sendEmail({
    to: email,
    subject: 'Payment Failed - Action Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Payment Failed</h1>
        <p>We encountered an issue processing your payment.</p>
        
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <strong>Error:</strong> ${errorMessage}
        </div>

        <p>Please update your payment method and try again.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/billing" 
             style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Update Payment Method
          </a>
        </div>

        <p>If you continue to experience issues, please contact support.</p>
      </div>
    `,
  });
}

/**
 * Usage alert email (80% or 100%)
 */
export async function sendUsageAlertEmail(
  email: string,
  usagePercent: number,
  usageType: string,
  currentUsage: number,
  limit: number
) {
  const isOverLimit = usagePercent >= 100;
  
  return sendEmail({
    to: email,
    subject: `Usage Alert: ${usagePercent}% of ${usageType} limit reached`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${isOverLimit ? '#ef4444' : '#f59e0b'};">
          Usage Alert: ${usagePercent}% Used
        </h1>
        <p>You've used ${usagePercent}% of your ${usageType} limit for this billing cycle.</p>
        
        <div style="background: ${isOverLimit ? '#fee2e2' : '#fef3c7'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <strong>Current Usage:</strong> ${currentUsage.toLocaleString()}<br>
          <strong>Plan Limit:</strong> ${limit.toLocaleString()}<br>
          <strong>Remaining:</strong> ${Math.max(0, limit - currentUsage).toLocaleString()}
        </div>

        ${isOverLimit ? `
          <p><strong>You've exceeded your plan limit.</strong> Usage-based charges will apply:</p>
          <ul>
            <li>Additional tokens: $10 per 1M tokens</li>
            <li>Extra connections: $50 per connection/month</li>
            <li>Additional users: $99 per user/month</li>
          </ul>
        ` : `
          <p>Consider upgrading your plan to avoid overage charges.</p>
        `}

        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/usage" 
             style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Usage Details
          </a>
        </div>
      </div>
    `,
  });
}

/**
 * Subscription cancellation email
 */
export async function sendCancellationEmail(email: string, endDate: string) {
  return sendEmail({
    to: email,
    subject: 'Subscription Cancelled - Velanova',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Subscription Cancelled</h1>
        <p>Your Velanova subscription has been cancelled successfully.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>You'll retain access until ${new Date(endDate).toLocaleDateString()}</li>
            <li>Your license will remain active until the end of your billing period</li>
            <li>No further charges will be made</li>
            <li>Your data will be retained for 30 days</li>
          </ul>
        </div>

        <p>We're sorry to see you go! If you have feedback, we'd love to hear it.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/reactivate" 
             style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reactivate Subscription
          </a>
        </div>
      </div>
    `,
  });
}

/**
 * Password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: email,
    subject: 'Reset Your Password - Velanova',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Reset Your Password</h1>
        <p>You requested to reset your password. Click the button below to create a new password.</p>
        
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>

        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Or copy and paste this URL: ${resetUrl}
        </p>
      </div>
    `,
  });
}
