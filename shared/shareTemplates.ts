/**
 * Social Media and Email Sharing Templates
 * Pre-formatted content for founding members to share their referral codes
 */

export interface ShareTemplate {
  id: string;
  platform: 'email' | 'linkedin' | 'twitter' | 'facebook' | 'generic';
  title: string;
  description: string;
  content: string;
  hashtags?: string[];
  characterLimit?: number;
}

export interface ShareTemplateVariables {
  referralCode: string;
  referrerName: string;
  facilityName: string;
  tier: string;
  totalReferrals: number;
  referralLink: string;
}

/**
 * Generate personalized share content from template
 */
export function generateShareContent(
  template: ShareTemplate,
  variables: ShareTemplateVariables
): string {
  let content = template.content;
  
  // Replace all variables
  content = content.replace(/\{referralCode\}/g, variables.referralCode);
  content = content.replace(/\{referrerName\}/g, variables.referrerName);
  content = content.replace(/\{facilityName\}/g, variables.facilityName);
  content = content.replace(/\{tier\}/g, variables.tier);
  content = content.replace(/\{totalReferrals\}/g, variables.totalReferrals.toString());
  content = content.replace(/\{referralLink\}/g, variables.referralLink);
  
  // Add hashtags for social media
  if (template.hashtags && template.hashtags.length > 0) {
    content += '\n\n' + template.hashtags.map(tag => `#${tag}`).join(' ');
  }
  
  return content;
}

/**
 * Email Templates
 */
export const EMAIL_TEMPLATES: ShareTemplate[] = [
  {
    id: 'email-professional',
    platform: 'email',
    title: 'Professional Email',
    description: 'Formal introduction for business contacts',
    content: `Subject: Transform Your Care Facility with AI-Powered Management

Hi,

I wanted to share an exciting opportunity with you. I recently became a founding member of HarmonyCare, an AI-native care management platform that's revolutionizing how we handle resident care documentation and operations.

Since implementing HarmonyCare at {facilityName}, we've seen remarkable improvements:
• 60% reduction in paperwork time for caregivers
• 24/7 AI agents handling routine tasks
• Automated compliance and documentation
• Real-time family engagement tools

As a founding member, I've locked in 56-65% off regular pricing forever. You can join the founding member program too and get the same exclusive rates.

Use my referral code: {referralCode}

Learn more and sign up here: {referralLink}

I'd be happy to discuss my experience with HarmonyCare if you have any questions.

Best regards,
{referrerName}
{facilityName}`,
  },
  {
    id: 'email-casual',
    platform: 'email',
    title: 'Casual Email',
    description: 'Friendly recommendation for peers',
    content: `Subject: You need to check out HarmonyCare! 🚀

Hey!

I just had to share this with you. I recently joined HarmonyCare as a founding member, and it's been a game-changer for {facilityName}.

Imagine having 20 AI agents working 24/7 for your facility - handling documentation, answering family questions, managing schedules, and more. Our caregivers are spending 60% less time on paperwork and way more time with residents.

The best part? As a founding member, I locked in 56-65% off forever. And you can too!

Use my code {referralCode} when you sign up: {referralLink}

We'll both get rewards, and your facility will thank you. Trust me on this one!

Let me know if you want to chat about it!

{referrerName}`,
  },
  {
    id: 'email-testimonial',
    platform: 'email',
    title: 'Personal Testimonial',
    description: 'Share your success story',
    content: `Subject: How We Transformed Care at {facilityName}

Hi,

I'm reaching out to share our experience with HarmonyCare, an AI-powered care management platform that's genuinely transformed operations at {facilityName}.

Before HarmonyCare:
• Caregivers spent 60% of their time on paperwork
• Family communication was reactive and time-consuming
• Compliance documentation was a constant headache
• Staff felt overwhelmed and burned out

After HarmonyCare:
• Paperwork reduced by 60% - caregivers focus on care
• Families get real-time updates and can message AI agents 24/7
• Compliance is automated and always up-to-date
• Staff morale has significantly improved

I became a founding member to lock in exclusive pricing (56-65% off forever), and I want to extend this opportunity to you.

Use my referral code: {referralCode}
Sign up here: {referralLink}

Happy to answer any questions about our implementation and results.

Best,
{referrerName}
{facilityName}`,
  },
];

