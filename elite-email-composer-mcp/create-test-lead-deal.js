#!/usr/bin/env node

/**
 * Create a proper test deal in lead stage with correct Pipedrive format
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
const PIPELINE_ID = 14;
const LEAD_STAGE_ID = 95;

async function createProperTestDeal() {
  console.log('🧪 Creating test deal in lead stage with proper format...\n');
  
  try {
    // Step 1: Create organization first
    console.log('1️⃣ Creating organization...');
    const orgData = {
      name: 'AutoTest Solutions BV'
    };
    
    const orgResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/organizations?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orgData)
    });
    
    const orgResult = await orgResponse.json();
    
    if (!orgResult.success) {
      throw new Error(`Failed to create organization: ${orgResult.error}`);
    }
    
    console.log(`✅ Organization created: ${orgResult.data.name} (ID: ${orgResult.data.id})`);
    
    // Step 2: Create person
    console.log('2️⃣ Creating contact person...');
    const personData = {
      name: 'Maria van Automated',
      email: [{ value: 'maria@autotest.nl', primary: true }],
      org_id: orgResult.data.id
    };
    
    const personResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/persons?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personData)
    });
    
    const personResult = await personResponse.json();
    
    if (!personResult.success) {
      throw new Error(`Failed to create person: ${personResult.error}`);
    }
    
    console.log(`✅ Person created: ${personResult.data.name} (ID: ${personResult.data.id})`);
    console.log(`   Email: ${personResult.data.email[0].value}`);
    
    // Step 3: Create deal
    console.log('3️⃣ Creating deal...');
    const dealData = {
      title: 'Senior HR Manager - Automation Test',
      pipeline_id: PIPELINE_ID,
      stage_id: LEAD_STAGE_ID,
      org_id: orgResult.data.id,
      person_id: personResult.data.id,
      value: 5000,
      currency: 'EUR'
    };
    
    const dealResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealData)
    });
    
    const dealResult = await dealResponse.json();
    
    if (!dealResult.success) {
      throw new Error(`Failed to create deal: ${dealResult.error}`);
    }
    
    console.log(`✅ Deal created: ${dealResult.data.title} (ID: ${dealResult.data.id})`);
    console.log(`   Pipeline: ${dealResult.data.pipeline_id}`);
    console.log(`   Stage: ${dealResult.data.stage_id} (lead)`);
    console.log(`   Organization: ${dealResult.data.org_name}`);
    console.log(`   Contact: ${dealResult.data.person_name}`);
    
    // Verify the deal is in lead stage
    console.log('\n🔍 Verifying deal in lead stage...');
    
    const verifyResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals?pipeline_id=${PIPELINE_ID}&stage_id=${LEAD_STAGE_ID}&api_token=${API_TOKEN}`);
    const verifyData = await verifyResponse.json();
    
    const ourDeal = verifyData.data?.find(deal => deal.id === dealResult.data.id);
    
    if (ourDeal) {
      console.log('✅ Deal confirmed in lead stage!');
      console.log(`   Ready for MCP email generation`);
      
      return {
        success: true,
        deal_id: dealResult.data.id,
        org_id: orgResult.data.id,
        person_id: personResult.data.id,
        deal_data: {
          title: dealResult.data.title,
          org_name: dealResult.data.org_name,
          person_name: dealResult.data.person_name,
          person_email: personResult.data.email[0].value
        }
      };
      
    } else {
      throw new Error('Deal not found in lead stage after creation');
    }
    
  } catch (error) {
    console.error('❌ Error creating test deal:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the creation
createProperTestDeal()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 TEST DEAL READY FOR AUTOMATION!');
      console.log('\n📋 Next steps:');
      console.log(`   1. Run MCP email generation for deal ${result.deal_id}`);
      console.log('   2. Deal will auto-move to "Email Sequence Ready"');
      console.log('   3. Pipedrive automation will start email sequence');
      console.log('\n💡 This proves the full automatic workflow works!');
    }
  });