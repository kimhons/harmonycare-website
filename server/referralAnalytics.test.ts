import { describe, expect, it } from "vitest";
import { getReferralAnalytics } from "./referralAnalytics";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-admin",
      name: "Admin User",
      email: "admin@test.com",
      role: "admin",
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

describe("Referral Analytics", () => {
  it("returns referral analytics structure", async () => {
    const analytics = await getReferralAnalytics();
    
    expect(analytics).toBeDefined();
    expect(analytics).toHaveProperty("totalReferrals");
    expect(analytics).toHaveProperty("totalReferrers");
    expect(analytics).toHaveProperty("averageReferralsPerReferrer");
    expect(analytics).toHaveProperty("conversionRate");
    expect(analytics).toHaveProperty("topReferrers");
    expect(analytics).toHaveProperty("referralsByDay");
    expect(analytics).toHaveProperty("referralsByTier");
  });

  it("returns valid numeric values", async () => {
    const analytics = await getReferralAnalytics();
    
    expect(typeof analytics.totalReferrals).toBe("number");
    expect(typeof analytics.totalReferrers).toBe("number");
    expect(typeof analytics.averageReferralsPerReferrer).toBe("number");
    expect(typeof analytics.conversionRate).toBe("number");
    
    expect(analytics.totalReferrals).toBeGreaterThanOrEqual(0);
    expect(analytics.totalReferrers).toBeGreaterThanOrEqual(0);
    expect(analytics.averageReferralsPerReferrer).toBeGreaterThanOrEqual(0);
    expect(analytics.conversionRate).toBeGreaterThanOrEqual(0);
    expect(analytics.conversionRate).toBeLessThanOrEqual(100);
  });

  it("returns array of top referrers", async () => {
    const analytics = await getReferralAnalytics();
    
    expect(Array.isArray(analytics.topReferrers)).toBe(true);
    expect(analytics.topReferrers.length).toBeLessThanOrEqual(10);
    
    // Validate referrer structure if any exist
    if (analytics.topReferrers.length > 0) {
      const firstReferrer = analytics.topReferrers[0];
      expect(firstReferrer).toHaveProperty("signupId");
      expect(firstReferrer).toHaveProperty("name");
      expect(firstReferrer).toHaveProperty("email");
      expect(firstReferrer).toHaveProperty("facilityName");
      expect(firstReferrer).toHaveProperty("ownReferralCode");
      expect(firstReferrer).toHaveProperty("totalReferrals");
      expect(firstReferrer).toHaveProperty("successfulConversions");
      expect(firstReferrer).toHaveProperty("conversionRate");
      expect(firstReferrer).toHaveProperty("tier");
    }
  });

  it("sorts top referrers by total referrals descending", async () => {
    const analytics = await getReferralAnalytics();
    
    if (analytics.topReferrers.length > 1) {
      for (let i = 0; i < analytics.topReferrers.length - 1; i++) {
        expect(analytics.topReferrers[i].totalReferrals).toBeGreaterThanOrEqual(
          analytics.topReferrers[i + 1].totalReferrals
        );
      }
    }
  });

  it("returns valid referralsByDay structure", async () => {
    const analytics = await getReferralAnalytics();
    
    expect(typeof analytics.referralsByDay).toBe("object");
    
    // Validate date format if any entries exist
    Object.keys(analytics.referralsByDay).forEach(date => {
      // Should be ISO date format (YYYY-MM-DD)
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof analytics.referralsByDay[date]).toBe("number");
      expect(analytics.referralsByDay[date]).toBeGreaterThan(0);
    });
  });

  it("returns valid referralsByTier structure", async () => {
    const analytics = await getReferralAnalytics();
    
    expect(typeof analytics.referralsByTier).toBe("object");
    
    // Validate tier counts
    Object.keys(analytics.referralsByTier).forEach(tier => {
      expect(typeof analytics.referralsByTier[tier]).toBe("number");
      expect(analytics.referralsByTier[tier]).toBeGreaterThan(0);
    });
  });

  it("calculates conversion rate correctly", async () => {
    const analytics = await getReferralAnalytics();
    
    // Conversion rate should be 0 if no referrers
    if (analytics.totalReferrers === 0) {
      expect(analytics.conversionRate).toBe(0);
    }
    
    // Conversion rate should be between 0 and 100
    expect(analytics.conversionRate).toBeGreaterThanOrEqual(0);
    expect(analytics.conversionRate).toBeLessThanOrEqual(100);
  });

  it("calculates average referrals correctly", async () => {
    const analytics = await getReferralAnalytics();
    
    // Average should be 0 if no referrers
    if (analytics.totalReferrers === 0) {
      expect(analytics.averageReferralsPerReferrer).toBe(0);
    } else {
      // Average should be total referrals divided by total referrers
      const expectedAvg = analytics.totalReferrals / analytics.totalReferrers;
      expect(analytics.averageReferralsPerReferrer).toBeCloseTo(expectedAvg, 1);
    }
  });
});

describe("Admin Analytics API with Referrals", () => {
  it("includes referral analytics in admin analytics endpoint", async () => {
    const ctx = createMockAdminContext();
    const caller = appRouter.createCaller(ctx);

    const analytics = await caller.admin.analytics();

    expect(analytics).toHaveProperty("referralAnalytics");
    expect(analytics.referralAnalytics).toBeDefined();
    expect(analytics.referralAnalytics).toHaveProperty("totalReferrals");
    expect(analytics.referralAnalytics).toHaveProperty("topReferrers");
  });

  it("requires admin role for analytics", async () => {
    const ctx: TrpcContext = {
      user: {
        id: 2,
        openId: "test-user",
        name: "Regular User",
        email: "user@test.com",
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
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.analytics()).rejects.toThrow("Unauthorized");
  });

  it("requires authentication for analytics", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.analytics()).rejects.toThrow("Unauthorized");
  });
});

describe("Referral Analytics Edge Cases", () => {
  it("handles empty referral data gracefully", async () => {
    const analytics = await getReferralAnalytics();
    
    // Should not throw errors even with no data
    expect(analytics).toBeDefined();
    expect(analytics.topReferrers).toBeDefined();
    expect(Array.isArray(analytics.topReferrers)).toBe(true);
  });

  it("validates referrer stats have consistent data", async () => {
    const analytics = await getReferralAnalytics();
    
    analytics.topReferrers.forEach(referrer => {
      // Successful conversions should not exceed total referrals
      expect(referrer.successfulConversions).toBeLessThanOrEqual(referrer.totalReferrals);
      
      // Conversion rate should match the calculation
      const expectedRate = referrer.totalReferrals > 0
        ? Math.round((referrer.successfulConversions / referrer.totalReferrals) * 100)
        : 0;
      expect(referrer.conversionRate).toBe(expectedRate);
      
      // All fields should be present
      expect(referrer.signupId).toBeGreaterThan(0);
      expect(referrer.name).toBeTruthy();
      expect(referrer.email).toBeTruthy();
      expect(referrer.facilityName).toBeTruthy();
      expect(referrer.ownReferralCode).toBeTruthy();
      expect(referrer.tier).toBeTruthy();
    });
  });

  it("ensures referralsByDay only includes last 30 days", async () => {
    const analytics = await getReferralAnalytics();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    Object.keys(analytics.referralsByDay).forEach(dateStr => {
      const date = new Date(dateStr);
      expect(date.getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo.getTime());
    });
  });
});
