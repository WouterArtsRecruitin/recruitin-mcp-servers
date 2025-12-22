#!/usr/bin/env node

/**
 * Test Jotform webhook integration with mock data
 * Simulates real form submission to verify end-to-end functionality
 */

import https from 'https';

const WEBHOOK_URL = 'https://lmi-webhook-server.onrender.com/webhook/jotform';

// Mock Jotform submission data (realistic format)
const mockJotformData = {
  // Standard Jotform fields
  submission_id: '5234567890123456789',
  form_id: '252881347421054',
  created_at: new Date().toISOString(),
  
  // Our custom fields matching expected webhook data
  jobTitle: 'Allround Monteur',
  q1_jobTitle: 'Allround Monteur',
  
  vacatureText: `Wij zoeken een ervaren Allround Monteur voor onze productielocatie in Eindhoven. 
  
Taken:
- Montage en assemblage van mechanische componenten
- Preventief onderhoud en storingsherstel
- Kwaliteitscontroles uitvoeren
- Samenwerken in een dynamisch team

Vereisten:
- MBO niveau 3/4 Werktuigbouwkunde
- Minimaal 3 jaar ervaring als monteur
- Kennis van hydrauliek en pneumatiek
- VCA certificaat gewenst

Wij bieden:
- Salaris tussen €42.000 - €48.000
- Goede pensioenregeling
- 25 vakantiedagen + ADV dagen
- Opleidingsmogelijkheden`,
  
  q2_vacatureText: 'Ervaren allround monteur gezocht voor technische productie omgeving',
  
  vacatureUrl: 'https://example-bedrijf.nl/vacatures/allround-monteur-eindhoven',
  q3_vacatureUrl: 'https://example-bedrijf.nl/vacatures/allround-monteur-eindhoven',
  
  // Mock PDF upload (simulated)
  pdfUpload: {
    name: 'Jobdigger_Allround_Monteur_Rapport.pdf',
    path: '/mock/pdf/path.pdf',
    size: 245678,
    type: 'application/pdf'
  },
  q4_pdfUpload: {
    name: 'Jobdigger_Allround_Monteur_Rapport.pdf',
    path: '/mock/pdf/path.pdf'
  },

  // Additional form metadata
  ip: '192.168.1.100',
  user_agent: 'Mozilla/5.0 (Test Browser)',
  submit_button: 'Analyseer Arbeidsmarkt'
};

function testWebhook(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'lmi-webhook-server.onrender.com',
      port: 443,
      path: '/webhook/jotform',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'JotForm-Test-Client/1.0',
        'X-Test-Request': 'true'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runWebhookTest() {
  console.log('🧪 Testing Jotform webhook integration...\n');
  
  console.log('📋 Test Data:');
  console.log('Job Title:', mockJotformData.jobTitle);
  console.log('Form ID:', mockJotformData.form_id);
  console.log('Has PDF:', !!mockJotformData.pdfUpload);
  console.log('Vacancy Text Length:', mockJotformData.vacatureText.length, 'characters');
  console.log('Vacancy URL:', mockJotformData.vacatureUrl);
  
  try {
    console.log('\n🚀 Sending webhook request to:', WEBHOOK_URL);
    console.log('⏱️ Processing...\n');
    
    const startTime = Date.now();
    const result = await testWebhook(mockJotformData);
    const duration = Date.now() - startTime;
    
    console.log('📊 WEBHOOK TEST RESULTS:');
    console.log('Status Code:', result.status);
    console.log('Processing Time:', duration + 'ms');
    console.log('Response Headers:', Object.keys(result.headers).join(', '));
    
    if (result.status === 200) {
      console.log('\n✅ SUCCESS - Webhook processed successfully!');
      
      if (typeof result.data === 'object') {
        console.log('\n📈 Analysis Results:');
        console.log('Success:', result.data.success);
        console.log('Reliability Score:', result.data.reliabilityScore || 'Not provided');
        console.log('Message:', result.data.message || 'No message');
        
        if (result.data.analysis) {
          console.log('\n🎯 Market Analysis:');
          console.log('Job Title:', result.data.analysis.jobTitle);
          console.log('Timestamp:', result.data.analysis.timestamp);
          console.log('Has Market Data:', !!result.data.analysis.marketData);
          console.log('Has Workforce Data:', !!result.data.analysis.workforceData);
          
          if (result.data.analysis.reliabilityScore) {
            console.log('\n🔍 Reliability Validation:');
            console.log('Overall Score:', result.data.analysis.reliabilityScore.overallScore + '%');
            console.log('Is Reliable:', result.data.analysis.reliabilityScore.isReliable);
            if (result.data.analysis.reliabilityScore.blockers?.length > 0) {
              console.log('Blockers:', result.data.analysis.reliabilityScore.blockers.join(', '));
            }
          }
        }
        
        if (result.data.report) {
          console.log('\n📄 Professional Report Generated:');
          console.log('Report Length:', result.data.report.length, 'characters');
          console.log('Report Preview:', result.data.report.substring(0, 200) + '...');
        }
        
      } else {
        console.log('\n📝 Raw Response:');
        console.log(result.data.substring(0, 500) + (result.data.length > 500 ? '...' : ''));
      }
      
    } else if (result.status === 422) {
      console.log('\n⚠️ RELIABILITY CHECK FAILED');
      console.log('This is expected behavior - system blocks low-quality data');
      console.log('Response:', result.data.message || result.data);
      
    } else {
      console.log('\n❌ WEBHOOK ERROR');
      console.log('Status:', result.status);
      console.log('Response:', result.data);
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🚨 Connection refused - Service might be down');
      console.log('Check service status: https://lmi-webhook-server.onrender.com/health');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🚨 Hostname not found - Check webhook URL');
    }
  }

  console.log('\n🔗 Manual verification:');
  console.log('Service Health:', 'https://lmi-webhook-server.onrender.com/health');
  console.log('Render Logs:', 'https://dashboard.render.com/web/srv-d3oohhm3jp1c739kd4f0');
  console.log('Jotform:', 'https://form.jotform.com/252881347421054');
}

// Run the test
runWebhookTest();