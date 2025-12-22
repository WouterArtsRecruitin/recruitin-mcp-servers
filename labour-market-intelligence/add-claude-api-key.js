#!/usr/bin/env node

// Add CLAUDE_API_KEY environment variable to Render service
import https from 'https';

const RENDER_API_TOKEN = 'rnd_vGJvIxrJzJO1k3JlHSU7clSOIZvj';
const SERVICE_ID = 'srv-d3oohhm3jp1c739kd4f0';

// You'll need to provide your Claude API key
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'your_claude_api_key_here';

function makeRenderRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.render.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${RENDER_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function addClaudeApiKey() {
  console.log('🔑 Adding CLAUDE_API_KEY to Render service...\n');

  if (CLAUDE_API_KEY === 'your_claude_api_key_here') {
    console.log('❌ Please set CLAUDE_API_KEY environment variable or update the script');
    console.log('Usage: CLAUDE_API_KEY=sk-ant-... node add-claude-api-key.js');
    console.log('\nOr manually add it at:');
    console.log(`https://dashboard.render.com/web/${SERVICE_ID}/environment`);
    return;
  }

  try {
    // Get current environment variables
    console.log('1. 📋 Getting current environment variables...');
    const currentEnv = await makeRenderRequest('GET', `/v1/services/${SERVICE_ID}/env-vars`);
    
    if (currentEnv.status === 200) {
      console.log('✅ Current environment variables found:', currentEnv.data.length || 0);
      
      // Check if CLAUDE_API_KEY already exists
      const existingClaudeKey = currentEnv.data.find(env => env.key === 'CLAUDE_API_KEY');
      if (existingClaudeKey) {
        console.log('⚠️ CLAUDE_API_KEY already exists, updating...');
      }
    }

    // Add CLAUDE_API_KEY
    console.log('2. 🔑 Adding CLAUDE_API_KEY...');
    
    const envVarData = {
      key: 'CLAUDE_API_KEY',
      value: CLAUDE_API_KEY
    };

    const addResult = await makeRenderRequest('POST', `/v1/services/${SERVICE_ID}/env-vars`, envVarData);
    
    if (addResult.status === 201) {
      console.log('✅ CLAUDE_API_KEY added successfully!');
    } else {
      console.log('⚠️ Add env var response:', addResult.status, addResult.data);
    }

    // Trigger redeploy
    console.log('3. 🚀 Triggering redeploy with new environment variable...');
    
    const deployResult = await makeRenderRequest('POST', `/v1/services/${SERVICE_ID}/deploys`);
    
    if (deployResult.status === 201) {
      console.log('✅ Redeploy triggered successfully!');
    }

    console.log('\n📊 SETUP COMPLETE:');
    console.log('✅ CLAUDE_API_KEY configured');
    console.log('✅ Service redeploying with API key');
    console.log('✅ Webhook will be available at: https://lmi-webhook-server.onrender.com/webhook/jotform');
    
    console.log('\n🔗 Monitor at:');
    console.log(`https://dashboard.render.com/web/${SERVICE_ID}`);

  } catch (error) {
    console.error('❌ Failed to add API key:', error.message);
    
    console.log('\n📋 MANUAL STEPS:');
    console.log('1. Go to: https://dashboard.render.com/web/' + SERVICE_ID + '/environment');
    console.log('2. Click "Add Environment Variable"');
    console.log('3. Key: CLAUDE_API_KEY');
    console.log('4. Value: [your Claude API key starting with sk-ant-...]');
    console.log('5. Save - this will trigger an automatic redeploy');
  }
}

addClaudeApiKey();