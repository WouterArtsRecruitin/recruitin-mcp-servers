#!/usr/bin/env node
// Slack MCP Server
const express = require('express');
const { WebClient } = require('@slack/web-api');

const app = express();
app.use(express.json());

const slack = new WebClient(process.env.SLACK_TOKEN);

// MCP Endpoints
app.post('/list-resources', async (req, res) => {
  try {
    const channels = await slack.conversations.list();
    res.json({
      resources: channels.channels.map(ch => ({
        uri: `slack://channel/${ch.id}`,
        name: `#${ch.name}`,
        mimeType: 'application/json'
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'slack-mcp-server', port: PORT });
});

// Dashboard
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Slack MCP Server</title>
  <style>
    body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: #4A154B; color: white; padding: 20px; border-radius: 8px; }
    .card { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 6px; }
    .status { display: inline-block; padding: 5px 10px; background: #2eb67d; color: white; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>💬 Slack MCP Server</h1>
    <p>Team notifications & workflows automation</p>
  </div>
  <div class="card">
    <h2>Status</h2>
    <p><span class="status">🟢 Running</span></p>
    <p><strong>Port:</strong> ${PORT}</p>
    <p><strong>Slack Token:</strong> ${process.env.SLACK_TOKEN ? '✅ Configured' : '❌ Not configured'}</p>
  </div>
  <div class="card">
    <h2>Available Tools</h2>
    <ul>
      <li><strong>send_message</strong> - Send message to channel</li>
      <li><strong>list_channels</strong> - List all channels</li>
      <li><strong>send_recruitment_notification</strong> - Recruitment alerts</li>
    </ul>
  </div>
</body>
</html>
  `);
});

app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  try {
    switch(name) {
      case 'send_message':
        const result = await slack.chat.postMessage({
          channel: args.channel,
          text: args.text
        });
        res.json({ success: true, ts: result.ts });
        break;
      case 'list_channels':
        const channels = await slack.conversations.list();
        res.json({ channels: channels.channels });
        break;
      case 'send_recruitment_notification':
        const notification = await slack.chat.postMessage({
          channel: args.channel || '#recruitment',
          text: `🎯 *Recruitment Update*\n${args.message}\n\n📊 ${args.details || ''}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🎯 *Recruitment Update*\n${args.message}`
              }
            },
            ...(args.details ? [{
              type: 'section',
              text: {
                type: 'mrkdwn', 
                text: `📊 ${args.details}`
              }
            }] : [])
          ]
        });
        res.json({ success: true, ts: notification.ts });
        break;
      default:
        res.status(404).json({ error: 'Tool not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3010;
app.listen(PORT, () => {
  console.log(`Slack MCP Server running on port ${PORT}`);
});
