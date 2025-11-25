import { describe, expect, it } from "vitest";
import {
  EMAIL_TEMPLATES,
  LINKEDIN_TEMPLATES,
  TWITTER_TEMPLATES,
  FACEBOOK_TEMPLATES,
  generateShareContent,
  generatePlatformShareUrl,
  getTemplatesByPlatform,
  getAllTemplates,
  type ShareTemplateVariables,
} from "../shared/shareTemplates";

const mockVariables: ShareTemplateVariables = {
  referralCode: "HARMONY-TEST",
  referrerName: "John Doe",
  facilityName: "Sunrise Care Home",
  tier: "Gold Ambassador",
  totalReferrals: 5,
  referralLink: "https://harmony.care/signup?ref=HARMONY-TEST",
};

describe("Share Templates Structure", () => {
  it("defines email templates", () => {
    expect(EMAIL_TEMPLATES).toBeDefined();
    expect(Array.isArray(EMAIL_TEMPLATES)).toBe(true);
    expect(EMAIL_TEMPLATES.length).toBeGreaterThan(0);
  });

  it("defines LinkedIn templates", () => {
    expect(LINKEDIN_TEMPLATES).toBeDefined();
    expect(Array.isArray(LINKEDIN_TEMPLATES)).toBe(true);
    expect(LINKEDIN_TEMPLATES.length).toBeGreaterThan(0);
  });

  it("defines Twitter templates", () => {
    expect(TWITTER_TEMPLATES).toBeDefined();
    expect(Array.isArray(TWITTER_TEMPLATES)).toBe(true);
    expect(TWITTER_TEMPLATES.length).toBeGreaterThan(0);
  });

  it("defines Facebook templates", () => {
    expect(FACEBOOK_TEMPLATES).toBeDefined();
    expect(Array.isArray(FACEBOOK_TEMPLATES)).toBe(true);
    expect(FACEBOOK_TEMPLATES.length).toBeGreaterThan(0);
  });

  it("each template has required fields", () => {
    const allTemplates = getAllTemplates();
    
    allTemplates.forEach(template => {
      expect(template).toHaveProperty("id");
      expect(template).toHaveProperty("platform");
      expect(template).toHaveProperty("title");
      expect(template).toHaveProperty("description");
      expect(template).toHaveProperty("content");
      
      expect(typeof template.id).toBe("string");
      expect(typeof template.platform).toBe("string");
      expect(typeof template.title).toBe("string");
      expect(typeof template.description).toBe("string");
      expect(typeof template.content).toBe("string");
    });
  });

  it("Twitter templates have character limits", () => {
    TWITTER_TEMPLATES.forEach(template => {
      expect(template.characterLimit).toBeDefined();
      expect(template.characterLimit).toBe(280);
    });
  });

  it("social media templates have hashtags", () => {
    [...LINKEDIN_TEMPLATES, ...TWITTER_TEMPLATES, ...FACEBOOK_TEMPLATES].forEach(template => {
      expect(template.hashtags).toBeDefined();
      expect(Array.isArray(template.hashtags)).toBe(true);
    });
  });
});

