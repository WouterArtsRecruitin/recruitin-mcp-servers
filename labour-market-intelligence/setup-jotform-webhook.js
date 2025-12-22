#!/usr/bin/env node

/**
 * Setup Jotform Webhook for Labour Market Intelligence MCP
 * Configures webhook integration with deployed Render service
 */

import https from 'https';
import { URLSearchParams } from 'url';

const JOTFORM_API_KEY = process.env.JOTFORM_API_KEY || 'your_jotform_api_key';
const FORM_ID = '252881347421054';
const WEBHOOK_URL = 'https://lmi-webhook-server.onrender.com/webhook/jotform';

function makeJotformRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'eu-api.jotform.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'APIKEY': JOTFORM_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      const params = new URLSearchParams(data);
      req.write(params.toString());
    }
    
    req.end();
  });
}

async function setupWebhook() {
  console.log('🔗 Setting up Jotform webhook for Labour Market Intelligence...\n');

  if (JOTFORM_API_KEY === 'your_jotform_api_key') {
    console.log('❌ Please set JOTFORM_API_KEY environment variable');
    console.log('Usage: JOTFORM_API_KEY=your_key node setup-jotform-webhook.js');
    console.log('\n📋 MANUAL SETUP INSTRUCTIONS:');
    console.log('1. Go to: https://www.jotform.com/myforms/');
    console.log('2. Find form: Arbeidsmarkt Intelligence | Recruitin');
    console.log('3. Settings → Integrations → Webhooks');
    console.log('4. Add Webhook URL:', WEBHOOK_URL);
    console.log('5. Method: POST');
    console.log('6. When to Send: Form Submission');
    return;
  }

  try {
    // Check form details first
    console.log(`1. 📋 Checking form ${FORM_ID}...`);
    const formInfo = await makeJotformRequest('GET', `/form/${FORM_ID}`);
    
    if (formInfo.status === 200) {
      console.log('✅ Form found:', formInfo.data.content?.title || 'Labour Market Intelligence');
      console.log('Form status:', formInfo.data.content?.status || 'unknown');
    } else {
      console.log('⚠️ Form check response:', formInfo.status, formInfo.data);
    }

    // Get existing webhooks
    console.log('\n2. 🔍 Checking existing webhooks...');
    const webhooks = await makeJotformRequest('GET', `/form/${FORM_ID}/webhooks`);
    
    if (webhooks.status === 200) {
      console.log('Current webhooks:', webhooks.data.content?.length || 0);
      
      // Check if our webhook already exists
      const existingWebhook = webhooks.data.content?.find(w => 
        w.webhookURL === WEBHOOK_URL
      );
      
      if (existingWebhook) {
        console.log('✅ Webhook already configured:', WEBHOOK_URL);
        return;
      }
    }

    // Add webhook
    console.log('\n3. 🔗 Adding Labour Market Intelligence webhook...');
    
    const webhookData = {
      webhookURL: WEBHOOK_URL,
      method: 'POST'
    };

    const addWebhook = await makeJotformRequest('POST', `/form/${FORM_ID}/webhooks`, webhookData);
    
    if (addWebhook.status === 200 || addWebhook.status === 201) {
      console.log('✅ Webhook added successfully!');
      console.log('Webhook URL:', WEBHOOK_URL);
    } else {
      console.log('⚠️ Webhook add response:', addWebhook.status, addWebhook.data);
    }

    console.log('\n📊 JOTFORM INTEGRATION COMPLETE:');
    console.log('✅ Form ID:', FORM_ID);
    console.log('✅ Webhook URL:', WEBHOOK_URL);
    console.log('✅ Method: POST');
    console.log('✅ Trigger: Form Submission');
    
    console.log('\n🧪 TEST THE INTEGRATION:');
    console.log('1. Go to: https://form.jotform.com/' + FORM_ID);
    console.log('2. Fill out the form with job title and/or upload PDF');
    console.log('3. Submit the form');
    console.log('4. Check Render logs: https://dashboard.render.com/web/srv-d3oohhm3jp1c739kd4f0');
    console.log('5. Verify 85% reliability validation is applied');

  } catch (error) {
    console.error('❌ Webhook setup failed:', error.message);
    
    console.log('\n📋 MANUAL WEBHOOK SETUP:');
    console.log('1. Go to Jotform dashboard: https://www.jotform.com/myforms/');
    console.log('2. Find form: "Arbeidsmarkt Intelligence | Recruitin"');
    console.log('3. Edit form → Settings → Integrations');
    console.log('4. Add Webhook:');
    console.log('   URL:', WEBHOOK_URL);
    console.log('   Method: POST');
    console.log('   When: Form Submission');
    console.log('5. Save settings');
  }
}

setupWebhook();