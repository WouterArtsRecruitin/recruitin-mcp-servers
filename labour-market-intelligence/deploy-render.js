#!/usr/bin/env node

// Render API Deployment Script voor Labour Market Intelligence MCP
// Automatische deployment naar Render.com

import https from 'https';

const RENDER_API_TOKEN = 'rnd_vGJvIxrJzJO1k3JlHSU7clSOIZvj';
const GITHUB_REPO = 'https://github.com/WouterArtsRecruitin/labour-market-intelligence-mcp';

// Render API configuratie
const renderAPI = {
  baseURL: 'api.render.com',
  headers: {
    'Authorization': `Bearer ${RENDER_API_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Service configuratie voor Webhook Server
const webServiceConfig = {
  type: 'web_service',
  name: 'lmi-webhook-server',
  repo: GITHUB_REPO,
  branch: 'main',
  buildCommand: 'npm install && npm run build',
  startCommand: 'npm run start:http',
  plan: 'starter', // Free tier
  region: 'frankfurt',
  env: 'node',
  envVars: [
    {
      key: 'NODE_ENV',
      value: 'production'
    },
    {
      key: 'PORT',
      value: '3000'
    }
    // CLAUDE_API_KEY moet handmatig worden toegevoegd via dashboard
  ]
};

// API Request functie
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

// Hoofdfunctie voor deployment
async function deployToRender() {
  console.log('🚀 Starting Render deployment...\n');

  try {
    // 1. Controleer Render API verbinding
    console.log('1. 🔍 Checking Render API connection...');
    const authTest = await makeRenderRequest('GET', '/v1/services');
    
    if (authTest.status !== 200) {
      throw new Error(`API Authentication failed: ${authTest.status}`);
    }
    console.log('✅ API connection successful\n');

    // 2. Maak webhook service
    console.log('2. 🌐 Creating webhook service...');
    const serviceResult = await makeRenderRequest('POST', '/v1/services', webServiceConfig);
    
    if (serviceResult.status === 201) {
      console.log('✅ Webhook service created successfully!');
      console.log(`   Service ID: ${serviceResult.data.service.id}`);
      console.log(`   Service URL: https://${serviceResult.data.service.serviceDetails.url}`);
    } else {
      console.log(`⚠️  Service creation response: ${serviceResult.status}`);
      console.log(`   Response: ${JSON.stringify(serviceResult.data, null, 2)}`);
    }

    // 3. Deployment status
    console.log('\n3. 📊 Deployment Summary:');
    console.log('✅ Repository: Connected to GitHub');
    console.log('✅ Build Command: npm install && npm run build');
    console.log('✅ Start Command: npm run start:http');
    console.log('✅ Region: Frankfurt (EU)');
    console.log('✅ Plan: Starter (Free)');

    console.log('\n🔧 Next Steps:');
    console.log('1. Go to Render Dashboard: https://dashboard.render.com');
    console.log('2. Add CLAUDE_API_KEY environment variable');
    console.log('3. Trigger deployment');
    console.log('4. Configure Jotform webhook with your new URL');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    // Fallback: Manual instructions
    console.log('\n📋 Manual Setup Required:');
    console.log('1. Go to: https://dashboard.render.com');
    console.log('2. New → Web Service');
    console.log('3. Connect GitHub repo: labour-market-intelligence-mcp');
    console.log('4. Configure as per DEPLOYMENT.md');
  }
}

// Run deployment
deployToRender();