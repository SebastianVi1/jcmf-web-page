import nodemailer from 'nodemailer';

interface ISendEmail {
  email: string;
  html: string;
  subject: string;
  name: string;
}

async function sendEmail({ email, html, subject, name }: ISendEmail) {
  let transporter = nodemailer.createTransport({
    host: process.env.Email_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  let message = {
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    subject: subject,
    name: name,
    html: html,
  };

  await transporter.sendMail(message);
}

export { sendEmail };
