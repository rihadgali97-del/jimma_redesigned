import nodemailer from 'nodemailer';
import { env } from '../../../../config/env.js';

export async function sendEmail(recipient, message) {
  if (!env.GMAIL_SMTP_USER || !env.GMAIL_APP_PASSWORD) {
    throw new Error('Gmail delivery requires GMAIL_SMTP_USER and GMAIL_APP_PASSWORD');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: env.GMAIL_SMTP_USER,
      pass: env.GMAIL_APP_PASSWORD.replace(/\s/g, ''),
    },
  });

  try {
    return await transporter.sendMail({
      from: env.EMAIL_FROM_ADDRESS || env.GMAIL_SMTP_USER,
      to: recipient,
      subject: message.subject || message.title || 'Jimma Islamic Council notification',
      html: message.html || notificationHtml(message),
      text: message.text || notificationText(message),
    });
  } finally {
    transporter.close();
  }
}

function notificationText(message) {
  return [
    message.title,
    message.summary,
    message.description,
    message.content,
    message.date && `Date: ${message.date}`,
    message.time && `Time: ${message.time}`,
    message.location && `Location: ${message.location}`,
    message.eventDate && `Date: ${message.eventDate}`,
    message.eventTime && `Time: ${message.eventTime}`,
    message.eventLocation && `Location: ${message.eventLocation}`,
    message.passNumber && `Pass number: ${message.passNumber}`,
    message.verificationUrl && `Verify your email: ${message.verificationUrl}`,
  ].filter(Boolean).join('\n\n');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function notificationHtml(message) {
  const text = notificationText(message);
  const content = text.split('\n').map((line) => `<p>${escapeHtml(line)}</p>`).join('');
  return `<div style="font-family:Arial,sans-serif;line-height:1.5">${content}</div>`;
}
