/**
 * Referral Email Templates
 * Automated emails for referral program milestones and notifications
 */

import { Resend } from 'resend';
import { ENV } from './_core/env';
import { getCurrentTier, getNextTier, REWARD_TIERS } from '../shared/referralRewards';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'HarmonyCare <noreply@harmony.care>';
const REPLY_TO = 'support@harmony.care';

/**
 * Send welcome email with referral code to new founding member
 */
export async function sendReferralWelcomeEmail(params: {
  email: string;
  firstName: string;
  referralCode: string;
}): Promise<void> {
  const { email, firstName, referralCode } = params;
  
  const baseUrl = process.env.VITE_APP_URL || 'https://harmony.care';
  const referralLink = `${baseUrl}/signup?utm_source=referral&utm_medium=founding_member&utm_campaign=referral_program&ref=${referralCode}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .code-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: 'Courier New', monospace; }
        .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: 600; }
        .rewards { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .reward-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .reward-item:last-child { border-bottom: none; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 Welcome to HarmonyCare!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Exclusive Referral Code is Ready</p>
        </div>
        
        <div class="content">
          <p>Hi ${firstName},</p>
          
          <p>Thank you for joining HarmonyCare as a <strong>Founding Member</strong>! You've locked in exclusive pricing forever, and now you can share the opportunity with others.</p>
          
          <div class="code-box">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your Personal Referral Code</p>
            <div class="code">${referralCode}</div>
          </div>
          
          <p style="text-align: center;">
            <a href="${referralLink}" class="button">Share Your Referral Link</a>
          </p>
          
          <h3>🎁 Referral Rewards Program</h3>
          <p>Earn amazing rewards for every founding member you refer:</p>
          
          <div class="rewards">
            ${REWARD_TIERS.map(tier => `
              <div class="reward-item">
                <strong>${tier.badge} ${tier.name}</strong> - ${tier.referralsRequired} referral${tier.referralsRequired > 1 ? 's' : ''}
                <ul style="margin: 5px 0; padding-left: 20px; color: #6b7280;">
                  ${tier.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
          
          <h3>📊 Track Your Progress</h3>
          <p>Log in to your <a href="${baseUrl}/referrals" style="color: #667eea;">Referral Dashboard</a> to:</p>
          <ul>
            <li>View your referral statistics in real-time</li>
            <li>Track reward progress and milestones</li>
            <li>Access shareable links for email and social media</li>
            <li>See who you've referred and their status</li>
          </ul>
          
          <p>Questions? Reply to this email or contact us at support@harmony.care</p>
          
          <p>Best regards,<br><strong>The HarmonyCare Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2025 HarmonyCare. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO,
      subject: `🎉 Your HarmonyCare Referral Code: ${referralCode}`,
      html,
    });
    console.log(`[Referral Email] Welcome email sent to ${email}`);
  } catch (error) {
    console.error('[Referral Email] Failed to send welcome email:', error);
    throw error;
  }
}

/**
 * Send notification when someone uses your referral code
 */
export async function sendReferralSuccessEmail(params: {
  referrerEmail: string;
  referrerFirstName: string;
  referredName: string;
  totalReferrals: number;
}): Promise<void> {
  const { referrerEmail, referrerFirstName, referredName, totalReferrals } = params;
  const baseUrl = process.env.VITE_APP_URL || 'https://harmony.care';
  
  const currentTier = getCurrentTier(totalReferrals);
  const nextTier = getNextTier(totalReferrals);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .stats-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .stat { font-size: 48px; font-weight: bold; color: #10b981; }
        .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: 600; }
        .tier-badge { display: inline-block; background: ${currentTier?.color || '#667eea'}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 10px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 New Referral Success!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone just joined using your code</p>
        </div>
        
        <div class="content">
          <p>Hi ${referrerFirstName},</p>
          
          <p>Great news! <strong>${referredName}</strong> just signed up as a founding member using your referral code.</p>
          
          <div class="stats-box">
            <div class="stat">${totalReferrals}</div>
            <p style="margin: 10px 0; color: #6b7280;">Total Successful Referrals</p>
            ${currentTier ? `<div class="tier-badge">${currentTier.badge} ${currentTier.name}</div>` : ''}
          </div>
          
          ${nextTier ? `
            <p style="text-align: center;">
              <strong>Next Milestone:</strong> ${nextTier.badge} ${nextTier.name}<br>
              <span style="color: #6b7280;">Just ${nextTier.referralsRequired - totalReferrals} more referral${nextTier.referralsRequired - totalReferrals > 1 ? 's' : ''} to unlock!</span>
            </p>
          ` : `
            <p style="text-align: center; color: #10b981; font-weight: 600;">
              🏆 Congratulations! You've reached the highest tier!
            </p>
          `}
          
          <p style="text-align: center;">
            <a href="${baseUrl}/referrals" class="button">View Your Dashboard</a>
          </p>
          
          <p>Keep sharing your referral code to unlock more rewards and help other care facilities discover HarmonyCare!</p>
          
          <p>Best regards,<br><strong>The HarmonyCare Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2025 HarmonyCare. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: referrerEmail,
      replyTo: REPLY_TO,
      subject: `🎉 New Referral! You now have ${totalReferrals} successful referral${totalReferrals > 1 ? 's' : ''}`,
      html,
    });
    console.log(`[Referral Email] Success notification sent to ${referrerEmail}`);
  } catch (error) {
    console.error('[Referral Email] Failed to send success email:', error);
    // Don't throw - this is a nice-to-have notification
  }
}

