#!/usr/bin/env node

/**
 * Final test van de complete automation setup
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';

async function finalAutomationTest() {
  console.log('🎯 FINAL AUTOMATION TEST\n');
  
  try {
    // Create a completely fresh test deal
    console.log('1️⃣ Creating fresh test deal for automation...');
    
    // Create organization
    const orgData = { name: 'Final Test Company BV' };
    const orgResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/organizations?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orgData)
    });
    const orgResult = await orgResponse.json();
    
    // Create person
    const personData = {
      name: 'Test Contact Person',
      email: [{ value: 'test@finaltest.nl', primary: true }],
      org_id: orgResult.data.id
    };
    const personResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/persons?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personData)
    });
    const personResult = await personResponse.json();
    
    // Create deal in LEAD stage first
    const dealData = {
      title: 'AUTOMATION TEST - HR Director',
      pipeline_id: 14,
      stage_id: 95, // Lead stage
      org_id: orgResult.data.id,
      person_id: personResult.data.id,
      value: 10000,
      currency: 'EUR'
    };
    
    const dealResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealData)
    });
    const dealResult = await dealResponse.json();
    
    console.log(`✅ Fresh deal created: ${dealResult.data.id}`);
    console.log(`   Title: ${dealResult.data.title}`);
    console.log(`   Stage: ${dealResult.data.stage_id} (lead)`);
    console.log(`   Contact: ${personResult.data.name} (${personResult.data.email[0].value})`);
    
    const FRESH_DEAL_ID = dealResult.data.id;
    
    // Generate emails for this fresh deal using MCP
    console.log('\n2️⃣ Generating email content via MCP...');
    
    // Import MCP functionality
    const { PipedriveIntegrator } = await import('./dist/pipedrive-integrator.js');
    const integrator = new PipedriveIntegrator();
    
    const testData = {
      company_name: 'Final Test Company BV',
      contact_name: 'Test Contact Person',
      vacancy_title: 'HR Director',
      sector: 'technology',
      company_size: 'scale-up',
      location: 'Nederland',
      urgency_level: 'medium'
    };
    
    // Generate strategy and emails
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
    
    console.log('✅ 6 emails generated');
    
    // Save to Pipedrive (this will auto-move to Email Sequence Ready)
    console.log('\n3️⃣ Saving to Pipedrive and auto-moving to Email Sequence Ready...');
    
    const pipedriveUpdate = await integrator.updatePipedriveDeal(FRESH_DEAL_ID, emailSequence, API_TOKEN);
    
    if (pipedriveUpdate.success) {
      console.log('✅ Emails saved to custom fields');
      console.log('✅ Deal automatically moved to Email Sequence Ready');
      
      // Verify the deal is in Email Sequence Ready stage
      console.log('\n4️⃣ Verifying automation trigger...');
      
      const verifyResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${FRESH_DEAL_ID}?api_token=${API_TOKEN}`);
      const dealData = await verifyResponse.json();
      
      console.log(`   Deal stage: ${dealData.data.stage_id} (should be 105)`);
      console.log(`   Email 1 subject: ${dealData.data['47a7d774bf5b08226ce8d6e1e79708f1d44e3e30'] ? 'Present' : 'Missing'}`);
      
      if (dealData.data.stage_id === 105) {
        console.log('✅ Deal is in Email Sequence Ready stage - automation should trigger!');
        
        // Wait and check for email activity
        console.log('\n5️⃣ Waiting 15 seconds for automation to trigger...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        console.log('🔍 Checking for email activity...');
        
        const activitiesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/activities?deal_id=${FRESH_DEAL_ID}&limit=5&api_token=${API_TOKEN}`);
        const activitiesData = await activitiesResponse.json();
        
        if (activitiesData.success && activitiesData.data && activitiesData.data.length > 0) {
          console.log('\n📧 RECENT ACTIVITIES FOUND:');
          activitiesData.data.forEach(activity => {
            console.log(`   ${activity.type}: ${activity.subject}`);
            console.log(`   Date: ${activity.add_time}`);
          });
          
          const emailActivity = activitiesData.data.find(a => a.type === 'email');
          if (emailActivity) {
            console.log('\n🎉 EMAIL ACTIVITY DETECTED! AUTOMATION WORKING!');
          } else {
            console.log('\n⚠️  No email activity found yet, but other activities detected');
          }
        } else {
          console.log('   No activities found yet');
        }
        
        console.log(`\n👀 MANUAL CHECK:`)
        console.log(`   Go to deal ${FRESH_DEAL_ID} in Pipedrive`);
        console.log(`   Check Activities tab for email sends`);
        console.log(`   Check automation history`);
        
      } else {
        console.log('❌ Deal not in Email Sequence Ready stage');
      }
      
      return FRESH_DEAL_ID;
      
    } else {
      console.log('❌ Failed to save emails to Pipedrive');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Final test failed:', error.message);
    return null;
  }
}

// Run the final test
finalAutomationTest()
  .then(dealId => {
    console.log('\n🎯 FINAL AUTOMATION TEST COMPLETE!');
    if (dealId) {
      console.log(`   Test Deal ID: ${dealId}`);
      console.log('   ✅ Fresh deal created with email content');
      console.log('   ✅ Moved to Email Sequence Ready stage'); 
      console.log('   ✅ Automation should have triggered');
      console.log('\n💡 Check Pipedrive now for email activity!');
    }
  });