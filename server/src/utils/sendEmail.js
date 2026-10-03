// src/utils/sendEmail.js — Nodemailer wrapper
const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = require('../config/env');
const logger = require('../config/logger');

let transporter = null;
if (SMTP_HOST && SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/**
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    logger.warn(`SMTP not configured. Skipping email to ${to}: "${subject}"`);
    return;
  }
  try {
    await transporter.sendMail({ from: EMAIL_FROM, to, subject, html });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error({ err }, `Failed to send email to ${to}`);
    // Don't throw — email failure should not break the request
  }
};

// ── Email templates ────────────────────────────────────────────────────────────

const sendVerificationEmail = (to, name, token, clientUrl) =>
  sendEmail({
    to,
    subject: 'Verify your Retech Market account',
    html: `
      <h2>Welcome to Retech Market, ${name}!</h2>
      <p>Please verify your email address by clicking the link below. It expires in 24 hours.</p>
      <a href="${clientUrl}/verify-email/${token}" style="background:#2563EB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">
        Verify Email
      </a>
      <p>If you did not create an account, please ignore this email.</p>
    `,
  });

const sendPasswordResetEmail = (to, name, token, clientUrl) =>
  sendEmail({
    to,
    subject: 'Reset your Retech Market password',
    html: `
      <h2>Hi ${name},</h2>
      <p>You requested a password reset. Click the link below (expires in 1 hour).</p>
      <a href="${clientUrl}/reset-password/${token}" style="background:#2563EB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">
        Reset Password
      </a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });

const sendOrderEmail = (to, name, orderId, status) =>
  sendEmail({
    to,
    subject: `Order #${orderId} — ${status}`,
    html: `
      <h2>Hi ${name},</h2>
      <p>Your order <strong>#${orderId}</strong> status has been updated to: <strong>${status}</strong>.</p>
      <p>Log in to Retech Market to view details.</p>
    `,
  });

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendOrderEmail };
