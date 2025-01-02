const nodemailer = require("nodemailer");

export const sendEmail = async (to: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Use your email service
    auth: {
      user: "whosmudassir@gmail.com", // Your email
      pass: "llakkfxhoksdznnz", // Your email password
    },
  });

  await transporter.sendMail({
    from: "whosmudassir@gmail.com",
    to,
    subject: "Verification Code For Sign-Up",
    text,
  });
};