/**
 * Send milestone achievement email
 */
export async function sendMilestoneEmail(params: {
  email: string;
  firstName: string;
  tier: typeof REWARD_TIERS[number];
  totalReferrals: number;
}): Promise<void> {
  const { email, firstName, tier, totalReferrals } = params;
  const baseUrl = process.env.VITE_APP_URL || 'https://harmony.care';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, ${tier.color} 0%, ${tier.color}dd 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
        .badge { font-size: 80px; margin: 20px 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .benefit-item { padding: 12px; margin: 8px 0; background: #f3f4f6; border-radius: 6px; }
        .button { display: inline-block; background: ${tier.color}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: 600; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">${tier.badge}</div>
          <h1 style="margin: 0;">Milestone Achieved!</h1>
          <h2 style="margin: 10px 0 0 0; font-weight: 600;">${tier.name}</h2>
        </div>
        
        <div class="content">
          <p>Hi ${firstName},</p>
          
          <p><strong>Congratulations!</strong> You've reached an incredible milestone with <strong>${totalReferrals} successful referrals</strong>. You've unlocked the <strong>${tier.name}</strong> tier!</p>
          
          <h3>🎁 Your Rewards</h3>
          <div class="benefits">
            ${tier.benefits.map(benefit => `
              <div class="benefit-item">✓ ${benefit}</div>
            `).join('')}
          </div>
          
          <p>Your rewards will be automatically applied to your account within 24 hours. You can track their status in your referral dashboard.</p>
          
          <p style="text-align: center;">
            <a href="${baseUrl}/referrals" class="button">View Your Dashboard</a>
          </p>
          
          <p>Thank you for being an amazing advocate for HarmonyCare! Your support helps us transform care management for facilities across the country.</p>
          
          <p>Best regards,<br><strong>The HarmonyCare Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2025 HarmonyCare. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO,
      subject: `🏆 Milestone Unlocked: ${tier.badge} ${tier.name}!`,
      html,
    });
    console.log(`[Referral Email] Milestone email sent to ${email} for ${tier.name}`);
  } catch (error) {
    console.error('[Referral Email] Failed to send milestone email:', error);
    // Don't throw - this is a nice-to-have notification
  }
}

/**
 * Send monthly referral summary email
 */
export async function sendMonthlySummaryEmail(params: {
  email: string;
  firstName: string;
  referralCode: string;
  totalReferrals: number;
  monthlyReferrals: number;
  currentTier: typeof REWARD_TIERS[number] | null;
  nextTier: typeof REWARD_TIERS[number] | null;
}): Promise<void> {
  const { email, firstName, referralCode, totalReferrals, monthlyReferrals, currentTier, nextTier } = params;
  const baseUrl = process.env.VITE_APP_URL || 'https://harmony.care';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; flex: 1; margin: 0 10px; }
        .stat-number { font-size: 36px; font-weight: bold; color: #667eea; }
        .stat-label { color: #6b7280; font-size: 14px; margin-top: 5px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: 600; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">📊 Your Monthly Referral Summary</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Here's how you're doing this month</p>
        </div>
        
        <div class="content">
          <p>Hi ${firstName},</p>
          
          <p>Here's your referral program update for this month:</p>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-number">${monthlyReferrals}</div>
              <div class="stat-label">This Month</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${totalReferrals}</div>
              <div class="stat-label">All Time</div>
            </div>
          </div>
          
          ${currentTier ? `
            <p style="text-align: center;">
              <strong>Current Tier:</strong> ${currentTier.badge} ${currentTier.name}
            </p>
          ` : ''}
          
          ${nextTier ? `
            <p style="text-align: center; background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Next Goal:</strong> ${nextTier.badge} ${nextTier.name}<br>
              <span style="color: #6b7280;">Need ${nextTier.referralsRequired - totalReferrals} more referral${nextTier.referralsRequired - totalReferrals > 1 ? 's' : ''}</span>
            </p>
          ` : ''}
          
          <p style="text-align: center;">
            <a href="${baseUrl}/referrals" class="button">View Full Dashboard</a>
          </p>
          
          <p><strong>Your Referral Code:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${referralCode}</code></p>
          
          <p>Keep sharing to unlock more rewards and help transform care management!</p>
          
          <p>Best regards,<br><strong>The HarmonyCare Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2025 HarmonyCare. All rights reserved.</p>
          <p><a href="${baseUrl}/unsubscribe" style="color: #6b7280;">Unsubscribe from monthly summaries</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO,
      subject: `📊 Your Referral Summary: ${totalReferrals} Total Referrals`,
      html,
    });
    console.log(`[Referral Email] Monthly summary sent to ${email}`);
  } catch (error) {
    console.error('[Referral Email] Failed to send monthly summary:', error);
    // Don't throw - this is a nice-to-have notification
  }
}
