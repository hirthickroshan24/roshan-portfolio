/**
 * Simple Express server to send emails from the portfolio contact form.
 * - POST /send-email
 * - Requires .env with EMAIL_USER and EMAIL_PASS (Gmail app password)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve frontend static files from the parent (root) directory
app.use(express.static(path.join(__dirname, '..')));

// Basic health check
app.get('/api/health', (req, res) => res.json({ok:true, message:'Email backend running'}));

// POST /send-email - expects { name, email, message }
app.post('/send-email', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ ok:false, error: 'Name, email and message are required.' });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ ok:false, error: 'Invalid email address.' });
    }

    let transporter;
    let usingTestAccount = false;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      // Create a test account (Ethereal) for local development if no real creds provided
      console.warn('No EMAIL_USER/EMAIL_PASS found — using a Nodemailer test account (emails will not go to real inbox).');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        }
      });
      usingTestAccount = true;
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    // Send email to the portfolio owner (EMAIL_USER or test account). Set replyTo so replies go to the client.
    const toAddress = process.env.EMAIL_USER || undefined;
    const mailOptions = {
      from: process.env.EMAIL_USER || 'no-reply@example.com',
      to: toAddress || (usingTestAccount ? undefined : process.env.EMAIL_USER),
      replyTo: `${name} <${email}>`,
      subject: `Portfolio message from ${name}`,
      text: `You received a new message from your portfolio contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `<p>You received a new message from your portfolio contact form:</p>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong><br/>${message.replace(/\n/g,'<br/>')}</p>`
    };

    // If using ethereal test account, set to the test account user
    if (usingTestAccount) {
      // Ethereal requires 'to' to be set; we'll send to the test account
      mailOptions.to = transporter.options.auth.user;
    }

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    if (usingTestAccount) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return res.json({ ok:true, message: 'Email sent successfully', preview: usingTestAccount ? nodemailer.getTestMessageUrl(info) : undefined });
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ ok:false, error: 'Failed to send email' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
