#!/usr/bin/env node

/**
 * Debug waarom Pipedrive automation niet wordt getriggerd
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
const TEST_DEAL_ID = '1111';

async function debugAutomationTrigger() {
  console.log('🔍 Debugging waarom automation niet wordt getriggerd...\n');
  
  try {
    // Check deal status
    console.log('1️⃣ Checking deal status...');
    const dealResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${TEST_DEAL_ID}?api_token=${API_TOKEN}`);
    const dealData = await dealResponse.json();
    
    if (!dealData.success) {
      throw new Error(`Failed to get deal: ${dealData.error}`);
    }
    
    console.log(`   Deal: ${dealData.data.title}`);
    console.log(`   Current Stage: ${dealData.data.stage_id}`);
    console.log(`   Pipeline: ${dealData.data.pipeline_id}`);
    console.log(`   Active: ${dealData.data.active_flag}`);
    console.log(`   Status: ${dealData.data.status}`);
    
    // Check if in correct stage
    if (dealData.data.stage_id !== 105) {
      console.log('\n⚠️  PROBLEEM: Deal is NIET in "Email Sequence Ready" stage (105)');
      console.log('   Verplaatsing naar stage 105...');
      
      const moveResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${TEST_DEAL_ID}?api_token=${API_TOKEN}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage_id: 105 })
      });
      
      const moveResult = await moveResponse.json();
      if (moveResult.success) {
        console.log('   ✅ Deal verplaatst naar stage 105');
      } else {
        console.log('   ❌ Failed to move deal:', moveResult.error);
      }
    } else {
      console.log('   ✅ Deal is in correcte stage (105)');
    }
    
    // Check email content
    console.log('\n2️⃣ Checking email content...');
    const email1Subject = dealData.data['47a7d774bf5b08226ce8d6e1e79708f1d44e3e30'];
    const email1Body = dealData.data['867577ef580ff8d22c74799d949483401bba2e26'];
    
    console.log(`   Email 1 Subject: ${email1Subject ? '✅ Present' : '❌ Missing'}`);
    console.log(`   Email 1 Body: ${email1Body ? '✅ Present' : '❌ Missing'}`);
    
    if (email1Subject) {
      console.log(`   Subject preview: ${email1Subject.substring(0, 50)}...`);
    }
    
    // Check contact person
    console.log('\n3️⃣ Checking contact person...');
    if (dealData.data.person_id) {
      const personResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/persons/${dealData.data.person_id}?api_token=${API_TOKEN}`);
      const personData = await personResponse.json();
      
      if (personData.success) {
        console.log(`   Contact: ${personData.data.name}`);
        console.log(`   Email: ${personData.data.email ? personData.data.email[0]?.value || 'No email' : 'No email'}`);
        
        if (!personData.data.email || !personData.data.email[0]?.value) {
          console.log('   ⚠️  PROBLEEM: Contact heeft geen email adres!');
        } else {
          console.log('   ✅ Contact heeft email adres');
        }
      } else {
        console.log('   ❌ Failed to get contact info');
      }
    } else {
      console.log('   ❌ PROBLEEM: Deal heeft geen contact persoon!');
    }
    
    // Check automation status
    console.log('\n4️⃣ Checking automation status...');
    const automationsResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/automations?api_token=${API_TOKEN}`);
    const automationsData = await automationsResponse.json();
    
    if (automationsData.success && automationsData.data) {
      const emailSequenceAutomation = automationsData.data.find(auto => 
        auto.name.includes('Corporate Recruiter Email Sequence') || 
        auto.name.includes('Email Sequence')
      );
      
      if (emailSequenceAutomation) {
        console.log(`   Automation found: ${emailSequenceAutomation.name}`);
        console.log(`   Status: ${emailSequenceAutomation.active ? '✅ Active' : '❌ Inactive'}`);
        console.log(`   ID: ${emailSequenceAutomation.id}`);
        
        if (!emailSequenceAutomation.active) {
          console.log('   ⚠️  PROBLEEM: Automation is NIET actief!');
        }
      } else {
        console.log('   ❌ PROBLEEM: Email Sequence automation niet gevonden!');
      }
    } else {
      console.log('   ❌ Failed to get automations');
    }
    
    console.log('\n📊 DIAGNOSE SAMENVATTING:');
    console.log('   Deal in juiste stage (105):', dealData.data.stage_id === 105 ? '✅' : '❌');
    console.log('   Email content aanwezig:', email1Subject ? '✅' : '❌');
    console.log('   Contact heeft email:', dealData.data.person_id ? '✅' : '❌');
    console.log('   Automation actief: (check manually in Pipedrive)');
    
    console.log('\n💡 MOGELIJKE OORZAKEN:');
    console.log('   1. Automation is niet actief (schakel aan in Pipedrive)');
    console.log('   2. Deal werd al eerder in stage 105 geplaatst (automation triggert alleen bij NIEUWE stage changes)');
    console.log('   3. Automation trigger is niet correct ingesteld');
    console.log('   4. Templates zijn niet correct gekoppeld');
    
    console.log('\n🔧 OPLOSSINGEN:');
    console.log('   1. Check automation status in Pipedrive interface');
    console.log('   2. Move deal TERUG naar lead stage, dan weer naar Email Sequence Ready');
    console.log('   3. Check automation trigger settings');
    console.log('   4. Check template koppelingen in automation');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAutomationTrigger();