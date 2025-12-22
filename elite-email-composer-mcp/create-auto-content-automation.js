#!/usr/bin/env node

/**
 * Create Pipedrive automation that auto-generates email content when deals enter "lead" stage
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
const PIPELINE_ID = 14;
const LEAD_STAGE_ID = 95; // "lead" stage in Pipeline 14

async function createAutoContentGeneration() {
  console.log('🤖 Setting up auto email content generation for new deals...\n');
  
  try {
    // First, let's create a webhook automation approach
    // Since Pipedrive automations can't directly call external APIs,
    // we'll use webhook + our MCP server
    
    console.log('📋 Strategy: Webhook-based Auto Content Generation');
    console.log('   1. Deal enters "lead" stage → Webhook triggered');
    console.log('   2. Webhook calls our MCP server');
    console.log('   3. MCP generates 6 emails and saves to custom fields');
    console.log('   4. Deal ready for manual review & stage change\n');
    
    // Create a webhook endpoint specification
    const webhookConfig = {
      name: "Auto Email Content Generator",
      description: "Automatically generate personalized 6-email sequence when deal enters lead stage",
      pipeline_id: PIPELINE_ID,
      stage_id: LEAD_STAGE_ID,
      trigger_conditions: {
        deal_stage_change: "TO lead stage (95)",
        required_fields: ["person_id", "title", "org_id"],
        pipeline_filter: "Pipeline 14 only"
      },
      webhook_url: "http://localhost:3000/generate-emails", // Local MCP server endpoint
      payload_data: {
        deal_id: "{{deal.id}}",
        company_name: "{{deal.org_name}}",
        contact_name: "{{deal.person_name}}",
        contact_email: "{{deal.person_email}}",
        vacancy_title: "{{deal.title}}",
        sector: "{{deal.custom_field_sector}}", // If available
        api_token: API_TOKEN
      }
    };
    
    console.log('🔧 Webhook Configuration:');
    console.log(`   Name: ${webhookConfig.name}`);
    console.log(`   Trigger: Deal enters stage ${LEAD_STAGE_ID} in Pipeline ${PIPELINE_ID}`);
    console.log(`   Action: Call MCP server to generate emails`);
    console.log(`   Result: 6 emails saved to custom fields automatically\n`);
    
    // Since we can't directly create the webhook via API easily,
    // let's create a Pipedrive automation that sets a flag field
    // which we can then monitor externally
    
    console.log('📝 Alternative: Flag Field Automation');
    console.log('   Creating custom field for "Email Generation Needed" flag...\n');
    
    // Create a flag field for email generation
    const flagField = {
      name: "Email Generation Needed",
      field_type: "enum",
      options: [
        { label: "Yes", id: 1 },
        { label: "No", id: 2 },
        { label: "Generated", id: 3 }
      ],
      add_visible_flag: true
    };
    
    // Check if flag field already exists
    const fieldsResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/dealFields?api_token=${API_TOKEN}`);
    const fieldsData = await fieldsResponse.json();
    
    let flagFieldKey = null;
    const existingFlagField = fieldsData.data?.find(field => 
      field.name === "Email Generation Needed" || 
      field.name.includes("Email Generation")
    );
    
    if (existingFlagField) {
      console.log(`✅ Flag field already exists: ${existingFlagField.name} (${existingFlagField.key})`);
      flagFieldKey = existingFlagField.key;
    } else {
      console.log('➕ Creating flag field...');
      
      const createFieldResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/dealFields?api_token=${API_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flagField)
      });
      
      const createFieldResult = await createFieldResponse.json();
      
      if (createFieldResult.success) {
        flagFieldKey = createFieldResult.data.key;
        console.log(`✅ Flag field created: ${createFieldResult.data.name} (${flagFieldKey})`);
      } else {
        console.log('❌ Failed to create flag field:', createFieldResult.error);
      }
    }
    
    if (flagFieldKey) {
      // Now create simple automation approach
      console.log('\n🎯 SIMPLE APPROACH IMPLEMENTED:');
      console.log('   1. New deal enters "lead" stage');
      console.log(`   2. Manual: Set "${flagField.name}" to "Yes"`);
      console.log('   3. External script monitors this field');
      console.log('   4. When "Yes" → Generate emails → Set to "Generated"');
      console.log('   5. Deal ready for "Email Sequence Ready" stage\n');
      
      return {
        success: true,
        approach: "Flag field monitoring",
        flag_field_key: flagFieldKey,
        instructions: [
          "1. New deal in lead stage",
          `2. Set '${flagField.name}' to 'Yes'`,
          "3. Run monitoring script to auto-generate emails",
          "4. Field changes to 'Generated' when done",
          "5. Manually move to 'Email Sequence Ready' when ready"
        ]
      };
    }
    
  } catch (error) {
    console.error('❌ Error setting up auto content generation:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the setup
createAutoContentGeneration()
  .then(result => {
    if (result.success) {
      console.log('🎉 AUTO CONTENT GENERATION SETUP COMPLETE!\n');
      console.log('📋 How to use:');
      result.instructions.forEach(instruction => {
        console.log(`   ${instruction}`);
      });
      console.log('\n💡 This gives you control over when emails are generated');
      console.log('   while making the process much more efficient!');
    }
  })
  .catch(console.error);