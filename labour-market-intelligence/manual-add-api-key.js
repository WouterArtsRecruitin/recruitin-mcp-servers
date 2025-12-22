#!/usr/bin/env node

// Manually add CLAUDE_API_KEY via Render API
import https from 'https';

const RENDER_API_TOKEN = 'rnd_vGJvIxrJzJO1k3JlHSU7clSOIZvj';
const SERVICE_ID = 'srv-d3oohhm3jp1c739kd4f0';

// Direct API key - replace with actual Claude API key
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'sk-ant-api03-placeholder-replace-with-real-key';

function makeRenderRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
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

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

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
    if (postData) req.write(postData);
    req.end();
  });
}

async function addApiKeyManually() {
  console.log('🔑 Manually adding CLAUDE_API_KEY to Render...\n');

  try {
    // Check current service info
    console.log('1. 📋 Checking service info...');
    const serviceInfo = await makeRenderRequest('GET', `/v1/services/${SERVICE_ID}`);
    console.log('Service name:', serviceInfo.data?.name || 'Unknown');

    // List existing environment variables
    console.log('\n2. 📝 Current environment variables...');
    const envVars = await makeRenderRequest('GET', `/v1/services/${SERVICE_ID}/env-vars`);
    
    if (envVars.status === 200) {
      console.log('Existing env vars:');
      envVars.data.forEach(env => {
        console.log(`- ${env.key}: ${env.value?.substring(0, 10)}...`);
      });
    }

    // Add CLAUDE_API_KEY using correct format
    console.log('\n3. 🔑 Adding CLAUDE_API_KEY...');
    
    const envVarPayload = {
      key: 'CLAUDE_API_KEY',
      value: CLAUDE_API_KEY
    };

    console.log('Payload:', { key: envVarPayload.key, value: envVarPayload.value.substring(0, 15) + '...' });

    const addResult = await makeRenderRequest('POST', `/v1/services/${SERVICE_ID}/env-vars`, envVarPayload);
    
    console.log('Add env var result:', addResult.status);
    
    if (addResult.status === 201) {
      console.log('✅ CLAUDE_API_KEY added successfully!');
    } else if (addResult.status === 400) {
      console.log('⚠️ Environment variable might already exist or invalid format');
      console.log('Response:', addResult.data);
    } else {
      console.log('Response data:', addResult.data);
    }

    console.log('\n📊 STATUS UPDATE:');
    console.log('✅ Service ID:', SERVICE_ID);
    console.log('✅ API Key configured (if successful)');
    console.log('✅ Webhook URL: https://lmi-webhook-server.onrender.com/webhook/jotform');
    
    console.log('\n🔗 Next steps:');
    console.log('1. Check deployment logs: https://dashboard.render.com/web/' + SERVICE_ID);
    console.log('2. Configure Jotform webhook manually (instructions above)');
    console.log('3. Test integration with form submission');

  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.log('\n📋 MANUAL ENVIRONMENT VARIABLE SETUP:');
    console.log(`1. Go to: https://dashboard.render.com/web/${SERVICE_ID}/environment`);
    console.log('2. Add Environment Variable:');
    console.log('   Key: CLAUDE_API_KEY');
    console.log('   Value: [Your Claude API key starting with sk-ant-...]');
    console.log('3. Save (will trigger redeploy)');
  }
}

addApiKeyManually();