/**
 * LinkedIn Templates
 */
export const LINKEDIN_TEMPLATES: ShareTemplate[] = [
  {
    id: 'linkedin-announcement',
    platform: 'linkedin',
    title: 'Professional Announcement',
    description: 'Share your founding member status',
    content: `🚀 Excited to announce that {facilityName} is now a HarmonyCare Founding Member!

We've joined an innovative AI-native care management platform that's transforming how care facilities operate. Since implementation:

✅ 60% reduction in caregiver paperwork
✅ 24/7 AI-powered family engagement
✅ Automated compliance & documentation
✅ Real-time operational insights

As a founding member, we've locked in exclusive pricing forever (56-65% off). If you manage a care facility and want to transform your operations, I highly recommend checking out HarmonyCare.

Use my referral code {referralCode} to join the founding member program: {referralLink}

Let's revolutionize care management together!`,
    hashtags: ['HarmonyCare', 'HealthcareInnovation', 'AIinHealthcare', 'CareManagement', 'FoundingMember'],
  },
  {
    id: 'linkedin-results',
    platform: 'linkedin',
    title: 'Results-Focused Post',
    description: 'Highlight measurable improvements',
    content: `📊 Real results from implementing AI-powered care management at {facilityName}:

30 days with HarmonyCare:
• Caregiver documentation time: -60%
• Family satisfaction scores: +45%
• Compliance audit prep time: -80%
• Staff retention: Improved significantly

The platform uses 20 specialized AI agents working 24/7 to handle everything from documentation to family communication to medication coordination.

As a founding member, I've secured lifetime pricing at 56-65% off. This opportunity is still available for other care facilities.

Interested in similar results? Use code {referralCode}: {referralLink}

Happy to connect and discuss our implementation experience.`,
    hashtags: ['HealthTech', 'CareInnovation', 'AITransformation', 'SeniorCare', 'HealthcareLeadership'],
  },
  {
    id: 'linkedin-problem-solution',
    platform: 'linkedin',
    title: 'Problem-Solution Story',
    description: 'Address common care facility challenges',
    content: `The Problem: Caregivers spending 60% of their time on paperwork instead of providing care.

The Solution: AI-native care management that actually works.

At {facilityName}, we implemented HarmonyCare and the transformation has been remarkable. Our caregivers now focus on what they do best - caring for residents - while 20 AI agents handle documentation, family communication, compliance, scheduling, and more.

The best part? As a founding member, we locked in 56-65% off forever.

If you're facing similar challenges at your facility, I encourage you to explore HarmonyCare. Use my referral code {referralCode} to join the founding member program: {referralLink}

Let's give caregivers their time back.`,
    hashtags: ['CaregiverSupport', 'HealthcareAI', 'SeniorLiving', 'Innovation', 'HealthcareManagement'],
  },
];

/**
 * Twitter Templates
 */
export const TWITTER_TEMPLATES: ShareTemplate[] = [
  {
    id: 'twitter-short',
    platform: 'twitter',
    title: 'Quick Recommendation',
    description: 'Short and impactful',
    content: `🚀 Just became a @HarmonyCare founding member! AI-powered care management that cuts paperwork by 60% and gives caregivers their time back.

Founding members get 56-65% off forever. Use code {referralCode}: {referralLink}`,
    hashtags: ['HealthTech', 'AIinHealthcare', 'CareInnovation'],
    characterLimit: 280,
  },
  {
    id: 'twitter-results',
    platform: 'twitter',
    title: 'Results Thread Starter',
    description: 'Start a thread about your results',
    content: `30 days with @HarmonyCare at {facilityName}: 🧵

✅ 60% less paperwork for caregivers
✅ 24/7 AI family support
✅ Automated compliance
✅ Happier staff & families

Founding member pricing still available (56-65% off forever). Code: {referralCode}
{referralLink}`,
    hashtags: ['HealthcareTransformation', 'SeniorCare'],
    characterLimit: 280,
  },
  {
    id: 'twitter-testimonial',
    platform: 'twitter',
    title: 'Personal Testimonial',
    description: 'Share your experience',
    content: `Best decision for {facilityName}: becoming a @HarmonyCare founding member.

20 AI agents working 24/7. Caregivers spending 60% less time on paperwork. Families getting instant responses.

Join the founding member program: {referralCode}
{referralLink}`,
    hashtags: ['HealthcareInnovation', 'AIforGood'],
    characterLimit: 280,
  },
];

