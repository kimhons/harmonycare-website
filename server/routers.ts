import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createSignup } from "./db";
import { sendWelcomeEmail } from "./email";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  signup: router({
    create: publicProcedure
      .input(
        z.object({
          firstName: z.string().min(1, "First name is required"),
          lastName: z.string().min(1, "Last name is required"),
          email: z.string().email("Invalid email address"),
          phone: z.string().optional(),
          facilityName: z.string().min(1, "Facility name is required"),
          facilityType: z.string().min(1, "Facility type is required"),
          residentCount: z.number().min(1, "Resident count must be at least 1"),
          tier: z.string().min(1, "Please select a tier"),
          interestedFeatures: z.array(z.string()).optional(),
          additionalNeeds: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Store interested features as JSON string
        const signupData = {
          ...input,
          interestedFeatures: input.interestedFeatures
            ? JSON.stringify(input.interestedFeatures)
            : null,
        };

        await createSignup(signupData);

        // Send welcome email
        try {
          await sendWelcomeEmail({
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            facilityName: input.facilityName,
            tier: input.tier,
          });
        } catch (emailError) {
          console.error('[Signup] Failed to send welcome email:', emailError);
          // Don't fail the signup if email fails
        }

        return {
          success: true,
          message: "Thank you for signing up! Check your email for confirmation.",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
