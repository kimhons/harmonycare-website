/**
 * Referral Rewards System Configuration
 * Defines reward tiers, milestones, and benefits for the founding member referral program
 */

export interface RewardTier {
  id: string;
  name: string;
  referralsRequired: number;
  benefits: string[];
  badge: string;
  color: string;
}

export const REWARD_TIERS: RewardTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Advocate',
    referralsRequired: 1,
    benefits: ['$25 account credit', 'Bronze badge on profile'],
    badge: '🥉',
    color: '#CD7F32',
  },
  {
    id: 'silver',
    name: 'Silver Champion',
    referralsRequired: 3,
    benefits: ['$100 account credit', 'Silver badge on profile', 'Priority support'],
    badge: '🥈',
    color: '#C0C0C0',
  },
  {
    id: 'gold',
    name: 'Gold Ambassador',
    referralsRequired: 5,
    benefits: ['$250 account credit', 'Gold badge on profile', 'Priority support', '1 month free service'],
    badge: '🥇',
    color: '#FFD700',
  },
  {
    id: 'platinum',
    name: 'Platinum Partner',
    referralsRequired: 10,
    benefits: [
      '$600 account credit',
      'Platinum badge on profile',
      'VIP support line',
      '3 months free service',
      'Featured in success stories',
    ],
    badge: '💎',
    color: '#E5E4E2',
  },
  {
    id: 'diamond',
    name: 'Diamond Elite',
    referralsRequired: 20,
    benefits: [
      '$1,500 account credit',
      'Diamond badge on profile',
      'Dedicated account manager',
      '6 months free service',
      'Lifetime 10% additional discount',
      'Advisory board invitation',
    ],
    badge: '👑',
    color: '#B9F2FF',
  },
];

/**
 * Get the current reward tier based on referral count
 */
export function getCurrentTier(referralCount: number): RewardTier | null {
  // Find the highest tier the user has achieved
  const achievedTiers = REWARD_TIERS.filter(tier => referralCount >= tier.referralsRequired);
  return achievedTiers.length > 0 ? achievedTiers[achievedTiers.length - 1] : null;
}

/**
 * Get the next reward tier to achieve
 */
export function getNextTier(referralCount: number): RewardTier | null {
  return REWARD_TIERS.find(tier => referralCount < tier.referralsRequired) || null;
}

/**
 * Calculate progress to next tier (0-100)
 */
export function getProgressToNextTier(referralCount: number): number {
  const nextTier = getNextTier(referralCount);
  if (!nextTier) return 100; // Max tier achieved
  
  const currentTier = getCurrentTier(referralCount);
  const previousRequired = currentTier ? currentTier.referralsRequired : 0;
  const nextRequired = nextTier.referralsRequired;
  
  const progress = ((referralCount - previousRequired) / (nextRequired - previousRequired)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Get all milestones with achievement status
 */
export function getReferralMilestones(referralCount: number) {
  return REWARD_TIERS.map(tier => ({
    ...tier,
    achieved: referralCount >= tier.referralsRequired,
    progress: referralCount >= tier.referralsRequired 
      ? 100 
      : tier.referralsRequired === REWARD_TIERS[0].referralsRequired
        ? (referralCount / tier.referralsRequired) * 100
        : 0,
  }));
}

/**
 * Generate shareable referral link with UTM parameters
 */
export function generateReferralLink(referralCode: string, baseUrl: string): string {
  const params = new URLSearchParams({
    utm_source: 'referral',
    utm_medium: 'founding_member',
    utm_campaign: 'referral_program',
    ref: referralCode,
  });
  
  return `${baseUrl}/signup?${params.toString()}`;
}

/**
 * Generate social media share text
 */
export function generateShareText(referralCode: string, referrerName: string): {
  email: string;
  twitter: string;
  linkedin: string;
} {
  return {
    email: `Hi! I'm a founding member of HarmonyCare, an AI-powered care management platform that's transforming resident care facilities. As a founding member, I've locked in 56-65% off forever, and you can too! Use my referral code ${referralCode} when you sign up to join the exclusive founding member program. We'll both receive rewards! Learn more: [LINK]`,
    
    twitter: `I'm a founding member of @HarmonyCare - AI-powered care management that saves caregivers 60% of their time on paperwork. Join me and lock in founding member pricing forever! Use code ${referralCode} 🚀`,
    
    linkedin: `Excited to be a founding member of HarmonyCare, an innovative AI-native care management platform. If you run a care facility, I highly recommend checking out their founding member program - you'll lock in 56-65% off regular pricing forever. Use my referral code ${referralCode} and we'll both receive exclusive rewards. This platform is genuinely transforming how we manage resident care.`,
  };
}
