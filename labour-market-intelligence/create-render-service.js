#!/usr/bin/env node

// Create Labour Market Intelligence MCP service on Render
import https from 'https';

const RENDER_API_TOKEN = 'rnd_vGJvIxrJzJO1k3JlHSU7clSOIZvj';
const OWNER_ID = 'tea-d3cq3ti4d50c73cpduqg'; // From account info

const serviceConfig = {
  type: 'web_service',
  name: 'lmi-webhook-server',
  ownerId: OWNER_ID,
  repo: 'https://github.com/WouterArtsRecruitin/labour-market-intelligence-mcp',
  branch: 'main',
  serviceDetails: {
    env: 'node',
    plan: 'starter',
    region: 'frankfurt',
    runtime: 'node',
    envSpecificDetails: {
      buildCommand: 'npm install && npm run build',
      startCommand: 'npm run start:http'
    }
  },
  envVars: [
    {
      key: 'NODE_ENV',
      value: 'production'
    }
  ]
};

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

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function createService() {
  console.log('🚀 Creating Labour Market Intelligence MCP service on Render...\n');

  try {
    const result = await makeRenderRequest('POST', '/v1/services', serviceConfig);
    
    console.log(`Status: ${result.status}`);
    
    if (result.status === 201) {
      console.log('✅ SERVICE CREATED SUCCESSFULLY!\n');
      console.log('📊 Service Details:');
      console.log(`   Name: ${result.data.service.name}`);
      console.log(`   ID: ${result.data.service.id}`);
      console.log(`   URL: https://${result.data.service.serviceDetails.url}`);
      console.log(`   Dashboard: ${result.data.service.dashboardUrl}`);
      console.log(`   Region: ${result.data.service.serviceDetails.region}`);
      
      console.log('\n🔧 NEXT STEPS:');
      console.log('1. Go to Dashboard:', result.data.service.dashboardUrl);
      console.log('2. Add Environment Variable: CLAUDE_API_KEY = your_api_key');
      console.log('3. Deploy will start automatically');
      console.log('4. Your webhook URL:', `https://${result.data.service.serviceDetails.url}/webhook/jotform`);
      
    } else {
      console.log('❌ Service creation failed');
      console.log('Response:', JSON.stringify(result.data, null, 2));
      
      console.log('\n📋 MANUAL SETUP FALLBACK:');
      console.log('1. Go to: https://dashboard.render.com/create?type=web');
      console.log('2. Connect: WouterArtsRecruitin/labour-market-intelligence-mcp');
      console.log('3. Name: lmi-webhook-server');
      console.log('4. Build: npm install && npm run build');
      console.log('5. Start: npm run start:http');
      console.log('6. Add CLAUDE_API_KEY environment variable');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    console.log('\n📋 MANUAL SETUP REQUIRED:');
    console.log('1. Go to: https://dashboard.render.com');
    console.log('2. New → Web Service');
    console.log('3. Connect repository: WouterArtsRecruitin/labour-market-intelligence-mcp');
    console.log('4. Configure as shown above');
  }
}

createService();