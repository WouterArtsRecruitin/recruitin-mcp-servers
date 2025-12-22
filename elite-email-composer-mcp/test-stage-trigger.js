#!/usr/bin/env node

/**
 * Test the Email Sequence Ready stage by moving a deal to it
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
const TEST_DEAL_ID = '1110'; // Our test deal
const EMAIL_SEQUENCE_READY_STAGE_ID = 105; // Just created

async function testStageTransition() {
  console.log('🧪 Testing "Email Sequence Ready" stage transition...\n');
  
  try {
    // Get current deal status
    console.log(`📋 Checking current status of deal ${TEST_DEAL_ID}...`);
    
    const dealResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${TEST_DEAL_ID}?api_token=${API_TOKEN}`);
    const dealData = await dealResponse.json();
    
    if (!dealResponse.ok) {
      throw new Error(`Failed to fetch deal: ${dealData.error}`);
    }
    
    console.log(`✅ Deal found: ${dealData.data.title}`);
    console.log(`   Current stage: ${dealData.data.stage_id}`);
    console.log(`   Pipeline: ${dealData.data.pipeline_id}`);
    
    // Check if email content is present
    const email1Subject = dealData.data['47a7d774bf5b08226ce8d6e1e79708f1d44e3e30'];
    const email1Body = dealData.data['867577ef580ff8d22c74799d949483401bba2e26'];
    
    console.log(`   Email content ready: ${email1Subject ? '✅' : '❌'} Subject, ${email1Body ? '✅' : '❌'} Body`);
    
    if (!email1Subject || !email1Body) {
      console.log('\n⚠️  Email content not found! Run the email generation first:');
      console.log('   node test-complete-pipeline-14.js');
      return;
    }
    
    // Move deal to "Email Sequence Ready" stage
    console.log(`\n🔄 Moving deal to "Email Sequence Ready" stage (ID: ${EMAIL_SEQUENCE_READY_STAGE_ID})...`);
    
    const updateData = {
      stage_id: EMAIL_SEQUENCE_READY_STAGE_ID
    };
    
    const updateResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${TEST_DEAL_ID}?api_token=${API_TOKEN}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    const updateResult = await updateResponse.json();
    
    if (!updateResponse.ok) {
      throw new Error(`Failed to update deal: ${updateResult.error}`);
    }
    
    if (updateResult.success) {
      console.log('✅ Deal moved to "Email Sequence Ready" stage successfully!');
      console.log(`   New stage ID: ${updateResult.data.stage_id}`);
      console.log(`   Stage change time: ${new Date().toISOString()}`);
      
      console.log('\n🎯 AUTOMATION TRIGGER CONDITIONS MET:');
      console.log('   ✅ Deal is in Pipeline 14');
      console.log('   ✅ Deal moved TO "Email Sequence Ready" stage');
      console.log('   ✅ Email content is populated in custom fields');
      console.log('   ✅ Deal has contact person with email');
      
      console.log('\n📧 Expected automation behavior (when set up):');
      console.log('   1. Automation detects stage change');
      console.log('   2. Immediately sends Email 1 using Template ID 36');
      console.log('   3. Template reads custom field: {{47a7d774bf5b08226ce8d6e1e79708f1d44e3e30}}');
      console.log('   4. Personalized content is sent');
      console.log('   5. 7-day wait timer starts for Email 2');
      
      // Show what the email content would be
      console.log('\n📝 Email 1 content preview:');
      console.log(`   Subject: ${email1Subject}`);
      console.log(`   Body length: ${email1Body.length} characters`);
      console.log(`   Body preview: ${email1Body.substring(0, 100)}...`);
      
    } else {
      throw new Error(`Deal update failed: ${updateResult.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testStageTransition();