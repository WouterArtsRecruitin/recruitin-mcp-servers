#!/usr/bin/env node

/**
 * Get recent Render logs to see webhook processing results
 */

import https from 'https';

const RENDER_API_TOKEN = process.env.RENDER_API_TOKEN;
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

async function getLogs() {
  console.log('📋 Getting recent Render logs for webhook processing...\n');

  try {
    console.log('1. 🔍 Fetching recent service logs...');
    const logsResponse = await makeRenderRequest('GET', `/v1/services/${SERVICE_ID}/logs?limit=50`);

    if (logsResponse.status === 200) {
      console.log('✅ Logs retrieved successfully');

      if (logsResponse.data && logsResponse.data.length > 0) {
        console.log(`Found ${logsResponse.data.length} recent log entries\n`);

        const webhookLogs = logsResponse.data.filter(log =>
          log.message && (
            log.message.includes('webhook') ||
            log.message.includes('jotform') ||
            log.message.includes('betrouwbaarheid') ||
            log.message.includes('reliability') ||
            log.message.includes('POST /webhook') ||
            log.message.includes('analyse') ||
            log.message.includes('PDF')
          )
        );

        if (webhookLogs.length > 0) {
          console.log('🎯 WEBHOOK PROCESSING LOGS:');
          webhookLogs.slice(0, 10).forEach((log, index) => {
            const timestamp = new Date(log.timestamp).toLocaleString('nl-NL');
            console.log(`\n${index + 1}. [${timestamp}]`);
            console.log(`${log.message}`);
          });
        } else {
          console.log('ℹ️ No specific webhook logs found in recent entries');
          logsResponse.data.slice(0, 5).forEach((log, index) => {
            const timestamp = new Date(log.timestamp).toLocaleString('nl-NL');
            console.log(`\n${index + 1}. [${timestamp}]`);
            console.log(`${log.message.substring(0, 200)}${log.message.length > 200 ? '...' : ''}`);
          });
        }
      } else {
        console.log('ℹ️ No logs found or empty response');
      }
    } else {
      console.log('❌ Failed to get logs:', logsResponse.status);
    }

    console.log('\n2. 📊 Checking service events...');
    const eventsResponse = await makeRenderRequest('GET', `/v1/services/${SERVICE_ID}/events?limit=10`);

    if (eventsResponse.status === 200 && eventsResponse.data.length > 0) {
      eventsResponse.data.slice(0, 5).forEach((event, index) => {
        const timestamp = new Date(event.timestamp).toLocaleString('nl-NL');
        console.log(`${index + 1}. [${timestamp}] ${event.type}: ${event.description || 'No description'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error getting logs:', error.message);
  }

  console.log('\n🔗 MANUAL LOG ACCESS:');
  console.log('Direct link: https://dashboard.render.com/web/' + SERVICE_ID);
}

getLogs();
