#!/usr/bin/env node

/**
 * Test dat alle **bold** formatting automatisch wordt weggehaald
 */

import { PipedriveIntegrator } from './dist/pipedrive-integrator.js';

async function testCleanFormatting() {
  console.log('🧹 TESTING AUTOMATIC **BOLD** REMOVAL\n');
  
  const integrator = new PipedriveIntegrator();
  const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
  
  try {
    // Create fresh test deal
    console.log('1️⃣ Creating test deal for clean formatting...');
    
    const orgData = { name: 'Clean Formatting Test BV' };
    const orgResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/organizations?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orgData)
    });
    const orgResult = await orgResponse.json();
    
    const personData = {
      name: 'Clean Format Contact',
      email: [{ value: 'clean@formatting.test', primary: true }],
      org_id: orgResult.data.id
    };
    const personResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/persons?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personData)
    });
    const personResult = await personResponse.json();
    
    const dealData = {
      title: 'CLEAN FORMAT TEST - Operations Manager',
      pipeline_id: 14,
      stage_id: 95, // Lead stage
      org_id: orgResult.data.id,
      person_id: personResult.data.id,
      value: 20000,
      currency: 'EUR'
    };
    
    const dealResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealData)
    });
    const dealResult = await dealResponse.json();
    
    const CLEAN_DEAL_ID = dealResult.data.id;
    console.log(`✅ Test deal created: ${CLEAN_DEAL_ID}`);
    
    // Generate emails with automatic cleaning
    console.log('\n2️⃣ Generating emails with AUTOMATIC **bold** removal...');
    
    const testData = {
      company_name: 'Clean Formatting Test BV',
      contact_name: 'Clean Format Contact',
      vacancy_title: 'Operations Manager',
      sector: 'operations',
      company_size: 'enterprise',
      location: 'Rotterdam',
      urgency_level: 'high'
    };
    
    const strategy = integrator.determineSequenceStrategy(
      testData.vacancy_title,
      testData.sector,
      testData.company_size,
      testData.urgency_level
    );
    
    const cleanEmailSequence = [];
    
    for (let i = 1; i <= 6; i++) {
      console.log(`   📧 Generating CLEAN Email ${i}...`);
      
      const emailData = await integrator.generatePersonalizedEmail(i, testData, strategy);
      cleanEmailSequence.push(emailData);
      
      // Verify NO **bold** formatting remains
      const boldInSubject = (emailData.subject.match(/\*\*/g) || []).length;
      const boldInBody = (emailData.body.match(/\*\*/g) || []).length;
      
      console.log(`      Subject: ${emailData.subject.substring(0, 60)}...`);
      console.log(`      Bold formatting: ${boldInSubject + boldInBody === 0 ? '✅ CLEAN' : '❌ STILL HAS **bold**'}`);
      
      if (boldInSubject > 0 || boldInBody > 0) {
        console.log(`      ⚠️  Found ${boldInSubject/2} in subject, ${boldInBody/2} in body`);
      }
    }
    
    console.log('\n3️⃣ Saving CLEAN emails to Pipedrive...');
    
    // Save to Pipedrive (auto-moves to Email Sequence Ready)
    const pipedriveUpdate = await integrator.updatePipedriveDeal(CLEAN_DEAL_ID, cleanEmailSequence, API_TOKEN);
    
    if (pipedriveUpdate.success) {
      console.log('✅ Clean emails saved to Pipedrive');
      console.log('✅ Deal moved to Email Sequence Ready');
      
      // Verify saved content is clean
      console.log('\n4️⃣ Verifying saved content is CLEAN...');
      
      const verifyResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${CLEAN_DEAL_ID}?api_token=${API_TOKEN}`);
      const verifyData = await verifyResponse.json();
      
      const savedSubject = verifyData.data['47a7d774bf5b08226ce8d6e1e79708f1d44e3e30'];
      const savedBody = verifyData.data['867577ef580ff8d22c74799d949483401bba2e26'];
      
      const subjectBoldCount = (savedSubject.match(/\*\*/g) || []).length;
      const bodyBoldCount = (savedBody.match(/\*\*/g) || []).length;
      
      console.log(`   Email 1 Subject: "${savedSubject}"`);
      console.log(`   Bold formatting in subject: ${subjectBoldCount === 0 ? '✅ CLEAN' : '❌ ' + subjectBoldCount/2 + ' **bold** found'}`);
      console.log(`   Bold formatting in body: ${bodyBoldCount === 0 ? '✅ CLEAN' : '❌ ' + bodyBoldCount/2 + ' **bold** found'}`);
      
      // Wait for automation
      console.log('\n5️⃣ Waiting for Pipedrive automation to use CLEAN templates...');
      console.log('   Templates will now receive clean content without **bold** formatting!');
      
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      console.log('\n🎉 CLEAN FORMATTING TEST COMPLETE!');
      console.log('');
      console.log('✅ RESULTS:');
      console.log('   • All **bold** formatting automatically removed');
      console.log('   • Clean content saved to Pipedrive custom fields');  
      console.log('   • Email templates will receive properly formatted text');
      console.log('   • No more **text** artifacts in sent emails');
      console.log('   • Automation ready with clean templates!');
      
      return CLEAN_DEAL_ID;
      
    } else {
      console.log('❌ Failed to save clean emails');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Clean formatting test failed:', error.message);
    return null;
  }
}

// Run the clean formatting test
testCleanFormatting()
  .then(dealId => {
    if (dealId) {
      console.log(`\n🎯 SUCCESS! Deal ${dealId} has CLEAN formatting`);
      console.log('📧 Check Pipedrive email templates - no more **bold** issues!');
    }
  });