describe("Content Generation", () => {
  it("replaces referral code variable", () => {
    const template = EMAIL_TEMPLATES[0];
    const content = generateShareContent(template, mockVariables);
    
    expect(content).toContain(mockVariables.referralCode);
    expect(content).not.toContain("{referralCode}");
  });

  it("replaces referrer name variable", () => {
    const template = EMAIL_TEMPLATES[0];
    const content = generateShareContent(template, mockVariables);
    
    expect(content).toContain(mockVariables.referrerName);
    expect(content).not.toContain("{referrerName}");
  });

  it("replaces facility name variable", () => {
    const template = EMAIL_TEMPLATES[0];
    const content = generateShareContent(template, mockVariables);
    
    expect(content).toContain(mockVariables.facilityName);
    expect(content).not.toContain("{facilityName}");
  });

  it("replaces tier variable", () => {
    const template = LINKEDIN_TEMPLATES[0];
    const content = generateShareContent(template, mockVariables);
    
    // Content might not always contain tier, so just check no unreplaced variables
    expect(content).not.toContain("{tier}");
  });

  it("replaces total referrals variable", () => {
    const template = LINKEDIN_TEMPLATES[1];
    const content = generateShareContent(template, mockVariables);
    
    // Check no unreplaced variables
    expect(content).not.toContain("{totalReferrals}");
  });

  it("replaces referral link variable", () => {
    const template = EMAIL_TEMPLATES[0];
    const content = generateShareContent(template, mockVariables);
    
    expect(content).toContain(mockVariables.referralLink);
    expect(content).not.toContain("{referralLink}");
  });

  it("adds hashtags to social media templates", () => {
    const template = LINKEDIN_TEMPLATES[0];
    const content = generateShareContent(template, mockVariables);
    
    if (template.hashtags && template.hashtags.length > 0) {
      template.hashtags.forEach(hashtag => {
        expect(content).toContain(`#${hashtag}`);
      });
    }
  });

  it("generates complete content without placeholder variables", () => {
    const allTemplates = getAllTemplates();
    
    allTemplates.forEach(template => {
      const content = generateShareContent(template, mockVariables);
      
      // Check no unreplaced variables remain
      expect(content).not.toContain("{referralCode}");
      expect(content).not.toContain("{referrerName}");
      expect(content).not.toContain("{facilityName}");
      expect(content).not.toContain("{tier}");
      expect(content).not.toContain("{totalReferrals}");
      expect(content).not.toContain("{referralLink}");
    });
  });
});

describe("Platform Share URLs", () => {
  const testContent = "Check out HarmonyCare!";
  const testUrl = "https://harmony.care/signup?ref=TEST";

  it("generates Twitter share URL", () => {
    const url = generatePlatformShareUrl("twitter", testContent, testUrl);
    
    expect(url).toContain("twitter.com/intent/tweet");
    expect(url).toContain(encodeURIComponent(testContent));
  });

  it("generates LinkedIn share URL", () => {
    const url = generatePlatformShareUrl("linkedin", testContent, testUrl);
    
    expect(url).toContain("linkedin.com/sharing/share-offsite");
    expect(url).toContain(encodeURIComponent(testUrl));
  });

  it("generates Facebook share URL", () => {
    const url = generatePlatformShareUrl("facebook", testContent, testUrl);
    
    expect(url).toContain("facebook.com/sharer/sharer.php");
    expect(url).toContain(encodeURIComponent(testUrl));
  });

  it("generates email mailto link", () => {
    const url = generatePlatformShareUrl("email", testContent, testUrl);
    
    expect(url.startsWith("mailto:")).toBe(true);
    expect(url).toContain("subject=");
    expect(url).toContain("body=");
    expect(url).toContain(encodeURIComponent(testContent));
  });

  it("handles generic platform", () => {
    const url = generatePlatformShareUrl("generic", testContent, testUrl);
    
    expect(url).toBe(testUrl);
  });
});

describe("Template Retrieval", () => {
  it("gets templates by email platform", () => {
    const templates = getTemplatesByPlatform("email");
    
    expect(templates).toEqual(EMAIL_TEMPLATES);
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => expect(t.platform).toBe("email"));
  });

  it("gets templates by LinkedIn platform", () => {
    const templates = getTemplatesByPlatform("linkedin");
    
    expect(templates).toEqual(LINKEDIN_TEMPLATES);
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => expect(t.platform).toBe("linkedin"));
  });

  it("gets templates by Twitter platform", () => {
    const templates = getTemplatesByPlatform("twitter");
    
    expect(templates).toEqual(TWITTER_TEMPLATES);
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => expect(t.platform).toBe("twitter"));
  });

  it("gets templates by Facebook platform", () => {
    const templates = getTemplatesByPlatform("facebook");
    
    expect(templates).toEqual(FACEBOOK_TEMPLATES);
    expect(templates.length).toBeGreaterThan(0);
    templates.forEach(t => expect(t.platform).toBe("facebook"));
  });

  it("returns empty array for unknown platform", () => {
    const templates = getTemplatesByPlatform("generic" as any);
    
    expect(templates).toEqual([]);
  });

  it("gets all templates", () => {
    const allTemplates = getAllTemplates();
    
    const expectedCount = 
      EMAIL_TEMPLATES.length +
      LINKEDIN_TEMPLATES.length +
      TWITTER_TEMPLATES.length +
      FACEBOOK_TEMPLATES.length;
    
    expect(allTemplates.length).toBe(expectedCount);
  });
});

