#!/usr/bin/env node
// Alternative Email MCP - Works without Gmail
// Uses local email queue and webhook notifications

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const EMAIL_QUEUE_FILE = path.join(__dirname, 'email-queue.json');
const EMAIL_LOG_FILE = path.join(__dirname, 'logs', 'email-sent.log');

// Initialize queue
let emailQueue = [];
(async () => {
  try {
    const data = await fs.readFile(EMAIL_QUEUE_FILE, 'utf8');
    emailQueue = JSON.parse(data);
  } catch {
    emailQueue = [];
  }
})();

// Save queue
async function saveQueue() {
  await fs.writeFile(EMAIL_QUEUE_FILE, JSON.stringify(emailQueue, null, 2));
}

// MCP Endpoints
app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  switch(name) {
    case 'send_email':
      // Instead of sending, we queue it and can integrate with Zapier
      const email = {
        id: Date.now(),
        to: args.to,
        subject: args.subject,
        body: args.text || args.body,
        html: args.html,
        timestamp: new Date().toISOString(),
        status: 'queued'
      };

      emailQueue.push(email);
      await saveQueue();

      // Log to file
      const logEntry = `${email.timestamp} - To: ${email.to} - Subject: ${email.subject}\n`;
      await fs.appendFile(EMAIL_LOG_FILE, logEntry).catch(() => {});

      // If Zapier webhook is configured, send there
      if (process.env.ZAPIER_WEBHOOK_URL) {
        try {
          const axios = require('axios');
          await axios.post(process.env.ZAPIER_WEBHOOK_URL, {
            type: 'email',
            data: email
          });
          email.status = 'sent_to_zapier';
        } catch (error) {
          console.log('Zapier webhook failed, email queued locally');
        }
      }

      res.json({
        success: true,
        emailId: email.id,
        message: 'Email queued for sending',
        queue_size: emailQueue.length
      });
      break;

    case 'list_queued_emails':
      res.json({
        emails: emailQueue,
        total: emailQueue.length
      });
      break;

    case 'get_email_template':
      // Return email templates
      const templates = {
        recruitment_followup: {
          subject: 'Opvolging: {{position}} bij {{company}}',
          body: 'Beste {{name}},\n\nBedankt voor ons gesprek...'
        },
        interview_invite: {
          subject: 'Uitnodiging interview - {{position}}',
          body: 'Beste {{name}},\n\nGraag nodigen we je uit voor een interview...'
        }
      };
      res.json({ templates });
      break;

    case 'clear_queue':
      emailQueue = [];
      await saveQueue();
      res.json({ success: true, message: 'Queue cleared' });
      break;

    default:
      res.status(404).json({ error: 'Tool not found' });
  }
});

app.post('/list-resources', (req, res) => {
  res.json({
    resources: [
      { uri: 'email://queue', name: 'Email Queue' },
      { uri: 'email://templates', name: 'Email Templates' },
      { uri: 'email://logs', name: 'Email Logs' }
    ]
  });
});

// Web interface to view queued emails
app.get('/dashboard', async (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Email Queue Dashboard</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .email { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .header { background: #4CAF50; color: white; padding: 20px; border-radius: 8px; }
        .status { padding: 3px 8px; border-radius: 3px; font-size: 12px; }
        .queued { background: #FFC107; }
        .sent { background: #4CAF50; color: white; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📧 Email MCP Queue</h1>
        <p>Total emails: ${emailQueue.length}</p>
      </div>
      ${emailQueue.map(email => `
        <div class="email">
          <span class="status ${email.status}">${email.status}</span>
          <h3>${email.subject}</h3>
          <p><strong>To:</strong> ${email.to}</p>
          <p><strong>Time:</strong> ${email.timestamp}</p>
          <details>
            <summary>Body</summary>
            <pre>${email.body}</pre>
          </details>
        </div>
      `).join('')}
      ${emailQueue.length === 0 ? '<p>No emails in queue</p>' : ''}
    </body>
    </html>
  `;
  res.send(html);
});

const PORT = 3008;
app.listen(PORT, () => {
  console.log(`📧 Alternative Email MCP running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`✉️  Emails will be queued locally and can be sent via Zapier`);
});