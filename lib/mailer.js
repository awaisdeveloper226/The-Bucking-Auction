import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or SMTP provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationUrl = `https://the-bucking-auction.vercel.app/verify?token=${token}`;

  await transporter.sendMail({
    from: `"The Bucking Auction" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });
};
