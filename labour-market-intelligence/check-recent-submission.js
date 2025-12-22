#!/usr/bin/env node

/**
 * Check recent webhook processing for real Jotform submission
 * Monitor Render service logs and webhook activity
 */

import https from 'https';

const SERVICE_ID = 'srv-d3oohhm3jp1c739kd4f0';
const RENDER_API_TOKEN = 'rnd_vGJvIxrJzJO1k3JlHSU7clSOIZvj';

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

async function checkRecentActivity() {
  console.log('🔍 Checking recent webhook activity...\n');

  try {
    // Check service health first
    console.log('1. 🏥 Checking service health...');
    const healthResponse = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'lmi-webhook-server.onrender.com',
        path: '/health',
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    if (healthResponse.status === 200) {
      console.log('✅ Service is healthy and running');
      console.log('Service:', healthResponse.data.service || 'Labour Market Intelligence MCP');
      console.log('Version:', healthResponse.data.version || '1.0.0');
      console.log('Reliability Standard:', healthResponse.data.reliability || '85% minimum');
    } else {
      console.log('⚠️ Service health check failed:', healthResponse.status);
    }

    // Get recent logs/deploys
    console.log('\n2. 📋 Getting recent deployment info...');
    const deployments = await makeRenderRequest('GET', `/v1/services/${SERVICE_ID}/deploys?limit=5`);
    
    if (deployments.status === 200 && deployments.data.length > 0) {
      const latestDeploy = deployments.data[0];
      console.log('Latest deployment:');
      console.log('- Status:', latestDeploy.status);
      console.log('- Created:', new Date(latestDeploy.createdAt).toLocaleString('nl-NL'));
      console.log('- Commit:', latestDeploy.commit?.message?.substring(0, 60) + '...' || 'No commit info');
    }

    // Check environment variables
    console.log('\n3. 🔑 Checking environment configuration...');
    const envVars = await makeRenderRequest('GET', `/v1/services/${SERVICE_ID}/env-vars`);
    
    if (envVars.status === 200) {
      const hasClaudeKey = envVars.data.some(env => env.key === 'CLAUDE_API_KEY');
      console.log('Environment variables configured:', envVars.data.length);
      console.log('CLAUDE_API_KEY present:', hasClaudeKey ? '✅ Yes' : '❌ Missing');
      
      envVars.data.forEach(env => {
        console.log(`- ${env.key}: ${env.key === 'CLAUDE_API_KEY' ? '[REDACTED]' : env.value}`);
      });
    }

    console.log('\n📊 SUBMISSION ANALYSIS GUIDE:');
    console.log('=================================');
    console.log('✅ Your real submission should result in:');
    console.log('');
    console.log('📈 EXPECTED RELIABILITY FACTORS:');
    console.log('- PDF Upload (40% weight): High score if Jobdigger PDF');
    console.log('- Market Data (30% weight): Calculated from job title');
    console.log('- Workforce Data (20% weight): Derived from PDF + market');
    console.log('- Manual Data (10% weight): Vacancy text + URL provided');
    console.log('');
    console.log('🎯 SUCCESS SCENARIO (≥85% reliability):');
    console.log('- Jobdigger PDF with salary/skills data');
    console.log('- Comprehensive vacancy description');
    console.log('- Valid job title (e.g., "Allround Monteur")');
    console.log('- Complete form fields filled');
    console.log('');
    console.log('📋 RESULT INDICATORS:');
    console.log('- success: true = Analysis completed');
    console.log('- reliabilityScore: 85+ = High quality data');
    console.log('- analysis object = Complete market intelligence');
    console.log('- report = Professional Dutch report generated');

    console.log('\n🔗 CHECK YOUR SUBMISSION RESULT:');
    console.log('1. Monitor Render logs: https://dashboard.render.com/web/' + SERVICE_ID);
    console.log('2. Look for webhook processing messages');
    console.log('3. Check reliability score in the logs');
    console.log('4. Verify analysis completion or blocking message');

  } catch (error) {
    console.error('❌ Error checking activity:', error.message);
    
    console.log('\n📋 MANUAL VERIFICATION STEPS:');
    console.log('1. Check service: https://lmi-webhook-server.onrender.com/health');
    console.log('2. View logs: https://dashboard.render.com/web/srv-d3oohhm3jp1c739kd4f0');
    console.log('3. Submit test form: https://form.jotform.com/252881347421054');
  }
}

checkRecentActivity();