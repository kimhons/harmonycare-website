/**
 * Referral Program Utilities
 * Generate and validate referral codes for founding members
 */

import { getDb } from './db';
import { signups, referrals } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Generate a unique referral code
 * Format: HARMONY-XXXX (e.g., HARMONY-A7B9)
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters (0, O, I, 1)
  let code = 'HARMONY-';
  
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Generate a unique referral code that doesn't exist in the database
 */
export async function generateUniqueReferralCode(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  let code = generateReferralCode();
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    // Check if code already exists
    const existing = await db
      .select()
      .from(signups)
      .where(eq(signups.ownReferralCode, code))
      .limit(1);
    
    if (existing.length === 0) {
      return code;
    }
    
    code = generateReferralCode();
    attempts++;
  }
  
  throw new Error('Failed to generate unique referral code');
}

/**
 * Validate a referral code and get the referrer's signup ID
 */
export async function validateReferralCode(code: string): Promise<number | null> {
  if (!code || code.trim() === '') {
    return null;
  }
  
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({ id: signups.id })
    .from(signups)
    .where(eq(signups.ownReferralCode, code.toUpperCase().trim()))
    .limit(1);
  
  return result.length > 0 ? result[0].id : null;
}

/**
 * Create a referral relationship
 */
export async function createReferral(params: {
  referrerSignupId: number;
  referredSignupId: number;
  referralCode: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.insert(referrals).values({
    referrerSignupId: params.referrerSignupId,
    referredSignupId: params.referredSignupId,
    referralCode: params.referralCode,
    rewardStatus: 'pending',
    rewardType: 'discount',
    rewardValue: '5%', // 5% additional discount for referrer
  });
}

/**
 * Get referral statistics for a signup
 */
export async function getReferralStats(signupId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Get all referrals made by this user
  const referralsMade = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerSignupId, signupId));
  
  // Get signup details for referred users
  const referredUsers = await Promise.all(
    referralsMade.map(async (ref) => {
      const signup = await db
        .select({
          id: signups.id,
          name: signups.firstName,
          facilityName: signups.facilityName,
          tier: signups.tier,
          createdAt: signups.createdAt,
        })
        .from(signups)
        .where(eq(signups.id, ref.referredSignupId))
        .limit(1);
      
      return signup[0];
    })
  );
  
  return {
    totalReferrals: referralsMade.length,
    pendingRewards: referralsMade.filter((r: any) => r.rewardStatus === 'pending').length,
    claimedRewards: referralsMade.filter((r: any) => r.rewardStatus === 'claimed').length,
    referredUsers: referredUsers.filter(Boolean),
  };
}

/**
 * Get referral code for a signup (create if doesn't exist)
 */
export async function getOrCreateReferralCode(signupId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Check if user already has a referral code
  const signup = await db
    .select({ ownReferralCode: signups.ownReferralCode })
    .from(signups)
    .where(eq(signups.id, signupId))
    .limit(1);
  
  if (signup.length === 0) {
    throw new Error('Signup not found');
  }
  
  if (signup[0].ownReferralCode) {
    return signup[0].ownReferralCode;
  }
  
  // Generate new code
  const newCode = await generateUniqueReferralCode();
  
  // Update signup with new code
  await db
    .update(signups)
    .set({ ownReferralCode: newCode })
    .where(eq(signups.id, signupId));
  
  return newCode;
}
