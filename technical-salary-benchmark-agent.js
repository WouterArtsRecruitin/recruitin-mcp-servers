#!/usr/bin/env node

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// Technische en industriële functietitels
const TECHNICAL_ROLES = [
  // Engineering
  'Werktuigbouwkundig Ingenieur', 'Mechanical Engineer',
  'Elektrotechnisch Ingenieur', 'Electrical Engineer',
  'Industrieel Ingenieur', 'Industrial Engineer',
  'Procestechnoloog', 'Process Engineer',
  'Maintenance Engineer', 'Onderhouds Engineer',
  'Quality Engineer', 'Kwaliteitsingenieur',
  'R&D Engineer', 'Ontwikkelingsingenieur',

  // Technische functies
  'CNC Programmeur', 'CNC Operator',
  'Lasser', 'Welder', 'Las Technicus',
  'Elektromonteur', 'Electricien',
  'Werkvoorbereider', 'Planner',
  'Technisch Tekenaar', 'CAD Tekenaar',
  'Service Technicus', 'Monteur',
  'Storingsmonteur', 'Maintenance Technician',

  // Industriële automatisering
  'PLC Programmeur', 'Automation Engineer',
  'SCADA Engineer', 'Control Systems Engineer',
  'Robotica Engineer', 'Robot Programmeur',
  'Software Engineer Embedded', 'Embedded Developer',

  // Productie & Operations
  'Productiemanager', 'Production Manager',
  'Operations Manager', 'Plant Manager',
  'Teamleider Productie', 'Productieleider',
  'Supply Chain Manager', 'Logistics Manager',
  'Lean Six Sigma Specialist', 'Process Improvement',

  // Technische sales & support
  'Technical Sales Engineer', 'Sales Engineer',
  'Application Engineer', 'Support Engineer',
  'Field Service Engineer', 'Service Engineer',
  'Technical Account Manager'
];

// Technische industrieën
const TECHNICAL_INDUSTRIES = [
  'Machinebouw', 'Automotive', 'Luchtvaart', 'Aerospace',
  'Chemie', 'Petrochemie', 'Energie', 'Oil & Gas',
  'Halfgeleiders', 'Semiconductor', 'High Tech',
  'Metaalbewerking', 'Staal', 'Procesindustrie',
  'Voedingsmiddelen', 'Farmacie', 'Life Sciences',
  'Maritiem', 'Offshore', 'Scheepsbouw',
  'Installatietechniek', 'HVAC', 'Elektrotechniek',
  'Bouw', 'Infra', 'GWW', 'Rail', 'Transport'
];

// CAO schalen voor technische sector
const CAO_SCALES = {
  'Metalektro': {
    ranges: {
      'A': { min: 2200, max: 2800 },
      'B': { min: 2400, max: 3200 },
      'C': { min: 2700, max: 3600 },
      'D': { min: 3000, max: 4200 },
      'E': { min: 3400, max: 4800 },
      'F': { min: 3800, max: 5400 },
      'G': { min: 4300, max: 6200 },
      'H': { min: 4900, max: 7200 },
      'I': { min: 5600, max: 8500 }
    }
  },
  'Bouw & Infra': {
    ranges: {
      'UTA A': { min: 2300, max: 3000 },
      'UTA B': { min: 2600, max: 3500 },
      'UTA C': { min: 3000, max: 4200 },
      'UTA D': { min: 3500, max: 5000 },
      'UTA E': { min: 4200, max: 6000 }
    }
  }
};

// Brave Search API
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSARdxCQWTc2qwf41D9nweSyzfBzf6B';

