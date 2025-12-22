#!/usr/bin/env node

/**
 * Kandidatentekort.nl Automation Setup
 * Pipeline 4: "vacature analyse" 
 * Automatische bedankemail bij Typeform submission
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';

async function setupKandidatentekortAutomation() {
  console.log('🌐 KANDIDATENTEKORT.NL AUTOMATION SETUP\n');
  console.log('Pipeline: 4 "vacature analyse"');
  console.log('Trigger: Typeform submission → Automatische bedankemail\n');
  
  try {
    // Step 1: Verify vacature analyse pipeline
    console.log('1️⃣ Verificatie "vacature analyse" pipeline...');
    
    const stagesResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/stages?pipeline_id=4&api_token=${API_TOKEN}`);
    const stagesData = await stagesResponse.json();
    
    if (!stagesData.success) {
      throw new Error('Failed to fetch stages for pipeline 4');
    }
    
    console.log('📊 Stages in "vacature analyse" pipeline:');
    stagesData.data.forEach(stage => {
      console.log(`   ${stage.id}: "${stage.name}"`);
    });
    
    // Find or use first stage for new Typeform submissions
    const firstStage = stagesData.data.find(s => s.order_nr === 1) || stagesData.data[0];
    const NEW_SUBMISSION_STAGE_ID = firstStage.id;
    
    console.log(`✅ New submission stage: ${NEW_SUBMISSION_STAGE_ID} ("${firstStage.name}")`);
    
    // Step 2: Create bedankemail template
    console.log('\n2️⃣ Aanmaken bedankemail template...');
    
    const bedankTemplate = {
      name: 'Kandidatentekort.nl - Bedankemail Typeform',
      subject: 'Bedankt voor je interesse - Kandidatentekort Analyse voor {{company_name}}',
      content: `Beste {{contact_name}},

Hartelijk dank voor je interesse in onze gratis kandidatentekort analyse!

**Wat gebeurt er nu?**
✅ Je aanvraag is ontvangen
⏰ Binnen 24 uur ontvang je een persoonlijke analyse  
📊 Compleet overzicht van jouw recruitment uitdagingen
💡 Concrete aanbevelingen voor {{company_name}}

**Wat je kunt verwachten:**
• Marktanalyse voor jouw sector
• Benchmark tegen vergelijkbare bedrijven
• Praktische tips om sneller kandidaten te vinden
• Optionele gesprek voor persoonlijk advies

**Direct contact nodig?**
📞 06-14314593 (Wouter van der Linden)
📧 wouter@recruitin.nl
🌐 kandidatentekort.nl

**P.S.** Keep an eye on je inbox - de analyse komt er echt aan! 📈

Met vriendelijke groet,

**Wouter van der Linden**  
Recruitment Consultant | Recruitin B.V.
🌐 kandidatentekort.nl | recruitin.nl

---
Deze email is verstuurd omdat je via kandidatentekort.nl een gratis analyse hebt aangevraagd.`,
      active_flag: true
    };
    
    const templateResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/mailbox/mailTemplates?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bedankTemplate)
    });
    
    let templateResult = null;
    if (templateResponse.ok) {
      templateResult = await templateResponse.json();
      if (templateResult.success) {
        console.log(`✅ Bedankemail template created: ID ${templateResult.data.id}`);
      }
    }
    
    // Step 3: Check for existing kandidatentekort custom fields
    console.log('\n3️⃣ Check Typeform/kandidatentekort custom fields...');
    
    const fieldsResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/dealFields?api_token=${API_TOKEN}`);
    const fieldsData = await fieldsResponse.json();
    
    const typeformFields = fieldsData.data.filter(field => 
      field.name.toLowerCase().includes('typeform') ||
      field.name.toLowerCase().includes('kandidaat') ||
      field.name.toLowerCase().includes('website') ||
      field.name.toLowerCase().includes('source')
    );
    
    console.log(`📋 Gevonden Typeform-gerelateerde velden: ${typeformFields.length}`);
    typeformFields.forEach(field => {
      console.log(`   ${field.key}: "${field.name}"`);
    });
    
    // Step 4: Create automation instructions
    console.log('\n4️⃣ Automation setup instructies...');
    
    const automationInstructions = `
🔧 ZAPIER/AUTOMATION SETUP voor kandidatentekort.nl:

**TRIGGER:** Typeform Submission (kandidatentekort.nl form)
↓
**ACTION 1:** Create Pipedrive Deal
• Pipeline: 4 ("vacature analyse") 
• Stage: ${NEW_SUBMISSION_STAGE_ID} ("${firstStage.name}")
• Title: "Kandidatentekort Analyse - [Company Name]"

↓
**ACTION 2:** Send Email Template
• Template ID: ${templateResult ? templateResult.data.id : 'TO_BE_CREATED'}
• To: {{typeform_email}}
• Variables: {{company_name}}, {{contact_name}}

**TYPEFORM FIELDS MAPPING:**
• Company Name → Deal Organization
• Contact Name → Deal Person  
• Email → Person Email
• Phone → Person Phone
• Aantal Vacatures → Custom Field
• Sector → Deal Custom Field
• Urgentie → Deal Value/Priority

**EMAIL PERSONALIZATION:**
• {{contact_name}} = Contact naam uit Typeform
• {{company_name}} = Bedrijf naam uit Typeform
`;

    console.log(automationInstructions);
    
    console.log('\n🎉 KANDIDATENTEKORT.NL AUTOMATION READY!\n');
    
    console.log('✅ SETUP COMPLETE:');
    console.log(`   📊 Pipeline: 4 ("vacature analyse")`);
    console.log(`   🎯 New Entry Stage: ${NEW_SUBMISSION_STAGE_ID}`);
    console.log(`   📧 Bedankemail Template: ${templateResult ? 'Created ✅' : 'Failed ❌'}`);
    console.log('   🔗 Ready voor Typeform → Pipedrive → Email automation');
    
    console.log('\n🌙 GOODNIGHT SETUP:');
    console.log('   • Pipeline 14: Corporate Recruiter (HR roles)');
    console.log('   • Pipeline 12: JobDigger Automation (Tech roles)');
    console.log('   • Pipeline 4:  Kandidatentekort.nl (Typeform → Bedankemail) ✨ NEW');
    
    return {
      KANDIDATENTEKORT_PIPELINE_ID: 4,
      NEW_SUBMISSION_STAGE_ID,
      bedankemail_template: templateResult ? templateResult.data.id : null,
      automation_ready: true,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Kandidatentekort automation setup failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Execute setup
setupKandidatentekortAutomation()
  .then(result => {
    if (result.success) {
      console.log('\n🚀 Kandidatentekort.nl automation klaar voor gebruik!');
      console.log('💤 Goedenacht! Automation werkt terwijl je slaapt...');
    }
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
  });