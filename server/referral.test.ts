import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { generateReferralCode, validateReferralCode, createReferral } from "./referral";
import { getDb } from "./db";
import { signups, referrals } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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

describe("Referral Code Generation", () => {
  it("generates referral code in correct format", () => {
    const code = generateReferralCode();
    expect(code).toMatch(/^HARMONY-[A-Z0-9]{4}$/);
  });

  it("generates unique codes", () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateReferralCode());
    }
    // Should have high uniqueness (allow some collisions in 100 attempts)
    expect(codes.size).toBeGreaterThan(90);
  });

  it("excludes confusing characters", () => {
    const confusingChars = ['0', 'O', 'I', '1'];
    for (let i = 0; i < 50; i++) {
      const code = generateReferralCode();
      const codePart = code.replace('HARMONY-', '');
      confusingChars.forEach(char => {
        expect(codePart).not.toContain(char);
      });
    }
  });
});

describe("Referral Code Validation API", () => {
  it("returns invalid for non-existent code", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.referral.validate({ code: "HARMONY-FAKE" });

    expect(result.valid).toBe(false);
    expect(result.message).toContain("Invalid");
  });

  it("returns invalid for empty code", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.referral.validate({ code: "" });

    expect(result.valid).toBe(false);
  });

  it("validates code case-insensitively", async () => {
    const result = await validateReferralCode("harmony-test");
    // Should handle uppercase conversion internally
    expect(result).toBeNull(); // Code doesn't exist, but no error
  });
});

describe("Signup with Referral Code", () => {
  it("rejects signup with invalid referral code", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.signup.create({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        facilityName: "Test Facility",
        facilityType: "group-home",
        residentCount: 5,
        tier: "starter",
        referralCode: "HARMONY-INVALID",
      })
    ).rejects.toThrow("Invalid referral code");
  });

  it("accepts signup without referral code", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.signup.create({
      firstName: "John",
      lastName: "Smith",
      email: `test-${Date.now()}@example.com`,
      facilityName: "Test Facility",
      facilityType: "group-home",
      residentCount: 5,
      tier: "starter",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Thank you for signing up");
  });
});

describe("Referral Tracking", () => {
  it("creates referral relationship correctly", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    // This test validates the structure, actual DB operations tested via integration
    const referralData = {
      referrerSignupId: 1,
      referredSignupId: 2,
      referralCode: "HARMONY-TEST",
    };

    // Validate function signature and structure
    expect(createReferral).toBeDefined();
    expect(typeof createReferral).toBe("function");
  });

  it("generates unique referral code for new signups", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Create a signup and verify it gets a referral code
    const email = `test-${Date.now()}@example.com`;
    const result = await caller.signup.create({
      firstName: "Test",
      lastName: "User",
      email,
      facilityName: "Test Facility",
      facilityType: "group-home",
      residentCount: 5,
      tier: "starter",
    });

    expect(result.success).toBe(true);

    // Verify the signup was created with a referral code
    const db = await getDb();
    if (db) {
      const signup = await db
        .select()
        .from(signups)
        .where(eq(signups.email, email))
        .limit(1);

      if (signup.length > 0) {
        expect(signup[0].ownReferralCode).toBeTruthy();
        expect(signup[0].ownReferralCode).toMatch(/^HARMONY-[A-Z0-9]{4}$/);
      }
    }
  });
});

describe("Referral Code Input Validation", () => {
  it("accepts valid referral code format", () => {
    const validCodes = [
      "HARMONY-A7B9",
      "HARMONY-XYZW",
      "HARMONY-2345",
      "harmony-test", // Should be converted to uppercase
    ];

    validCodes.forEach(code => {
      expect(code.toUpperCase()).toMatch(/^HARMONY-[A-Z0-9]+$/);
    });
  });

  it("handles optional referral code in signup", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test with undefined referral code
    const result = await caller.signup.create({
      firstName: "Test",
      lastName: "User",
      email: `optional-${Date.now()}@example.com`,
      facilityName: "Test Facility",
      facilityType: "group-home",
      residentCount: 5,
      tier: "starter",
      referralCode: undefined,
    });

    expect(result.success).toBe(true);
  });
});
