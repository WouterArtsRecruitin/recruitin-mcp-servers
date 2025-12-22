#!/usr/bin/env node

/**
 * Auto-generate emails for deals in "lead" stage using MCP
 */

import { PipedriveIntegrator } from './dist/pipedrive-integrator.js';

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
const PIPELINE_ID = 14;
const LEAD_STAGE_ID = 95;

async function generateEmailsForLeadDeals() {
  console.log('🎯 Auto-generating emails for deals in "lead" stage...\n');
  
  const integrator = new PipedriveIntegrator();
  
  try {
    // Get all deals in lead stage
    const dealsResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals?pipeline_id=${PIPELINE_ID}&stage_id=${LEAD_STAGE_ID}&api_token=${API_TOKEN}`);
    const dealsData = await dealsResponse.json();
    
    if (!dealsData.success) {
      throw new Error(`Failed to fetch deals: ${dealsData.error}`);
    }
    
    if (!dealsData.data || dealsData.data.length === 0) {
      console.log('📋 No deals found in lead stage');
      return;
    }
    
    console.log(`📋 Found ${dealsData.data.length} deals in lead stage:\n`);
    
    for (const deal of dealsData.data) {
      console.log(`🔄 Processing: ${deal.title}`);
      console.log(`   Company: ${deal.org_name || 'Unknown'}`);
      console.log(`   Contact: ${deal.person_name || 'Unknown'}`);
      console.log(`   Email: ${deal.person_email || 'Unknown'}`);
      
      // Check if emails already generated
      const hasEmailContent = deal['47a7d774bf5b08226ce8d6e1e79708f1d44e3e30'];
      
      if (hasEmailContent) {
        console.log('   ✅ Email content already exists - skipping');
        
        // Auto-move to Email Sequence Ready if content exists
        console.log('   🚀 Moving to Email Sequence Ready stage...');
        
        await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${deal.id}?api_token=${API_TOKEN}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage_id: 105 }) // Email Sequence Ready
        });
        
        console.log('   ✅ Moved - automation will start!\n');
        continue;
      }
      
      // Generate emails for this deal
      console.log('   📧 Generating 6-email sequence...');
      
      const dealData = {
        company_name: deal.org_name || deal.title || 'Company',
        contact_name: deal.person_name || 'Contact Person', 
        contact_email: deal.person_email || '',
        vacancy_title: deal.title || 'Position',
        sector: 'technology', // Default, could be extracted from deal data
        company_size: 'scale-up', // Default
        location: 'Nederland', // Default
        urgency_level: 'medium' // Default
      };
      
      try {
        // Generate sequence strategy
        const strategy = integrator.determineSequenceStrategy(
          dealData.vacancy_title,
          dealData.sector, 
          dealData.company_size,
          dealData.urgency_level
        );
        
        console.log(`   📋 Strategy: ${Object.keys(strategy).length} emails planned`);
        
        // Generate all 6 emails
        const emailSequence = [];
        for (let i = 1; i <= 6; i++) {
          console.log(`   📝 Generating Email ${i}...`);
          
          const emailData = await integrator.generatePersonalizedEmail(i, dealData, strategy);
          emailSequence.push(emailData);
        }
        
        console.log('   ✅ All 6 emails generated!');
        
        // Save to Pipedrive custom fields
        console.log('   💾 Saving to Pipedrive custom fields...');
        
        const pipedriveUpdate = await integrator.updatePipedriveDeal(deal.id, emailSequence, API_TOKEN);
        
        if (pipedriveUpdate.success) {
          console.log(`   ✅ Saved ${pipedriveUpdate.fields_updated.length} fields to Pipedrive`);
          
          // Auto-move to Email Sequence Ready stage
          console.log('   🚀 Moving to Email Sequence Ready stage...');
          
          await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${deal.id}?api_token=${API_TOKEN}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stage_id: 105 })
          });
          
          console.log('   ✅ Deal moved - automation will start email sequence!');
          
          // Show email preview
          console.log('   📧 Email 1 Preview:');
          console.log(`      Subject: ${emailSequence[0].subject}`);
          console.log(`      Framework: ${emailSequence[0].framework} (${emailSequence[0].effectiveness_score}%)`);
          
        } else {
          console.log(`   ❌ Failed to save to Pipedrive: ${pipedriveUpdate.error}`);
        }
        
      } catch (emailError) {
        console.log(`   ❌ Email generation failed: ${emailError.message}`);
      }
      
      console.log(''); // Empty line between deals
    }
    
  } catch (error) {
    console.error('❌ Error processing lead deals:', error.message);
  }
}

// Create a test deal first to demonstrate
async function createTestDeal() {
  console.log('🧪 Creating test deal in lead stage...\n');
  
  const testDeal = {
    title: 'HR Manager - TestBedrijf BV',
    pipeline_id: PIPELINE_ID,
    stage_id: LEAD_STAGE_ID,
    org_name: 'TestBedrijf BV',
    person_name: 'Jan de Tester',
    person_email: 'jan@testbedrijf.nl'
  };
  
  try {
    const createResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testDeal)
    });
    
    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ Test deal created!');
      console.log(`   Deal ID: ${createResult.data.id}`);
      console.log(`   Title: ${createResult.data.title}`);
      console.log(`   Stage: ${createResult.data.stage_id} (lead)`);
      console.log(`   Pipeline: ${createResult.data.pipeline_id}\n`);
      
      return createResult.data.id;
    } else {
      console.log('❌ Failed to create test deal:', createResult.error);
      return null;
    }
    
  } catch (error) {
    console.log('❌ Error creating test deal:', error.message);
    return null;
  }
}

// Run the process
async function main() {
  console.log('🎯 MCP AUTO EMAIL GENERATION FOR LEAD DEALS\n');
  
  // Create a test deal first (optional)
  const testDealId = await createTestDeal();
  
  // Process all deals in lead stage
  await generateEmailsForLeadDeals();
  
  console.log('🎉 AUTO GENERATION COMPLETE!');
  console.log('\n💡 To make this fully automatic:');
  console.log('   1. Run this script every 10 minutes with cron');
  console.log('   2. New deals in "lead" stage get auto-processed');
  console.log('   3. Emails generated and deals moved to "Email Sequence Ready"'); 
  console.log('   4. Pipedrive automation starts email sequence');
  console.log('   5. Fully automatic workflow! 🚀');
  
  // Clean up test deal
  if (testDealId) {
    console.log(`\n🧹 Cleaning up test deal ${testDealId}...`);
    await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${testDealId}?api_token=${API_TOKEN}`, {
      method: 'DELETE'
    });
    console.log('   ✅ Test deal deleted');
  }
}

main().catch(console.error);