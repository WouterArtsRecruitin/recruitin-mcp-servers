/**
 * Vercel Serverless Function for Pipedrive Webhook
 * Handles new deal notifications and triggers email automation
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error', 
      message: 'Method not allowed. Use POST only.' 
    });
  }

  console.log('🔔 Webhook received from Pipedrive');
  console.log('📊 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const dealData = req.body.current;
    
    if (!dealData) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No deal data received' 
      });
    }

    // Only process Pipeline 14 deals (Corporate Recruiter)
    if (dealData.pipeline_id !== 14) {
      console.log(`⏭️  Skipping deal ${dealData.id} - wrong pipeline (${dealData.pipeline_id})`);
      return res.status(200).json({ 
        status: 'ignored', 
        reason: `Pipeline ${dealData.pipeline_id} not monitored`,
        deal_id: dealData.id
      });
    }

    console.log(`🎯 Processing Pipeline 14 deal: ${dealData.title}`);

    // Environment variables for API tokens
    const PIPEDRIVE_API_TOKEN = process.env.PIPEDRIVE_API_TOKEN || '57720aa8b264cb9060c9dd5af8ae0c096dbbebb5';
    const LOCAL_MCP_SERVER = process.env.LOCAL_MCP_SERVER; // Optional: for local MCP integration

    // Prepare email generation data
    const emailData = {
      deal_id: dealData.id,
      company_name: dealData.org_name || dealData.title,
      contact_name: dealData.person_name || 'Contact',
      contact_email: dealData.person_email,
      vacancy_title: dealData.title,
      pipeline_id: dealData.pipeline_id
    };

    // Try to reach local MCP server (if accessible)
    let emailResult = { status: 'serverless_mode' };
    if (LOCAL_MCP_SERVER) {
      try {
        const mcpResponse = await fetch(`${LOCAL_MCP_SERVER}/generate-sequence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...emailData, api_token: PIPEDRIVE_API_TOKEN }),
          timeout: 10000
        });

        if (mcpResponse.ok) {
          emailResult = await mcpResponse.json();
          console.log('✅ Email generation completed via MCP server');
        }
      } catch (error) {
        console.log('⚠️  MCP server not reachable, using serverless mode');
      }
    }

    // Move deal to "Email Sequence Ready" stage (ID 105)
    const moveResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealData.id}?api_token=${PIPEDRIVE_API_TOKEN}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        stage_id: 105  // Email Sequence Ready stage
      })
    });

    let stageMovedSuccessfully = false;
    if (moveResponse.ok) {
      stageMovedSuccessfully = true;
      console.log('🚀 Deal moved to Email Sequence Ready - automation will trigger');
    } else {
      const errorText = await moveResponse.text();
      console.log('⚠️  Failed to move deal to next stage:', errorText);
    }

    // Add note to deal about automation trigger
    const noteContent = `🤖 Email Automation Triggered\\n\\nDeal: ${dealData.title}\\nCompany: ${emailData.company_name}\\nContact: ${emailData.contact_name}\\nPipeline: Corporate Recruiter (14)\\n\\nNext Steps:\\n- 6-email sequence will be generated\\n- Automatic follow-up schedule activated\\n- Deal moved to Email Sequence Ready stage\\n\\nTimestamp: ${new Date().toISOString()}`;

    await fetch(`https://recruitinbv.pipedrive.com/api/v1/notes?api_token=${PIPEDRIVE_API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deal_id: dealData.id,
        content: noteContent
      })
    }).catch(err => console.log('⚠️  Note creation failed:', err.message));

    // Return success response
    return res.status(200).json({
      status: 'processed',
      deal_id: dealData.id,
      company_name: emailData.company_name,
      contact_name: emailData.contact_name,
      email_generation: emailResult.status,
      stage_moved: stageMovedSuccessfully,
      pipeline: 'Corporate Recruiter (14)',
      timestamp: new Date().toISOString(),
      serverless: true
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error.message);
    return res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}