/**
 * Facebook Templates
 */
export const FACEBOOK_TEMPLATES: ShareTemplate[] = [
  {
    id: 'facebook-story',
    platform: 'facebook',
    title: 'Personal Story',
    description: 'Share your journey with HarmonyCare',
    content: `🌟 Exciting news for {facilityName}! 🌟

We've joined HarmonyCare as founding members, and I couldn't be more excited about this transformation!

For years, I've watched our amazing caregivers spend more time on paperwork than with residents. It was heartbreaking. But HarmonyCare has changed everything.

Now we have 20 AI agents working around the clock:
🤖 Handling documentation automatically
💬 Answering family questions 24/7
📋 Managing compliance and schedules
📊 Providing real-time insights

Our caregivers are spending 60% less time on paperwork and way more time doing what they love - caring for residents. Family satisfaction is through the roof because they can get updates and answers anytime.

As a founding member, we locked in 56-65% off forever. This opportunity is still available!

If you manage a care facility and want to give your caregivers their time back, use my referral code: {referralCode}

Learn more: {referralLink}

Happy to answer any questions! 💙`,
    hashtags: ['HarmonyCare', 'CaregiverSupport', 'SeniorCare', 'HealthcareInnovation', 'FoundingMember'],
  },
  {
    id: 'facebook-community',
    platform: 'facebook',
    title: 'Community Recommendation',
    description: 'Recommend to care facility groups',
    content: `Hey everyone! 👋

I wanted to share something that's been a game-changer for {facilityName}.

We recently became founding members of HarmonyCare - an AI-powered care management platform. I was skeptical at first (another tech solution promising the world, right?), but this one actually delivers.

Real results in 30 days:
✅ Caregivers spending 60% less time on paperwork
✅ Families getting 24/7 support from AI agents
✅ Compliance documentation automated
✅ Staff morale significantly improved

The platform has 20 specialized AI agents handling everything from documentation to family communication to medication coordination. It's like having a full support team working 24/7.

Founding member pricing is 56-65% off forever, and you can still join!

Use my code {referralCode} when signing up: {referralLink}

Happy to chat more about our experience if anyone has questions! 💬`,
    hashtags: ['CareManagement', 'HealthTech', 'SeniorLiving'],
  },
];

/**
 * Get all templates for a specific platform
 */
export function getTemplatesByPlatform(platform: ShareTemplate['platform']): ShareTemplate[] {
  switch (platform) {
    case 'email':
      return EMAIL_TEMPLATES;
    case 'linkedin':
      return LINKEDIN_TEMPLATES;
    case 'twitter':
      return TWITTER_TEMPLATES;
    case 'facebook':
      return FACEBOOK_TEMPLATES;
    default:
      return [];
  }
}

/**
 * Get all available templates
 */
export function getAllTemplates(): ShareTemplate[] {
  return [
    ...EMAIL_TEMPLATES,
    ...LINKEDIN_TEMPLATES,
    ...TWITTER_TEMPLATES,
    ...FACEBOOK_TEMPLATES,
  ];
}

/**
 * Generate share URL for different platforms
 */
export function generatePlatformShareUrl(
  platform: ShareTemplate['platform'],
  content: string,
  url: string
): string {
  const encodedContent = encodeURIComponent(content);
  const encodedUrl = encodeURIComponent(url);
  
  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedContent}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedContent}`;
    case 'email':
      const subject = encodeURIComponent('Join HarmonyCare as a Founding Member');
      return `mailto:?subject=${subject}&body=${encodedContent}`;
    default:
      return url;
  }
}
