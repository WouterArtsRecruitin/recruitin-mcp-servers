#!/usr/bin/env node

/**
 * 🔍 PROSPECT INTELLIGENCE AGENT
 * Automated company and contact research using Brave Search
 * For Recruitin - info@recruitin.nl
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Import fetch properly for Node.js
let fetch;
(async () => {
  const fetchModule = await import('node-fetch');
  fetch = fetchModule.default;
})();

const app = express();
const PORT = 3017;

// Configuration
const CONFIG = {
  braveApiKey: process.env.BRAVE_API_KEY || 'BSARdxCQWTc2qwf41D9nweSyzfBzf6B',
  baseUrl: 'https://api.search.brave.com/res/v1',
  reportsDir: path.join(__dirname, 'reports'),
  cacheDir: path.join(__dirname, 'cache', 'prospects'),
  oneDriveDir: '/Users/wouterarts/Library/CloudStorage/OneDrive-Recruitin/Prospect Intelligence'
};

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(CONFIG.reportsDir, { recursive: true });
  await fs.mkdir(CONFIG.cacheDir, { recursive: true });
  await fs.mkdir(CONFIG.oneDriveDir, { recursive: true });
}

/**
 * Research company with multiple search queries
 */
async function researchCompany(companyName, options = {}) {
  const {
    deepSearch = true,
    includeNews = true,
    includeJobs = true,
    includeSocial = true,
    country = 'nl'
  } = options;

  console.log(`\n🔍 Researching: ${companyName}`);

  const searchQueries = [
    // Basic company info
    `"${companyName}" bedrijf nederland site:.nl`,
    `"${companyName}" "over ons" OR "about us"`,
    `"${companyName}" kvk nummer OR "chamber of commerce"`,

    // Contact information
    `"${companyName}" contact email telefoon adres`,
    `"${companyName}" "hoofdkantoor" OR "headquarters" nederland`,

    // Key personnel
    `"${companyName}" CEO OR directeur OR "managing director"`,
    `"${companyName}" "HR manager" OR "HR director" OR "recruitment manager"`,
    `"${companyName}" linkedin.com/in/ -jobs`,

    // Company size & culture
    `"${companyName}" "aantal medewerkers" OR "employees" OR "FTE"`,
    `"${companyName}" "company culture" OR "bedrijfscultuur" OR "werken bij"`,

    // Financial & growth
    `"${companyName}" omzet OR revenue OR "jaarverslag"`,
    `"${companyName}" investering OR funding OR "private equity"`,
    `"${companyName}" groei OR expansion OR "nieuwe vestiging"`,

    // Technology & tools
    `"${companyName}" "tech stack" OR technologie OR software`,
    `"${companyName}" SAP OR Salesforce OR Microsoft OR Oracle`,

    // Industry & competition
    `"${companyName}" branche OR sector OR industrie`,
    `"${companyName}" concurrent OR competitor OR marktpositie`,

    // Recent developments
    `"${companyName}" nieuws ${new Date().getFullYear()}`,
    `"${companyName}" "persbericht" OR "press release" recent`
  ];

  // Add optional searches
  if (includeJobs) {
    searchQueries.push(
      `"${companyName}" vacature OR vacancy site:linkedin.com`,
      `"${companyName}" "werken bij" OR careers`,
      `"${companyName}" recruitment OR "hiring" OR "zoeken wij"`
    );
  }

  if (includeSocial) {
    searchQueries.push(
      `"${companyName}" site:linkedin.com/company/`,
      `"${companyName}" site:twitter.com OR site:x.com`,
      `"${companyName}" site:facebook.com`,
      `"${companyName}" site:instagram.com`,
      `"${companyName}" site:youtube.com`
    );
  }

  if (includeNews) {
    searchQueries.push(
      `"${companyName}" site:nu.nl OR site:nos.nl OR site:rtlnieuws.nl`,
      `"${companyName}" site:fd.nl OR site:telegraaf.nl`,
      `"${companyName}" acquisition OR overname OR merger`
    );
  }

  // Execute searches
  const searchResults = {};
  for (const query of searchQueries) {
    try {
      const results = await performSearch(query, country);
      const category = categorizeQuery(query);

      if (!searchResults[category]) {
        searchResults[category] = [];
      }

      searchResults[category].push(...results);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error searching "${query}":`, error.message);
    }
  }

  // Analyze and structure the data
  const intelligence = await analyzeCompanyData(companyName, searchResults);

  return intelligence;
}

/**
 * Perform individual search
 */
async function performSearch(query, country = 'nl') {
  const params = new URLSearchParams({
    q: query,
    count: 10,
    country: country,
    search_lang: 'nl',
    ui_lang: 'nl'
  });

  const response = await fetch(`${CONFIG.baseUrl}/web/search?${params}`, {
    headers: {
      'X-Subscription-Token': CONFIG.braveApiKey,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  const data = await response.json();

  return (data.web?.results || []).map(result => ({
    title: result.title,
    url: result.url,
    description: result.description,
    domain: new URL(result.url).hostname,
    query: query
  }));
}

/**
 * Categorize search query
 */
function categorizeQuery(query) {
  if (query.includes('CEO') || query.includes('directeur') || query.includes('manager')) return 'personnel';
  if (query.includes('contact') || query.includes('email') || query.includes('telefoon')) return 'contact';
  if (query.includes('kvk') || query.includes('chamber')) return 'registration';
  if (query.includes('omzet') || query.includes('revenue') || query.includes('investering')) return 'financial';
  if (query.includes('vacature') || query.includes('vacancy') || query.includes('hiring')) return 'jobs';
  if (query.includes('linkedin.com') || query.includes('twitter.com') || query.includes('facebook')) return 'social';
  if (query.includes('nieuws') || query.includes('news') || query.includes('persbericht')) return 'news';
  if (query.includes('tech') || query.includes('software') || query.includes('SAP')) return 'technology';
  if (query.includes('medewerkers') || query.includes('employees') || query.includes('culture')) return 'culture';
  if (query.includes('sector') || query.includes('branche') || query.includes('concurrent')) return 'industry';
  return 'general';
}

/**
 * Analyze company data and extract intelligence
 */
async function analyzeCompanyData(companyName, searchResults) {
  const intelligence = {
    companyName: companyName,
    timestamp: new Date().toISOString(),

    // Basic Information
    basicInfo: {
      domains: extractDomains(searchResults),
      locations: extractLocations(searchResults),
      kvkNumber: extractKvkNumber(searchResults),
      industry: extractIndustry(searchResults),
      companySize: extractCompanySize(searchResults)
    },

    // Contact Information
    contacts: {
      emails: extractEmails(searchResults),
      phones: extractPhones(searchResults),
      addresses: extractAddresses(searchResults),
      website: extractMainWebsite(searchResults)
    },

    // Key Personnel
    personnel: extractPersonnel(searchResults),

    // Social Media
    socialMedia: {
      linkedin: extractSocialProfile(searchResults, 'linkedin'),
      twitter: extractSocialProfile(searchResults, 'twitter'),
      facebook: extractSocialProfile(searchResults, 'facebook'),
      instagram: extractSocialProfile(searchResults, 'instagram'),
      youtube: extractSocialProfile(searchResults, 'youtube')
    },

    // Financial & Growth
    financial: {
      revenue: extractFinancialInfo(searchResults, 'revenue'),
      funding: extractFinancialInfo(searchResults, 'funding'),
      growth: extractGrowthSignals(searchResults)
    },

    // Technology Stack
    technology: extractTechnologyStack(searchResults),

    // Recruitment Activity
    recruitment: {
      activeJobs: extractJobPostings(searchResults),
      hiringSignals: extractHiringSignals(searchResults),
      jobBoards: extractJobBoards(searchResults)
    },

    // Recent News & Developments
    recentNews: extractRecentNews(searchResults),

    // Competition & Market
    market: {
      competitors: extractCompetitors(searchResults),
      marketPosition: extractMarketPosition(searchResults)
    },

    // Intelligence Score
    scores: calculateIntelligenceScores(searchResults),

    // Raw search results for reference
    rawResults: searchResults
  };

  return intelligence;
}

// Extraction helper functions
function extractDomains(results) {
  const domains = new Set();
  Object.values(results).flat().forEach(r => {
    if (r.domain && !r.domain.includes('linkedin.com') && !r.domain.includes('facebook.com')) {
      domains.add(r.domain);
    }
  });
  return Array.from(domains);
}

function extractLocations(results) {
  const locations = new Set();
  const locationPatterns = [
    /(\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*Nederland/g,
    /Amsterdam|Rotterdam|Den Haag|Utrecht|Eindhoven|Groningen|Tilburg|Almere|Breda|Nijmegen/gi
  ];

  Object.values(results).flat().forEach(r => {
    locationPatterns.forEach(pattern => {
      const matches = r.description.match(pattern);
      if (matches) matches.forEach(m => locations.add(m));
    });
  });

  return Array.from(locations);
}

function extractKvkNumber(results) {
  const kvkPattern = /KvK[:\s]*(\d{8})/i;
  for (const r of Object.values(results).flat()) {
    const match = r.description.match(kvkPattern);
    if (match) return match[1];
  }
  return null;
}

function extractEmails(results) {
  const emails = new Set();
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  Object.values(results).flat().forEach(r => {
    const matches = r.description.match(emailPattern);
    if (matches) {
      matches.forEach(email => {
        if (!email.includes('example.') && !email.includes('mailto:')) {
          emails.add(email.toLowerCase());
        }
      });
    }
  });

  return Array.from(emails);
}

function extractPhones(results) {
  const phones = new Set();
  const phonePatterns = [
    /(?:\+31|0031|0)[1-9](?:[0-9]\s?){8}/g,
    /\(0[1-9]{1,2}\)\s?[0-9]{3,4}[\s-]?[0-9]{4}/g
  ];

  Object.values(results).flat().forEach(r => {
    phonePatterns.forEach(pattern => {
      const matches = r.description.match(pattern);
      if (matches) matches.forEach(p => phones.add(p));
    });
  });

  return Array.from(phones);
}

function extractAddresses(results) {
  const addresses = [];
  const addressPattern = /([A-Za-z\s]+\s+\d+[a-zA-Z]?),?\s*(\d{4}\s*[A-Z]{2}),?\s*([A-Za-z\s]+)/g;

  Object.values(results).flat().forEach(r => {
    const matches = [...r.description.matchAll(addressPattern)];
    matches.forEach(match => {
      addresses.push({
        street: match[1],
        postalCode: match[2],
        city: match[3]
      });
    });
  });

  return addresses;
}

function extractMainWebsite(results) {
  const domains = extractDomains(results);
  // Prioritize .nl domains
  return domains.find(d => d.endsWith('.nl')) || domains[0] || null;
}

function extractPersonnel(results) {
  const personnel = [];
  const personnelResults = results.personnel || [];

  const titlePatterns = [
    { pattern: /CEO|Chief Executive/i, role: 'CEO' },
    { pattern: /CFO|Chief Financial/i, role: 'CFO' },
    { pattern: /CTO|Chief Technology/i, role: 'CTO' },
    { pattern: /HR Director|HR Manager|Head of HR/i, role: 'HR Director' },
    { pattern: /Recruitment Manager|Talent Acquisition/i, role: 'Recruitment Manager' },
    { pattern: /Managing Director|Algemeen Directeur/i, role: 'Managing Director' },
    { pattern: /Sales Director|Commercial Director/i, role: 'Sales Director' }
  ];

  personnelResults.forEach(r => {
    titlePatterns.forEach(({ pattern, role }) => {
      if (pattern.test(r.description)) {
        const nameMatch = r.description.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
        if (nameMatch) {
          personnel.push({
            name: nameMatch[1],
            role: role,
            source: r.url
          });
        }
      }
    });
  });

  return personnel;
}

function extractSocialProfile(results, platform) {
  const socialResults = results.social || [];
  const platformDomains = {
    linkedin: 'linkedin.com/company/',
    twitter: ['twitter.com/', 'x.com/'],
    facebook: 'facebook.com/',
    instagram: 'instagram.com/',
    youtube: 'youtube.com/'
  };

  const domains = Array.isArray(platformDomains[platform])
    ? platformDomains[platform]
    : [platformDomains[platform]];

  for (const r of socialResults) {
    for (const domain of domains) {
      if (r.url.includes(domain)) {
        return r.url;
      }
    }
  }

  return null;
}

function extractCompanySize(results) {
  const sizeIndicators = {
    'startup': /startup|start-up|beginnende/i,
    'scale-up': /scale-up|scaleup|groeiende/i,
    'mkb': /mkb|midden.*klein|small.*medium/i,
    'corporate': /corporate|multinational|enterprise/i
  };

  const numbers = [];
  const numberPattern = /(\d+(?:\.\d+)?)\s*(?:medewerkers|employees|FTE)/gi;

  Object.values(results).flat().forEach(r => {
    const matches = [...r.description.matchAll(numberPattern)];
    matches.forEach(m => numbers.push(parseInt(m[1])));
  });

  const avgSize = numbers.length > 0
    ? Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length)
    : null;

  let category = 'unknown';
  if (avgSize) {
    if (avgSize < 50) category = 'small';
    else if (avgSize < 250) category = 'medium';
    else if (avgSize < 1000) category = 'large';
    else category = 'enterprise';
  }

  return {
    estimatedSize: avgSize,
    category: category,
    indicators: Object.entries(sizeIndicators)
      .filter(([_, pattern]) =>
        Object.values(results).flat().some(r => pattern.test(r.description))
      )
      .map(([key]) => key)
  };
}

function extractIndustry(results) {
  const industries = new Set();
  const industryKeywords = {
    'Technology': /software|tech|IT|digitaal|automation/i,
    'Finance': /bank|finance|verzekering|insurance|fintech/i,
    'Healthcare': /health|zorg|medisch|pharma|gezondheid/i,
    'Retail': /retail|winkel|shop|e-commerce/i,
    'Manufacturing': /productie|manufacturing|fabriek|industrie/i,
    'Logistics': /logistiek|transport|supply chain|distributie/i,
    'Construction': /bouw|construction|vastgoed|real estate/i,
    'Energy': /energie|energy|duurzaam|sustainable/i,
    'Education': /onderwijs|education|training|academy/i,
    'Consultancy': /consultancy|advies|advisory|consulting/i
  };

  Object.values(results).flat().forEach(r => {
    Object.entries(industryKeywords).forEach(([industry, pattern]) => {
      if (pattern.test(r.description)) {
        industries.add(industry);
      }
    });
  });

  return Array.from(industries);
}

function extractTechnologyStack(results) {
  const techResults = results.technology || [];
  const technologies = new Set();

  const techKeywords = [
    'SAP', 'Salesforce', 'Microsoft', 'Oracle', 'AWS', 'Azure', 'Google Cloud',
    'JavaScript', 'Python', 'Java', '.NET', 'React', 'Angular', 'Vue',
    'Docker', 'Kubernetes', 'Jenkins', 'Git', 'Jira', 'Confluence',
    'Slack', 'Teams', 'Office 365', 'G Suite', 'HubSpot', 'Marketo'
  ];

  techResults.forEach(r => {
    techKeywords.forEach(tech => {
      if (new RegExp(`\\b${tech}\\b`, 'i').test(r.description)) {
        technologies.add(tech);
      }
    });
  });

  return Array.from(technologies);
}

function extractJobPostings(results) {
  const jobResults = results.jobs || [];
  const jobs = [];

  jobResults.forEach(r => {
    if (r.url.includes('linkedin.com/jobs') || r.url.includes('indeed.com')) {
      const titleMatch = r.title.match(/([^-|]+)/);
      if (titleMatch) {
        jobs.push({
          title: titleMatch[1].trim(),
          url: r.url,
          platform: r.domain
        });
      }
    }
  });

  return jobs;
}

function extractHiringSignals(results) {
  const signals = [];
  const hiringKeywords = [
    { keyword: 'groeiende team', signal: 'Team expansion' },
    { keyword: 'uitbreiding', signal: 'Business expansion' },
    { keyword: 'nieuwe vestiging', signal: 'New office location' },
    { keyword: 'hiring spree', signal: 'Active hiring phase' },
    { keyword: 'recruitment drive', signal: 'Recruitment campaign' },
    { keyword: 'vacatures', signal: 'Open positions' },
    { keyword: 'werken bij', signal: 'Career page active' }
  ];

  Object.values(results).flat().forEach(r => {
    hiringKeywords.forEach(({ keyword, signal }) => {
      if (new RegExp(keyword, 'i').test(r.description)) {
        signals.push(signal);
      }
    });
  });

  return [...new Set(signals)];
}

function extractJobBoards(results) {
  const boards = new Set();
  const jobBoards = [
    'indeed.com', 'linkedin.com/jobs', 'glassdoor',
    'monsterboard.nl', 'nationalevacaturebank.nl', 'jobbird.com'
  ];

  const jobResults = results.jobs || [];
  jobResults.forEach(r => {
    jobBoards.forEach(board => {
      if (r.url.includes(board)) {
        boards.add(board.replace('.com', '').replace('.nl', ''));
      }
    });
  });

  return Array.from(boards);
}

function extractFinancialInfo(results, type) {
  const financialResults = results.financial || [];

  if (type === 'revenue') {
    const revenuePattern = /€?\s*(\d+(?:\.\d+)?)\s*(?:miljoen|million|mln)/gi;
    const revenues = [];

    financialResults.forEach(r => {
      const matches = [...r.description.matchAll(revenuePattern)];
      matches.forEach(m => revenues.push(parseFloat(m[1])));
    });

    return revenues.length > 0
      ? { amount: Math.max(...revenues), currency: 'EUR', unit: 'million' }
      : null;
  }

  if (type === 'funding') {
    const fundingKeywords = [
      'investering', 'funding', 'investment', 'Series A', 'Series B',
      'venture capital', 'private equity'
    ];

    const funding = [];
    financialResults.forEach(r => {
      fundingKeywords.forEach(keyword => {
        if (new RegExp(keyword, 'i').test(r.description)) {
          funding.push({
            type: keyword,
            source: r.url,
            description: r.description.substring(0, 200)
          });
        }
      });
    });

    return funding;
  }

  return null;
}

function extractGrowthSignals(results) {
  const signals = [];
  const growthKeywords = [
    { keyword: 'groei', signal: 'Growth mentioned' },
    { keyword: 'expansion', signal: 'Expansion plans' },
    { keyword: 'nieuwe markt', signal: 'New market entry' },
    { keyword: 'overname', signal: 'Acquisition activity' },
    { keyword: 'merger', signal: 'Merger activity' },
    { keyword: 'international', signal: 'International expansion' }
  ];

  Object.values(results).flat().forEach(r => {
    growthKeywords.forEach(({ keyword, signal }) => {
      if (new RegExp(keyword, 'i').test(r.description)) {
        signals.push(signal);
      }
    });
  });

  return [...new Set(signals)];
}

function extractRecentNews(results) {
  const newsResults = results.news || [];
  const currentYear = new Date().getFullYear();
  const news = [];

  newsResults.forEach(r => {
    // Check if news is recent (contains current or previous year)
    if (r.description.includes(currentYear) || r.description.includes(currentYear - 1)) {
      news.push({
        title: r.title,
        url: r.url,
        source: r.domain,
        snippet: r.description.substring(0, 200)
      });
    }
  });

  return news.slice(0, 10); // Return max 10 most recent news items
}

function extractCompetitors(results) {
  const competitors = new Set();
  const competitorKeywords = ['concurrent', 'competitor', 'versus', 'vs', 'alternatief'];

  Object.values(results).flat().forEach(r => {
    competitorKeywords.forEach(keyword => {
      if (new RegExp(keyword, 'i').test(r.description)) {
        // Try to extract company names (capitalized words)
        const companyNames = r.description.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
        if (companyNames) {
          companyNames.forEach(name => {
            if (name.length > 3 && !name.includes('Nederland')) {
              competitors.add(name);
            }
          });
        }
      }
    });
  });

  return Array.from(competitors).slice(0, 10);
}

function extractMarketPosition(results) {
  const positionIndicators = {
    'leader': /market leader|marktleider|leading|nummer 1/i,
    'challenger': /challenger|uitdager|opkomend/i,
    'niche': /niche|specialist|gespecialiseerd/i,
    'innovative': /innovatief|innovative|disruptive/i
  };

  const positions = [];
  Object.values(results).flat().forEach(r => {
    Object.entries(positionIndicators).forEach(([position, pattern]) => {
      if (pattern.test(r.description)) {
        positions.push(position);
      }
    });
  });

  return [...new Set(positions)];
}

function calculateIntelligenceScores(results) {
  const totalResults = Object.values(results).flat().length;
  const categories = Object.keys(results).length;

  // Calculate completeness scores
  const scores = {
    dataCompleteness: Math.min(100, Math.round((totalResults / 50) * 100)),
    contactQuality: 0,
    socialPresence: 0,
    recruitmentActivity: 0,
    marketVisibility: 0,
    overallScore: 0
  };

  // Contact quality
  if (results.contact && results.contact.length > 0) scores.contactQuality += 50;
  if (results.personnel && results.personnel.length > 0) scores.contactQuality += 50;

  // Social presence
  const socialPlatforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'];
  socialPlatforms.forEach(platform => {
    if (results.social && results.social.some(r => r.url.includes(platform))) {
      scores.socialPresence += 20;
    }
  });

  // Recruitment activity
  if (results.jobs && results.jobs.length > 0) scores.recruitmentActivity = Math.min(100, results.jobs.length * 20);

  // Market visibility
  if (results.news && results.news.length > 0) scores.marketVisibility += 40;
  if (results.industry && results.industry.length > 0) scores.marketVisibility += 30;
  if (results.financial && results.financial.length > 0) scores.marketVisibility += 30;

  // Calculate overall score
  scores.overallScore = Math.round(
    (scores.dataCompleteness * 0.2) +
    (scores.contactQuality * 0.25) +
    (scores.socialPresence * 0.15) +
    (scores.recruitmentActivity * 0.25) +
    (scores.marketVisibility * 0.15)
  );

  return scores;
}

/**
 * Generate HTML report
 */
async function generateProspectReport(intelligence) {
  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Prospect Intelligence: ${intelligence.companyName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f7fa; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; }

    .header {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 40px;
      border-radius: 15px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }

    h1 { font-size: 36px; margin-bottom: 10px; }
    .subtitle { opacity: 0.9; font-size: 18px; }

    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }

    .card {
      background: white;
      border-radius: 10px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .card h2 {
      color: #2c3e50;
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }

    .score-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }

    .score-item {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea20, #764ba220);
      border-radius: 10px;
    }

    .score-value {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
    }

    .score-label {
      font-size: 14px;
      color: #7f8c8d;
      margin-top: 5px;
    }

    .info-item {
      padding: 10px 0;
      border-bottom: 1px solid #ecf0f1;
    }

    .info-item:last-child { border-bottom: none; }

    .label {
      font-weight: 600;
      color: #7f8c8d;
      display: inline-block;
      min-width: 120px;
    }

    .value {
      color: #2c3e50;
      word-break: break-word;
    }

    .list-item {
      background: #f8f9fa;
      padding: 10px;
      margin: 5px 0;
      border-radius: 5px;
      border-left: 3px solid #667eea;
    }

    .tag {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 14px;
      margin: 3px;
    }

    .link {
      color: #667eea;
      text-decoration: none;
      word-break: break-all;
    }

    .link:hover { text-decoration: underline; }

    .alert {
      background: #f39c12;
      color: white;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
    }

    .success {
      background: #27ae60;
      color: white;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
    }

    .personnel-card {
      background: #ecf0f1;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
    }

    .personnel-name {
      font-weight: bold;
      color: #2c3e50;
      font-size: 16px;
    }

    .personnel-role {
      color: #7f8c8d;
      font-size: 14px;
    }

    .news-item {
      margin: 15px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .news-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .news-snippet {
      color: #7f8c8d;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 ${intelligence.companyName}</h1>
      <div class="subtitle">Prospect Intelligence Report - ${new Date().toLocaleDateString('nl-NL')}</div>
    </div>

    <!-- Intelligence Scores -->
    <div class="score-grid">
      <div class="score-item">
        <div class="score-value">${intelligence.scores.overallScore}%</div>
        <div class="score-label">Overall Score</div>
      </div>
      <div class="score-item">
        <div class="score-value">${intelligence.scores.contactQuality}%</div>
        <div class="score-label">Contact Quality</div>
      </div>
      <div class="score-item">
        <div class="score-value">${intelligence.scores.socialPresence}%</div>
        <div class="score-label">Social Presence</div>
      </div>
      <div class="score-item">
        <div class="score-value">${intelligence.scores.recruitmentActivity}%</div>
        <div class="score-label">Recruitment Activity</div>
      </div>
      <div class="score-item">
        <div class="score-value">${intelligence.scores.marketVisibility}%</div>
        <div class="score-label">Market Visibility</div>
      </div>
    </div>

    <div class="grid">
      <!-- Basic Information -->
      <div class="card">
        <h2>📊 Company Overview</h2>
        ${intelligence.basicInfo.kvkNumber ? `
          <div class="info-item">
            <span class="label">KvK Number:</span>
            <span class="value">${intelligence.basicInfo.kvkNumber}</span>
          </div>
        ` : ''}

        ${intelligence.basicInfo.industry.length > 0 ? `
          <div class="info-item">
            <span class="label">Industry:</span>
            <div style="margin-top: 5px;">
              ${intelligence.basicInfo.industry.map(ind => `<span class="tag">${ind}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${intelligence.basicInfo.companySize.estimatedSize ? `
          <div class="info-item">
            <span class="label">Company Size:</span>
            <span class="value">${intelligence.basicInfo.companySize.estimatedSize} employees (${intelligence.basicInfo.companySize.category})</span>
          </div>
        ` : ''}

        ${intelligence.basicInfo.locations.length > 0 ? `
          <div class="info-item">
            <span class="label">Locations:</span>
            <span class="value">${intelligence.basicInfo.locations.join(', ')}</span>
          </div>
        ` : ''}
      </div>

      <!-- Contact Information -->
      <div class="card">
        <h2>📞 Contact Information</h2>
        ${intelligence.contacts.website ? `
          <div class="info-item">
            <span class="label">Website:</span>
            <a href="https://${intelligence.contacts.website}" class="link" target="_blank">${intelligence.contacts.website}</a>
          </div>
        ` : ''}

        ${intelligence.contacts.emails.length > 0 ? `
          <div class="info-item">
            <span class="label">Emails:</span>
            <div style="margin-top: 5px;">
              ${intelligence.contacts.emails.map(email =>
                `<div class="list-item"><a href="mailto:${email}" class="link">${email}</a></div>`
              ).join('')}
            </div>
          </div>
        ` : ''}

        ${intelligence.contacts.phones.length > 0 ? `
          <div class="info-item">
            <span class="label">Phones:</span>
            <div style="margin-top: 5px;">
              ${intelligence.contacts.phones.map(phone =>
                `<div class="list-item">${phone}</div>`
              ).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Key Personnel -->
      ${intelligence.personnel.length > 0 ? `
        <div class="card">
          <h2>👥 Key Personnel</h2>
          ${intelligence.personnel.map(person => `
            <div class="personnel-card">
              <div class="personnel-name">${person.name}</div>
              <div class="personnel-role">${person.role}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Social Media -->
      <div class="card">
        <h2>🌐 Social Media Presence</h2>
        ${Object.entries(intelligence.socialMedia).map(([platform, url]) => {
          if (url) {
            return `
              <div class="info-item">
                <span class="label">${platform.charAt(0).toUpperCase() + platform.slice(1)}:</span>
                <a href="${url}" class="link" target="_blank">View Profile</a>
              </div>
            `;
          }
          return '';
        }).join('')}
      </div>

      <!-- Technology Stack -->
      ${intelligence.technology.length > 0 ? `
        <div class="card">
          <h2>💻 Technology Stack</h2>
          <div style="margin-top: 10px;">
            ${intelligence.technology.map(tech => `<span class="tag">${tech}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Recruitment Activity -->
      <div class="card">
        <h2>🎯 Recruitment Activity</h2>
        ${intelligence.recruitment.hiringSignals.length > 0 ? `
          <div class="info-item">
            <span class="label">Hiring Signals:</span>
            <div style="margin-top: 5px;">
              ${intelligence.recruitment.hiringSignals.map(signal =>
                `<div class="list-item">${signal}</div>`
              ).join('')}
            </div>
          </div>
        ` : '<div class="info-item">No active hiring signals detected</div>'}

        ${intelligence.recruitment.activeJobs.length > 0 ? `
          <div class="info-item">
            <span class="label">Active Jobs:</span>
            <span class="value">${intelligence.recruitment.activeJobs.length} positions</span>
          </div>
        ` : ''}

        ${intelligence.recruitment.jobBoards.length > 0 ? `
          <div class="info-item">
            <span class="label">Job Boards:</span>
            <span class="value">${intelligence.recruitment.jobBoards.join(', ')}</span>
          </div>
        ` : ''}
      </div>

      <!-- Financial & Growth -->
      ${(intelligence.financial.revenue || intelligence.financial.growth.length > 0) ? `
        <div class="card">
          <h2>📈 Financial & Growth</h2>
          ${intelligence.financial.revenue ? `
            <div class="info-item">
              <span class="label">Revenue:</span>
              <span class="value">€${intelligence.financial.revenue.amount} million</span>
            </div>
          ` : ''}

          ${intelligence.financial.growth.length > 0 ? `
            <div class="info-item">
              <span class="label">Growth Signals:</span>
              <div style="margin-top: 5px;">
                ${intelligence.financial.growth.map(signal =>
                  `<div class="list-item">${signal}</div>`
                ).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Market Position -->
      ${(intelligence.market.competitors.length > 0 || intelligence.market.marketPosition.length > 0) ? `
        <div class="card">
          <h2>🏆 Market Position</h2>
          ${intelligence.market.marketPosition.length > 0 ? `
            <div class="info-item">
              <span class="label">Position:</span>
              <div style="margin-top: 5px;">
                ${intelligence.market.marketPosition.map(pos => `<span class="tag">${pos}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${intelligence.market.competitors.length > 0 ? `
            <div class="info-item">
              <span class="label">Competitors:</span>
              <div style="margin-top: 5px;">
                ${intelligence.market.competitors.slice(0, 5).map(comp =>
                  `<div class="list-item">${comp}</div>`
                ).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      ` : ''}
    </div>

    <!-- Recent News -->
    ${intelligence.recentNews.length > 0 ? `
      <div class="card" style="margin-top: 20px;">
        <h2>📰 Recent News & Developments</h2>
        ${intelligence.recentNews.slice(0, 5).map(news => `
          <div class="news-item">
            <div class="news-title">
              <a href="${news.url}" class="link" target="_blank">${news.title}</a>
            </div>
            <div class="news-snippet">${news.snippet}...</div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Action Recommendations -->
    <div class="card" style="margin-top: 20px;">
      <h2>💡 Recommended Actions</h2>
      ${intelligence.scores.recruitmentActivity > 60 ? `
        <div class="success">
          ✅ High recruitment activity detected - Perfect time to reach out!
        </div>
      ` : ''}

      ${intelligence.scores.contactQuality < 50 ? `
        <div class="alert">
          ⚠️ Limited contact information - Consider LinkedIn outreach or phone research
        </div>
      ` : ''}

      ${intelligence.personnel.length > 0 ? `
        <div class="info-item">
          <strong>Next Steps:</strong>
          <ul style="margin-top: 10px; padding-left: 20px;">
            <li>Connect with ${intelligence.personnel[0]?.name || 'key personnel'} on LinkedIn</li>
            <li>Reference recent developments in your outreach</li>
            <li>Highlight expertise in their technology stack</li>
            ${intelligence.recruitment.activeJobs.length > 0 ?
              '<li>Mention ability to help with current hiring needs</li>' : ''}
          </ul>
        </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`;

  // Save report
  const fileName = `prospect-${intelligence.companyName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.html`;
  const filePath = path.join(CONFIG.reportsDir, fileName);
  await fs.writeFile(filePath, html);

  // Copy to OneDrive
  const oneDrivePath = path.join(CONFIG.oneDriveDir, fileName);
  await fs.copyFile(filePath, oneDrivePath);

  return { filePath, fileName };
}

// Express routes
app.use(express.json());

// Dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="UTF-8">
      <title>Prospect Intelligence Agent</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .container {
          background: white;
          border-radius: 15px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          color: #2c3e50;
          margin-bottom: 30px;
        }
        .search-box {
          display: flex;
          gap: 10px;
          margin: 30px 0;
        }
        input {
          flex: 1;
          padding: 15px;
          font-size: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 5px;
        }
        button {
          background: #667eea;
          color: white;
          padding: 15px 30px;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
        }
        button:hover {
          background: #5a67d8;
        }
        .options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
        .option {
          display: flex;
          align-items: center;
        }
        .results {
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
        }
        .status {
          padding: 10px;
          margin: 10px 0;
          border-radius: 5px;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .loading { background: #fff3cd; color: #856404; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔍 Prospect Intelligence Agent</h1>
        <p>Deep research on companies and their recruitment potential</p>

        <div class="search-box">
          <input type="text" id="companyName" placeholder="Enter company name..." value="">
          <button onclick="research()">Research Company</button>
        </div>

        <div class="options">
          <label class="option">
            <input type="checkbox" id="deepSearch" checked> Deep Search
          </label>
          <label class="option">
            <input type="checkbox" id="includeNews" checked> Include News
          </label>
          <label class="option">
            <input type="checkbox" id="includeJobs" checked> Include Jobs
          </label>
          <label class="option">
            <input type="checkbox" id="includeSocial" checked> Include Social Media
          </label>
        </div>

        <div id="results" class="results" style="display:none;"></div>
      </div>

      <script>
        async function research() {
          const companyName = document.getElementById('companyName').value;
          const resultsDiv = document.getElementById('results');

          if (!companyName) {
            alert('Please enter a company name');
            return;
          }

          resultsDiv.style.display = 'block';
          resultsDiv.innerHTML = '<div class="status loading">🔍 Researching ' + companyName + '...</div>';

          try {
            const options = {
              deepSearch: document.getElementById('deepSearch').checked,
              includeNews: document.getElementById('includeNews').checked,
              includeJobs: document.getElementById('includeJobs').checked,
              includeSocial: document.getElementById('includeSocial').checked
            };

            const response = await fetch('/research', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyName, options })
            });

            const data = await response.json();

            if (data.success) {
              resultsDiv.innerHTML = \`
                <div class="status success">✅ Research complete!</div>
                <h3>Intelligence Report Generated</h3>
                <p><strong>Company:</strong> \${data.intelligence.companyName}</p>
                <p><strong>Overall Score:</strong> \${data.intelligence.scores.overallScore}%</p>
                <p><strong>Contacts Found:</strong> \${data.intelligence.contacts.emails.length} emails, \${data.intelligence.contacts.phones.length} phones</p>
                <p><strong>Key Personnel:</strong> \${data.intelligence.personnel.length} identified</p>
                <p><strong>Active Jobs:</strong> \${data.intelligence.recruitment.activeJobs.length}</p>
                <p><a href="/reports/\${data.report.fileName}" target="_blank">📊 View Full Report</a></p>
              \`;
            } else {
              resultsDiv.innerHTML = '<div class="status error">❌ Error: ' + data.error + '</div>';
            }
          } catch (error) {
            resultsDiv.innerHTML = '<div class="status error">❌ Error: ' + error.message + '</div>';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Research endpoint
app.post('/research', async (req, res) => {
  try {
    const { companyName, options } = req.body;

    // Perform research
    const intelligence = await researchCompany(companyName, options);

    // Generate report
    const report = await generateProspectReport(intelligence);

    res.json({
      success: true,
      intelligence: intelligence,
      report: report
    });
  } catch (error) {
    console.error('Research error:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Serve reports
app.use('/reports', express.static(CONFIG.reportsDir));

// Batch research endpoint
app.post('/batch-research', async (req, res) => {
  try {
    const { companies, options } = req.body;
    const results = [];

    for (const company of companies) {
      console.log(`Processing ${company}...`);
      const intelligence = await researchCompany(company, options);
      const report = await generateProspectReport(intelligence);
      results.push({ company, intelligence, report });

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    res.json({ success: true, results });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Start server
async function startServer() {
  // Wait for fetch to load
  while (!fetch) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  await ensureDirectories();

  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║       🔍 PROSPECT INTELLIGENCE AGENT ACTIVE          ║
║                                                       ║
║  Dashboard: http://localhost:${PORT}                    ║
║  Company: Recruitin (info@recruitin.nl)              ║
║                                                       ║
║  Features:                                            ║
║  • Deep company research                             ║
║  • Contact discovery                                 ║
║  • Personnel identification                          ║
║  • Social media mapping                              ║
║  • Recruitment activity tracking                     ║
║  • Technology stack detection                        ║
║  • Financial & growth signals                        ║
║  • Competition analysis                              ║
║                                                       ║
║  API Endpoints:                                      ║
║  POST /research - Single company                     ║
║  POST /batch-research - Multiple companies           ║
║                                                       ║
╚══════════════════════════════════════════════════════╝
    `);
  });
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Start
startServer();