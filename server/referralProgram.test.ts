import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getCurrentTier, getNextTier, getProgressToNextTier, REWARD_TIERS } from "../shared/referralRewards";

function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createMockUserContext(email: string): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email,
      role: "user",
      loginMethod: "oauth",
      lastSignedIn: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Reward Tiers System", () => {
  it("defines all reward tiers correctly", () => {
    expect(REWARD_TIERS).toHaveLength(5);
    expect(REWARD_TIERS[0].id).toBe("bronze");
    expect(REWARD_TIERS[1].id).toBe("silver");
    expect(REWARD_TIERS[2].id).toBe("gold");
    expect(REWARD_TIERS[3].id).toBe("platinum");
    expect(REWARD_TIERS[4].id).toBe("diamond");
  });

  it("has ascending referral requirements", () => {
    for (let i = 0; i < REWARD_TIERS.length - 1; i++) {
      expect(REWARD_TIERS[i].referralsRequired).toBeLessThan(
        REWARD_TIERS[i + 1].referralsRequired
      );
    }
  });

  it("each tier has benefits defined", () => {
    REWARD_TIERS.forEach(tier => {
      expect(tier.benefits).toBeDefined();
      expect(Array.isArray(tier.benefits)).toBe(true);
      expect(tier.benefits.length).toBeGreaterThan(0);
    });
  });

  it("each tier has badge and color", () => {
    REWARD_TIERS.forEach(tier => {
      expect(tier.badge).toBeTruthy();
      expect(tier.color).toBeTruthy();
      expect(tier.color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe("Tier Calculation Functions", () => {
  it("returns null for 0 referrals", () => {
    const tier = getCurrentTier(0);
    expect(tier).toBeNull();
  });

  it("returns bronze for 1 referral", () => {
    const tier = getCurrentTier(1);
    expect(tier).not.toBeNull();
    expect(tier?.id).toBe("bronze");
  });

  it("returns silver for 3 referrals", () => {
    const tier = getCurrentTier(3);
    expect(tier).not.toBeNull();
    expect(tier?.id).toBe("silver");
  });

  it("returns gold for 5 referrals", () => {
    const tier = getCurrentTier(5);
    expect(tier).not.toBeNull();
    expect(tier?.id).toBe("gold");
  });

  it("returns platinum for 10 referrals", () => {
    const tier = getCurrentTier(10);
    expect(tier).not.toBeNull();
    expect(tier?.id).toBe("platinum");
  });

  it("returns diamond for 20+ referrals", () => {
    const tier = getCurrentTier(20);
    expect(tier).not.toBeNull();
    expect(tier?.id).toBe("diamond");
    
    const tier25 = getCurrentTier(25);
    expect(tier25?.id).toBe("diamond");
  });

  it("getNextTier returns bronze for 0 referrals", () => {
    const nextTier = getNextTier(0);
    expect(nextTier).not.toBeNull();
    expect(nextTier?.id).toBe("bronze");
  });

  it("getNextTier returns silver for 1 referral", () => {
    const nextTier = getNextTier(1);
    expect(nextTier).not.toBeNull();
    expect(nextTier?.id).toBe("silver");
  });

  it("getNextTier returns null for max tier", () => {
    const nextTier = getNextTier(20);
    expect(nextTier).toBeNull();
  });
});

describe("Progress Calculation", () => {
  it("returns 0% progress at start of tier", () => {
    const progress = getProgressToNextTier(0);
    expect(progress).toBe(0);
  });

  it("returns 100% progress at max tier", () => {
    const progress = getProgressToNextTier(20);
    expect(progress).toBe(100);
  });

  it("calculates progress correctly between tiers", () => {
    // Between bronze (1) and silver (3): need 2 more
    const progress = getProgressToNextTier(2);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(100);
  });

  it("progress increases with more referrals", () => {
    const progress1 = getProgressToNextTier(1);
    const progress2 = getProgressToNextTier(2);
    expect(progress2).toBeGreaterThan(progress1);
  });
});

describe("Referral API - myReferrals", () => {
  it("requires authentication", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.referral.myReferrals()).rejects.toThrow("Unauthorized");
  });

  it("returns referral data structure for authenticated user", async () => {
    // This test validates the API structure
    // Actual data depends on database state
    const mockEmail = "test@example.com";
    const ctx = createMockUserContext(mockEmail);
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.referral.myReferrals();
      
      expect(result).toHaveProperty("referralCode");
      expect(result).toHaveProperty("totalReferrals");
      expect(result).toHaveProperty("referredUsers");
      expect(Array.isArray(result.referredUsers)).toBe(true);
      expect(typeof result.totalReferrals).toBe("number");
    } catch (error: any) {
      // User might not have a signup record, which is expected
      expect(error.message).toContain("Signup record not found");
    }
  });
});

describe("Referral Email Integration", () => {
  it("validates referral email template structure", async () => {
    // Import to ensure no syntax errors
    const emailModule = await import("./referralEmails");
    
    expect(typeof emailModule.sendReferralWelcomeEmail).toBe("function");
    expect(typeof emailModule.sendReferralSuccessEmail).toBe("function");
    expect(typeof emailModule.sendMilestoneEmail).toBe("function");
  });
});

describe("Complete Referral Flow", () => {
  it("validates signup with referral code flow", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test that signup accepts referral code parameter
    const signupData = {
      firstName: "Test",
      lastName: "User",
      email: `test-${Date.now()}@example.com`,
      facilityName: "Test Facility",
      facilityType: "group-home",
      residentCount: 5,
      tier: "starter",
      referralCode: "HARMONY-TEST",
    };

    try {
      await caller.signup.create(signupData);
      // If code is invalid, should throw
    } catch (error: any) {
      // Expected: invalid referral code
      expect(error.message).toContain("Invalid referral code");
    }
  });

  it("validates signup without referral code works", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const signupData = {
      firstName: "Test",
      lastName: "User",
      email: `test-no-ref-${Date.now()}@example.com`,
      facilityName: "Test Facility",
      facilityType: "group-home",
      residentCount: 5,
      tier: "starter",
    };

    const result = await caller.signup.create(signupData);
    expect(result.success).toBe(true);
  });
});

