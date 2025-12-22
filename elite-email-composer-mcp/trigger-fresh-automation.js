#!/usr/bin/env node

/**
 * Force a fresh automation trigger by moving deal back and forth
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
const TEST_DEAL_ID = '1111';

async function triggerFreshAutomation() {
  console.log('🔄 Forcing fresh automation trigger...\n');
  
  try {
    console.log('1️⃣ Moving deal BACK to lead stage...');
    
    // Move to lead stage first
    const moveToLeadResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${TEST_DEAL_ID}?api_token=${API_TOKEN}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_id: 95 }) // Lead stage
    });
    
    const leadResult = await moveToLeadResponse.json();
    if (leadResult.success) {
      console.log('✅ Deal moved to lead stage');
    } else {
      throw new Error(`Failed to move to lead: ${leadResult.error}`);
    }
    
    // Wait 3 seconds
    console.log('⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('2️⃣ Moving deal TO Email Sequence Ready stage...');
    
    // Now move to Email Sequence Ready
    const moveToSequenceResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${TEST_DEAL_ID}?api_token=${API_TOKEN}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_id: 105 }) // Email Sequence Ready
    });
    
    const sequenceResult = await moveToSequenceResponse.json();
    if (sequenceResult.success) {
      console.log('✅ Deal moved to Email Sequence Ready stage');
      console.log(`   Stage change detected at: ${new Date().toISOString()}`);
    } else {
      throw new Error(`Failed to move to sequence ready: ${sequenceResult.error}`);
    }
    
    console.log('\n🎯 FRESH AUTOMATION TRIGGER COMPLETED!');
    console.log('   Deal moved: Lead (95) → Email Sequence Ready (105)');
    console.log('   This should trigger the automation');
    console.log('\n👀 Check Pipedrive now:');
    console.log('   1. Go to deal 1111');
    console.log('   2. Check Activities tab for email activity');
    console.log('   3. Check if Email 1 was sent');
    console.log('   4. Check automation history');
    
    // Wait and check if any activities were created
    console.log('\n⏳ Waiting 10 seconds to check for automation activity...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('🔍 Checking recent activities...');
    const activitiesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/activities?deal_id=${TEST_DEAL_ID}&api_token=${API_TOKEN}`);
    const activitiesData = await activitiesResponse.json();
    
    if (activitiesData.success && activitiesData.data && activitiesData.data.length > 0) {
      console.log(`   Found ${activitiesData.data.length} activities:`);
      activitiesData.data.slice(0, 3).forEach(activity => {
        console.log(`   - ${activity.type}: ${activity.subject} (${activity.add_time})`);
      });
    } else {
      console.log('   ⚠️  No recent activities found');
    }
    
  } catch (error) {
    console.error('❌ Fresh trigger failed:', error.message);
  }
}

triggerFreshAutomation();