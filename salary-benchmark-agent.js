#!/usr/bin/env node

/**
 * 💰 SALARY BENCHMARK AGENT
 * Real-time salary data for Dutch job market
 * For Recruitin - info@recruitin.nl
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BRAVE_API_KEY = 'BSARdxCQWTc2qwf41D9nweSyzfBzf6B';

// Function to search using Brave API
function searchBrave(query, freshness = 'py') {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      q: query,
      count: 30,
      country: 'nl',
      search_lang: 'nl',
      freshness: freshness // py = past year, pm = past month
    });

    const options = {
      hostname: 'api.search.brave.com',
      port: 443,
      path: `/res/v1/web/search?${params}`,
      method: 'GET',
      headers: {
        'X-Subscription-Token': BRAVE_API_KEY,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData.web?.results || []);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Main salary research function
async function researchSalary(jobTitle, options = {}) {
  const {
    location = 'Nederland',
    experience = '',
    industry = '',
    includeBonus = true
  } = options;

  console.log(`\n💰 Researching Salary: ${jobTitle}`);
  console.log('=' . repeat(60));

  // Build search queries
  const queries = [
    // Direct salary searches
    `"${jobTitle}" salaris ${location} 2025`,
    `"${jobTitle}" salaris ${location} 2024`,
    `"${jobTitle}" verdien inkomen ${location}`,
    `gemiddeld salaris "${jobTitle}" ${location}`,

    // CAO and scale searches
    `"${jobTitle}" cao schaal ${location}`,
    `"${jobTitle}" functiegroep salarisschaal`,

    // Job sites with salary info
    `site:indeed.nl "${jobTitle}" salaris`,
    `site:nationalevacaturebank.nl "${jobTitle}" salaris`,
    `site:glassdoor.nl "${jobTitle}" salaris`,

    // Benchmark sites
    `site:loonwijzer.nl "${jobTitle}"`,
    `site:intermediair.nl "${jobTitle}" salaris`,
    `site:monsterboard.nl "${jobTitle}" salaris`
  ];

  // Add experience level if specified
  if (experience) {
    queries.push(`"${jobTitle}" ${experience} jaar ervaring salaris ${location}`);
    queries.push(`"${jobTitle}" ${experience} salaris ${location}`);
  }

  // Add industry if specified
  if (industry) {
    queries.push(`"${jobTitle}" ${industry} salaris ${location}`);
  }

  // Collect all salary data
  const salaryData = {
    jobTitle: jobTitle,
    location: location,
    experience: experience,
    industry: industry,
    timestamp: new Date().toISOString(),
    salaryRanges: [],
    averages: [],
    sources: [],
    bonuses: [],
    benefits: [],
    trends: []
  };

  // Execute searches
  for (const query of queries) {
    console.log(`\n🔍 Searching: ${query.substring(0, 60)}...`);

    try {
      const results = await searchBrave(query);

      for (const result of results) {
        const text = `${result.title} ${result.description}`.toLowerCase();
        const url = result.url;

        // Extract salary amounts (EUR)
        const salaryPatterns = [
          /€\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:tot|\/|-)\s*€?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/gi,
          /€\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:per maand|bruto|netto)/gi,
          /(\d{1,3}(?:\.\d{3})*)\s*(?:tot|-)\s*(\d{1,3}(?:\.\d{3})*)\s*euro/gi,
          /salaris(?:.*?)(\d{1,3}(?:\.\d{3})*)/gi
        ];

        for (const pattern of salaryPatterns) {
          const matches = [...text.matchAll(pattern)];
          for (const match of matches) {
            if (match[1]) {
              const amount1 = parseInt(match[1].replace(/\./g, '').replace(',', ''));
              const amount2 = match[2] ? parseInt(match[2].replace(/\./g, '').replace(',', '')) : null;

              // Filter realistic amounts (between 1500 and 15000 per month)
              if (amount1 >= 1500 && amount1 <= 15000) {
                salaryData.salaryRanges.push({
                  min: amount1,
                  max: amount2 || amount1,
                  source: url,
                  title: result.title
                });
              }
            }
          }
        }

        // Extract average/median
        if (text.includes('gemiddeld') || text.includes('mediaan')) {
          const avgMatch = text.match(/(?:gemiddeld|mediaan)(?:.*?)€?\s*(\d{1,3}(?:\.\d{3})*)/);
          if (avgMatch) {
            const avg = parseInt(avgMatch[1].replace(/\./g, ''));
            if (avg >= 1500 && avg <= 15000) {
              salaryData.averages.push(avg);
            }
          }
        }

        // Extract bonus information
        if (text.includes('bonus') || text.includes('13e maand') || text.includes('vakantiegeld')) {
          const bonusInfo = [];
          if (text.includes('13e maand')) bonusInfo.push('13e maand');
          if (text.includes('vakantiegeld')) bonusInfo.push('8% vakantiegeld');
          if (text.includes('bonus')) {
            const bonusMatch = text.match(/bonus(?:.*?)(\d+)%/);
            if (bonusMatch) bonusInfo.push(`${bonusMatch[1]}% bonus`);
          }
          if (bonusInfo.length > 0) {
            salaryData.bonuses.push(...bonusInfo);
          }
        }

        // Extract benefits
        const benefitKeywords = [
          'lease auto', 'leaseauto', 'auto van de zaak',
          'pensioen', 'thuiswerk', 'flexibel',
          'opleiding', 'training', 'ontwikkel',
          'laptop', 'telefoon', 'sportabonnement'
        ];

        for (const benefit of benefitKeywords) {
          if (text.includes(benefit)) {
            salaryData.benefits.push(benefit);
          }
        }

        // Track sources
        if (url.includes('indeed.') || url.includes('glassdoor') || url.includes('loonwijzer') ||
            url.includes('nationalevacaturebank') || url.includes('intermediair')) {
          salaryData.sources.push({
            name: new URL(url).hostname.replace('www.', '').replace('.nl', '').replace('.com', ''),
            url: url
          });
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }

  // Calculate statistics
  const stats = calculateSalaryStatistics(salaryData);

  // Generate report
  generateSalaryReport(jobTitle, salaryData, stats, options);

  return { salaryData, stats };
}

// Calculate salary statistics
function calculateSalaryStatistics(data) {
  const allSalaries = [];

  // Collect all salary points
  data.salaryRanges.forEach(range => {
    allSalaries.push(range.min);
    if (range.max > range.min) {
      allSalaries.push(range.max);
      allSalaries.push((range.min + range.max) / 2); // midpoint
    }
  });

  allSalaries.push(...data.averages);

  if (allSalaries.length === 0) {
    return {
      min: 0,
      max: 0,
      average: 0,
      median: 0,
      q1: 0,
      q3: 0,
      count: 0
    };
  }

  // Sort for quartiles
  allSalaries.sort((a, b) => a - b);

  const stats = {
    min: Math.min(...allSalaries),
    max: Math.max(...allSalaries),
    average: Math.round(allSalaries.reduce((a, b) => a + b, 0) / allSalaries.length),
    median: allSalaries[Math.floor(allSalaries.length / 2)],
    q1: allSalaries[Math.floor(allSalaries.length * 0.25)],
    q3: allSalaries[Math.floor(allSalaries.length * 0.75)],
    count: allSalaries.length
  };

  return stats;
}

// Generate detailed salary report
function generateSalaryReport(jobTitle, data, stats, options) {
  console.log('\n' + '='.repeat(60));
  console.log('💰 SALARY BENCHMARK REPORT');
  console.log('='.repeat(60));

  console.log(`\n📋 Position: ${jobTitle}`);
  console.log(`📍 Location: ${options.location || 'Nederland'}`);
  if (options.experience) console.log(`📊 Experience: ${options.experience}`);
  if (options.industry) console.log(`🏢 Industry: ${options.industry}`);
  console.log(`📅 Research Date: ${new Date().toLocaleDateString('nl-NL')}`);

  console.log('\n💶 SALARY STATISTICS (Monthly Gross):');
  console.log('─'.repeat(40));

  if (stats.count > 0) {
    console.log(`  Minimum:     €${stats.min.toLocaleString('nl-NL')}`);
    console.log(`  25% earn <   €${stats.q1.toLocaleString('nl-NL')}`);
    console.log(`  Median:      €${stats.median.toLocaleString('nl-NL')}`);
    console.log(`  Average:     €${stats.average.toLocaleString('nl-NL')}`);
    console.log(`  75% earn <   €${stats.q3.toLocaleString('nl-NL')}`);
    console.log(`  Maximum:     €${stats.max.toLocaleString('nl-NL')}`);

    // Annual calculation
    console.log('\n💼 ANNUAL ESTIMATES:');
    console.log('─'.repeat(40));
    const annual = stats.average * 12;
    const with13th = annual * 1.08; // Including vacation money
    const withBonus = annual * 1.15; // Rough estimate with bonuses

    console.log(`  Base (12x):           €${annual.toLocaleString('nl-NL')}`);
    console.log(`  With vacation (8%):   €${Math.round(with13th).toLocaleString('nl-NL')}`);
    console.log(`  With bonuses (~15%):  €${Math.round(withBonus).toLocaleString('nl-NL')}`);
  } else {
    console.log('  No reliable salary data found');
  }

  // Show top salary ranges found
  if (data.salaryRanges.length > 0) {
    console.log('\n📊 TOP SALARY RANGES FOUND:');
    console.log('─'.repeat(40));

    // Deduplicate and sort
    const uniqueRanges = [];
    const seen = new Set();

    data.salaryRanges.forEach(range => {
      const key = `${range.min}-${range.max}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRanges.push(range);
      }
    });

    uniqueRanges
      .sort((a, b) => b.min - a.min)
      .slice(0, 5)
      .forEach(range => {
        if (range.max > range.min) {
          console.log(`  €${range.min.toLocaleString('nl-NL')} - €${range.max.toLocaleString('nl-NL')}`);
          console.log(`    Source: ${range.title.substring(0, 50)}...`);
        } else {
          console.log(`  €${range.min.toLocaleString('nl-NL')}`);
          console.log(`    Source: ${range.title.substring(0, 50)}...`);
        }
      });
  }

  // Show bonuses and benefits
  if (data.bonuses.length > 0 || data.benefits.length > 0) {
    console.log('\n🎁 COMPENSATION EXTRAS:');
    console.log('─'.repeat(40));

    if (data.bonuses.length > 0) {
      const uniqueBonuses = [...new Set(data.bonuses)];
      console.log('  Bonuses:');
      uniqueBonuses.forEach(bonus => console.log(`    • ${bonus}`));
    }

    if (data.benefits.length > 0) {
      const uniqueBenefits = [...new Set(data.benefits)];
      console.log('  Benefits:');
      uniqueBenefits.slice(0, 8).forEach(benefit => console.log(`    • ${benefit}`));
    }
  }

  // Show sources
  if (data.sources.length > 0) {
    console.log('\n📚 DATA SOURCES:');
    console.log('─'.repeat(40));

    const uniqueSources = [];
    const seenSources = new Set();

    data.sources.forEach(source => {
      if (!seenSources.has(source.name)) {
        seenSources.add(source.name);
        uniqueSources.push(source);
      }
    });

    uniqueSources.slice(0, 5).forEach(source => {
      console.log(`  • ${source.name}`);
    });
  }

  console.log('\n💡 INSIGHTS:');
  console.log('─'.repeat(40));

  // Provide insights based on data
  if (stats.count > 0) {
    const spread = stats.q3 - stats.q1;
    if (spread > 1000) {
      console.log('  ⚠️  Large salary spread indicates varied experience levels');
    }

    if (stats.median > stats.average) {
      console.log('  📈 Median > Average: Some high earners pull up the average');
    } else if (stats.average > stats.median * 1.1) {
      console.log('  📉 Average > Median: Some low earners pull down the median');
    }

    // Market positioning advice
    console.log(`\n  Recruitment Advice:`);
    console.log(`  • Competitive offer: €${Math.round(stats.median * 1.05).toLocaleString('nl-NL')} - €${Math.round(stats.q3).toLocaleString('nl-NL')}`);
    console.log(`  • Premium offer: €${Math.round(stats.q3 * 1.1).toLocaleString('nl-NL')}+`);
  }

  // Save to file
  saveReport(jobTitle, data, stats, options);
}

// Save report to file
async function saveReport(jobTitle, data, stats, options) {
  const reportData = {
    jobTitle,
    options,
    stats,
    data: {
      salaryRanges: data.salaryRanges.slice(0, 20),
      bonuses: [...new Set(data.bonuses)],
      benefits: [...new Set(data.benefits)].slice(0, 20),
      sources: data.sources.slice(0, 10)
    },
    timestamp: new Date().toISOString()
  };

  const fileName = `salary-${jobTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
  const filePath = path.join(__dirname, 'reports', fileName);

  try {
    await fs.mkdir(path.join(__dirname, 'reports'), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(reportData, null, 2));
    console.log(`\n✅ Report saved: reports/${fileName}`);
  } catch (error) {
    console.error('Error saving report:', error);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('\nUsage: node salary-benchmark-agent.js "Job Title" [options]');
    console.log('\nExamples:');
    console.log('  node salary-benchmark-agent.js "Software Engineer"');
    console.log('  node salary-benchmark-agent.js "HR Manager" --location Amsterdam');
    console.log('  node salary-benchmark-agent.js "Data Scientist" --experience "3-5"');
    console.log('  node salary-benchmark-agent.js "Project Manager" --industry "IT"');
    console.log('\nCommon job titles to research:');
    console.log('  • Software Engineer / Developer / Programmeur');
    console.log('  • Data Scientist / Data Analyst');
    console.log('  • Project Manager / Scrum Master');
    console.log('  • HR Manager / Recruiter');
    console.log('  • Sales Manager / Account Manager');
    console.log('  • Marketing Manager / Digital Marketer');
    console.log('  • Finance Manager / Controller');
    console.log('  • Operations Manager');
    process.exit(0);
  }

  // Parse arguments
  const jobTitle = args[0];
  const options = {};

  for (let i = 1; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case '--location':
      case '-l':
        options.location = value;
        break;
      case '--experience':
      case '-e':
        options.experience = value;
        break;
      case '--industry':
      case '-i':
        options.industry = value;
        break;
    }
  }

  // Run research
  await researchSalary(jobTitle, options);
}

// Export for use in other modules
module.exports = {
  researchSalary,
  calculateSalaryStatistics
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}