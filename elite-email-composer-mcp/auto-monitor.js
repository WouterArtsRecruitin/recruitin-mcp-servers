#!/usr/bin/env node

/**
 * Auto-monitor script: Check for new deals and auto-process them
 * Run this every 10 minutes with cron job
 */

const API_TOKEN = '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';

async function autoProcessNewDeals() {
  console.log('🔍 Checking for new deals to process...\n');
  
  try {
    // Get all deals in Pipeline 14, stage "lead" (95)
    const dealsResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals?pipeline_id=14&stage_id=95&api_token=${API_TOKEN}`);
    const dealsData = await dealsResponse.json();
    
    if (!dealsData.success || !dealsData.data?.length) {
      console.log('   No new deals in lead stage');
      return;
    }
    
    console.log(`📋 Found ${dealsData.data.length} deals in lead stage:`);
    
    for (const deal of dealsData.data) {
      console.log(`\n🔄 Processing deal: ${deal.title}`);
      
      // Check if deal already has email content
      const hasEmailContent = deal['47a7d774bf5b08226ce8d6e1e79708f1d44e3e30']; // Email 1 subject field
      
      if (hasEmailContent) {
        console.log('   ✅ Email content already exists');
        console.log('   🚀 Moving to Email Sequence Ready...');
        
        // Move to Email Sequence Ready stage
        await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${deal.id}?api_token=${API_TOKEN}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage_id: 105 })
        });
        
        console.log('   ✅ Moved to Email Sequence Ready - automation will start!');
        
      } else {
        console.log('   📧 No email content - generating now...');
        
        // Call MCP to generate emails (you would implement this)
        const company_name = deal.org_name || deal.title || 'Company';
        const contact_name = deal.person_name || 'Contact Person';
        const vacancy_title = deal.title || 'Position';
        
        console.log(`   Company: ${company_name}`);
        console.log(`   Contact: ${contact_name}`);
        console.log(`   Vacancy: ${vacancy_title}`);
        
        // Here you would call your MCP server to generate and save emails
        // For now, just log what would happen
        console.log('   📝 [Would generate 6 personalized emails]');
        console.log('   💾 [Would save to custom fields]');
        console.log('   🚀 [Would move to Email Sequence Ready]');
        
        // Uncomment this when you have MCP endpoint ready:
        /*
        try {
          const mcpResponse = await fetch('http://localhost:3000/generate-sequence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deal_id: deal.id,
              company_name,
              contact_name,
              vacancy_title,
              api_token: API_TOKEN
            })
          });
          
          const mcpResult = await mcpResponse.json();
          
          if (mcpResult.success) {
            // Move to Email Sequence Ready
            await fetch(\`https://recruitinbv.pipedrive.com/api/v1/deals/\${deal.id}?api_token=${API_TOKEN}\`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stage_id: 105 })
            });
            
            console.log('   ✅ Emails generated and deal moved - automation starting!');
          }
        } catch (error) {
          console.log('   ❌ Email generation failed:', error.message);
        }
        */
      }
    }
    
  } catch (error) {
    console.error('❌ Error processing deals:', error.message);
  }
}

// Run the auto-processor
autoProcessNewDeals()
  .then(() => {
    console.log('\n🎉 Auto-processing complete!');
    console.log('\n💡 To make this fully automatic:');
    console.log('   1. Save this as auto-monitor.js');
    console.log('   2. Run: crontab -e');
    console.log('   3. Add: */10 * * * * cd /path/to/project && node auto-monitor.js');
    console.log('   4. Now runs every 10 minutes automatically!');
  });