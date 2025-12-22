#!/usr/bin/env node

/**
 * Configure Pipedrive Webhook for Email Automation
 * Sets up webhook to trigger email sequence generation
 */

const https = require('https');

const PIPEDRIVE_API_TOKEN = process.env.PIPEDRIVE_API_TOKEN || '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
const PIPEDRIVE_DOMAIN = 'recruitinbv.pipedrive.com';
const PUBLIC_IP = '83.82.140.185';
const WEBHOOK_PORT = 3004;
const WEBHOOK_URL = `http://${PUBLIC_IP}:${WEBHOOK_PORT}/webhook/new-deal`;

async function makeRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: PIPEDRIVE_DOMAIN,
      port: 443,
      path: `/api/v1/${endpoint}?api_token=${PIPEDRIVE_API_TOKEN}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Invalid JSON: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function listExistingWebhooks() {
  console.log('📋 Checking existing webhooks...');
  try {
    const response = await makeRequest('GET', 'webhooks');
    
    if (response.success && response.data) {
      console.log(`Found ${response.data.length} existing webhooks:`);
      
      response.data.forEach((webhook, index) => {
        console.log(`${index + 1}. ID: ${webhook.id}`);
        console.log(`   URL: ${webhook.subscription_url}`);
        console.log(`   Event: ${webhook.event_action}.${webhook.event_object}`);
        console.log(`   Active: ${webhook.active}`);
        console.log('');
      });
      
      return response.data;
    } else {
      console.log('No existing webhooks found');
      return [];
    }
  } catch (error) {
    console.error('❌ Error listing webhooks:', error.message);
    return [];
  }
}

async function deleteWebhook(webhookId) {
  console.log(`🗑️  Deleting webhook ID: ${webhookId}`);
  try {
    const response = await makeRequest('DELETE', `webhooks/${webhookId}`);
    
    if (response.success) {
      console.log('✅ Webhook deleted successfully');
      return true;
    } else {
      console.log('⚠️  Failed to delete webhook:', response);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting webhook:', error.message);
    return false;
  }
}

async function createWebhook() {
  console.log('🔗 Creating new webhook for email automation...');
  console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);
  
  const webhookData = {
    subscription_url: WEBHOOK_URL,
    event_action: 'added',
    event_object: 'deal',
    version: '1.0',
    http_auth_user: null,
    http_auth_password: null
  };

  try {
    const response = await makeRequest('POST', 'webhooks', webhookData);
    
    if (response.success && response.data) {
      console.log('✅ Webhook created successfully!');
      console.log(`   Webhook ID: ${response.data.id}`);
      console.log(`   URL: ${response.data.subscription_url}`);
      console.log(`   Event: ${response.data.event_action}.${response.data.event_object}`);
      console.log(`   Active: ${response.data.active}`);
      
      return response.data;
    } else {
      console.error('❌ Failed to create webhook');
      console.error('Response:', JSON.stringify(response, null, 2));
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating webhook:', error.message);
    return null;
  }
}

async function testWebhookEndpoint() {
  console.log('🧪 Testing webhook endpoint...');
  
  const testData = {
    current: {
      id: 12345,
      title: 'Test Deal - Email Automation',
      pipeline_id: 14,
      org_name: 'Test Company',
      person_name: 'Test Contact',
      person_email: 'test@example.com'
    },
    event: 'added'
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      timeout: 10000
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Webhook endpoint is responding');
      console.log('Response:', JSON.stringify(result, null, 2));
      return true;
    } else {
      console.log(`⚠️  Webhook endpoint returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Webhook endpoint test failed:', error.message);
    console.log('💡 Make sure the webhook relay server is running on port 3004');
    return false;
  }
}

async function main() {
  console.log('🚀 Pipedrive Webhook Configuration');
  console.log('=====================================\n');
  
  // Step 1: Test webhook endpoint
  console.log('Step 1: Testing webhook endpoint...');
  const endpointWorking = await testWebhookEndpoint();
  
  if (!endpointWorking) {
    console.log('\n❌ Webhook endpoint is not responding!');
    console.log('Please ensure:');
    console.log('1. Webhook relay server is running: node webhook-relay-server.cjs');
    console.log('2. Port 3004 is accessible from the internet');
    console.log('3. Firewall allows incoming connections on port 3004');
    return;
  }
  
  console.log('');
  
  // Step 2: List existing webhooks
  const existingWebhooks = await listExistingWebhooks();
  
  // Step 3: Clean up old webhooks for the same URL
  const duplicateWebhooks = existingWebhooks.filter(webhook => 
    webhook.subscription_url === WEBHOOK_URL || 
    webhook.subscription_url.includes('webhook/new-deal')
  );
  
  if (duplicateWebhooks.length > 0) {
    console.log('🧹 Cleaning up duplicate webhooks...');
    for (const webhook of duplicateWebhooks) {
      await deleteWebhook(webhook.id);
    }
    console.log('');
  }
  
  // Step 4: Create new webhook
  const newWebhook = await createWebhook();
  
  if (newWebhook) {
    console.log('\n🎉 WEBHOOK CONFIGURATION COMPLETE!');
    console.log('=====================================');
    console.log(`✅ Webhook ID: ${newWebhook.id}`);
    console.log(`📡 URL: ${newWebhook.subscription_url}`);
    console.log(`🎯 Event: New deals added to any pipeline`);
    console.log(`🔄 Auto-processing: Pipeline 14 (Corporate Recruiter) only`);
    console.log('\n💡 How it works:');
    console.log('1. New deal created in Pipedrive → Webhook triggers');
    console.log('2. If Pipeline 14 → Generate 6-email sequence');
    console.log('3. Move deal to "Email Sequence Ready" stage');
    console.log('4. Pipedrive automation starts sending emails');
    console.log('\n🚀 Email automation is now FULLY ACTIVE!');
  } else {
    console.log('\n❌ Webhook configuration failed');
    console.log('Please check the error messages above and try again');
  }
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

main().catch(console.error);