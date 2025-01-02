import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "~/utils/email"; // Utility to send emails

export const userRouter = createTRPCRouter({
  signup: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, email, password } = input;

      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already exists",
        });
      }

      // Generate verification code
      const verificationCode = nanoid(6); // 6-character random code
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 mins

      // Store verification code in the database
      await ctx.db.emailVerificationCode.create({
        data: { email, code: verificationCode, expiresAt },
      });

      // Send verification email
      await sendEmail(email, `Your verification code is: ${verificationCode}`);

      return { message: "Verification code sent to your email" };
    }),

  verifyCode: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { email, code, password } = input;

      // Find the verification code
      const verificationRecord = await ctx.db.emailVerificationCode.findFirst({
        where: { email, code },
      });

      if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired code",
        });
      }

      //   // Hash the password
      //   const bcrypt = await import("bcryptjs");
      //   const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
      const user = await ctx.db.user.create({
        data: { email, password, isVerified: true },
      });

      // Clean up verification records
      await ctx.db.emailVerificationCode.deleteMany({ where: { email } });

      return { message: "User verified and created successfully", user };
    }),
});
