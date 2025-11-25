/**
 * Referral Analytics Functions
 * Calculate referral statistics and conversion metrics for admin dashboard
 */

import { getDb } from './db';
import { signups, referrals } from '../drizzle/schema';
import { eq, desc, sql } from 'drizzle-orm';

export interface ReferrerStats {
  signupId: number;
  name: string;
  email: string;
  facilityName: string;
  ownReferralCode: string;
  totalReferrals: number;
  successfulConversions: number;
  conversionRate: number;
  tier: string;
}

export interface ReferralAnalytics {
  totalReferrals: number;
  totalReferrers: number;
  averageReferralsPerReferrer: number;
  conversionRate: number;
  topReferrers: ReferrerStats[];
  referralsByDay: Record<string, number>;
  referralsByTier: Record<string, number>;
}

/**
 * Get comprehensive referral analytics for admin dashboard
 */
export async function getReferralAnalytics(): Promise<ReferralAnalytics> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Get all referrals
  const allReferrals = await db.select().from(referrals);
  
  // Get all signups with referral codes
  const allSignups = await db.select().from(signups);
  
  // Calculate total referrals and referrers
  const totalReferrals = allReferrals.length;
  const uniqueReferrers = new Set(allReferrals.map(r => r.referrerSignupId));
  const totalReferrers = uniqueReferrers.size;
  
  // Calculate average referrals per referrer
  const averageReferralsPerReferrer = totalReferrers > 0 
    ? Math.round((totalReferrals / totalReferrers) * 10) / 10 
    : 0;
  
  // Calculate overall conversion rate (referrals / total signups with codes)
  const signupsWithCodes = allSignups.filter(s => s.ownReferralCode).length;
  const conversionRate = signupsWithCodes > 0 
    ? Math.round((totalReferrals / signupsWithCodes) * 100) 
    : 0;
  
  // Build referrer statistics
  const referrerStatsMap = new Map<number, ReferrerStats>();
  
  for (const referral of allReferrals) {
    const referrerId = referral.referrerSignupId;
    
    if (!referrerStatsMap.has(referrerId)) {
      // Find referrer signup details
      const referrerSignup = allSignups.find(s => s.id === referrerId);
      
      if (referrerSignup) {
        referrerStatsMap.set(referrerId, {
          signupId: referrerId,
          name: `${referrerSignup.firstName} ${referrerSignup.lastName}`,
          email: referrerSignup.email,
          facilityName: referrerSignup.facilityName,
          ownReferralCode: referrerSignup.ownReferralCode || '',
          totalReferrals: 0,
          successfulConversions: 0,
          conversionRate: 0,
          tier: referrerSignup.tier,
        });
      }
    }
    
    const stats = referrerStatsMap.get(referrerId);
    if (stats) {
      stats.totalReferrals++;
      stats.successfulConversions++;
    }
  }
  
  // Calculate conversion rates for each referrer
  referrerStatsMap.forEach(stats => {
    stats.conversionRate = stats.totalReferrals > 0 
      ? Math.round((stats.successfulConversions / stats.totalReferrals) * 100) 
      : 0;
  });
  
  // Sort by total referrals and get top 10
  const topReferrers = Array.from(referrerStatsMap.values())
    .sort((a, b) => b.totalReferrals - a.totalReferrals)
    .slice(0, 10);
  
  // Calculate referrals by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const referralsByDay: Record<string, number> = {};
  allReferrals.forEach(r => {
    if (r.createdAt && new Date(r.createdAt) >= thirtyDaysAgo) {
      const date = new Date(r.createdAt).toISOString().split('T')[0];
      referralsByDay[date] = (referralsByDay[date] || 0) + 1;
    }
  });
  
  // Calculate referrals by tier (tier of referred user)
  const referralsByTier: Record<string, number> = {};
  for (const referral of allReferrals) {
    const referredSignup = allSignups.find(s => s.id === referral.referredSignupId);
    if (referredSignup) {
      const tier = referredSignup.tier;
      referralsByTier[tier] = (referralsByTier[tier] || 0) + 1;
    }
  }
  
  return {
    totalReferrals,
    totalReferrers,
    averageReferralsPerReferrer,
    conversionRate,
    topReferrers,
    referralsByDay,
    referralsByTier,
  };
}

/**
 * Get detailed referral information for a specific signup
 */
export async function getSignupReferralDetails(signupId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Get referrals made by this user
  const referralsMade = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerSignupId, signupId));
  
  // Get details of referred users
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
  
  // Check if this user was referred by someone
  const wasReferred = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referredSignupId, signupId))
    .limit(1);
  
  let referredBy = null;
  if (wasReferred.length > 0) {
    const referrerSignup = await db
      .select({
        id: signups.id,
        name: signups.firstName,
        email: signups.email,
        facilityName: signups.facilityName,
      })
      .from(signups)
      .where(eq(signups.id, wasReferred[0].referrerSignupId))
      .limit(1);
    
    if (referrerSignup.length > 0) {
      referredBy = referrerSignup[0];
    }
  }
  
  return {
    totalReferrals: referralsMade.length,
    referredUsers: referredUsers.filter(Boolean),
    referredBy,
  };
}