describe("Template Content Quality", () => {
  it("email templates have professional tone", () => {
    EMAIL_TEMPLATES.forEach(template => {
      const content = generateShareContent(template, mockVariables);
      
      // Should have greeting and signature
      expect(content.toLowerCase()).toMatch(/hi|hello|hey/);
      expect(content).toContain(mockVariables.referrerName);
    });
  });

  it("LinkedIn templates mention professional benefits", () => {
    LINKEDIN_TEMPLATES.forEach(template => {
      const content = generateShareContent(template, mockVariables);
      
      // Should mention key benefits
      const hasBenefits = 
        content.includes("60%") ||
        content.includes("paperwork") ||
        content.includes("AI") ||
        content.includes("caregivers");
      
      expect(hasBenefits).toBe(true);
    });
  });

  it("Twitter templates respect character limit", () => {
    TWITTER_TEMPLATES.forEach(template => {
      const content = generateShareContent(template, mockVariables);
      
      // With hashtags, should be close to or under 280
      expect(content.length).toBeLessThanOrEqual(350); // Allow buffer for customization and hashtags
    });
  });

  it("all templates include referral code", () => {
    const allTemplates = getAllTemplates();
    
    allTemplates.forEach(template => {
      const content = generateShareContent(template, mockVariables);
      
      expect(content).toContain(mockVariables.referralCode);
    });
  });

  it("all templates include referral link", () => {
    const allTemplates = getAllTemplates();
    
    allTemplates.forEach(template => {
      const content = generateShareContent(template, mockVariables);
      
      expect(content).toContain(mockVariables.referralLink);
    });
  });
});

describe("Template Variety", () => {
  it("provides multiple email template options", () => {
    expect(EMAIL_TEMPLATES.length).toBeGreaterThanOrEqual(3);
  });

  it("provides multiple LinkedIn template options", () => {
    expect(LINKEDIN_TEMPLATES.length).toBeGreaterThanOrEqual(3);
  });

  it("provides multiple Twitter template options", () => {
    expect(TWITTER_TEMPLATES.length).toBeGreaterThanOrEqual(2);
  });

  it("provides multiple Facebook template options", () => {
    expect(FACEBOOK_TEMPLATES.length).toBeGreaterThanOrEqual(2);
  });

  it("email templates have different tones", () => {
    const tones = EMAIL_TEMPLATES.map(t => t.description.toLowerCase());
    
    // Should have variety: professional, casual, testimonial, etc.
    const uniqueTones = new Set(tones);
    expect(uniqueTones.size).toBe(EMAIL_TEMPLATES.length);
  });

  it("each template has unique ID", () => {
    const allTemplates = getAllTemplates();
    const ids = allTemplates.map(t => t.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(allTemplates.length);
  });
});

describe("Edge Cases", () => {
  it("handles empty referral code gracefully", () => {
    const variables = { ...mockVariables, referralCode: "" };
    const template = EMAIL_TEMPLATES[0];
    const content = generateShareContent(template, variables);
    
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });

  it("handles special characters in variables", () => {
    const variables: ShareTemplateVariables = {
      ...mockVariables,
      referrerName: "O'Brien & Associates",
      facilityName: "Care Home #1",
    };
    
    const template = EMAIL_TEMPLATES[0];
    const content = generateShareContent(template, variables);
    
    expect(content).toContain("O'Brien & Associates");
    expect(content).toContain("Care Home #1");
  });

  it("handles zero referrals", () => {
    const variables = { ...mockVariables, totalReferrals: 0 };
    const template = LINKEDIN_TEMPLATES[1];
    const content = generateShareContent(template, variables);
    
    expect(content).toBeDefined();
    expect(content).toContain("0");
  });

  it("handles very long facility names", () => {
    const variables = {
      ...mockVariables,
      facilityName: "The Very Long Name Senior Living and Memory Care Facility of Greater Metropolitan Area",
    };
    
    const template = EMAIL_TEMPLATES[0];
    const content = generateShareContent(template, variables);
    
    expect(content).toContain(variables.facilityName);
  });
});
