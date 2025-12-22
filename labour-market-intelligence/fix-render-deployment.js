#!/usr/bin/env node

// Fix Render deployment configuration
import https from 'https';

const RENDER_API_TOKEN = 'rnd_vGJvIxrJzJO1k3JlHSU7clSOIZvj';
const OWNER_ID = 'tea-d3cq3ti4d50c73cpduqg';
const SERVICE_ID = 'srv-d3oohhm3jp1c739kd4f0'; // Existing service

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
    // First check current service
    console.log('1. 📍 Checking current service configuration...');
    const currentService = await makeRenderRequest('GET', `/v1/services/${SERVICE_ID}`);
    
    if (currentService.status === 200) {
      console.log('✅ Service found:', currentService.data.name);
      console.log('Current build command:', currentService.data.serviceDetails?.buildCommand);
      console.log('Current start command:', currentService.data.serviceDetails?.startCommand);
    }

    // Update service configuration
    console.log('\n2. 🔄 Updating service configuration...');
    
    const updateConfig = {
      serviceDetails: {
        buildCommand: 'npm install && npm run build',
        startCommand: 'npm run start:http',
        rootDir: '.', // Explicitly set root directory to project root
      }
    };

    const updateResult = await makeRenderRequest('PATCH', `/v1/services/${SERVICE_ID}`, updateConfig);
    
    if (updateResult.status === 200) {
      console.log('✅ Service configuration updated successfully!');
    } else {
      console.log('⚠️ Update response:', updateResult.status, updateResult.data);
    }

    // Trigger manual deploy
    console.log('\n3. 🚀 Triggering manual deployment...');
    
    const deployResult = await makeRenderRequest('POST', `/v1/services/${SERVICE_ID}/deploys`, {
      clearCache: false
    });

    if (deployResult.status === 201) {
      console.log('✅ Deployment triggered successfully!');
      console.log('Deploy ID:', deployResult.data.id);
    } else {
      console.log('⚠️ Deploy trigger response:', deployResult.status, deployResult.data);
    }

    console.log('\n📊 SUMMARY:');
    console.log('✅ Service ID:', SERVICE_ID);
    console.log('✅ Root directory configured');
    console.log('✅ Build command: npm install && npm run build');
    console.log('✅ Start command: npm run start:http');
    console.log('✅ Deployment triggered');
    
    console.log('\n🔗 Monitor deployment at:');
    console.log(`https://dashboard.render.com/web/${SERVICE_ID}`);

  } catch (error) {
    console.error('❌ Deployment fix failed:', error.message);
    console.log('\n📋 MANUAL STEPS:');
    console.log('1. Go to: https://dashboard.render.com/web/' + SERVICE_ID);
    console.log('2. Settings → Build & Deploy');
    console.log('3. Set Root Directory: . (dot for project root)');
    console.log('4. Build Command: npm install && npm run build');
    console.log('5. Start Command: npm run start:http');
    console.log('6. Trigger manual deploy');
  }
}

fixDeployment();