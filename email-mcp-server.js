#!/usr/bin/env node
// Email MCP Server
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// MCP Endpoints
app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  switch(name) {
    case 'send_email':
      try {
        const info = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: args.to,
          subject: args.subject,
          text: args.text,
          html: args.html || args.text
        });
        res.json({ success: true, messageId: info.messageId });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;
    case 'create_draft':
      // Store draft logic here
      res.json({ success: true, draftId: Date.now() });
      break;
    default:
      res.status(404).json({ error: 'Tool not found' });
  }
});

const PORT = 3012;
app.listen(PORT, () => {
  console.log(`Email MCP Server running on port ${PORT}`);
});
