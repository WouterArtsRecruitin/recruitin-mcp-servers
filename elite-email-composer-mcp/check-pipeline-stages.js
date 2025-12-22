#!/usr/bin/env node

/**
 * Check all stages in Pipeline 14 to see if Email Sequence Ready was created correctly
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
const PIPELINE_ID = 14;

async function checkPipelineStages() {
  console.log(`🔍 Checking all stages in Pipeline ${PIPELINE_ID}...\n`);
  
  try {
    // Get pipeline info first
    const pipelineResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/pipelines/${PIPELINE_ID}?api_token=${API_TOKEN}`);
    const pipelineData = await pipelineResponse.json();
    
    if (!pipelineResponse.ok) {
      throw new Error(`Pipeline not found: ${pipelineData.error}`);
    }
    
    console.log(`📋 Pipeline Found: "${pipelineData.data.name}"`);
    console.log(`   ID: ${pipelineData.data.id}`);
    console.log(`   Active: ${pipelineData.data.active}`);
    console.log(`   Deal probability: ${pipelineData.data.deal_probability}\n`);
    
    // Get all stages for this pipeline
    const stagesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages?pipeline_id=${PIPELINE_ID}&api_token=${API_TOKEN}`);
    const stagesData = await stagesResponse.json();
    
    if (!stagesResponse.ok) {
      throw new Error(`Failed to fetch stages: ${stagesData.error}`);
    }
    
    console.log('📊 ALL STAGES in Pipeline 14:');
    console.log('=' .repeat(60));
    
    // Sort stages by order_nr for correct display
    const sortedStages = stagesData.data.sort((a, b) => a.order_nr - b.order_nr);
    
    sortedStages.forEach((stage, index) => {
      const isEmailSequenceStage = stage.name.includes('Email Sequence') || stage.id === 105;
      const marker = isEmailSequenceStage ? '🎯' : '  ';
      
      console.log(`${marker} ${index + 1}. ${stage.name}`);
      console.log(`     ID: ${stage.id} | Order: ${stage.order_nr} | Active: ${stage.active_flag}`);
      console.log(`     Pipeline: ${stage.pipeline_id} | Probability: ${stage.deal_probability}%`);
      
      if (isEmailSequenceStage) {
        console.log(`     ⭐ THIS IS THE EMAIL SEQUENCE STAGE!`);
      }
      console.log('');
    });
    
    // Look specifically for our created stage
    const emailSequenceStage = sortedStages.find(stage => 
      stage.name === 'Email Sequence Ready' || stage.id === 105
    );
    
    if (emailSequenceStage) {
      console.log('✅ EMAIL SEQUENCE READY STAGE FOUND!');
      console.log(`   Name: "${emailSequenceStage.name}"`);
      console.log(`   ID: ${emailSequenceStage.id}`);
      console.log(`   Order: ${emailSequenceStage.order_nr}`);
      console.log(`   Active: ${emailSequenceStage.active_flag}`);
      console.log(`   Pipeline: ${emailSequenceStage.pipeline_id}`);
      
      if (!emailSequenceStage.active_flag) {
        console.log('\n⚠️  STAGE IS INACTIVE! This might be why you can\'t see it.');
        console.log('   Activating stage...');
        
        // Try to activate the stage
        const activateResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages/${emailSequenceStage.id}?api_token=${API_TOKEN}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            active_flag: true
          })
        });
        
        const activateResult = await activateResponse.json();
        if (activateResult.success) {
          console.log('✅ Stage activated successfully!');
        } else {
          console.log('❌ Failed to activate stage:', activateResult.error);
        }
      }
      
    } else {
      console.log('❌ EMAIL SEQUENCE READY STAGE NOT FOUND!');
      console.log('\n🔧 Creating the stage now...');
      
      // Create the stage if it doesn't exist
      const maxOrder = Math.max(...sortedStages.map(s => s.order_nr));
      
      const newStage = {
        name: "Email Sequence Ready",
        pipeline_id: PIPELINE_ID,
        deal_probability: 25,
        rotten_flag: false,
        active_flag: true,
        order_nr: maxOrder + 1
      };
      
      const createResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages?api_token=${API_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStage)
      });
      
      const createResult = await createResponse.json();
      
      if (createResult.success) {
        console.log('✅ Stage created successfully!');
        console.log(`   New Stage ID: ${createResult.data.id}`);
        console.log(`   Name: ${createResult.data.name}`);
        console.log(`   Order: ${createResult.data.order_nr}`);
        console.log(`   Pipeline: ${createResult.data.pipeline_id}`);
      } else {
        console.log('❌ Failed to create stage:', createResult.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking pipeline stages:', error.message);
    console.error(error.stack);
  }
}

// Run the check
checkPipelineStages();