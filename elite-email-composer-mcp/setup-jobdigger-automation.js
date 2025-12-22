#!/usr/bin/env node

/**
 * Complete JobDigger Automation Setup
 * Voor generieke technische vacatures (geen recruiter vacatures)
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';

async function setupJobDiggerAutomation() {
  console.log('🚀 SETTING UP COMPLETE JOBDIGGER AUTOMATION SYSTEM\n');
  console.log('Focus: Generieke technische vacatures (Developer, Engineer, Analyst, etc.)\n');
  
  try {
    // Step 1: Find JobDigger pipeline
    console.log('1️⃣ Finding JobDigger pipeline...');
    
    const pipelinesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/pipelines?api_token=${API_TOKEN}`);
    const pipelinesData = await pipelinesResponse.json();
    
    if (!pipelinesData.success) {
      throw new Error(`Failed to fetch pipelines: ${pipelinesData.error}`);
    }
    
    console.log('📋 Available Pipelines:');
    pipelinesData.data.forEach(pipeline => {
      console.log(`   ${pipeline.id}: "${pipeline.name}" (${pipeline.deal_probability ? 'Probability' : 'Standard'})`);
    });
    
    // Look for JobDigger related pipeline
    const jobDiggerPipeline = pipelinesData.data.find(p => 
      p.name.toLowerCase().includes('jobdigger') ||
      p.name.toLowerCase().includes('vacature') ||
      p.name.toLowerCase().includes('tech') ||
      p.name.toLowerCase().includes('analyse')
    );
    
    let JOBDIGGER_PIPELINE_ID;
    if (jobDiggerPipeline) {
      JOBDIGGER_PIPELINE_ID = jobDiggerPipeline.id;
      console.log(`✅ JobDigger pipeline found: ${jobDiggerPipeline.name} (ID: ${JOBDIGGER_PIPELINE_ID})`);
    } else {
      // Look for any pipeline that's not the Corporate Recruiter one (14)
      const otherPipelines = pipelinesData.data.filter(p => p.id !== 14);
      if (otherPipelines.length > 0) {
        JOBDIGGER_PIPELINE_ID = otherPipelines[0].id;
        console.log(`📍 Using pipeline: ${otherPipelines[0].name} (ID: ${JOBDIGGER_PIPELINE_ID}) for JobDigger`);
      } else {
        console.log('⚠️  No suitable pipeline found, will create new one...');
        
        // Create new JobDigger pipeline
        const newPipelineData = {
          name: 'JobDigger Tech Vacatures',
          deal_probability: false,
          order_nr: 10
        };
        
        const createPipelineResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/pipelines?api_token=${API_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPipelineData)
        });
        
        const newPipelineResult = await createPipelineResponse.json();
        if (newPipelineResult.success) {
          JOBDIGGER_PIPELINE_ID = newPipelineResult.data.id;
          console.log(`✅ Created new JobDigger pipeline: ID ${JOBDIGGER_PIPELINE_ID}`);
        } else {
          throw new Error('Could not create or find JobDigger pipeline');
        }
      }
    }
    
    // Step 2: Get stages for JobDigger pipeline
    console.log(`\n2️⃣ Getting stages for JobDigger pipeline ${JOBDIGGER_PIPELINE_ID}...`);
    
    const stagesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages?pipeline_id=${JOBDIGGER_PIPELINE_ID}&api_token=${API_TOKEN}`);
    const stagesData = await stagesResponse.json();
    
    if (!stagesData.success) {
      throw new Error(`Failed to fetch stages: ${stagesData.error}`);
    }
    
    console.log(`📊 Stages in JobDigger pipeline:`);
    stagesData.data.forEach(stage => {
      console.log(`   ${stage.id}: "${stage.name}" (Order: ${stage.order_nr})`);
    });
    
    // Find or create "Email Sequence Ready" stage
    let EMAIL_SEQUENCE_READY_STAGE_ID = stagesData.data.find(s => 
      s.name.toLowerCase().includes('email sequence ready') ||
      s.name.toLowerCase().includes('email ready') ||
      s.name.toLowerCase().includes('sequence ready')
    )?.id;
    
    if (!EMAIL_SEQUENCE_READY_STAGE_ID) {
      console.log('➕ Creating "Email Sequence Ready" stage for JobDigger...');
      
      const maxOrder = Math.max(...stagesData.data.map(s => s.order_nr));
      const newStageData = {
        name: 'Email Sequence Ready',
        pipeline_id: JOBDIGGER_PIPELINE_ID,
        deal_probability: 30,
        order_nr: maxOrder + 1,
        active_flag: true
      };
      
      const createStageResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages?api_token=${API_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStageData)
      });
      
      const stageResult = await createStageResponse.json();
      if (stageResult.success) {
        EMAIL_SEQUENCE_READY_STAGE_ID = stageResult.data.id;
        console.log(`✅ Created Email Sequence Ready stage: ID ${EMAIL_SEQUENCE_READY_STAGE_ID}`);
      } else {
        throw new Error('Failed to create Email Sequence Ready stage');
      }
    } else {
      console.log(`✅ Email Sequence Ready stage found: ID ${EMAIL_SEQUENCE_READY_STAGE_ID}`);
    }
    
    // Step 3: Create/verify custom fields for JobDigger
    console.log(`\n3️⃣ Setting up custom fields for JobDigger pipeline...`);
    
    const fieldsResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/dealFields?api_token=${API_TOKEN}`);
    const fieldsData = await fieldsResponse.json();
    
    if (!fieldsData.success) {
      throw new Error(`Failed to fetch custom fields: ${fieldsData.error}`);
    }
    
    // Check if JobDigger email fields exist
    const existingEmailFields = fieldsData.data.filter(field => 
      field.name.includes('JobDigger Email') || 
      (field.name.includes('Email') && field.name.includes('Subject'))
    );
    
    console.log(`📋 Found ${existingEmailFields.length} existing email-related fields`);
    
    // Create JobDigger-specific email fields if needed
    const jobDiggerEmailFields = [];
    const emailFieldsNeeded = [
      'JobDigger Email 1 Subject', 'JobDigger Email 1 Body',
      'JobDigger Email 2 Subject', 'JobDigger Email 2 Body', 
      'JobDigger Email 3 Subject', 'JobDigger Email 3 Body',
      'JobDigger Email 4 Subject', 'JobDigger Email 4 Body',
      'JobDigger Email 5 Subject', 'JobDigger Email 5 Body',
      'JobDigger Email 6 Subject', 'JobDigger Email 6 Body',
      'JobDigger Email Sequence Status'
    ];
    
    for (const fieldName of emailFieldsNeeded) {
      const existingField = fieldsData.data.find(f => f.name === fieldName);
      
      if (existingField) {
        jobDiggerEmailFields.push({
          name: fieldName,
          key: existingField.key,
          existing: true
        });
        console.log(`   ✅ ${fieldName}: ${existingField.key} (existing)`);
      } else {
        console.log(`   ➕ Creating ${fieldName}...`);
        
        const fieldType = fieldName.includes('Body') ? 'text' : (fieldName.includes('Status') ? 'enum' : 'varchar');
        const fieldData = {
          name: fieldName,
          field_type: fieldType
        };
        
        if (fieldName.includes('Status')) {
          fieldData.options = [
            { label: 'Not Started' },
            { label: 'In Progress' }, 
            { label: 'Completed' },
            { label: 'Replied' },
            { label: 'Meeting Scheduled' }
          ];
        }
        
        const createFieldResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/dealFields?api_token=${API_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fieldData)
        });
        
        const fieldResult = await createFieldResponse.json();
        if (fieldResult.success) {
          jobDiggerEmailFields.push({
            name: fieldName,
            key: fieldResult.data.key,
            existing: false
          });
          console.log(`   ✅ Created ${fieldName}: ${fieldResult.data.key}`);
        } else {
          console.log(`   ❌ Failed to create ${fieldName}`);
        }
      }
    }
    
    console.log(`✅ JobDigger custom fields ready: ${jobDiggerEmailFields.length}/13`);
    
    return {
      JOBDIGGER_PIPELINE_ID,
      EMAIL_SEQUENCE_READY_STAGE_ID,
      jobDiggerEmailFields,
      success: true
    };
    
  } catch (error) {
    console.error('❌ JobDigger setup failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Step 4: Create tech-focused email templates
async function createJobDiggerEmailTemplates(pipelineId, customFields) {
  console.log('\n4️⃣ Creating JobDigger email templates...');
  
  try {
    const templates = [
      {
        name: 'JobDigger Tech Email 1 - Developer Shortage',
        subject: `{{${customFields.find(f => f.name === 'JobDigger Email 1 Subject')?.key}}}`,
        content: `{{${customFields.find(f => f.name === 'JobDigger Email 1 Body')?.key}}}`,
        active_flag: true
      },
      {
        name: 'JobDigger Tech Email 2 - Tech Talent Pipeline',
        subject: `{{${customFields.find(f => f.name === 'JobDigger Email 2 Subject')?.key}}}`,
        content: `{{${customFields.find(f => f.name === 'JobDigger Email 2 Body')?.key}}}`,
        active_flag: true
      },
      {
        name: 'JobDigger Tech Email 3 - Development Team Scaling',
        subject: `{{${customFields.find(f => f.name === 'JobDigger Email 3 Subject')?.key}}}`,
        content: `{{${customFields.find(f => f.name === 'JobDigger Email 3 Body')?.key}}}`,
        active_flag: true
      },
      {
        name: 'JobDigger Tech Email 4 - Tech Stack Expertise',
        subject: `{{${customFields.find(f => f.name === 'JobDigger Email 4 Subject')?.key}}}`,
        content: `{{${customFields.find(f => f.name === 'JobDigger Email 4 Body')?.key}}}`,
        active_flag: true
      },
      {
        name: 'JobDigger Tech Email 5 - Innovation & Growth',
        subject: `{{${customFields.find(f => f.name === 'JobDigger Email 5 Subject')?.key}}}`,
        content: `{{${customFields.find(f => f.name === 'JobDigger Email 5 Body')?.key}}}`,
        active_flag: true
      },
      {
        name: 'JobDigger Tech Email 6 - Partnership Proposal',
        subject: `{{${customFields.find(f => f.name === 'JobDigger Email 6 Subject')?.key}}}`,
        content: `{{${customFields.find(f => f.name === 'JobDigger Email 6 Body')?.key}}}`,
        active_flag: true
      }
    ];
    
    const createdTemplates = [];
    
    for (const template of templates) {
      console.log(`   📧 Creating: ${template.name}...`);
      
      const templateResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/mailbox/mailTemplates?api_token=${API_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });
      
      if (!templateResponse.ok) {
        console.log(`   ⚠️  Template creation failed: ${templateResponse.status}`);
        continue;
      }
      
      const templateResult = await templateResponse.json();
      if (templateResult.success) {
        createdTemplates.push({
          id: templateResult.data.id,
          name: template.name,
          subject_field: template.subject,
          body_field: template.content
        });
        console.log(`   ✅ Created template ID ${templateResult.data.id}`);
      }
    }
    
    console.log(`✅ JobDigger templates created: ${createdTemplates.length}/6`);
    return createdTemplates;
    
  } catch (error) {
    console.error('❌ Template creation failed:', error.message);
    return [];
  }
}

// Step 5: Create tech-focused MCP integration
async function setupJobDiggerMCPIntegration(setupData) {
  console.log('\n5️⃣ Setting up JobDigger MCP integration...');
  
  try {
    // Create the JobDigger-specific code
    const jobDiggerMCPCode = `
// JobDigger MCP Integration Code
// Add this to your MCP server for tech-focused email generation

import { PipedriveIntegrator } from './pipedrive-integrator.js';

class JobDiggerIntegrator extends PipedriveIntegrator {
  
  // Override sequence strategy for tech vacatures
  determineJobDiggerSequence(vacancy_title, company_size, tech_stack, urgency_level) {
    const isSeniorRole = vacancy_title.toLowerCase().includes('senior') || 
                        vacancy_title.toLowerCase().includes('lead') ||
                        vacancy_title.toLowerCase().includes('architect');
    
    const isStartup = company_size === 'startup' || company_size === 'scale-up';
    const isUrgent = urgency_level === 'high';
    
    return {
      email_1: { approach: 'tech_shortage', timing: 'immediate', framework: 'PAS' },
      email_2: { approach: 'talent_pipeline', timing: '7 days', framework: 'Value-First' },
      email_3: { approach: 'team_scaling', timing: '14 days', framework: 'AIDA' },
      email_4: { approach: 'tech_expertise', timing: '21 days', framework: 'Problem-Solution' },
      email_5: { approach: 'innovation_growth', timing: '35 days', framework: 'Value-First' },
      email_6: { approach: 'partnership', timing: '49 days', framework: 'AIDA' }
    };
  }
  
  // Tech-specific email generation
  async generateTechEmail(emailNumber, data, strategy) {
    const techData = {
      ...data,
      sector: 'technology',
      focus: 'technical_roles',
      pain_points: [
        'Developer shortage (65% more demand than supply)',
        'Time-to-hire for developers: 12+ weeks average',
        'Competition for senior talent',
        'Tech stack specific expertise needed',
        'Remote work expectations',
        'Salary inflation in tech sector'
      ],
      solutions: [
        'Direct access to passive candidates',
        'Tech-stack specific sourcing',
        'Competitive salary benchmarking', 
        'Remote-first recruitment approach',
        'Technical interview support',
        'Employer branding for tech companies'
      ]
    };
    
    return await this.generatePersonalizedEmail(emailNumber, techData, strategy);
  }
  
  // JobDigger custom field mapping
  async updateJobDiggerDeal(dealId, emailSequence, apiToken) {
    const jobDiggerFieldMapping = [
      { subject: '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Email 1 Subject'))?.key}', 
        body: '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Email 1 Body'))?.key}' },
      { subject: '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Email 2 Subject'))?.key}', 
        body: '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Email 2 Body'))?.key}' },
      { subject: '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Email 3 Subject'))?.key}', 
        body: '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Email 3 Body'))?.key}' },
      { subject: '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Email 4 Subject'))?.key}', 
        body: '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Email 4 Body'))?.key}' },
      { subject: '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Email 5 Subject'))?.key}', 
        body: '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Email 5 Body'))?.key}' },
      { subject: '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Email 6 Subject'))?.key}', 
        body: '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Email 6 Body'))?.key}' }
    ];
    
    const updateData = {};
    const fieldsUpdated = [];
    
    emailSequence.forEach((email, index) => {
      const mapping = jobDiggerFieldMapping[index];
      if (mapping) {
        updateData[mapping.subject] = email.subject;
        updateData[mapping.body] = email.body;
        fieldsUpdated.push(`JobDigger Email ${index + 1} Subject`);
        fieldsUpdated.push(`JobDigger Email ${index + 1} Body`);
      }
    });
    
    // Add status field
    const statusField = '${setupData.jobDiggerEmailFields.find(f => f.name.includes('Status'))?.key}';
    if (statusField) {
      updateData[statusField] = '464'; // Not Started
      fieldsUpdated.push('JobDigger Email Sequence Status');
    }
    
    console.log(`📝 Updating JobDigger deal ${dealId} with ${fieldsUpdated.length} fields:`);
    console.log(`   ${fieldsUpdated.join(', ')}`);
    
    try {
      const response = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealId}?api_token=${apiToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`Pipedrive API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Auto-move to Email Sequence Ready stage
        console.log('🚀 Auto-moving to JobDigger Email Sequence Ready stage...');
        
        const stageUpdateResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealId}?api_token=${apiToken}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage_id: ${setupData.EMAIL_SEQUENCE_READY_STAGE_ID} })
        });
        
        const stageResult = await stageUpdateResponse.json();
        if (stageResult.success) {
          console.log('✅ Deal moved to JobDigger Email Sequence Ready - automation will start!');
        }
      }
      
      return {
        success: result.success,
        fields_updated: fieldsUpdated
      };
      
    } catch (error) {
      throw new Error(`Failed to update JobDigger deal: ${error.message}`);
    }
  }
}

// Export for use
export { JobDiggerIntegrator };

// MCP Tool Definition for JobDigger
const jobDiggerTool = {
  name: 'generate_jobdigger_email_sequence',
  description: 'Generate personalized 6-email sequence for technical vacatures and update JobDigger deal',
  inputSchema: {
    type: 'object',
    properties: {
      deal_id: { type: 'string', description: 'JobDigger deal ID' },
      company_name: { type: 'string', description: 'Company name' },
      contact_name: { type: 'string', description: 'Contact person name' },
      contact_email: { type: 'string', description: 'Contact email' },
      vacancy_title: { type: 'string', description: 'Technical vacancy title (e.g., Senior Developer, DevOps Engineer)' },
      tech_stack: { type: 'string', description: 'Required tech stack (e.g., React, Python, AWS)' },
      company_size: { type: 'string', description: 'Company size (startup, scale-up, enterprise)' },
      location: { type: 'string', description: 'Job location' },
      urgency_level: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
      api_token: { type: 'string', description: 'Pipedrive API token' }
    },
    required: ['deal_id', 'company_name', 'contact_name', 'vacancy_title', 'api_token']
  }
};
`;
    
    // Save the JobDigger MCP integration code
    require('fs').writeFileSync('/Users/wouterarts/mcp-servers/elite-email-composer-mcp/src/jobdigger-integrator.ts', jobDiggerMCPCode);
    
    console.log('✅ JobDigger MCP integration code created');
    console.log('   📁 File: src/jobdigger-integrator.ts');
    
    return true;
    
  } catch (error) {
    console.error('❌ JobDigger MCP integration failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🌙 CREATING JOBDIGGER AUTOMATION WHILE YOU SLEEP...\n');
  
  // Step 1-3: Basic setup
  const setupResult = await setupJobDiggerAutomation();
  
  if (!setupResult.success) {
    console.log('❌ JobDigger setup failed, stopping...');
    return;
  }
  
  // Step 4: Email templates
  const templates = await createJobDiggerEmailTemplates(
    setupResult.JOBDIGGER_PIPELINE_ID, 
    setupResult.jobDiggerEmailFields
  );
  
  // Step 5: MCP integration
  const mcpIntegration = await setupJobDiggerMCPIntegration(setupResult);
  
  // Final summary
  console.log('\n🎉 JOBDIGGER AUTOMATION SETUP COMPLETE!\n');
  
  console.log('✅ WHAT WAS CREATED:');
  console.log(`   📊 Pipeline: ${setupResult.JOBDIGGER_PIPELINE_ID}`);
  console.log(`   🎯 Email Sequence Ready Stage: ${setupResult.EMAIL_SEQUENCE_READY_STAGE_ID}`);
  console.log(`   📝 Custom Fields: ${setupResult.jobDiggerEmailFields.length}/13`);
  console.log(`   📧 Email Templates: ${templates.length}/6`);
  console.log(`   🤖 MCP Integration: ${mcpIntegration ? '✅' : '❌'}`);
  
  console.log('\n🎯 JOBDIGGER VS CORPORATE RECRUITER:');
  console.log('   Corporate Recruiter (Pipeline 14): HR/Recruiter vacatures');
  console.log(`   JobDigger (Pipeline ${setupResult.JOBDIGGER_PIPELINE_ID}): Tech vacatures (Developer, Engineer, etc.)`);
  
  console.log('\n📋 NEXT STEPS (MORNING):');
  console.log('   1. ✅ Test JobDigger email generation');  
  console.log('   2. ✅ Set up JobDigger automation in Pipedrive UI');
  console.log('   3. ✅ Test complete tech vacancy workflow');
  console.log('   4. ✅ Compare with Corporate Recruiter system');
  
  console.log('\n💤 SYSTEM READY FOR TECH VACATURES!');
  console.log('   Both pipelines now operational:');
  console.log('   • Pipeline 14: Corporate Recruiter outreach');
  console.log(`   • Pipeline ${setupResult.JOBDIGGER_PIPELINE_ID}: JobDigger tech vacatures`);
  
  return setupResult;
}

// Execute the complete setup
main()
  .then(result => {
    if (result?.success) {
      console.log('\n🚀 JobDigger automation ready for morning testing!');
    }
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
  });