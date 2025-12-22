#!/usr/bin/env node

/**
 * Webhook Relay Server for Pipedrive Integration
 * Creates a public URL endpoint that forwards to local services
 */

const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json({ limit: '10mb' }));

// CORS headers for external webhook access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'webhook-relay-server',
    port: 3004,
    timestamp: new Date().toISOString(),
    targets: [
      'http://localhost:3000 (MCP Email Composer)',
      'http://localhost:3001 (JobDigger Integration)'
    ]
  });
});

// Main webhook endpoint for new deals
app.post('/webhook/new-deal', async (req, res) => {
  console.log('🔔 Webhook received from Pipedrive');
  console.log('📊 Deal data:', JSON.stringify(req.body, null, 2));
  
  try {
    const dealData = req.body.current;
    
    if (!dealData) {
      return res.json({ status: 'error', message: 'No deal data received' });
    }

    // Only process Pipeline 14 deals (Corporate Recruiter)
    if (dealData.pipeline_id !== 14) {
      console.log(`⏭️  Skipping deal ${dealData.id} - wrong pipeline (${dealData.pipeline_id})`);
      return res.json({ 
        status: 'ignored', 
        reason: `Pipeline ${dealData.pipeline_id} not monitored`,
        deal_id: dealData.id
      });
    }

    console.log(`🎯 Processing Pipeline 14 deal: ${dealData.title}`);

    // Forward to local MCP Email Composer
    const mcpResponse = await fetch('http://localhost:3000/generate-sequence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deal_id: dealData.id,
        company_name: dealData.org_name || dealData.title,
        contact_name: dealData.person_name || 'Contact',
        contact_email: dealData.person_email,
        vacancy_title: dealData.title,
        api_token: process.env.PIPEDRIVE_API_TOKEN || '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5',
        pipeline_id: dealData.pipeline_id
      }),
      timeout: 30000
    }).catch(error => {
      console.log('⚠️  MCP server not responding, continuing...');
      return null;
    });

    let emailResult = { status: 'mcp_unavailable' };
    if (mcpResponse && mcpResponse.ok) {
      emailResult = await mcpResponse.json();
      console.log('✅ Email generation completed');
    }

    // Move deal to "Email Sequence Ready" stage (ID 105)
    const moveResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        stage_id: 105  // Email Sequence Ready stage
      }),
      timeout: 10000
    });

    if (moveResponse.ok) {
      console.log('🚀 Deal moved to Email Sequence Ready - automation will trigger');
    } else {
      console.log('⚠️  Failed to move deal to next stage');
    }

    res.json({
      status: 'processed',
      deal_id: dealData.id,
      company_name: dealData.org_name || dealData.title,
      email_generation: emailResult.status,
      stage_moved: moveResponse?.ok || false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error.message);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for manual testing
app.post('/test', (req, res) => {
  console.log('🧪 Test webhook received');
  res.json({
    status: 'test_successful',
    received_data: req.body,
    timestamp: new Date().toISOString()
  });
});

// Dashboard
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Webhook Relay Server</title>
  <style>
    body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: #2ecc71; color: white; padding: 20px; border-radius: 8px; }
    .status { background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 8px; }
    .endpoint { background: #e3f2fd; padding: 10px; margin: 10px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔗 Webhook Relay Server</h1>
    <p>Forwards Pipedrive webhooks to local MCP services</p>
  </div>
  
  <div class="status">
    <h3>📡 Active Endpoints</h3>
    <div class="endpoint">
      <strong>POST /webhook/new-deal</strong><br>
      Receives Pipedrive new deal webhooks
    </div>
    <div class="endpoint">
      <strong>POST /test</strong><br>
      Test endpoint for manual webhook testing
    </div>
    <div class="endpoint">
      <strong>GET /health</strong><br>
      Health check endpoint
    </div>
  </div>

  <div class="status">
    <h3>🎯 Configuration</h3>
    <p><strong>Target Services:</strong></p>
    <ul>
      <li>MCP Email Composer: http://localhost:3000</li>
      <li>JobDigger Integration: http://localhost:3001</li>
    </ul>
    <p><strong>Monitored Pipeline:</strong> Pipeline 14 (Corporate Recruiter)</p>
    <p><strong>Target Stage:</strong> 105 (Email Sequence Ready)</p>
  </div>

  <div class="status">
    <h3>📋 Webhook URL for Pipedrive</h3>
    <p>Use this URL in Pipedrive webhook configuration:</p>
    <code style="background: #f1f1f1; padding: 10px; display: block; margin: 10px 0;">
      http://YOUR_PUBLIC_IP:3004/webhook/new-deal
    </code>
    <small>Note: Replace YOUR_PUBLIC_IP with your actual public IP address</small>
  </div>
</body>
</html>
  `);
});

const PORT = 3004;
app.listen(PORT, '0.0.0.0', () => {
  console.log('🔗 Webhook Relay Server started');
  console.log(`📡 Server running on: http://0.0.0.0:${PORT}`);
  console.log(`🌐 Dashboard: http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`\n🎯 Webhook endpoint for Pipedrive:`);
  console.log(`   POST http://YOUR_PUBLIC_IP:${PORT}/webhook/new-deal`);
  console.log(`\n📊 Target services:`);
  console.log(`   - MCP Email Composer: http://localhost:3000`);
  console.log(`   - JobDigger Integration: http://localhost:3001`);
  console.log(`\n⚡ Ready to relay Pipedrive webhooks!`);
});

module.exports = app;