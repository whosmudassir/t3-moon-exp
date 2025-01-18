import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "~/utils/email";
import bcrypt from "bcryptjs";
import { clearSession, encrypt } from "~/utils/lib";
import { cookies } from "next/headers";

export const authRouter = createTRPCRouter({
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
      const verificationCode = nanoid(8);
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
        name: z.string(),
        email: z.string().email(),
        verificationCode: z.string(),
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, email, verificationCode, password } = input;
      const code = verificationCode;
      console.log(":code::", verificationCode);
      // Find the verification code
      const verificationRecord = await ctx.db.emailVerificationCode.findFirst({
        where: { email, code },
      });

      console.log(
        ":verificationRecord::",
        verificationRecord,
        verificationCode,
      );

      if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired code",
        });
      }

      // Hash the password
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
      const user = await ctx.db.user.create({
        data: { name, email, password: hashedPassword, isVerified: true },
      });

      await ctx.db.emailVerificationCode.deleteMany({ where: { email } });

      const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);
      const session = await encrypt({ user, expires });
      const cookieStore = await cookies();
      cookieStore.set("session", session, { expires, httpOnly: true });

      return { message: "User verified and created successfully", user };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const user = await ctx.db.user.findUnique({ where: { email } });

      if (!user) {
        throw new Error("Invalid email");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);
      const session = await encrypt({ user, expires });
      const cookieStore = await cookies();
      cookieStore.set("session", session, { expires, httpOnly: true });

      return { status: "success", message: "Login successful" };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    const cookieStore = await cookies();

    cookieStore.set("session", "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return { message: "Logout successful" };
  }),
});
