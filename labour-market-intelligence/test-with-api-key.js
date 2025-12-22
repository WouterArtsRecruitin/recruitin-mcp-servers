#!/usr/bin/env node

/**
 * Test webhook with API key configured
 * Enhanced test with better mock Jobdigger data to simulate high reliability
 */

import https from 'https';

// Enhanced test data that should achieve higher reliability score
const enhancedJotformData = {
  submission_id: 'test_' + Date.now(),
  form_id: '252881347421054',
  created_at: new Date().toISOString(),
  
  // Clear job title
  jobTitle: 'Allround Monteur',
  q1_jobTitle: 'Allround Monteur',
  
  // Comprehensive vacancy text with salary info (improves manual data score)
  vacatureText: `ALLROUND MONTEUR - EINDHOVEN
  
FUNCTIEOMSCHRIJVING:
Wij zoeken een ervaren Allround Monteur voor onze moderne productielocatie. Je wordt verantwoordelijk voor het monteren, onderhouden en repareren van complexe industriële machines.

TAKEN:
- Mechanische montage van productiesystemen
- Preventief en correctief onderhoud
- Storing diagnose en reparatie
- Kwaliteitscontroles uitvoeren
- Samenwerken met engineeringteam

VEREISTEN:
- MBO niveau 4 Werktuigbouwkunde of Mechatronica
- Minimaal 5 jaar ervaring als Allround Monteur
- Kennis van hydrauliek, pneumatiek en besturingen
- VCA certificaat verplicht
- Flexibele instelling en hands-on mentaliteit

ARBEIDSVOORWAARDEN:
- Bruto maandsalaris: € 3.800 - € 4.500 (€45.600 - €54.000 per jaar)
- Jaarcontract met uitzicht op vast
- 8,33% vakantiegeld
- Pensioenregeling via PME
- 25 vakantiedagen + 13 ADV dagen
- Doorgroeimogelijkheden naar Hoofdmonteur
- Opleidingsbudget € 2.500 per jaar
- Lease auto van de zaak
- Telefoon en laptop

BEDRIJF:
Toonaangevend internationaal bedrijf in machinebouw met 250 medewerkers. Specialist in hoogwaardige industriële automatisering voor automotive en aerospace sector.

LOCATIE:
Eindhoven (Noord-Brabant) - Goed bereikbaar per auto en openbaar vervoer`,
  
  q2_vacatureText: 'Allround Monteur met ervaring in machinebouw',
  
  // Complete URL
  vacatureUrl: 'https://www.indeed.nl/jobs?q=allround+monteur&l=eindhoven',
  q3_vacatureUrl: 'https://www.indeed.nl/jobs?q=allround+monteur&l=eindhoven',
  
  // Enhanced PDF simulation with more Jobdigger-like structure
  pdfUpload: {
    name: 'Jobdigger_Arbeidsmarkt_Analyse_Allround_Monteur_Nederland_2024.pdf',
    path: '/tmp/uploads/jobdigger_' + Date.now() + '.pdf',
    size: 3456789,
    type: 'application/pdf'
  },
  
  q4_pdfUpload: {
    name: 'Jobdigger_Arbeidsmarkt_Analyse_Allround_Monteur_Nederland_2024.pdf',
    path: '/tmp/uploads/jobdigger_analysis.pdf',
    size: 3456789,
    type: 'application/pdf'
  },

  // Additional form fields that might improve scoring
  companyName: 'TechPro Manufacturing B.V.',
  location: 'Eindhoven, Noord-Brabant',
  contactEmail: 'hr@techpro-manufacturing.nl',
  urgency: 'Hoog - Direct beschikbaar',
  
  // Metadata
  ip: '85.144.123.456',
  user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  referrer: 'https://form.jotform.com/252881347421054',
  submit_button: 'Analyseer Arbeidsmarkt Intelligence'
};

async function testWithApiKey() {
  console.log('🔑 Testing with CLAUDE_API_KEY configured...\n');
  
  console.log('📋 ENHANCED TEST DATA:');
  console.log('Job Title:', enhancedJotformData.jobTitle);
  console.log('Vacancy Text:', enhancedJotformData.vacatureText.length, 'characters');
  console.log('Contains Salary Info:', enhancedJotformData.vacatureText.includes('€') ? '✅ Yes' : '❌ No');
  console.log('PDF Name:', enhancedJotformData.pdfUpload.name);
  console.log('PDF Size:', Math.round(enhancedJotformData.pdfUpload.size / 1024), 'KB');
  console.log('Company Info:', enhancedJotformData.companyName);
  console.log('Location:', enhancedJotformData.location);

  const postData = JSON.stringify(enhancedJotformData);
  
  try {
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'lmi-webhook-server.onrender.com',
        port: 443,
        path: '/webhook/jotform',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'JotForm/1.0 (API-Key-Test)',
          'X-JotForm-Form-ID': '252881347421054',
          'X-Test-Enhanced': 'true'
        }
      };

      console.log('\n🚀 Sending enhanced submission...');
      console.log('Target:', 'https://lmi-webhook-server.onrender.com/webhook/jotform');
      
      const startTime = Date.now();
      
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          const processingTime = Date.now() - startTime;
          
          try {
            const parsed = JSON.parse(responseData);
            resolve({ 
              status: res.statusCode, 
              data: parsed, 
              processingTime,
              headers: res.headers 
            });
          } catch (e) {
            resolve({ 
              status: res.statusCode, 
              data: responseData, 
              processingTime,
              headers: res.headers 
            });
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    console.log('\n✅ RESPONSE RECEIVED:');
    console.log('Status Code:', result.status);
    console.log('Processing Time:', result.processingTime + 'ms');
    console.log('Response Size:', JSON.stringify(result.data).length, 'characters');
    
    if (result.status === 200) {
      console.log('\n📊 WEBHOOK SUCCESS:');
      console.log('Success:', result.data.success);
      console.log('Message:', result.data.message);
      
      if (result.data.reliabilityScore !== undefined) {
        console.log('\n🎯 RELIABILITY ANALYSIS:');
        console.log('Score:', result.data.reliabilityScore + '%');
        console.log('Threshold Met:', result.data.reliabilityScore >= 85 ? '✅ YES' : '❌ NO');
        
        if (result.data.reliabilityScore >= 85) {
          console.log('🎉 ANALYSIS SHOULD BE COMPLETE!');
        } else {
          console.log('⚠️ Still below 85% - investigating why...');
          
          // Analyze potential issues
          console.log('\n🔍 DEBUGGING LOW SCORE:');
          console.log('- API Key Present: Should be ✅ (you added it)');
          console.log('- PDF Analysis: Depends on actual file parsing');
          console.log('- Market Data: Should work (✅)');
          console.log('- Manual Data: Rich text provided (✅)');
          
          console.log('\n💡 LIKELY CAUSE:');
          console.log('Mock PDF path cannot be read by server.');
          console.log('Real PDF upload via Jotform should work better.');
        }
      }
      
      if (result.data.analysis) {
        console.log('\n📈 ANALYSIS DETAILS:');
        console.log('Job Title Analyzed:', result.data.analysis.jobTitle);
        console.log('Location:', result.data.analysis.location);
        console.log('Analysis Timestamp:', result.data.analysis.timestamp);
        
        if (result.data.analysis.marketData) {
          console.log('\n💼 MARKET DATA:');
          const md = result.data.analysis.marketData;
          console.log('Current Openings:', md.demandIndicators?.currentOpenings);
          console.log('Trend Direction:', md.demandIndicators?.trendDirection);
          console.log('Median Salary:', md.salaryBenchmarks?.median ? '€' + md.salaryBenchmarks.median.toLocaleString() : 'N/A');
        }
        
        if (result.data.analysis.workforceData) {
          console.log('\n👥 WORKFORCE INTELLIGENCE:');
          const wd = result.data.analysis.workforceData;
          console.log('Total Available:', wd.totalAvailable?.toLocaleString());
          console.log('Active Job Seekers:', wd.activeJobSeekers?.percentage + '%');
        }
      }
      
      if (result.data.report) {
        console.log('\n📄 REPORT GENERATED:');
        console.log('Report Length:', result.data.report.length);
        console.log('First 200 chars:', result.data.report.substring(0, 200) + '...');
      }
      
    } else {
      console.log('\n❌ NON-SUCCESS STATUS:');
      console.log('Status:', result.status);
      console.log('Response:', result.data);
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }

  console.log('\n🎯 NEXT STEP FOR REAL TEST:');
  console.log('Submit actual form with real PDF:');
  console.log('https://form.jotform.com/252881347421054');
  console.log('');
  console.log('Expected: Higher reliability score with real Jobdigger PDF!');
}

testWithApiKey();