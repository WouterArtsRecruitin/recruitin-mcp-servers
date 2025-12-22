#!/usr/bin/env node

import { PipedriveEmailTemplates } from './dist/pipedrive-email-templates.js';

async function testPipedriveNativeAutomation() {
  console.log('🚀 Testing Pipedrive NATIVE Email Automation Setup...\n');
  
  const pipedriveTemplates = new PipedriveEmailTemplates();
  const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
  
  try {
    console.log('🎯 Setting up NATIVE Pipedrive automation (vs Zapier)...\n');
    
    const result = await pipedriveTemplates.setupNativeEmailAutomation(API_TOKEN);
    
    if (result.success) {
      console.log('✅ Pipedrive Native Email Automation Setup Complete!\n');
      
      console.log('📊 Summary:');
      console.log(`   Email Templates Created: ${result.summary.email_templates_created}`);
      console.log(`   Automation Workflow: ${result.summary.automation_workflow}`);
      console.log(`   Ready for Use: ${result.summary.ready_for_use}\n`);
      
      console.log('📧 Email Templates Created:');
      result.templates.forEach((template, idx) => {
        console.log(`   ${idx + 1}. ${template.name} (ID: ${template.id})`);
        console.log(`      Subject: ${template.subject_field}`);
        console.log(`      Body: ${template.body_field}\n`);
      });
      
      console.log('🤖 Automation Workflow Structure:');
      console.log(`   Name: ${result.workflow.name}`);
      console.log(`   Trigger: ${result.workflow.trigger.type} on pipeline ${result.workflow.trigger.pipeline_id}`);
      console.log(`   Actions: ${result.workflow.actions.length} steps\n`);
      
      console.log('📋 Next Steps for Manual Setup:');
      result.setup_instructions.forEach((step, idx) => {
        console.log(`   ${step}`);
      });
      
      console.log('\n🎉 NATIVE PIPEDRIVE AUTOMATION vs ZAPIER:');
      console.log('   ✅ Templates use custom field variables: {{field_key}}');
      console.log('   ✅ Native email tracking & analytics');  
      console.log('   ✅ Conditional logic for replies/meetings');
      console.log('   ✅ No external dependencies or costs');
      console.log('   ✅ Integrated with Pipeline 14 workflow');
      console.log('\n📈 Workflow: Generate Content → Custom Fields → Native Templates → Send');
      
    } else {
      console.log('❌ Failed to setup native automation');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testPipedriveNativeAutomation();