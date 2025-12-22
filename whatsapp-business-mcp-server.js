#!/usr/bin/env node
// WhatsApp Business MCP Server - Messaging & Communication
// For candidate communication, automated responses, and recruitment outreach

const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// WhatsApp Business API configuration
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || '';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';
const WHATSAPP_BASE_URL = 'https://graph.facebook.com/v18.0';

// MCP Tools for WhatsApp Business
const WHATSAPP_TOOLS = {
  // Send text message
  sendMessage: async ({ to, message, previewUrl = false }) => {
    try {
      const response = await axios.post(
        `${WHATSAPP_BASE_URL}/${WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: {
            preview_url: previewUrl,
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      return { error: error.response?.data?.error?.message || error.message };
    }
  },

  // Send template message
  sendTemplate: async ({ to, templateName, language = 'nl', components = [] }) => {
    try {
      const response = await axios.post(
        `${WHATSAPP_BASE_URL}/${WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: language
            },
            components: components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      return { error: error.response?.data?.error?.message || error.message };
    }
  },

  // Send media message
  sendMedia: async ({ to, type, mediaUrl, caption }) => {
    try {
      const mediaTypes = ['image', 'video', 'document', 'audio'];
      if (!mediaTypes.includes(type)) {
        return { error: 'Invalid media type. Use: image, video, document, or audio' };
      }

      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: type
      };

      messageData[type] = {
        link: mediaUrl
      };

      if (caption && (type === 'image' || type === 'video' || type === 'document')) {
        messageData[type].caption = caption;
      }

      const response = await axios.post(
        `${WHATSAPP_BASE_URL}/${WHATSAPP_PHONE_ID}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      return { error: error.response?.data?.error?.message || error.message };
    }
  },

  // Send interactive message with buttons
  sendInteractive: async ({ to, body, buttons, header, footer }) => {
    try {
      const response = await axios.post(
        `${WHATSAPP_BASE_URL}/${WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            header: header ? { type: 'text', text: header } : undefined,
            body: { text: body },
            footer: footer ? { text: footer } : undefined,
            action: {
              buttons: buttons.slice(0, 3).map(btn => ({
                type: 'reply',
                reply: {
                  id: btn.id,
                  title: btn.title
                }
              }))
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      return { error: error.response?.data?.error?.message || error.message };
    }
  },

  // Create recruitment outreach campaign
  createRecruitmentCampaign: async ({ candidates, jobTitle, companyName }) => {
    try {
      const template = {
        intro: `Hallo! Ik ben van ${companyName} en we hebben een interessante ${jobTitle} positie open staan.`,
        details: `Deze rol biedt uitstekende groeimogelijkheden en competitieve arbeidsvoorwaarden.`,
        cta: `Bent u geïnteresseerd om meer te horen over deze opportuniteit?`,
        buttons: [
          { id: 'interested', title: 'Ja, interessant!' },
          { id: 'not_interested', title: 'Nee, bedankt' },
          { id: 'more_info', title: 'Meer info' }
        ]
      };

      const results = [];
      for (const candidate of candidates) {
        const result = await WHATSAPP_TOOLS.sendInteractive({
          to: candidate.phone,
          header: `${jobTitle} Opportuniteit`,
          body: `${template.intro}\n\n${template.details}`,
          footer: companyName,
          buttons: template.buttons
        });

        results.push({
          candidate: candidate.name,
          phone: candidate.phone,
          ...result
        });

        // Rate limiting
        await new Promise(r => setTimeout(r, 1000));
      }

      return {
        success: true,
        campaignSummary: {
          total: candidates.length,
          sent: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        },
        results
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Send interview reminder
  sendInterviewReminder: async ({ to, candidateName, date, time, location, interviewerName }) => {
    try {
      const message = `Beste ${candidateName},

📅 Interview Herinnering

**Datum:** ${date}
**Tijd:** ${time}
**Locatie:** ${location}
**Met:** ${interviewerName}

Gelieve 10 minuten voor aanvang aanwezig te zijn.

Succes!

Vragen? Reageer op dit bericht.`;

      return await WHATSAPP_TOOLS.sendMessage({ to, message });
    } catch (error) {
      return { error: error.message };
    }
  },

  // Create message template
  createTemplate: async ({ name, category = 'MARKETING', language = 'nl', components }) => {
    try {
      // This would typically be done through Facebook Business Manager
      // Returning template structure for manual creation
      const template = {
        name,
        category,
        language,
        components: components || [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: 'Recruitment Update'
          },
          {
            type: 'BODY',
            text: 'Hallo {{1}}, we hebben een update over uw sollicitatie voor {{2}}.'
          },
          {
            type: 'FOOTER',
            text: 'Reageer STOP om af te melden'
          },
          {
            type: 'BUTTONS',
            buttons: [
              {
                type: 'QUICK_REPLY',
                text: 'Meer info'
              },
              {
                type: 'PHONE_NUMBER',
                text: 'Bel ons',
                phone_number: '+31612345678'
              }
            ]
          }
        ]
      };

      return {
        success: true,
        template,
        note: 'Create this template in Facebook Business Manager'
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Bulk send messages
  bulkSend: async ({ recipients, message, delay = 1000 }) => {
    try {
      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const recipient of recipients) {
        const result = await WHATSAPP_TOOLS.sendMessage({
          to: recipient.phone || recipient,
          message: typeof message === 'function' ? message(recipient) : message
        });

        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }

        results.push({
          recipient: recipient.name || recipient,
          ...result
        });

        // Rate limiting
        await new Promise(r => setTimeout(r, delay));
      }

      return {
        success: true,
        summary: {
          total: recipients.length,
          sent: successCount,
          failed: failCount
        },
        results
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get message status
  getMessageStatus: async ({ messageId }) => {
    try {
      const response = await axios.get(
        `${WHATSAPP_BASE_URL}/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_API_KEY}`
          }
        }
      );

      return { success: true, status: response.data };
    } catch (error) {
      return { error: error.response?.data?.error?.message || error.message };
    }
  },

  // Create automated response flow
  createAutoResponse: async ({ triggerKeywords, responseMessage }) => {
    try {
      // This would typically require webhook setup
      const autoResponse = {
        id: Date.now().toString(),
        triggers: triggerKeywords,
        response: responseMessage,
        created: new Date().toISOString(),
        active: true
      };

      // Save to local file (in production, use database)
      const filePath = path.join(__dirname, 'data', 'auto-responses.json');
      let responses = [];

      try {
        const data = await fs.readFile(filePath, 'utf8');
        responses = JSON.parse(data);
      } catch {}

      responses.push(autoResponse);

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(responses, null, 2));

      return { success: true, autoResponse };
    } catch (error) {
      return { error: error.message };
    }
  }
};

// Webhook endpoint for incoming messages
app.post('/webhook', async (req, res) => {
  try {
    const { entry } = req.body;

    if (entry?.[0]?.changes?.[0]?.value?.messages) {
      const message = entry[0].changes[0].value.messages[0];
      const from = message.from;
      const text = message.text?.body;

      console.log(`Received message from ${from}: ${text}`);

      // Check auto-responses
      const filePath = path.join(__dirname, 'data', 'auto-responses.json');
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const responses = JSON.parse(data);

        for (const autoResponse of responses.filter(r => r.active)) {
          const triggered = autoResponse.triggers.some(keyword =>
            text.toLowerCase().includes(keyword.toLowerCase())
          );

          if (triggered) {
            await WHATSAPP_TOOLS.sendMessage({
              to: from,
              message: autoResponse.response
            });
            break;
          }
        }
      } catch {}
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// Webhook verification
app.get('/webhook', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'recruitin2025';
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// MCP endpoints
app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  if (WHATSAPP_TOOLS[name]) {
    const result = await WHATSAPP_TOOLS[name](args);
    res.json(result);
  } else {
    res.status(404).json({ error: 'Tool not found' });
  }
});

// Dashboard
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>WhatsApp Business MCP Server</title>
  <style>
    body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f4f4f4; }
    .header { background: linear-gradient(135deg, #25D366, #128C7E); color: white; padding: 30px; border-radius: 12px; }
    .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .tool { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #25D366; }
    .status { display: inline-block; padding: 5px 10px; background: #4CAF50; color: white; border-radius: 4px; }
    .feature { display: inline-block; margin: 5px; padding: 8px 12px; background: #e8f5e9; border-radius: 4px; }
    code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>💬 WhatsApp Business MCP Server</h1>
    <p>Messaging & Communication for Recruitment</p>
  </div>

  <div class="card">
    <h2>Status</h2>
    <p><span class="status">🟢 Running</span></p>
    <p><strong>Port:</strong> 3025</p>
    <p><strong>API Key:</strong> ${WHATSAPP_API_KEY ? '✅ Configured' : '❌ Not configured (set WHATSAPP_API_KEY)'}</p>
    <p><strong>Phone ID:</strong> ${WHATSAPP_PHONE_ID ? '✅ Configured' : '❌ Not configured (set WHATSAPP_PHONE_ID)'}</p>
    <p><strong>Webhook URL:</strong> http://localhost:3025/webhook</p>
  </div>

  <div class="card">
    <h2>Available Tools</h2>

    <div class="tool">
      <h3>sendMessage</h3>
      <p>Send text message to a phone number</p>
      <code>POST /call-tool { name: 'sendMessage', arguments: { to, message } }</code>
    </div>

    <div class="tool">
      <h3>sendTemplate</h3>
      <p>Send pre-approved template message</p>
      <code>POST /call-tool { name: 'sendTemplate', arguments: { to, templateName, language } }</code>
    </div>

    <div class="tool">
      <h3>sendMedia</h3>
      <p>Send image, video, document or audio</p>
      <code>POST /call-tool { name: 'sendMedia', arguments: { to, type, mediaUrl, caption } }</code>
    </div>

    <div class="tool">
      <h3>sendInteractive</h3>
      <p>Send message with interactive buttons</p>
      <code>POST /call-tool { name: 'sendInteractive', arguments: { to, body, buttons } }</code>
    </div>

    <div class="tool">
      <h3>createRecruitmentCampaign</h3>
      <p>Launch recruitment outreach campaign</p>
      <code>POST /call-tool { name: 'createRecruitmentCampaign', arguments: { candidates, jobTitle } }</code>
    </div>

    <div class="tool">
      <h3>sendInterviewReminder</h3>
      <p>Send interview appointment reminder</p>
      <code>POST /call-tool { name: 'sendInterviewReminder', arguments: { to, candidateName, date, time } }</code>
    </div>

    <div class="tool">
      <h3>bulkSend</h3>
      <p>Send messages to multiple recipients</p>
      <code>POST /call-tool { name: 'bulkSend', arguments: { recipients, message } }</code>
    </div>

    <div class="tool">
      <h3>createAutoResponse</h3>
      <p>Setup automated response rules</p>
      <code>POST /call-tool { name: 'createAutoResponse', arguments: { triggerKeywords, responseMessage } }</code>
    </div>
  </div>

  <div class="card">
    <h2>Features</h2>
    <span class="feature">✅ Dutch language support</span>
    <span class="feature">✅ Recruitment templates</span>
    <span class="feature">✅ Interactive buttons</span>
    <span class="feature">✅ Media messages</span>
    <span class="feature">✅ Bulk messaging</span>
    <span class="feature">✅ Auto-responses</span>
    <span class="feature">✅ Interview reminders</span>
    <span class="feature">✅ Campaign management</span>
    <span class="feature">✅ Webhook support</span>
  </div>

  <div class="card">
    <h2>Use Cases</h2>
    <ul>
      <li><strong>Candidate Outreach:</strong> Initial contact for interesting profiles</li>
      <li><strong>Interview Scheduling:</strong> Confirmations and reminders</li>
      <li><strong>Status Updates:</strong> Keep candidates informed</li>
      <li><strong>Quick Screening:</strong> Interactive buttons for quick responses</li>
      <li><strong>Document Sharing:</strong> Send job descriptions, contracts</li>
      <li><strong>Follow-ups:</strong> Automated check-ins with candidates</li>
    </ul>
  </div>
</body>
</html>
  `);
});

// Start server
const PORT = 3025;
app.listen(PORT, () => {
  console.log('💬 WhatsApp Business MCP Server');
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/call-tool`);
  console.log(`🔔 Webhook endpoint: http://localhost:${PORT}/webhook`);

  if (!WHATSAPP_API_KEY || !WHATSAPP_PHONE_ID) {
    console.log('⚠️  Warning: WhatsApp credentials not fully configured');
    console.log('   Set WHATSAPP_API_KEY and WHATSAPP_PHONE_ID environment variables');
    console.log('   Get credentials from: https://developers.facebook.com/apps/');
  }
});