describe("Reward Tier Benefits", () => {
  it("bronze tier has appropriate benefits", () => {
    const bronze = REWARD_TIERS.find(t => t.id === "bronze");
    expect(bronze).toBeDefined();
    expect(bronze?.referralsRequired).toBe(1);
    expect(bronze?.benefits.length).toBeGreaterThan(0);
  });

  it("higher tiers have more benefits", () => {
    const bronze = REWARD_TIERS.find(t => t.id === "bronze");
    const diamond = REWARD_TIERS.find(t => t.id === "diamond");
    
    expect(diamond?.benefits.length).toBeGreaterThan(bronze?.benefits.length || 0);
  });

  it("diamond tier has premium benefits", () => {
    const diamond = REWARD_TIERS.find(t => t.id === "diamond");
    expect(diamond).toBeDefined();
    expect(diamond?.referralsRequired).toBe(20);
    
    const benefitsText = diamond?.benefits.join(" ").toLowerCase();
    expect(benefitsText).toContain("lifetime");
  });
});

describe("Referral Code Validation", () => {
  it("validates referral code format", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.referral.validate({ code: "HARMONY-TEST" });
    
    expect(result).toHaveProperty("valid");
    expect(result).toHaveProperty("message");
    expect(typeof result.valid).toBe("boolean");
    expect(typeof result.message).toBe("string");
  });

  it("handles empty referral code", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.referral.validate({ code: "" });
    
    expect(result.valid).toBe(false);
  });

  it("handles invalid referral code format", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.referral.validate({ code: "INVALID" });
    
    expect(result.valid).toBe(false);
    expect(result.message).toContain("Invalid");
  });
});
