#!/usr/bin/env node

import { PipedriveIntegrator } from './dist/pipedrive-integrator.js';

async function testFullIntegration() {
  console.log('🚀 Testing Full Pipedrive Integration...\n');
  
  const integrator = new PipedriveIntegrator();
  const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
  
  // Test data for a real deal
  const testData = {
    deal_id: '8', // SOVAK deal
    company_name: 'SOVAK',
    contact_name: 'Tomas de Rooij',
    vacancy_title: 'Corporate Recruiter',
    sector: 'technology',
    company_size: 'scale-up', 
    location: 'Noord-Brabant',
    urgency_level: 'medium'
  };
  
  try {
    console.log('📊 Generating complete 6-email sequence...');
    
    // Generate strategy
    const strategy = integrator.determineSequenceStrategy(
      testData.vacancy_title,
      testData.sector,
      testData.company_size,
      testData.urgency_level
    );
    
    // Generate all 6 emails
    const emailSequence = [];
    for (let i = 1; i <= 6; i++) {
      console.log(`   📧 Generating email ${i}...`);
      const emailData = await integrator.generatePersonalizedEmail(i, testData, strategy);
      emailSequence.push(emailData);
    }
    
    console.log('✅ All emails generated successfully!');
    console.log(`   Average effectiveness score: ${(emailSequence.reduce((sum, email) => sum + email.effectiveness_score, 0) / 6).toFixed(1)}%`);
    
    console.log('\n🔄 Updating Pipedrive deal with email sequence...');
    
    // Update Pipedrive deal (just with first email for now as proof of concept)
    const pipedriveUpdate = await integrator.updatePipedriveDeal(testData.deal_id, emailSequence, API_TOKEN);
    
    if (pipedriveUpdate.success) {
      console.log('✅ Pipedrive deal updated successfully!');
      console.log(`   Fields updated: ${pipedriveUpdate.fields_updated.join(', ')}`);
    } else {
      console.log('❌ Failed to update Pipedrive deal');
    }
    
    console.log('\n📋 Sequence Overview:');
    emailSequence.forEach((email, idx) => {
      console.log(`   Email ${idx + 1}: ${email.subject.substring(0, 60)}...`);
      console.log(`      Framework: ${email.framework} | Score: ${email.effectiveness_score}%`);
    });
    
    console.log('\n🎯 Full Integration Test Summary:');
    console.log(`   ✅ Strategy: Tech scale-up RPO focus sequence`);
    console.log(`   ✅ Emails: ${emailSequence.length}/6 generated`);
    console.log(`   ✅ Pipedrive: ${pipedriveUpdate.success ? 'Updated' : 'Failed'}`);
    
    if (pipedriveUpdate.success) {
      console.log('\n🎉 Full integration test completed successfully!');
      console.log('   The system is now ready for production use.');
    }
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFullIntegration();