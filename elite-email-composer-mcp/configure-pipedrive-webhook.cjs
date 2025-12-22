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
  
  const http = require('http');
  const url = require('url');
  
  return new Promise((resolve) => {
    const testData = JSON.stringify({
      current: {
        id: 12345,
        title: 'Test Deal - Email Automation',
        pipeline_id: 14,
        org_name: 'Test Company',
        person_name: 'Test Contact',
        person_email: 'test@example.com'
      },
      event: 'added'
    });

    const parsedUrl = url.parse(WEBHOOK_URL);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Webhook endpoint is responding');
          try {
            const result = JSON.parse(responseData);
            console.log('Response:', JSON.stringify(result, null, 2));
          } catch (e) {
            console.log('Raw response:', responseData);
          }
          resolve(true);
        } else {
          console.log(`⚠️  Webhook endpoint returned status: ${res.statusCode}`);
          console.log('Response:', responseData);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Webhook endpoint test failed:', error.message);
      console.log('💡 Make sure the webhook relay server is running on port 3004');
      resolve(false);
    });

    req.on('timeout', () => {
      console.error('❌ Webhook endpoint test timed out');
      console.log('💡 Make sure the webhook relay server is running on port 3004');
      req.destroy();
      resolve(false);
    });

    req.write(testData);
    req.end();
  });
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
  
  // Step 3: Create new webhook
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
    
    // Test with a sample deal
    console.log('\n🧪 Testing complete pipeline...');
    console.log('You can now create a test deal in Pipeline 14 to verify the automation works');
  } else {
    console.log('\n❌ Webhook configuration failed');
    console.log('Please check the error messages above and try again');
  }
}

main().catch(console.error);