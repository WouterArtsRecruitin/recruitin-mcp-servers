#!/usr/bin/env node

/**
 * Simple Prospect Search using Brave API
 * For Recruitin - info@recruitin.nl
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BRAVE_API_KEY = 'BSARdxCQWTc2qwf41D9nweSyzfBzf6B';

// Function to search using Brave API
function searchBrave(query) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      q: query,
      count: 20,
      country: 'nl',
      search_lang: 'nl'
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

// Main function to research a company
async function researchCompany(companyName) {
  console.log(`\n🔍 Researching: ${companyName}`);
  console.log('=' . repeat(50));

  const searches = [
    `"${companyName}" contact email telefoon nederland`,
    `"${companyName}" "over ons" bedrijf`,
    `"${companyName}" CEO directeur manager`,
    `"${companyName}" vacature werken bij`,
    `"${companyName}" linkedin.com/company`,
    `"${companyName}" nieuws 2025`
  ];

  const results = {
    company: companyName,
    timestamp: new Date().toISOString(),
    contacts: {
      emails: new Set(),
      phones: new Set(),
      addresses: []
    },
    social: {
      linkedin: null,
      twitter: null
    },
    personnel: [],
    jobs: [],
    news: [],
    websites: new Set()
  };

  // Execute searches
  for (const query of searches) {
    console.log(`\n📌 Searching: ${query.substring(0, 50)}...`);

    try {
      const searchResults = await searchBrave(query);

      // Process results
      for (const result of searchResults) {
        const text = `${result.title} ${result.description}`.toLowerCase();
        const url = result.url;

        // Extract emails
        const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emailMatches) {
          emailMatches.forEach(email => results.contacts.emails.add(email));
        }

        // Extract phone numbers
        const phoneMatches = text.match(/(?:\+31|0031|0)[1-9](?:[0-9]\s?){8}/g);
        if (phoneMatches) {
          phoneMatches.forEach(phone => results.contacts.phones.add(phone));
        }

        // Extract LinkedIn
        if (url.includes('linkedin.com/company/') && !results.social.linkedin) {
          results.social.linkedin = url;
        }

        // Extract Twitter
        if ((url.includes('twitter.com/') || url.includes('x.com/')) && !results.social.twitter) {
          results.social.twitter = url;
        }

        // Extract personnel
        const titlePatterns = [
          { regex: /ceo/i, role: 'CEO' },
          { regex: /cfo/i, role: 'CFO' },
          { regex: /cto/i, role: 'CTO' },
          { regex: /hr\s+(?:director|manager)/i, role: 'HR Manager' },
          { regex: /recruitment\s+(?:manager|lead)/i, role: 'Recruitment Manager' }
        ];

        for (const pattern of titlePatterns) {
          if (pattern.regex.test(text)) {
            // Try to extract name
            const nameMatch = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
            if (nameMatch) {
              results.personnel.push({
                name: nameMatch[1],
                role: pattern.role,
                source: url
              });
            }
          }
        }

        // Extract job postings
        if (query.includes('vacature') && url.includes('linkedin.com/jobs')) {
          results.jobs.push({
            title: result.title,
            url: url
          });
        }

        // Extract news
        if (query.includes('nieuws')) {
          results.news.push({
            title: result.title,
            url: url,
            snippet: result.description
          });
        }

        // Collect websites
        const domain = new URL(url).hostname;
        if (!domain.includes('linkedin') && !domain.includes('twitter') && !domain.includes('facebook')) {
          results.websites.add(domain);
        }
      }

      // Wait between searches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Error searching: ${error.message}`);
    }
  }

  // Convert Sets to Arrays
  results.contacts.emails = Array.from(results.contacts.emails);
  results.contacts.phones = Array.from(results.contacts.phones);
  results.websites = Array.from(results.websites);

  // Generate report
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESEARCH RESULTS');
  console.log('='.repeat(50));

  console.log(`\n🏢 Company: ${companyName}`);
  console.log(`📅 Date: ${new Date().toLocaleDateString('nl-NL')}`);

  console.log('\n📧 Contact Information:');
  console.log(`  Emails: ${results.contacts.emails.length > 0 ? results.contacts.emails.join(', ') : 'None found'}`);
  console.log(`  Phones: ${results.contacts.phones.length > 0 ? results.contacts.phones.join(', ') : 'None found'}`);

  console.log('\n🌐 Online Presence:');
  console.log(`  LinkedIn: ${results.social.linkedin || 'Not found'}`);
  console.log(`  Twitter: ${results.social.twitter || 'Not found'}`);
  console.log(`  Websites: ${results.websites.length > 0 ? results.websites.slice(0, 3).join(', ') : 'None found'}`);

  console.log('\n👥 Key Personnel:');
  if (results.personnel.length > 0) {
    results.personnel.slice(0, 5).forEach(person => {
      console.log(`  - ${person.name} (${person.role})`);
    });
  } else {
    console.log('  No personnel identified');
  }

  console.log('\n💼 Active Jobs:');
  if (results.jobs.length > 0) {
    console.log(`  Found ${results.jobs.length} job postings`);
    results.jobs.slice(0, 3).forEach(job => {
      console.log(`  - ${job.title.substring(0, 60)}...`);
    });
  } else {
    console.log('  No job postings found');
  }

  console.log('\n📰 Recent News:');
  if (results.news.length > 0) {
    results.news.slice(0, 3).forEach(news => {
      console.log(`  - ${news.title.substring(0, 60)}...`);
    });
  } else {
    console.log('  No recent news found');
  }

  // Save results to file
  const fileName = `prospect-${companyName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
  const filePath = path.join(__dirname, 'reports', fileName);

  try {
    await fs.mkdir(path.join(__dirname, 'reports'), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(results, null, 2));
    console.log(`\n✅ Report saved: reports/${fileName}`);
  } catch (error) {
    console.error('Error saving report:', error);
  }

  return results;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('\nUsage: node simple-prospect-search.js "Company Name"');
    console.log('Example: node simple-prospect-search.js "ASML"');
    process.exit(1);
  }

  const companyName = args.join(' ');
  await researchCompany(companyName);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { researchCompany, searchBrave };