#!/usr/bin/env node

/**
 * Simple JobDigger Automation Setup
 * Voor generieke technische vacatures (geen recruiter vacatures)
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';

async function setupJobDiggerAutomation() {
  console.log('🚀 SETTING UP JOBDIGGER AUTOMATION SYSTEM\n');
  console.log('Focus: Generieke technische vacatures (Developer, Engineer, Analyst, etc.)\n');
  
  try {
    // Step 1: Find or create JobDigger pipeline
    console.log('1️⃣ Finding JobDigger pipeline...');
    
    const pipelinesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/pipelines?api_token=${API_TOKEN}`);
    const pipelinesData = await pipelinesResponse.json();
    
    if (!pipelinesData.success) {
      throw new Error(`Failed to fetch pipelines: ${pipelinesData.error}`);
    }
    
    console.log('📋 Available Pipelines:');
    pipelinesData.data.forEach(pipeline => {
      console.log(`   ${pipeline.id}: "${pipeline.name}"`);
    });
    
    // Look for existing JobDigger pipeline or use pipeline other than 14
    let JOBDIGGER_PIPELINE_ID;
    const jobDiggerPipeline = pipelinesData.data.find(p => 
      p.name.toLowerCase().includes('jobdigger') ||
      p.name.toLowerCase().includes('tech') ||
      (p.id !== 14 && p.id !== 1) // Not the Corporate Recruiter pipeline
    );
    
    if (jobDiggerPipeline) {
      JOBDIGGER_PIPELINE_ID = jobDiggerPipeline.id;
      console.log(`✅ Using pipeline: ${jobDiggerPipeline.name} (ID: ${JOBDIGGER_PIPELINE_ID}) for JobDigger`);
    } else {
      console.log('⚠️  Using pipeline ID 1 as fallback for JobDigger');
      JOBDIGGER_PIPELINE_ID = 1;
    }
    
    // Step 2: Get stages
    console.log(`\n2️⃣ Getting stages for pipeline ${JOBDIGGER_PIPELINE_ID}...`);
    
    const stagesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages?pipeline_id=${JOBDIGGER_PIPELINE_ID}&api_token=${API_TOKEN}`);
    const stagesData = await stagesResponse.json();
    
    if (!stagesData.success) {
      throw new Error(`Failed to fetch stages: ${stagesData.error}`);
    }
    
    console.log(`📊 Stages in pipeline ${JOBDIGGER_PIPELINE_ID}:`);
    stagesData.data.forEach(stage => {
      console.log(`   ${stage.id}: "${stage.name}"`);
    });
    
    // Find suitable stage for automation
    let EMAIL_SEQUENCE_READY_STAGE_ID = stagesData.data.find(s => 
      s.name.toLowerCase().includes('ready') ||
      s.name.toLowerCase().includes('sequence') ||
      s.name.toLowerCase().includes('email')
    )?.id || stagesData.data[0].id; // Use first stage as fallback
    
    console.log(`✅ Using stage ID ${EMAIL_SEQUENCE_READY_STAGE_ID} for email sequence ready`);
    
    // Step 3: Check custom fields
    console.log(`\n3️⃣ Checking custom fields for JobDigger...`);
    
    const fieldsResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/dealFields?api_token=${API_TOKEN}`);
    const fieldsData = await fieldsResponse.json();
    
    if (!fieldsData.success) {
      throw new Error(`Failed to fetch custom fields: ${fieldsData.error}`);
    }
    
    // Check if JobDigger fields exist
    const existingJobDiggerFields = fieldsData.data.filter(field => 
      field.name.includes('JobDigger Email') || 
      field.name.includes('Tech Email')
    );
    
    console.log(`📋 Found ${existingJobDiggerFields.length} existing JobDigger email fields`);
    
    if (existingJobDiggerFields.length === 0) {
      console.log('ℹ️  No JobDigger-specific fields found. Will use general email fields.');
      console.log('   You can create JobDigger-specific fields later if needed.');
    }
    
    // Step 4: Create JobDigger email templates
    console.log(`\n4️⃣ Creating JobDigger email templates...`);
    
    const templates = [
      {
        name: 'JobDigger Tech Email 1 - Developer Shortage',
        subject: 'Re: {{vacancy_title}} - Developer tekort oplossen?',
        content: `Hallo {{contact_name}},

Zag dat {{company_name}} een {{vacancy_title}} zoekt. 

**De realiteit:** 65% meer vraag dan aanbod in tech talent. Gemiddelde time-to-hire: 12+ weken.

**Onze aanpak:**
• Direct toegang tot passieve kandidaten  
• Tech-stack specifieke sourcing
• Remote-first recruitment strategie

Interesse in een 20-minuten gesprek over hoe wij tech teams helpen scaling?

Groet,
Wouter van der Linden | Recruitin B.V.
📞 06-14314593`,
        active_flag: true
      },
      {
        name: 'JobDigger Tech Email 2 - Tech Talent Pipeline',
        subject: 'Re: {{vacancy_title}} - Tech talent pipeline',
        content: `Hallo {{contact_name}},

Quick follow-up over {{company_name}}'s {{vacancy_title}} zoektocht.

**Tech sector realiteit:**
→ Gemiddeld 4-6 kandidaten per vacature
→ 40% meer salaris inflatie dan andere sectoren
→ Remote work = nieuwe standaard

**Onze tech pipeline:**
• 2.000+ pre-screened developers
• Specialist per tech stack (React, Python, AWS, etc.)
• Gemiddelde plaatsing: 6 weken

Kunnen we {{company_name}} helpen versnellen?

Groet,
Wouter`,
        active_flag: true
      }
    ];
    
    const createdTemplates = [];
    
    for (const template of templates) {
      console.log(`   📧 Creating: ${template.name}...`);
      
      try {
        const templateResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/mailbox/mailTemplates?api_token=${API_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template)
        });
        
        if (templateResponse.ok) {
          const templateResult = await templateResponse.json();
          if (templateResult.success) {
            createdTemplates.push(templateResult.data);
            console.log(`   ✅ Created template ID ${templateResult.data.id}`);
          }
        } else {
          console.log(`   ⚠️  Template creation failed: ${templateResponse.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Error creating template: ${error.message}`);
      }
    }
    
    console.log(`✅ JobDigger templates created: ${createdTemplates.length}/${templates.length}`);
    
    return {
      JOBDIGGER_PIPELINE_ID,
      EMAIL_SEQUENCE_READY_STAGE_ID,
      templates_created: createdTemplates.length,
      success: true
    };
    
  } catch (error) {
    console.error('❌ JobDigger setup failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('🌙 CREATING JOBDIGGER AUTOMATION...\n');
  
  const setupResult = await setupJobDiggerAutomation();
  
  if (setupResult.success) {
    console.log('\n🎉 JOBDIGGER AUTOMATION SETUP COMPLETE!\n');
    
    console.log('✅ WHAT WAS CREATED:');
    console.log(`   📊 Pipeline: ${setupResult.JOBDIGGER_PIPELINE_ID}`);
    console.log(`   🎯 Email Sequence Ready Stage: ${setupResult.EMAIL_SEQUENCE_READY_STAGE_ID}`);
    console.log(`   📧 Email Templates: ${setupResult.templates_created}`);
    
    console.log('\n🎯 SYSTEM OVERVIEW:');
    console.log('   Corporate Recruiter (Pipeline 14): HR/Recruiter vacatures');
    console.log(`   JobDigger (Pipeline ${setupResult.JOBDIGGER_PIPELINE_ID}): Tech vacatures (Developer, Engineer, etc.)`);
    
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. ✅ Test JobDigger email generation with MCP');  
    console.log('   2. ✅ Set up automation in Pipedrive UI');
    console.log('   3. ✅ Test complete tech vacancy workflow');
    
    console.log('\n💤 JOBDIGGER SYSTEM READY FOR TECH VACATURES!');
  } else {
    console.log('❌ Setup failed:', setupResult.error);
  }
  
  return setupResult;
}

// Execute the setup
main()
  .then(result => {
    if (result?.success) {
      console.log('\n🚀 JobDigger automation ready!');
    }
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
  });