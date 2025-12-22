#!/usr/bin/env node

/**
 * Move Email Sequence Ready stage to position 2 (after lead, before email beantwoord)
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
const EMAIL_SEQUENCE_STAGE_ID = 105;

async function moveStageToPosition2() {
  console.log('🔄 Moving "Email Sequence Ready" to position 2...\n');
  
  try {
    // Update the stage to order 2 (between lead and email beantwoord)
    const updateData = {
      order_nr: 2
    };
    
    console.log('📝 Updating stage order...');
    
    const updateResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages/${EMAIL_SEQUENCE_STAGE_ID}?api_token=${API_TOKEN}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    const updateResult = await updateResponse.json();
    
    if (!updateResponse.ok) {
      throw new Error(`Failed to update stage: ${updateResult.error}`);
    }
    
    if (updateResult.success) {
      console.log('✅ Stage moved successfully!');
      console.log(`   New order: ${updateResult.data.order_nr}`);
      console.log(`   Stage ID: ${updateResult.data.id}`);
      console.log(`   Name: ${updateResult.data.name}`);
      
      // Verify the new order
      console.log('\n🔍 Verifying new stage order...');
      
      const stagesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages?pipeline_id=14&api_token=${API_TOKEN}`);
      const stagesData = await stagesResponse.json();
      
      const sortedStages = stagesData.data.sort((a, b) => a.order_nr - b.order_nr);
      
      console.log('\n📊 NEW STAGE ORDER:');
      sortedStages.forEach((stage, index) => {
        const marker = stage.id === 105 ? '🎯' : '  ';
        console.log(`${marker} ${index + 1}. ${stage.name} (Order: ${stage.order_nr})`);
      });
      
      console.log('\n💡 Now refresh Pipedrive and the stage should be visible at position 2!');
      
    } else {
      throw new Error(`Stage update failed: ${updateResult.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error moving stage:', error.message);
  }
}

moveStageToPosition2();