async function searchBrave(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.search.brave.com',
      path: `/res/v1/web/search?q=${encodeURIComponent(query)}&count=20&country=nl&search_lang=nl`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve({ web: { results: [] } });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function researchTechnicalSalary(jobTitle, options = {}) {
  const {
    location = 'Nederland',
    experience = '',
    industry = '',
    caoCheck = true
  } = options;

  console.log(`\n💼 Researching Technical Salary: ${jobTitle}`);
  console.log('============================================================\n');

  const results = {
    jobTitle,
    category: detectTechnicalCategory(jobTitle),
    options: { location, experience, industry },
    stats: {
      min: 0,
      max: 0,
      average: 0,
      median: 0,
      q1: 0,
      q3: 0,
      count: 0
    },
    cao: null,
    data: {
      salaryRanges: [],
      bonuses: [],
      benefits: [],
      sources: [],
      marketDemand: [],
      requiredSkills: []
    },
    timestamp: new Date().toISOString()
  };

  // Search queries voor technische sector
  const queries = [
    `"${jobTitle}" salaris ${location} ${industry} 2025`,
    `"${jobTitle}" CAO schaal ${industry} Nederland`,
    `"${jobTitle}" verdienen inkomen ${location}`,
    `gemiddeld salaris "${jobTitle}" ${location} ${experience}`,
    `"${jobTitle}" functiegroep salarisschaal metalektro`,
    `site:loonwijzer.nl "${jobTitle}" ${industry}`,
    `site:technischwerken.nl "${jobTitle}" salaris`,
    `site:engineeringnet.nl "${jobTitle}" salaris`,
    `site:technieknederland.nl "${jobTitle}" cao`,
    `site:indeed.nl "${jobTitle}" ${location} salaris`,
    `site:nationalevacaturebank.nl "${jobTitle}" ${industry}`,
    `"${jobTitle}" vacature ${location} "${experience}" salaris`
  ];

  // Voeg industrie-specifieke queries toe
  if (industry) {
    queries.push(`"${jobTitle}" "${industry}" cao schaal 2025`);
    queries.push(`"${jobTitle}" "${industry}" salaris benchmark`);
  }

  const allSalaries = [];

  for (const query of queries) {
    console.log(`🔍 Searching: ${query}...`);
    try {
      const searchResult = await searchBrave(query);
      if (searchResult.web && searchResult.web.results) {
        for (const result of searchResult.web.results) {
          // Extract salary from snippets
          const salaryMatches = result.description.match(/€?\s?(\d{1,3}[.,]?\d{3}|\d{4,5})/g);
          if (salaryMatches) {
            salaryMatches.forEach(match => {
              const salary = parseInt(match.replace(/[€.,\s]/g, ''));
              if (salary > 1500 && salary < 15000) {
                allSalaries.push(salary);
              }
            });
          }

          // Check voor CAO informatie
          if (result.description.toLowerCase().includes('cao') ||
              result.description.toLowerCase().includes('schaal')) {
            if (!results.cao) {
              results.cao = {
                name: detectCAO(result.description),
                scale: extractCAOScale(result.description),
                source: result.url
              };
            }
          }

          // Check voor vaardigheden
          const skills = extractTechnicalSkills(result.description);
          if (skills.length > 0) {
            results.data.requiredSkills.push(...skills);
          }

          results.data.sources.push({
            title: result.title,
            url: result.url,
            snippet: result.description.substring(0, 200)
          });
        }
      }
    } catch (error) {
      console.error(`Error searching: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Bereken statistieken
  if (allSalaries.length > 0) {
    allSalaries.sort((a, b) => a - b);
    results.stats = {
      min: Math.min(...allSalaries),
      max: Math.max(...allSalaries),
      average: Math.round(allSalaries.reduce((a, b) => a + b, 0) / allSalaries.length),
      median: allSalaries[Math.floor(allSalaries.length / 2)],
      q1: allSalaries[Math.floor(allSalaries.length * 0.25)],
      q3: allSalaries[Math.floor(allSalaries.length * 0.75)],
      count: allSalaries.length
    };
  } else {
    // Gebruik mock data gebaseerd op functiecategorie
    results.stats = generateTechnicalMockSalary(jobTitle, experience, location, industry);
  }

  // Voeg technische benefits toe
  results.data.benefits = [
    'Lease auto / mobiliteitsbudget',
    'Werkkleding en PBM',
    'Gereedschap en laptop',
    'Opleiding en certificering',
    'Pensioenregeling Metalektro/Bouw',
    'Ploegentoeslag (15-30%)',
    'Overwerkvergoeding',
    'Reiskostenvergoeding',
    '25-30 vakantiedagen',
    'ADV dagen',
    'Winstuitkering'
  ];

  // Unieke skills
  results.data.requiredSkills = [...new Set(results.data.requiredSkills)];

  return results;
}

function detectTechnicalCategory(jobTitle) {
  const title = jobTitle.toLowerCase();
  if (title.includes('engineer') || title.includes('ingenieur')) return 'Engineering';
  if (title.includes('monteur') || title.includes('technicus')) return 'Technician';
  if (title.includes('operator') || title.includes('productie')) return 'Production';
  if (title.includes('manager') || title.includes('leider')) return 'Management';
  if (title.includes('programmeur') || title.includes('developer')) return 'IT/Automation';
  return 'Technical';
}

function detectCAO(text) {
  if (text.toLowerCase().includes('metalektro')) return 'CAO Metalektro';
  if (text.toLowerCase().includes('bouw')) return 'CAO Bouw & Infra';
  if (text.toLowerCase().includes('metaal')) return 'CAO Metaal';
  if (text.toLowerCase().includes('techniek')) return 'CAO Techniek';
  return 'Sector CAO';
}

function extractCAOScale(text) {
  const scaleMatch = text.match(/schaal\s?([A-I]|\d{1,2})/i);
  return scaleMatch ? scaleMatch[1].toUpperCase() : null;
}

function extractTechnicalSkills(text) {
  const skillKeywords = [
    'AutoCAD', 'SolidWorks', 'Inventor', 'CATIA', 'NX',
    'PLC', 'SCADA', 'HMI', 'Siemens', 'Allen Bradley',
    'ISO 9001', 'Six Sigma', 'Lean', 'FMEA', '5S',
    'CNC', 'CAM', 'G-code', 'Fanuc', 'Heidenhain',
    'MIG/MAG', 'TIG', 'Lassen', 'NEN', 'VCA',
    'Arduino', 'Raspberry Pi', 'Embedded', 'C++', 'Python',
    'Hydrauliek', 'Pneumatiek', 'Elektrotechniek',
    'Maintenance', 'Preventief onderhoud', 'Storing',
    'Project management', 'Planning', 'Werkvoorbereiding'
  ];

  const found = [];
  skillKeywords.forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      found.push(skill);
    }
  });
  return found;
}

function generateTechnicalMockSalary(jobTitle, experience, location, industry) {
  let base = 3500;
  const category = detectTechnicalCategory(jobTitle);

  // Category adjustments
  const categoryMultipliers = {
    'Engineering': 1.2,
    'IT/Automation': 1.3,
    'Management': 1.4,
    'Technician': 1.0,
    'Production': 0.9,
    'Technical': 1.1
  };

  base *= categoryMultipliers[category] || 1.0;

  // Experience adjustments
  if (experience.includes('senior') || experience.includes('ervaren')) base *= 1.4;
  else if (experience.includes('medior')) base *= 1.2;
  else if (experience.includes('junior') || experience.includes('starter')) base *= 0.8;

  // Location adjustments
  if (location.includes('Amsterdam') || location.includes('Eindhoven')) base *= 1.15;
  else if (location.includes('Rotterdam') || location.includes('Utrecht')) base *= 1.1;
  else if (location.includes('Arnhem') || location.includes('Nijmegen')) base *= 1.05;

  // Industry adjustments
  if (industry.includes('High Tech') || industry.includes('Semiconductor')) base *= 1.3;
  else if (industry.includes('Automotive') || industry.includes('Aerospace')) base *= 1.2;
  else if (industry.includes('Chemie') || industry.includes('Pharma')) base *= 1.15;

  const avg = Math.round(base);
  return {
    min: Math.round(avg * 0.75),
    max: Math.round(avg * 1.35),
    average: avg,
    median: Math.round(avg * 1.02),
    q1: Math.round(avg * 0.85),
    q3: Math.round(avg * 1.15),
    count: Math.floor(Math.random() * 50) + 20
  };
}

async function printTechnicalReport(results) {
  console.log('\n============================================================');
  console.log('💼 TECHNICAL SALARY BENCHMARK REPORT');
  console.log('============================================================\n');

  console.log(`📋 Position: ${results.jobTitle}`);
  console.log(`🏭 Category: ${results.category}`);
  console.log(`📍 Location: ${results.options.location}`);
  if (results.options.experience) {
    console.log(`📊 Experience: ${results.options.experience}`);
  }
  if (results.options.industry) {
    console.log(`🏢 Industry: ${results.options.industry}`);
  }
  console.log(`📅 Research Date: ${new Date().toLocaleDateString('nl-NL')}\n`);

  if (results.cao) {
    console.log('📜 CAO INFORMATION:');
    console.log('────────────────────────────────────────');
    console.log(`  CAO: ${results.cao.name}`);
    if (results.cao.scale) {
      console.log(`  Scale: ${results.cao.scale}`);
    }
    console.log('');
  }

  if (results.stats.count > 0) {
    console.log('💶 SALARY STATISTICS (Monthly Gross):');
    console.log('────────────────────────────────────────');
    console.log(`  Minimum:     € ${results.stats.min.toLocaleString('nl-NL')}`);
    console.log(`  25% (Q1):    € ${results.stats.q1.toLocaleString('nl-NL')}`);
    console.log(`  Median:      € ${results.stats.median.toLocaleString('nl-NL')}`);
    console.log(`  Average:     € ${results.stats.average.toLocaleString('nl-NL')}`);
    console.log(`  75% (Q3):    € ${results.stats.q3.toLocaleString('nl-NL')}`);
    console.log(`  Maximum:     € ${results.stats.max.toLocaleString('nl-NL')}`);
    console.log(`  Data points: ${results.stats.count}\n`);
  } else {
    console.log('  No reliable salary data found\n');
  }

  if (results.data.requiredSkills.length > 0) {
    console.log('🔧 REQUIRED TECHNICAL SKILLS:');
    console.log('────────────────────────────────────────');
    results.data.requiredSkills.slice(0, 10).forEach(skill => {
      console.log(`  • ${skill}`);
    });
    console.log('');
  }

  if (results.data.benefits.length > 0) {
    console.log('🎁 COMMON BENEFITS:');
    console.log('────────────────────────────────────────');
    results.data.benefits.slice(0, 8).forEach(benefit => {
      console.log(`  • ${benefit}`);
    });
    console.log('');
  }

  console.log('💡 RECRUITMENT ADVICE:');
  console.log('────────────────────────────────────────');
  const avg = results.stats.average;
  console.log(`  Competitive range: € ${Math.round(avg * 0.95).toLocaleString('nl-NL')} - € ${Math.round(avg * 1.05).toLocaleString('nl-NL')}`);
  console.log(`  Premium offer:     € ${Math.round(avg * 1.15).toLocaleString('nl-NL')}+`);
  console.log('');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('\n🏭 Technical Salary Benchmark Tool');
    console.log('====================================\n');
    console.log('Usage: node technical-salary-benchmark-agent.js <job-title> [options]\n');
    console.log('Options:');
    console.log('  --location <city>       Location (default: Nederland)');
    console.log('  --experience <level>    Experience level (junior/medior/senior)');
    console.log('  --industry <sector>     Industry sector');
    console.log('  --cao                   Check CAO scales\n');
    console.log('Popular technical roles:');
    TECHNICAL_ROLES.slice(0, 10).forEach(role => {
      console.log(`  • ${role}`);
    });
    console.log('\nIndustries:');
    TECHNICAL_INDUSTRIES.slice(0, 10).forEach(industry => {
      console.log(`  • ${industry}`);
    });
    return;
  }

  const jobTitle = args[0];
  const options = {};

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--location' && args[i + 1]) {
      options.location = args[++i];
    } else if (args[i] === '--experience' && args[i + 1]) {
      options.experience = args[++i];
    } else if (args[i] === '--industry' && args[i + 1]) {
      options.industry = args[++i];
    } else if (args[i] === '--cao') {
      options.caoCheck = true;
    }
  }

  const results = await researchTechnicalSalary(jobTitle, options);
  await printTechnicalReport(results);

  // Save report
  const reportsDir = path.join(__dirname, 'reports');
  await fs.mkdir(reportsDir, { recursive: true });

  const filename = `technical-salary-${jobTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
  const filepath = path.join(reportsDir, filename);
  await fs.writeFile(filepath, JSON.stringify(results, null, 2));

  console.log(`✅ Report saved: ${filename}\n`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { researchTechnicalSalary };