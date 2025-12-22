#!/usr/bin/env node
import { PipedriveClient } from './pipedrive-client.js';

const config = {
  apiToken: process.env.PIPEDRIVE_API_TOKEN || '',
  domain: process.env.PIPEDRIVE_DOMAIN || '',
  debug: true,
};

if (!config.apiToken) {
  console.error('❌ ERROR: PIPEDRIVE_API_TOKEN environment variable is required');
  process.exit(1);
}

console.log('🔍 Validating Pipedrive API connection...\n');
console.log(`Domain: ${config.domain}`);
console.log(`API Token: ${config.apiToken.substring(0, 10)}...${config.apiToken.substring(config.apiToken.length - 5)}\n`);

const client = new PipedriveClient(config);

async function validate() {
  try {
    // Test 1: Get Pipelines
    console.log('📊 Test 1: Fetching pipelines...');
    const pipelines = await client.getPipelines();
    if (pipelines.success) {
      console.log(`✅ Success! Found ${pipelines.data?.length || 0} pipelines`);
      pipelines.data?.forEach((p: any) => {
        console.log(`   - ${p.name} (ID: ${p.id})`);
      });
    } else {
      console.log(`❌ Failed: ${pipelines.error}`);
      return false;
    }

    // Test 2: Get Stages
    console.log('\n📋 Test 2: Fetching stages...');
    const stages = await client.getStages();
    if (stages.success) {
      console.log(`✅ Success! Found ${stages.data?.length || 0} stages`);
    } else {
      console.log(`❌ Failed: ${stages.error}`);
      return false;
    }

    // Test 3: Get Deal Fields
    console.log('\n🔧 Test 3: Fetching custom fields...');
    const fields = await client.getDealFields();
    if (fields.success) {
      console.log(`✅ Success! Found ${fields.data?.length || 0} custom fields`);
      const customFields = fields.data?.filter((f: any) => f.key.startsWith('custom_'));
      console.log(`   Custom fields: ${customFields?.length || 0}`);
      customFields?.slice(0, 5).forEach((f: any) => {
        console.log(`   - ${f.name} (${f.key}): ${f.field_type}`);
      });
    } else {
      console.log(`❌ Failed: ${fields.error}`);
      return false;
    }

    // Test 4: Get Deals (just a few)
    console.log('\n💼 Test 4: Fetching deals (limit 5)...');
    const deals = await client.getDeals({ limit: 5 });
    if (deals.success) {
      console.log(`✅ Success! Found deals`);
      deals.data?.forEach((d: any) => {
        console.log(`   - ${d.title} (ID: ${d.id}, Stage: ${d.stage_id})`);
      });
    } else {
      console.log(`❌ Failed: ${deals.error}`);
      return false;
    }

    console.log('\n✅ All validation tests passed!');
    console.log('\n📝 Your Pipedrive MCP is ready to use.');
    console.log('   Run: npm start (to start the MCP server)');
    
    return true;
  } catch (error) {
    console.error('\n❌ Validation failed with error:', error);
    return false;
  }
}

validate().then((success) => {
  process.exit(success ? 0 : 1);
});
