#!/usr/bin/env node

/**
 * CORRECTED JobDigger Setup - Juiste Pipeline 12 "JobDigger Automation"
 * Plus custom fields voor betere scheiding van Corporate Recruiter
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';

async function setupJobDiggerCorrected() {
  console.log('🔧 CORRIGEREN JOBDIGGER SETUP - JUISTE PIPELINE\n');
  console.log('Target: Pipeline 12 "JobDigger Automation"\n');
  
  try {
    // Step 1: Verify JobDigger Automation pipeline
    console.log('1️⃣ Verificatie JobDigger Automation pipeline...');
    
    const pipelinesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/pipelines?api_token=${API_TOKEN}`);
    const pipelinesData = await pipelinesResponse.json();
    
    const jobDiggerPipeline = pipelinesData.data.find(p => p.id === 12);
    if (!jobDiggerPipeline) {
      throw new Error('JobDigger Automation pipeline (12) not found');
    }
    
    console.log(`✅ Pipeline gevonden: ${jobDiggerPipeline.name} (ID: 12)`);
    
    // Step 2: Get stages for pipeline 12
    console.log('\n2️⃣ Ophalen stages JobDigger Automation...');
    
    const stagesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages?pipeline_id=12&api_token=${API_TOKEN}`);
    const stagesData = await stagesResponse.json();
    
    console.log('📊 JobDigger Automation stages:');
    stagesData.data.forEach(stage => {
      console.log(`   ${stage.id}: "${stage.name}"`);
    });
    
    const emailReadyStage = stagesData.data.find(s => s.name.includes('Contact gemaakt'));
    const EMAIL_READY_STAGE_ID = emailReadyStage ? emailReadyStage.id : 83;
    
    console.log(`✅ Email ready stage: ${EMAIL_READY_STAGE_ID} ("Contact gemaakt")`);
    
    // Step 3: Create JobDigger-specific custom fields
    console.log('\n3️⃣ Aanmaken JobDigger-specifieke custom fields...');
    
    const jobDiggerFields = [
      'JobDigger Email 1 Subject', 'JobDigger Email 1 Body',
      'JobDigger Email 2 Subject', 'JobDigger Email 2 Body', 
      'JobDigger Email 3 Subject', 'JobDigger Email 3 Body',
      'JobDigger Email 4 Subject', 'JobDigger Email 4 Body',
      'JobDigger Email 5 Subject', 'JobDigger Email 5 Body',
      'JobDigger Email 6 Subject', 'JobDigger Email 6 Body',
      'JobDigger Email Status',
      'Tech Stack Required',
      'Company Type (Tech)'
    ];
    
    const createdFields = [];
    
    for (const fieldName of jobDiggerFields) {
      console.log(`   ➕ Creating: ${fieldName}...`);
      
      let fieldType = 'varchar';
      let fieldOptions = undefined;
      
      if (fieldName.includes('Body')) {
        fieldType = 'text';
      } else if (fieldName.includes('Status')) {
        fieldType = 'enum';
        fieldOptions = [
          { label: 'Not Started' },
          { label: 'In Progress' }, 
          { label: 'Completed' },
          { label: 'Replied' },
          { label: 'Meeting Scheduled' }
        ];
      } else if (fieldName.includes('Company Type')) {
        fieldType = 'enum';
        fieldOptions = [
          { label: 'Startup' },
          { label: 'Scale-up' }, 
          { label: 'Enterprise' },
          { label: 'SME' }
        ];
      }
      
      const fieldData = {
        name: fieldName,
        field_type: fieldType
      };
      
      if (fieldOptions) {
        fieldData.options = fieldOptions;
      }
      
      try {
        const createFieldResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/dealFields?api_token=${API_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fieldData)
        });
        
        const fieldResult = await createFieldResponse.json();
        if (fieldResult.success) {
          createdFields.push({
            name: fieldName,
            key: fieldResult.data.key
          });
          console.log(`   ✅ Created: ${fieldResult.data.key}`);
        } else {
          console.log(`   ⚠️  Failed: ${fieldResult.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // Step 4: Update JobDigger email templates for pipeline 12
    console.log('\n4️⃣ Update JobDigger email templates...');
    
    const updatedTemplates = [
      {
        name: 'JobDigger Tech Email 1 - Developer Crisis',
        subject: 'Re: {{vacancy_title}} - Developer tekort crisis?',
        content: `Hallo {{contact_name}},

Zag dat {{company_name}} een {{vacancy_title}} zoekt.

**De harde realiteit:**
• 65% meer vraag dan aanbod voor developers
• Gemiddelde time-to-hire: 12+ weken 
• Tech salaris inflatie: +40% vs andere sectoren

**Onze directe oplossing:**
→ 2.000+ pre-screened developers
→ Tech-stack specifieke sourcing  
→ Gemiddelde plaatsing: 6 weken

Past een 20-minuten tech recruitment gesprek?
→ https://calendly.com/recruitin/tech-talk

Groet,
Wouter van der Linden
Tech Recruitment Specialist | Recruitin B.V.
📞 06-14314593 | 💻 Specialized in Developer placements`,
        active_flag: true
      },
      {
        name: 'JobDigger Tech Email 2 - Tech Scaling Strategy', 
        subject: 'Re: {{vacancy_title}} - Tech team scaling',
        content: `Hallo {{contact_name}},

Follow-up over {{company_name}}'s tech team uitbreiding.

**Scale-up realiteit:**
→ Meerdere tech rollen tegelijk invullen
→ Competitie voor senior developers
→ Remote work = nieuwe standaard

**Onze tech scaling aanpak:**
• Senior Developer binnen 4 weken
• Junior/Mid-level developers parallel
• Technical interview ondersteuning
• Employer branding voor tech talent

**Recent success case:**
Amsterdam scale-up zocht 3 developers:
→ Maand 1: Senior Full Stack Developer
→ Maand 2-3: 2 Frontend developers  
→ Resultaat: Complete team binnen 10 weken

Kunnen we {{company_name}} vergelijkbaar helpen?

Groet,
Wouter`,
        active_flag: true
      }
    ];
    
    const templateResults = [];
    
    for (const template of updatedTemplates) {
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
            templateResults.push(templateResult.data);
            console.log(`   ✅ Template ID: ${templateResult.data.id}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 JOBDIGGER SETUP GECORRIGEERD!\n');
    
    console.log('✅ NIEUWE CONFIGURATIE:');
    console.log(`   📊 Pipeline: 12 ("JobDigger Automation")`);
    console.log(`   🎯 Email Ready Stage: ${EMAIL_READY_STAGE_ID} ("Contact gemaakt")`);  
    console.log(`   📝 Custom Fields: ${createdFields.length}/15`);
    console.log(`   📧 Email Templates: ${templateResults.length}/2`);
    
    console.log('\n🔄 SYSTEEM OVERZICHT:');
    console.log('   Pipeline 14: Corporate Recruiter (HR roles)');
    console.log('   Pipeline 12: JobDigger Automation (Tech roles) ✨ CORRECTED');
    console.log('   Pipeline 4:  Vacature Analyse (Analysis)');
    
    console.log('\n📋 FIELD MAPPING voor JobDigger:');
    createdFields.forEach((field, idx) => {
      if (idx < 10) { // Show first 10 fields
        console.log(`   ${field.name}: ${field.key}`);
      }
    });
    
    return {
      JOBDIGGER_PIPELINE_ID: 12,
      EMAIL_READY_STAGE_ID,
      custom_fields: createdFields,
      templates: templateResults,
      success: true
    };
    
  } catch (error) {
    console.error('❌ JobDigger correction failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Execute the correction
setupJobDiggerCorrected()
  .then(result => {
    if (result.success) {
      console.log('\n🚀 JobDigger Automation correct geconfigureerd!');
      console.log('   Ready voor tech vacancy automation in Pipeline 12');
    }
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
  });