#!/usr/bin/env node

// Fix Render deployment configuration
import https from 'https';

const RENDER_API_TOKEN = process.env.RENDER_API_TOKEN;
const OWNER_ID = 'tea-d3cq3ti4d50c73cpduqg';
const SERVICE_ID = 'srv-d3oohhm3jp1c739kd4f0';

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

async function fixDeployment() {
  console.log('🔧 Fixing Render deployment configuration...\n');

  try {
    console.log('1. 📍 Checking current service configuration...');
    const currentService = await makeRenderRequest('GET', `/v1/services/${SERVICE_ID}`);

    if (currentService.status === 200) {
      console.log('✅ Service found:', currentService.data.name);
    }

    console.log('\n2. 🔄 Updating service configuration...');
    const updateConfig = {
      serviceDetails: {
        buildCommand: 'npm install && npm run build',
        startCommand: 'npm run start:http',
        rootDir: '.',
      }
    };

    const updateResult = await makeRenderRequest('PATCH', `/v1/services/${SERVICE_ID}`, updateConfig);

    if (updateResult.status === 200) {
      console.log('✅ Service configuration updated successfully!');
    }

    console.log('\n3. 🚀 Triggering manual deployment...');
    const deployResult = await makeRenderRequest('POST', `/v1/services/${SERVICE_ID}/deploys`, { clearCache: false });

    if (deployResult.status === 201) {
      console.log('✅ Deployment triggered successfully!');
    }

    console.log('\n🔗 Monitor at: https://dashboard.render.com/web/' + SERVICE_ID);

  } catch (error) {
    console.error('❌ Deployment fix failed:', error.message);
  }
}

fixDeployment();
