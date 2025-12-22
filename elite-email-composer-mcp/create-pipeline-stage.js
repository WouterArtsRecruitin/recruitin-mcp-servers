#!/usr/bin/env node

/**
 * Script to create "Email Sequence Ready" stage in Pipeline 14
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
const PIPELINE_ID = 14;

async function createEmailSequenceStage() {
  console.log('🎯 Creating "Email Sequence Ready" stage in Pipeline 14...\n');
  
  try {
    // Step 1: Get current pipeline stages
    console.log('📋 Fetching current Pipeline 14 stages...');
    
    const pipelineResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/pipelines/${PIPELINE_ID}?api_token=${API_TOKEN}`);
    const pipelineData = await pipelineResponse.json();
    
    if (!pipelineResponse.ok) {
      throw new Error(`Failed to fetch pipeline: ${pipelineData.error}`);
    }
    
    console.log(`✅ Pipeline "${pipelineData.data.name}" found`);
    console.log(`   Current stages: ${pipelineData.data.deal_probability ? 'Probability-based' : 'Standard'}\n`);
    
    // Step 2: Get all current stages
    const stagesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages?pipeline_id=${PIPELINE_ID}&api_token=${API_TOKEN}`);
    const stagesData = await stagesResponse.json();
    
    if (!stagesResponse.ok) {
      throw new Error(`Failed to fetch stages: ${stagesData.error}`);
    }
    
    console.log('📊 Current stages in Pipeline 14:');
    stagesData.data.forEach((stage, index) => {
      console.log(`   ${index + 1}. ${stage.name} (ID: ${stage.id}) - Order: ${stage.order_nr}`);
    });
    
    // Check if "Email Sequence Ready" already exists
    const existingStage = stagesData.data.find(stage => 
      stage.name.includes('Email Sequence Ready') || 
      stage.name.includes('Email Sequence') ||
      stage.name.includes('Ready')
    );
    
    if (existingStage) {
      console.log(`\n⚠️  Similar stage already exists: "${existingStage.name}" (ID: ${existingStage.id})`);
      console.log('   You can use this stage for the automation trigger.');
      return {
        success: true,
        stage_id: existingStage.id,
        stage_name: existingStage.name,
        message: 'Using existing similar stage'
      };
    }
    
    // Step 3: Calculate order number for new stage (insert before the last stage)
    const maxOrder = Math.max(...stagesData.data.map(s => s.order_nr));
    const newOrderNumber = maxOrder; // Insert before the last stage
    
    console.log(`\n➕ Creating new stage with order number: ${newOrderNumber}`);
    
    // Step 4: Create the new stage
    const newStage = {
      name: "Email Sequence Ready",
      pipeline_id: PIPELINE_ID,
      deal_probability: 25, // 25% probability (early in the process)
      rotten_flag: false,
      rotten_days: null,
      order_nr: newOrderNumber
    };
    
    console.log('🚀 Creating stage with data:');
    console.log(`   Name: ${newStage.name}`);
    console.log(`   Pipeline ID: ${newStage.pipeline_id}`);
    console.log(`   Probability: ${newStage.deal_probability}%`);
    console.log(`   Order: ${newStage.order_nr}`);
    
    const createResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStage)
    });
    
    const createResult = await createResponse.json();
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create stage: ${createResult.error || JSON.stringify(createResult)}`);
    }
    
    if (createResult.success) {
      console.log('\n✅ Stage "Email Sequence Ready" created successfully!');
      console.log(`   Stage ID: ${createResult.data.id}`);
      console.log(`   Pipeline: ${createResult.data.pipeline_id}`);
      console.log(`   Order: ${createResult.data.order_nr}`);
      console.log(`   Probability: ${createResult.data.deal_probability}%`);
      
      // Step 5: Verify the stage was created
      console.log('\n🔍 Verifying stage creation...');
      const verifyResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages?pipeline_id=${PIPELINE_ID}&api_token=${API_TOKEN}`);
      const verifyData = await verifyResponse.json();
      
      const createdStage = verifyData.data.find(stage => stage.id === createResult.data.id);
      if (createdStage) {
        console.log('✅ Stage verification successful!');
        console.log(`   Found: "${createdStage.name}" in Pipeline ${createdStage.pipeline_id}`);
      }
      
      return {
        success: true,
        stage_id: createResult.data.id,
        stage_name: createResult.data.name,
        pipeline_id: createResult.data.pipeline_id,
        order_nr: createResult.data.order_nr,
        deal_probability: createResult.data.deal_probability,
        message: 'New stage created successfully'
      };
    } else {
      throw new Error(`Stage creation failed: ${createResult.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error creating stage:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the function
createEmailSequenceStage()
  .then(result => {
    console.log('\n🎉 PIPELINE STAGE SETUP COMPLETE!');
    console.log('\n📋 Next Steps for Automation:');
    console.log('   1. Go to Pipedrive > Automations');
    console.log('   2. Create automation with trigger: "Deal stage change"');
    console.log(`   3. Set condition: Deal moves TO "${result.stage_name || 'Email Sequence Ready'}"`);
    console.log('   4. Add the 6 email sequence actions');
    console.log('\n💡 How to use:');
    console.log('   - Move deal to "Email Sequence Ready" stage');
    console.log('   - Automation will trigger and start sending email sequence');
    console.log('   - Emails will use personalized content from custom fields');
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });