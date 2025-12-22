#!/usr/bin/env node

/**
 * Test met aangepaste templates - nieuwe verse test
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';

async function testUpdatedTemplates() {
  console.log('🆕 TESTING UPDATED TEMPLATES\n');
  
  try {
    // Create completely fresh test deal
    console.log('1️⃣ Creating brand new test deal...');
    
    // Create organization
    const orgData = { name: `Updated Template Test ${Date.now()}` };
    const orgResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/organizations?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orgData)
    });
    const orgResult = await orgResponse.json();
    
    // Create person
    const personData = {
      name: 'Updated Test Contact',
      email: [{ value: 'updated@templatetest.nl', primary: true }],
      org_id: orgResult.data.id
    };
    const personResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/persons?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personData)
    });
    const personResult = await personResponse.json();
    
    // Create deal
    const dealData = {
      title: 'UPDATED TEMPLATE TEST - Marketing Manager',
      pipeline_id: 14,
      stage_id: 95, // Lead stage
      org_id: orgResult.data.id,
      person_id: personResult.data.id,
      value: 15000,
      currency: 'EUR'
    };
    
    const dealResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealData)
    });
    const dealResult = await dealResponse.json();
    
    const NEW_DEAL_ID = dealResult.data.id;
    
    console.log(`✅ New deal created: ${NEW_DEAL_ID}`);
    console.log(`   Title: ${dealResult.data.title}`);
    console.log(`   Company: ${orgResult.data.name}`);
    console.log(`   Contact: ${personResult.data.name} (${personResult.data.email[0].value})`);
    
    // Generate fresh email content
    console.log('\n2️⃣ Generating fresh email content...');
    
    const { PipedriveIntegrator } = await import('./dist/pipedrive-integrator.js');
    const integrator = new PipedriveIntegrator();
    
    const testData = {
      company_name: orgResult.data.name,
      contact_name: personResult.data.name,
      vacancy_title: 'Marketing Manager',
      sector: 'marketing',
      company_size: 'scale-up',
      location: 'Amsterdam',
      urgency_level: 'high'
    };
    
    // Generate new strategy and emails
    const strategy = integrator.determineSequenceStrategy(
      testData.vacancy_title,
      testData.sector,
      testData.company_size,
      testData.urgency_level
    );
    
    const emailSequence = [];
    for (let i = 1; i <= 6; i++) {
      console.log(`   📧 Generating Email ${i}...`);
      const emailData = await integrator.generatePersonalizedEmail(i, testData, strategy);
      emailSequence.push(emailData);
    }
    
    console.log('✅ All 6 emails generated with fresh content');
    
    // Show preview of generated content
    console.log('\n📝 Email Content Preview:');
    emailSequence.forEach((email, idx) => {
      console.log(`   Email ${idx + 1}:`);
      console.log(`     Subject: ${email.subject}`);
      console.log(`     Framework: ${email.framework} (${email.effectiveness_score}%)`);
      console.log(`     Body length: ${email.body.length} chars`);
    });
    
    // Save to Pipedrive (will auto-move to Email Sequence Ready)
    console.log('\n3️⃣ Saving to Pipedrive and triggering automation...');
    
    const pipedriveUpdate = await integrator.updatePipedriveDeal(NEW_DEAL_ID, emailSequence, API_TOKEN);
    
    if (pipedriveUpdate.success) {
      console.log('✅ Email content saved to custom fields');
      console.log('✅ Deal moved to Email Sequence Ready stage');
      console.log(`✅ Custom fields updated: ${pipedriveUpdate.fields_updated.length}`);
      
      // Verify stage and content
      console.log('\n4️⃣ Verifying deal status...');
      
      const verifyResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${NEW_DEAL_ID}?api_token=${API_TOKEN}`);
      const verifyData = await verifyResponse.json();
      
      console.log(`   Current stage: ${verifyData.data.stage_id} (Email Sequence Ready = 105)`);
      console.log(`   Pipeline: ${verifyData.data.pipeline_id} (should be 14)`);
      
      // Check if email content is present
      const email1Subject = verifyData.data['47a7d774bf5b08226ce8d6e1e79708f1d44e3e30'];
      const email1Body = verifyData.data['867577ef580ff8d22c74799d949483401bba2e26'];
      
      console.log(`   Email 1 Subject: ${email1Subject ? '✅ Present' : '❌ Missing'}`);
      console.log(`   Email 1 Body: ${email1Body ? '✅ Present' : '❌ Missing'}`);
      
      if (email1Subject) {
        console.log(`   Subject content: "${email1Subject}"`);
      }
      
      // Wait for automation to trigger
      console.log('\n5️⃣ Waiting 30 seconds for UPDATED templates automation...');
      console.log('   Your updated templates should now be triggered!');
      
      let waitTime = 30;
      for (let i = waitTime; i > 0; i--) {
        process.stdout.write(`\r   ⏱️  ${i} seconds remaining...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('\n\n🔍 Checking for automation activity...');
      
      // Check activities multiple times
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`   Attempt ${attempt}/3...`);
        
        const activitiesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/activities?deal_id=${NEW_DEAL_ID}&limit=10&api_token=${API_TOKEN}`);
        const activitiesData = await activitiesResponse.json();
        
        if (activitiesData.success && activitiesData.data && activitiesData.data.length > 0) {
          const recentActivities = activitiesData.data.filter(activity => {
            const activityTime = new Date(activity.add_time);
            const now = new Date();
            const diffMinutes = (now - activityTime) / (1000 * 60);
            return diffMinutes <= 5; // Activities from last 5 minutes
          });
          
          if (recentActivities.length > 0) {
            console.log('\n🎉 RECENT AUTOMATION ACTIVITY FOUND!');
            recentActivities.forEach(activity => {
              console.log(`   ${activity.type}: ${activity.subject}`);
              console.log(`   Time: ${activity.add_time}`);
              if (activity.type === 'email') {
                console.log('   🎯 EMAIL SENT BY AUTOMATION!');
              }
            });
            break;
          }
        }
        
        if (attempt < 3) {
          console.log('   No recent activity, waiting 10 more seconds...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
      
      console.log(`\n🎯 UPDATED TEMPLATE TEST COMPLETE!`);
      console.log(`📧 Deal ID: ${NEW_DEAL_ID}`);
      console.log('📋 Manual Checks:');
      console.log(`   1. Go to Pipedrive Deal ${NEW_DEAL_ID}`);
      console.log(`   2. Check Activities tab for email sends`);
      console.log(`   3. Check if your updated templates worked`);
      console.log(`   4. Verify email content from custom fields`);
      
      return NEW_DEAL_ID;
      
    } else {
      console.log('❌ Failed to save to Pipedrive:', pipedriveUpdate.error);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Updated template test failed:', error.message);
    console.error(error.stack);
    return null;
  }
}

// Run the updated template test
testUpdatedTemplates()
  .then(dealId => {
    if (dealId) {
      console.log(`\n🆕 SUCCESS! Test deal ${dealId} created with updated templates`);
      console.log('🚀 Check Pipedrive now to see if automation works with your changes!');
    }
  });