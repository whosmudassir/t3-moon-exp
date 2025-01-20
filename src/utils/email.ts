import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export const sendEmail = async (to: string, text: string): Promise<void> => {
  const transporter: Transporter<SMTPTransport.SentMessageInfo> =
    nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "whosmudassir@gmail.com",
        pass: "llakkfxhoksdznnz",
      },
    });

  await transporter.sendMail({
    from: "whosmudassir@gmail.com",
    to,
    subject: "Verification Code For Sign-Up",
    text,
  });
};
