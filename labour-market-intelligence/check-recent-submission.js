#!/usr/bin/env node

/**
 * Check recent webhook processing for real Jotform submission
 */

import https from 'https';

const SERVICE_ID = 'srv-d3oohhm3jp1c739kd4f0';
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

async function checkRecentSubmission() {
  console.log('🔍 Checking recent webhook submissions...\n');

  try {
    const logsResponse = await makeRenderRequest('GET', `/v1/services/${SERVICE_ID}/logs?limit=20`);

    if (logsResponse.status === 200) {
      console.log('✅ Logs retrieved');
      console.log(JSON.stringify(logsResponse.data, null, 2));
    } else {
      console.log('❌ Failed:', logsResponse.status, logsResponse.data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n🔗 Dashboard: https://dashboard.render.com/web/' + SERVICE_ID);
}

checkRecentSubmission();
