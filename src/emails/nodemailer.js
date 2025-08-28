import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: testAccount.smtp.host,
  port: testAccount.smtp.port,
  secure: testAccount.smtp.secure,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});

const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Test App" <${testAccount.user}>`,
      to,
      subject,

      html,
    });
    logger.info(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

export default sendMail;
