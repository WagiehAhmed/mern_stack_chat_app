import nodemailer from "nodemailer";
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.USER_EMAIL}`,
      pass: `${process.env.APP_PASSWORD}`,
    },
  });
};

/**
 * Send an email using Nodemailer with Gmail SMTP
 * @param {string} to - The recipient email address
 * @param {string} subject - The subject of the email
 * @param {string} text - The plain text content of the email
 * @param {string} html - The HTML content of the email (optional)
 * @returns {Promise} - Resolves with the email send status or rejects with an error
 */
export default function sendEmail({ from, to, subject, text, html }) {
  const transporter = createTransporter();
  return new Promise((resolve, reject) => {
    transporter.sendMail({ from, to, subject, text, html }, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}
