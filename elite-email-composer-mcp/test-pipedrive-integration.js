#!/usr/bin/env node

import { PipedriveIntegrator } from './dist/pipedrive-integrator.js';

async function testPipedriveIntegration() {
  console.log('🧪 Testing Pipedrive Email Sequence Generation...\n');
  
  const integrator = new PipedriveIntegrator();
  
  // Test data based on existing deal
  const testData = {
    deal_id: '8',
    company_name: 'SOVAK',
    contact_name: 'Tomas de Rooij', 
    vacancy_title: 'Corporate Recruiter',
    sector: 'technology',
    company_size: 'scale-up',
    location: 'Noord-Brabant',
    urgency_level: 'medium'
  };
  
  try {
    console.log('📊 Test Data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n🎯 Generating sequence strategy...');
    
    // Test sequence strategy generation
    const strategy = integrator.determineSequenceStrategy(
      testData.vacancy_title,
      testData.sector, 
      testData.company_size,
      testData.urgency_level
    );
    
    console.log('📋 Generated Strategy:');
    console.log(JSON.stringify(strategy, null, 2));
    
    console.log('\n📧 Generating first email...');
    
    // Test generating one email
    const firstEmail = await integrator.generatePersonalizedEmail(1, {
      company_name: testData.company_name,
      contact_name: testData.contact_name,
      vacancy_title: testData.vacancy_title,
      sector: testData.sector,
      company_size: testData.company_size,
      location: testData.location,
      urgency_level: testData.urgency_level
    }, strategy);
    
    console.log('✅ First Email Generated:');
    console.log(`Subject: ${firstEmail.subject}`);
    console.log(`Framework: ${firstEmail.framework}`);
    console.log(`Tone: ${firstEmail.tone}`);
    console.log(`Effectiveness Score: ${firstEmail.effectiveness_score}%`);
    console.log(`Body Length: ${firstEmail.body.length} characters`);
    console.log('\n📝 Email Body Preview:');
    console.log(firstEmail.body.substring(0, 200) + '...\n');
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPipedriveIntegration();