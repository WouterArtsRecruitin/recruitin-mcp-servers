#!/usr/bin/env node

/**
 * Test webhook endpoint directly to simulate your real submission
 * and check if the reliability scoring works properly
 */

import https from 'https';

// Test with realistic data similar to what you submitted
const realisticJotformData = {
  submission_id: Date.now().toString(),
  form_id: '252881347421054',
  created_at: new Date().toISOString(),
  
  // Job details (assuming you used Allround Monteur)
  jobTitle: 'Allround Monteur',
  q1_jobTitle: 'Allround Monteur',
  
  // Realistic vacancy text (expanded)
  vacatureText: `Voor onze moderne productielocatie in de regio Eindhoven zijn wij op zoek naar een ervaren Allround Monteur.

FUNCTIEOMSCHRIJVING:
Als Allround Monteur ben je verantwoordelijk voor:
- Het monteren en assembleren van complexe mechanische componenten
- Uitvoeren van preventief onderhoud aan productiemachines
- Opsporen en verhelpen van storingen aan installaties
- Uitvoeren van kwaliteitscontroles volgens ISO-normen
- Bijdragen aan verbeterprocessen en 5S-implementatie

FUNCTIE-EISEN:
- MBO niveau 3 of 4 richting Werktuigbouwkunde of Mechatronica
- Minimaal 3-5 jaar ervaring als Allround Monteur in industriële omgeving
- Kennis van hydraulische en pneumatische systemen
- Ervaring met lassen en mechanische bewerking
- Basis kennis van PLC-systemen (Siemens/Allen Bradley)
- VCA-certificaat of bereid dit te behalen
- Flexibele instelling en probleemoplossend vermogen

ARBEIDSVOORWAARDEN:
- Bruto maandsalaris tussen € 3.200 - € 4.000 afhankelijk van ervaring
- 8,33% vakantiegeld
- Pensioenregeling via PME
- 25 vakantiedagen + 13 ADV-dagen
- Doorgroeimogelijkheden naar Hoofdmonteur of Teamleider
- Opleidingskansen en cursussen
- Goede werksfeer in een hecht team

BEDRIJFSINFORMATIE:
Ons bedrijf is een toonaangevende producent van industriële componenten met 150 medewerkers. We leveren hoogwaardige producten aan de automotive en machinery sector in Nederland en Europa.`,

  q2_vacatureText: 'Allround Monteur gezocht voor productielocatie Eindhoven',
  
  // Realistic vacancy URL
  vacatureUrl: 'https://www.werkenbijexample.nl/vacatures/allround-monteur-eindhoven-123456',
  q3_vacatureUrl: 'https://www.werkenbijexample.nl/vacatures/allround-monteur-eindhoven-123456',
  
  // Simulate PDF upload (realistic Jobdigger-style data)
  pdfUpload: {
    name: 'Jobdigger_Arbeidsmarktrapport_Allround_Monteur_2024.pdf',
    path: '/uploads/pdf/jobdigger_report_' + Date.now() + '.pdf',
    size: 2456789,
    type: 'application/pdf',
    // Simulate actual PDF content that would be parsed
    mockContent: {
      jobTitle: 'Allround Monteur',
      salaryRange: '€42.000 - €48.000',
      experience: '3-5 jaar',
      education: 'MBO niveau 3/4',
      skills: ['Mechanica', 'Hydrauliek', 'Lassen', 'Troubleshooting'],
      marketDemand: 'Hoog',
      vacancies: 245,
      region: 'Brabant/Limburg'
    }
  },
  
  // Additional metadata
  ip: '85.144.xxx.xxx',
  user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  referrer: 'https://form.jotform.com/252881347421054',
  submit_button: 'Analyseer Arbeidsmarkt Data'
};

