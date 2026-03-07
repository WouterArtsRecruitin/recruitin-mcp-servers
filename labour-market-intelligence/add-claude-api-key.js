#!/usr/bin/env node

// Add CLAUDE_API_KEY environment variable to Render service
import https from 'https';

const RENDER_API_TOKEN = process.env.RENDER_API_TOKEN;
const SERVICE_ID = 'srv-d3oohhm3jp1c739kd4f0';
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
    console.log('❌ Please set CLAUDE_API_KEY environment variable');
    console.log('Usage: CLAUDE_API_KEY=sk-ant-... node add-claude-api-key.js');
    return;
  }

  try {
    const envVarData = { key: 'CLAUDE_API_KEY', value: CLAUDE_API_KEY };
    const addResult = await makeRenderRequest('POST', `/v1/services/${SERVICE_ID}/env-vars`, envVarData);

    if (addResult.status === 201) {
      console.log('✅ CLAUDE_API_KEY added successfully!');
    }

    const deployResult = await makeRenderRequest('POST', `/v1/services/${SERVICE_ID}/deploys`);
    if (deployResult.status === 201) {
      console.log('✅ Redeploy triggered!');
    }

  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.log('\nManual: https://dashboard.render.com/web/' + SERVICE_ID + '/environment');
  }
}

addClaudeApiKey();
