#!/usr/bin/env node

// Render API Deployment Script voor Labour Market Intelligence MCP
import https from 'https';

const RENDER_API_TOKEN = process.env.RENDER_API_TOKEN;
const GITHUB_REPO = 'https://github.com/WouterArtsRecruitin/labour-market-intelligence-mcp';

const renderAPI = {
  baseURL: 'api.render.com',
  headers: {
    'Authorization': `Bearer ${RENDER_API_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const webServiceConfig = {
  type: 'web_service',
  name: 'lmi-webhook-server',
  repo: GITHUB_REPO,
  branch: 'main',
  buildCommand: 'npm install && npm run build',
  startCommand: 'npm run start:http',
  plan: 'starter',
  region: 'frankfurt',
  env: 'node',
  envVars: [
    { key: 'NODE_ENV', value: 'production' },
    { key: 'PORT', value: '3000' }
  ]
};

function makeRenderRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: renderAPI.baseURL,
      port: 443,
      path: endpoint,
      method: method,
      headers: renderAPI.headers
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

async function deployToRender() {
  console.log('🚀 Starting Render deployment...\n');

  try {
    console.log('1. 🔍 Checking Render API connection...');
    const authTest = await makeRenderRequest('GET', '/v1/services');

    if (authTest.status !== 200) {
      throw new Error(`API Authentication failed: ${authTest.status}`);
    }
    console.log('✅ API connection successful\n');

    console.log('2. 🌐 Creating webhook service...');
    const serviceResult = await makeRenderRequest('POST', '/v1/services', webServiceConfig);

    if (serviceResult.status === 201) {
      console.log('✅ Webhook service created successfully!');
      console.log(`   Service ID: ${serviceResult.data.service.id}`);
    } else {
      console.log(`⚠️  Service creation response: ${serviceResult.status}`);
    }

    console.log('\n🔧 Next Steps:');
    console.log('1. Go to Render Dashboard: https://dashboard.render.com');
    console.log('2. Add CLAUDE_API_KEY environment variable');
    console.log('3. Trigger deployment');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  }
}

deployToRender();