async function testRealisticSubmission() {
  console.log('🧪 Testing realistic Jotform submission...\n');
  
  console.log('📋 SUBMITTED DATA:');
  console.log('Job Title:', realisticJotformData.jobTitle);
  console.log('Vacancy Text:', realisticJotformData.vacatureText.length + ' characters');
  console.log('PDF File:', realisticJotformData.pdfUpload.name);
  console.log('PDF Size:', (realisticJotformData.pdfUpload.size / 1024).toFixed(0) + ' KB');
  console.log('Vacancy URL:', realisticJotformData.vacatureUrl);

  const postData = JSON.stringify(realisticJotformData);
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'lmi-webhook-server.onrender.com',
      port: 443,
      path: '/webhook/jotform',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'JotForm/1.0 (Real-Submission-Test)',
        'X-JotForm-Test': 'realistic-data'
      }
    };

    console.log('\n🚀 Sending to webhook:', 'https://lmi-webhook-server.onrender.com/webhook/jotform');
    console.log('⏱️ Processing...');

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        
        try {
          const parsed = JSON.parse(responseData);
          
          console.log('\n✅ WEBHOOK RESPONSE RECEIVED:');
          console.log('Status:', res.statusCode);
          console.log('Content-Type:', res.headers['content-type']);
          
          if (res.statusCode === 200) {
            console.log('\n📊 ANALYSIS RESULTS:');
            console.log('Success:', parsed.success);
            console.log('Message:', parsed.message || 'No specific message');
            
            if (parsed.reliabilityScore) {
              console.log('\n🎯 RELIABILITY SCORE:', parsed.reliabilityScore + '%');
              
              if (parsed.reliabilityScore >= 85) {
                console.log('✅ RELIABILITY CHECK: PASSED');
                console.log('Analysis should be complete with full workforce intelligence');
              } else {
                console.log('❌ RELIABILITY CHECK: FAILED');
                console.log('Score too low - analysis blocked (this is correct behavior)');
              }
            }
            
            if (parsed.analysis) {
              console.log('\n📈 MARKET ANALYSIS:');
              console.log('Job Title:', parsed.analysis.jobTitle);
              console.log('Location:', parsed.analysis.location);
              console.log('Has Market Data:', !!parsed.analysis.marketData);
              console.log('Has PDF Analysis:', !!parsed.analysis.pdfAnalysis);
              console.log('Has Workforce Data:', !!parsed.analysis.workforceData);
              
              if (parsed.analysis.marketData?.demandIndicators) {
                console.log('\n💼 DEMAND INDICATORS:');
                console.log('Current Openings:', parsed.analysis.marketData.demandIndicators.currentOpenings);
                console.log('Trend:', parsed.analysis.marketData.demandIndicators.trendDirection);
                console.log('Demand Score:', parsed.analysis.marketData.demandIndicators.demandScore + '/100');
              }
              
              if (parsed.analysis.marketData?.salaryBenchmarks) {
                console.log('\n💰 SALARY BENCHMARKS:');
                console.log('Median:', '€' + parsed.analysis.marketData.salaryBenchmarks.median?.toLocaleString());
                console.log('Range:', '€' + parsed.analysis.marketData.salaryBenchmarks.p25?.toLocaleString() + 
                           ' - €' + parsed.analysis.marketData.salaryBenchmarks.p75?.toLocaleString());
              }
            }
            
            if (parsed.report) {
              console.log('\n📄 PROFESSIONAL REPORT:');
              console.log('Length:', parsed.report.length + ' characters');
              console.log('Preview:', parsed.report.substring(0, 300) + '...');
            }
            
          } else {
            console.log('\n⚠️ NON-200 RESPONSE:');
            console.log('Status:', res.statusCode);
            console.log('Response:', parsed);
          }
          
        } catch (e) {
          console.log('\n📝 RAW RESPONSE:');
          console.log('Status:', res.statusCode);
          console.log('Body:', responseData.substring(0, 1000) + (responseData.length > 1000 ? '...' : ''));
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('\n❌ REQUEST ERROR:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Run the test
testRealisticSubmission().catch(console.error);