#!/usr/bin/env node

/**
 * Test the automatic stage move functionality
 */

import { PipedriveIntegrator } from './dist/pipedrive-integrator.js';

async function testAutomaticStageMove() {
  console.log('🎯 Testing AUTOMATIC Stage Move After Email Generation\n');
  
  const integrator = new PipedriveIntegrator();
  const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
  
  // Use our test deal 1111 (reset it to lead stage first)
  const TEST_DEAL_ID = '1111';
  
  try {
    console.log(`📋 Resetting deal ${TEST_DEAL_ID} to lead stage...`);
    
    // First move back to lead stage
    const resetResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${TEST_DEAL_ID}?api_token=${API_TOKEN}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_id: 95 }) // Lead stage
    });
    
    if (!resetResponse.ok) {
      throw new Error('Failed to reset deal to lead stage');
    }
    
    console.log('✅ Deal reset to lead stage');
    
    // Now test the full flow: Generate emails + auto move
    console.log(`\n🚀 Testing automatic flow for deal ${TEST_DEAL_ID}...`);
    
    const testData = {
      company_name: 'AutoTest Solutions BV',
      contact_name: 'Maria van Automated',
      vacancy_title: 'Senior HR Manager - Automation Test',
      sector: 'technology',
      company_size: 'scale-up',
      location: 'Nederland',
      urgency_level: 'medium'
    };
    
    // Generate emails (this should now automatically move the deal)
    console.log('📧 Generating 6-email sequence...');
    
    const strategy = integrator.determineSequenceStrategy(
      testData.vacancy_title,
      testData.sector,
      testData.company_size,
      testData.urgency_level
    );
    
    const emailSequence = [];
    for (let i = 1; i <= 6; i++) {
      const emailData = await integrator.generatePersonalizedEmail(i, testData, strategy);
      emailSequence.push(emailData);
    }
    
    console.log('✅ All 6 emails generated');
    
    // Update Pipedrive (this should automatically move to Email Sequence Ready)
    console.log('\n💾 Saving to Pipedrive and testing automatic stage move...');
    
    const pipedriveUpdate = await integrator.updatePipedriveDeal(TEST_DEAL_ID, emailSequence, API_TOKEN);
    
    if (pipedriveUpdate.success) {
      console.log('✅ Emails saved to custom fields');
      console.log(`   Fields updated: ${pipedriveUpdate.fields_updated.length}`);
      
      // Check if deal was automatically moved
      console.log('\n🔍 Verifying automatic stage move...');
      
      const verifyResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${TEST_DEAL_ID}?api_token=${API_TOKEN}`);
      const dealData = await verifyResponse.json();
      
      console.log(`📊 Deal Status:`)
      console.log(`   Current Stage: ${dealData.data.stage_id}`);
      console.log(`   Expected Stage: 105 (Email Sequence Ready)`);
      
      if (dealData.data.stage_id === 105) {
        console.log('\n🎉 SUCCESS! Automatic stage move worked!');
        console.log('   Flow: Email Generation → Save to Fields → Auto Move to Stage 105');
        console.log('   ✅ Pipedrive automation should now trigger email sequence');
        
        // Show email preview
        const email1Subject = dealData.data['47a7d774bf5b08226ce8d6e1e79708f1d44e3e30'];
        console.log(`\n📧 Email 1 Preview:`);
        console.log(`   Subject: ${email1Subject}`);
        console.log(`   Template 36 will read this from custom field`);
        console.log(`   Ready for automation!`);
        
      } else {
        console.log('\n❌ Stage move did not work');
        console.log('   Deal is still in stage:', dealData.data.stage_id);
      }
      
    } else {
      console.log('❌ Failed to save emails to Pipedrive');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAutomaticStageMove();