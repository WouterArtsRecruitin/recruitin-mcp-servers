#!/usr/bin/env node

// Render Account Info & Manual Setup Helper
import https from 'https';

const RENDER_API_TOKEN = process.env.RENDER_API_TOKEN;

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
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (e) => { reject(e); });
    if (data) { req.write(JSON.stringify(data)); }
    req.end();
  });
}

async function checkRenderAccount() {
  console.log('🔍 Checking Render account details...\n');

  try {
    const userInfo = await makeRenderRequest('GET', '/v1/owners');
    console.log('Account Info:', JSON.stringify(userInfo.data, null, 2));

    const services = await makeRenderRequest('GET', '/v1/services');
    console.log('\nExisting Services:', JSON.stringify(services.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n📋 MANUAL SETUP INSTRUCTIONS:');
  console.log('==========================================');
  console.log('1. Go to: https://dashboard.render.com');
  console.log('2. Click: New → Web Service');
  console.log('3. Connect repository: WouterArtsRecruitin/labour-market-intelligence-mcp');
  console.log('4. Service name: lmi-webhook-server');
  console.log('5. Build command: npm install && npm run build');
  console.log('6. Start command: npm run start:http');
  console.log('7. Add environment variable: CLAUDE_API_KEY');
  console.log('8. Deploy!');
  console.log('\n✅ Your webhook URL will be: https://lmi-webhook-server.onrender.com/webhook/jotform');
}

checkRenderAccount();
