#!/usr/bin/env node

/**
 * Create fully automatic email sequence system
 * New deal → Auto generate emails → Auto start sequence
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
const PIPELINE_ID = 14;

async function createFullyAutomaticSystem() {
  console.log('🤖 Creating FULLY AUTOMATIC Email System...\n');
  console.log('   New Deal → Auto Generate → Auto Send Sequence\n');
  
  try {
    // Strategy: Use Pipedrive webhook to trigger our MCP server
    // When new deal created → webhook → MCP generates emails → immediately start sequence
    
    console.log('🔧 System Architecture:');
    console.log('   1. New deal created in Pipeline 14');
    console.log('   2. Pipedrive webhook → calls our server');
    console.log('   3. Server generates 6 personalized emails');
    console.log('   4. Server moves deal to "Email Sequence Ready"');
    console.log('   5. Pipedrive automation starts email sequence');
    console.log('   6. All 6 emails sent automatically with delays\n');
    
    // Create webhook for new deals
    const webhookData = {
      subscription_url: 'http://localhost:3001/webhook/new-deal',
      event_action: 'added',
      event_object: 'deal',
      http_auth_user: null,
      http_auth_password: null,
      version: '1.0'
    };
    
    console.log('📡 Creating webhook for new deals...');
    
    const webhookResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/webhooks?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData)
    });
    
    const webhookResult = await webhookResponse.json();
    
    if (webhookResult.success) {
      console.log('✅ Webhook created successfully!');
      console.log(`   Webhook ID: ${webhookResult.data.id}`);
      console.log(`   URL: ${webhookResult.data.subscription_url}`);
      console.log(`   Event: ${webhookResult.data.event_action}.${webhookResult.data.event_object}\n`);
    } else {
      console.log('⚠️  Webhook creation info:', webhookResult);
    }
    
    // Create the webhook server code
    const webhookServerCode = `
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// Webhook endpoint for new deals
app.post('/webhook/new-deal', async (req, res) => {
  console.log('🔔 New deal webhook received!');
  
  const dealData = req.body.current;
  
  // Only process deals in Pipeline 14
  if (dealData.pipeline_id !== ${PIPELINE_ID}) {
    return res.json({ status: 'ignored', reason: 'wrong pipeline' });
  }
  
  console.log(\`📝 Processing deal: \${dealData.title}\`);
  
  try {
    // Call our MCP server to generate emails
    const mcpResponse = await fetch('http://localhost:3000/generate-sequence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deal_id: dealData.id,
        company_name: dealData.org_name || dealData.title,
        contact_name: dealData.person_name || 'Contact',
        contact_email: dealData.person_email,
        vacancy_title: dealData.title,
        api_token: '${API_TOKEN}'
      })
    });
    
    const mcpResult = await mcpResponse.json();
    
    if (mcpResult.success) {
      console.log('✅ Emails generated and saved to Pipedrive!');
      
      // Automatically move deal to "Email Sequence Ready" stage
      await fetch(\`https://recruitinbv.pipedrive.com/api/v1/deals/\${dealData.id}?api_token=${API_TOKEN}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage_id: 105 }) // Email Sequence Ready stage
      });
      
      console.log('🚀 Deal moved to Email Sequence Ready - automation will start!');
      
    } else {
      console.log('❌ Email generation failed:', mcpResult.error);
    }
    
  } catch (error) {
    console.log('❌ Webhook processing error:', error.message);
  }
  
  res.json({ status: 'processed' });
});

app.listen(3001, () => {
  console.log('🎯 Webhook server running on port 3001');
  console.log('   Ready to receive new deal notifications!');
});
`;
    
    // Save webhook server code
    require('fs').writeFileSync('webhook-server.js', webhookServerCode);
    
    console.log('📁 Created webhook-server.js');
    console.log('   This server will handle new deal notifications\n');
    
    // Also create the MCP endpoint for email generation
    const mcpEndpointCode = `
// Add this to your MCP server (src/index.ts)

// Express endpoint for webhook integration
app.post('/generate-sequence', async (req, res) => {
  const { deal_id, company_name, contact_name, contact_email, vacancy_title, api_token } = req.body;
  
  try {
    // Generate 6-email sequence using existing logic
    const strategy = pipedriveIntegrator.determineSequenceStrategy(vacancy_title, 'technology', 'scale-up', 'medium');
    
    const emailSequence = [];
    for (let i = 1; i <= 6; i++) {
      const emailData = await pipedriveIntegrator.generatePersonalizedEmail(i, {
        company_name,
        contact_name,
        vacancy_title,
        sector: 'technology',
        company_size: 'scale-up',
        location: 'Nederland',
        urgency_level: 'medium'
      }, strategy);
      
      emailSequence.push(emailData);
    }
    
    // Save to Pipedrive custom fields
    const pipedriveUpdate = await pipedriveIntegrator.updatePipedriveDeal(deal_id, emailSequence, api_token);
    
    res.json({
      success: pipedriveUpdate.success,
      emails_generated: 6,
      deal_id,
      company_name
    });
    
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});
`;
    
    require('fs').writeFileSync('mcp-webhook-endpoint.js', mcpEndpointCode);
    console.log('📁 Created mcp-webhook-endpoint.js');
    console.log('   Add this code to your MCP server\n');
    
    return {
      success: true,
      webhook_id: webhookResult.data?.id,
      next_steps: [
        "1. Add webhook endpoint to MCP server",
        "2. Start webhook server: node webhook-server.js",
        "3. Create new deal in Pipeline 14",
        "4. System automatically generates emails and starts sequence",
        "5. Fully automatic - no manual steps needed!"
      ]
    };
    
  } catch (error) {
    console.error('❌ Error creating automatic system:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the setup
createFullyAutomaticSystem()
  .then(result => {
    console.log('🎉 FULLY AUTOMATIC SYSTEM CREATED!\n');
    console.log('📋 Next Steps:');
    if (result.next_steps) {
      result.next_steps.forEach(step => console.log(`   ${step}`));
    }
    console.log('\n🚀 Once setup: New deal = Automatic 6-email sequence!');
    console.log('   No clicking, no manual steps, fully automated!');
  });