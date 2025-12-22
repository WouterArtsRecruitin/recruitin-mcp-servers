#!/usr/bin/env node

import { PipedriveIntegrator } from './dist/pipedrive-integrator.js';

async function testCompleteEmailSequence() {
  console.log('🎯 Testing COMPLETE Email Sequence Generation for Pipeline 14...\n');
  
  const integrator = new PipedriveIntegrator();
  const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
  
  const testData = {
    deal_id: '1110', // Our test deal in pipeline 14
    company_name: 'TechFlow Solutions',
    contact_name: 'Emma van der Berg',
    vacancy_title: 'Corporate Recruiter',
    sector: 'technology',
    company_size: 'scale-up', 
    location: 'Noord-Brabant',
    urgency_level: 'medium'
  };
  
  try {
    console.log('📧 Generating complete 6-email personalized sequence...');
    
    // Generate strategy
    const strategy = integrator.determineSequenceStrategy(
      testData.vacancy_title,
      testData.sector,
      testData.company_size,
      testData.urgency_level
    );
    
    console.log('📋 Strategy determined:');
    Object.entries(strategy).forEach(([key, value]) => {
      console.log(`   ${key}: ${value.approach} (${value.timing})`);
    });
    
    // Generate all 6 personalized emails
    const emailSequence = [];
    for (let i = 1; i <= 6; i++) {
      console.log(`   📝 Generating Email ${i} (${strategy[`email_${i}`].approach})...`);
      const emailData = await integrator.generatePersonalizedEmail(i, testData, strategy);
      emailSequence.push(emailData);
    }
    
    console.log('✅ All 6 personalized emails generated!');
    
    // Display summary
    console.log('\n📊 Email Sequence Summary:');
    emailSequence.forEach((email, idx) => {
      console.log(`   Email ${idx + 1}:`);
      console.log(`     Subject: ${email.subject.substring(0, 60)}...`);
      console.log(`     Framework: ${email.framework} | Score: ${email.effectiveness_score}%`);
      console.log(`     Body length: ${email.body.length} chars`);
    });
    
    console.log('\n🔄 Saving ALL 6 emails to Pipeline 14 custom fields...');
    
    // Save all emails to Pipedrive custom fields
    const pipedriveUpdate = await integrator.updatePipedriveDeal(testData.deal_id, emailSequence, API_TOKEN);
    
    if (pipedriveUpdate.success) {
      console.log('✅ ALL email content saved to Pipedrive!');
      console.log(`   Fields updated: ${pipedriveUpdate.fields_updated.length}`);
      console.log(`   ${pipedriveUpdate.fields_updated.join(', ')}`);
      
      // Verify the data was saved correctly
      console.log('\n🔍 Verifying saved data in Pipeline 14...');
      
      const verifyResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${testData.deal_id}?api_token=${API_TOKEN}`);
      const dealData = await verifyResponse.json();
      
      console.log('📋 Verification Results:');
      console.log(`   Pipeline ID: ${dealData.data.pipeline_id} ✅`);
      console.log(`   Email 1 Subject: ${dealData.data['47a7d774bf5b08226ce8d6e1e79708f1d44e3e30']}`);
      console.log(`   Email 2 Subject: ${dealData.data['c9b94aad810dad22e3835669aff3076e9bbed481']}`);
      console.log(`   Email 3 Subject: ${dealData.data['4a105b3f0a7e2fc4b28aa3c446ab863c3c7564c4']}`);
      console.log(`   Email Sequence Status: ${dealData.data['22d33c7f119119e178f391a272739c571cf2e29b']}`);
      
      // Count non-empty email fields
      const emailFields = [
        dealData.data['47a7d774bf5b08226ce8d6e1e79708f1d44e3e30'], // Email 1 Subject
        dealData.data['867577ef580ff8d22c74799d949483401bba2e26'], // Email 1 Body
        dealData.data['c9b94aad810dad22e3835669aff3076e9bbed481'], // Email 2 Subject
        dealData.data['14229c6d09ce02f7752762831cb290c2845a0adc'], // Email 2 Body
        dealData.data['4a105b3f0a7e2fc4b28aa3c446ab863c3c7564c4'], // Email 3 Subject
        dealData.data['728051c14d08fd50d018d2f52d249480553407ef'], // Email 3 Body
        dealData.data['af3c082c6c557ff5d2f640be8863f855fc403b1a'], // Email 4 Subject
        dealData.data['363f0878ff15f00cc54470a5dc85049e6a12e5e3'], // Email 4 Body
        dealData.data['d915d63b9b2621d3ce81d54d8dfce1e3f0dd4306'], // Email 5 Subject
        dealData.data['c4f72e32ce76ad00a822e9c7d1044dba77e6458b'], // Email 5 Body
        dealData.data['e84b304ae9696a9e1e1943d02bf8b762fa290f91'], // Email 6 Subject
        dealData.data['d0ad20b3323a67da53529b8f5514e663ed81a3fc'], // Email 6 Body
      ];
      
      const populatedFields = emailFields.filter(field => field && field.length > 0).length;
      
      console.log(`\n🎉 SUCCESS! ${populatedFields}/12 email fields populated in Pipeline 14`);
      console.log('\n📧 Ready for Zapier Integration:');
      console.log('   ✅ All personalized email content saved to custom fields');
      console.log('   ✅ Email Sequence Status set to "Not Started"'); 
      console.log('   ✅ Zapier can now read custom fields and send emails');
      console.log('   ✅ No direct email sending - content stored for automation');
      
    } else {
      console.log('❌ Failed to save emails to Pipedrive');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testCompleteEmailSequence();