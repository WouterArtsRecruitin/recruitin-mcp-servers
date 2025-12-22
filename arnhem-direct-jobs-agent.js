#!/usr/bin/env node
// Arnhem Region Direct Employer Technical Jobs Agent

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSARdxCQWTc2qwf41D9nweSyzfBzf6B';

// Technical keywords focused on direct employers
const TECHNICAL_KEYWORDS = [
  'elektrotechnisch Arnhem',
  'werktuigbouwkundig Arnhem',
  'technisch Arnhem vacature',
  'engineer Arnhem',
  'monteur Arnhem'
];

// Recruitment agencies to EXCLUDE
const RECRUITMENT_AGENCIES = [
  'randstad', 'adecco', 'manpower', 'tempo-team', 'youngcapital',
  'yacht', 'brunel', 'usg people', 'olympia', 'start people',
  'indeed', 'jobbird', 'nationalevacaturebank', 'monsterboard',
  'technicum', 'continu professionals', 'intro personeel',
  'techniekwerkt', 'werkzoeken', 'uitzendbureau', 'detachering',
  'werving', 'selectie', 'interim', 'zzp', 'freelance',
  'linkedin', 'glassdoor', 'jooble', 'stepstone', 'jobrapido'
];

// Arnhem region cities
const ARNHEM_REGION = [
  'Arnhem', 'Velp', 'Westervoort', 'Duiven', 'Zevenaar',
  'Rheden', 'Rozendaal', 'Oosterbeek', 'Wolfheze', 'Ellecom'
];

// Search for jobs
async function searchArnhemJobs(keyword) {
  try {
    const query = `${keyword} -uitzendbureau -detachering -interim`;

    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: {
        'X-Subscription-Token': BRAVE_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        q: query,
        count: 30,
        freshness: 'pm' // Past month for more results
      }
    });

    return response.data.web?.results || [];
  } catch (error) {
    console.error(`Error searching ${keyword}:`, error.message);
    return [];
  }
}

// Extract detailed job info
function extractJobDetails(result) {
  const url = result.url || '';
  const title = result.title || '';
  const description = result.description || '';

  // Extract company name (skip if recruitment agency)
  const company = extractCompanyName(url, title);
  if (isRecruitmentAgency(company)) {
    return null; // Skip recruitment agencies
  }

  // Check if it's in Arnhem region
  const location = extractLocation(description + ' ' + title);
  if (!isArnhemRegion(location)) {
    return null; // Skip if not in Arnhem region
  }

  // Extract contact info
  const emailMatch = description.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  const phoneMatch = description.match(/(\+31|0)[\s.-]?(\d{2,3})[\s.-]?(\d{3,4})[\s.-]?(\d{3,4})/);

  // Extract salary if mentioned
  const salaryMatch = description.match(/€\s?(\d+\.?\d*)/);

  return {
    vacatureName: cleanTitle(title),
    company: company,
    location: location,
    description: description.substring(0, 300) + '...',
    url: url,
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    salary: salaryMatch ? salaryMatch[0] : '',
    dateFound: new Date().toISOString().split('T')[0],
    source: extractDomain(url)
  };
}

// Check if company is a recruitment agency
function isRecruitmentAgency(company) {
  const companyLower = company.toLowerCase();
  return RECRUITMENT_AGENCIES.some(agency =>
    companyLower.includes(agency)
  );
}

// Check if location is in Arnhem region
function isArnhemRegion(location) {
  return ARNHEM_REGION.some(city =>
    location.toLowerCase().includes(city.toLowerCase())
  );
}

// Extract company name
function extractCompanyName(url, title) {
  // Try to get from domain
  const domain = url.match(/\/\/(?:www\.)?([^\/\.]+)/)?.[1] || '';

  // Clean up common patterns
  const patterns = [
    /bij\s+([A-Z][^\s,]+)/i,
    /\|\s*([^|]+)$/,
    /-\s*([^-]+)$/
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && !isRecruitmentAgency(match[1])) {
      return match[1].trim();
    }
  }

  return domain;
}

// Extract location
function extractLocation(text) {
  for (const city of ARNHEM_REGION) {
    if (text.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }

  // Check if Arnhem is mentioned
  if (text.toLowerCase().includes('arnhem')) {
    return 'Arnhem';
  }

  return '';
}

// Clean job title
function cleanTitle(title) {
  return title
    .replace(/\s*\|.*$/, '')
    .replace(/\s*-\s*(Indeed|Jobbird|LinkedIn).*$/i, '')
    .replace(/\s*vacature.*$/i, '')
    .trim();
}

// Extract domain
function extractDomain(url) {
  const match = url.match(/\/\/(?:www\.)?([^\/]+)/);
  return match ? match[1] : '';
}

// Generate CSV
async function generateCSV(jobs) {
  const csvHeader = 'Vacature,Werkgever,Standplaats,Salaris,Email,Telefoon,Website,Omschrijving,Datum\n';

  const csvRows = jobs.map(job => {
    return [
      `"${job.vacatureName.replace(/"/g, '""')}"`,
      `"${job.company}"`,
      `"${job.location}"`,
      `"${job.salary}"`,
      `"${job.email}"`,
      `"${job.phone}"`,
      `"${job.url}"`,
      `"${job.description.replace(/"/g, '""').substring(0, 200)}"`,
      job.dateFound
    ].join(',');
  });

  return csvHeader + csvRows.join('\n');
}

// Main function
async function generateArnhemJobsReport() {
  console.log('\n🎯 ARNHEM REGION DIRECT EMPLOYER JOBS');
  console.log('=====================================\n');

  const allJobs = [];

  // Search for each keyword
  for (const keyword of TECHNICAL_KEYWORDS) {
    console.log(`🔍 Searching: "${keyword}"`);

    const results = await searchArnhemJobs(keyword);

    for (const result of results) {
      const jobDetails = extractJobDetails(result);
      if (jobDetails) {
        allJobs.push(jobDetails);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Remove duplicates based on URL
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [job.url, job])).values()
  );

  // Sort by company name
  uniqueJobs.sort((a, b) => a.company.localeCompare(b.company));

  console.log(`\n✅ Found ${uniqueJobs.length} direct employer jobs in Arnhem region`);

  // Generate reports
  const reportDir = path.join(__dirname, 'reports');
  await fs.mkdir(reportDir, { recursive: true });

  const today = new Date().toISOString().split('T')[0];

  // Generate CSV
  const csvContent = await generateCSV(uniqueJobs);
  const csvPath = path.join(reportDir, `arnhem-direct-jobs-${today}.csv`);
  await fs.writeFile(csvPath, csvContent);

  // Generate HTML report
  const htmlPath = path.join(reportDir, `arnhem-direct-jobs-${today}.html`);
  let html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Arnhem Direct Employer Jobs - ${today}</title>
  <style>
    body { font-family: 'Segoe UI', Arial; max-width: 1600px; margin: 0 auto; padding: 20px; background: #f5f7fa; }
    .header { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 40px; border-radius: 15px; margin-bottom: 30px; }
    h1 { margin: 0; font-size: 32px; }
    .filters { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
    .filter-badge { display: inline-block; background: #3498db; color: white; padding: 5px 15px; border-radius: 20px; margin: 5px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .stat-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
    .stat-number { font-size: 36px; font-weight: bold; color: #c0392b; }
    .stat-label { color: #7f8c8d; margin-top: 5px; }
    .job-card { background: white; padding: 25px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 5px solid #e74c3c; }
    .job-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px; }
    .job-title { font-size: 20px; font-weight: 600; color: #2c3e50; margin: 0; }
    .job-company { font-size: 18px; color: #e74c3c; margin: 5px 0; }
    .job-location { display: inline-block; background: #ecf0f1; padding: 5px 12px; border-radius: 15px; font-size: 14px; }
    .job-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
    .detail-item { display: flex; align-items: center; }
    .detail-label { font-weight: 600; color: #7f8c8d; margin-right: 10px; }
    .detail-value { color: #2c3e50; }
    .job-description { color: #555; line-height: 1.6; margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
    .contact-section { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .contact-item { display: inline-block; margin-right: 20px; }
    .apply-btn { background: #27ae60; color: white; padding: 10px 25px; border-radius: 5px; text-decoration: none; display: inline-block; }
    .apply-btn:hover { background: #229954; }
    .no-agencies { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f39c12; }
    .download-section { background: white; padding: 25px; border-radius: 10px; text-align: center; margin: 30px 0; }
    .download-btn { background: #3498db; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 Arnhem Region - Direct Employer Technical Jobs</h1>
    <p>Technische vacatures rechtstreeks bij werkgevers (geen uitzendbureaus)</p>
    <p>${new Date().toLocaleString('nl-NL')}</p>
  </div>

  <div class="filters">
    <h3>Active Filters:</h3>
    <span class="filter-badge">📍 Regio Arnhem</span>
    <span class="filter-badge">🏢 Direct werkgevers</span>
    <span class="filter-badge">🚫 Geen uitzendbureaus</span>
    <span class="filter-badge">⚙️ Technische vacatures</span>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-number">${uniqueJobs.length}</div>
      <div class="stat-label">Direct Employer Jobs</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${new Set(uniqueJobs.map(j => j.company)).size}</div>
      <div class="stat-label">Unique Companies</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${uniqueJobs.filter(j => j.email).length}</div>
      <div class="stat-label">With Email</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${uniqueJobs.filter(j => j.phone).length}</div>
      <div class="stat-label">With Phone</div>
    </div>
  </div>

  <div class="no-agencies">
    <strong>✅ Quality Guarantee:</strong> All listings are from direct employers. Recruitment agencies, job boards, and intermediaries have been filtered out.
  </div>

  <div class="download-section">
    <h2>📊 Export Data</h2>
    <a href="arnhem-direct-jobs-${today}.csv" class="download-btn">📥 Download CSV for Excel</a>
    <p style="color: #7f8c8d; margin-top: 15px;">Import into Excel or Google Sheets for advanced filtering and mail merge</p>
  </div>`;

  // Add job cards
  for (const job of uniqueJobs) {
    html += `
  <div class="job-card">
    <div class="job-header">
      <div>
        <h2 class="job-title">${job.vacatureName}</h2>
        <div class="job-company">🏢 ${job.company}</div>
      </div>
      <div>
        <span class="job-location">📍 ${job.location}</span>
      </div>
    </div>

    <div class="job-details">
      <div class="detail-item">
        <span class="detail-label">Datum:</span>
        <span class="detail-value">${job.dateFound}</span>
      </div>
      ${job.salary ? `
      <div class="detail-item">
        <span class="detail-label">Salaris:</span>
        <span class="detail-value">${job.salary}</span>
      </div>` : ''}
    </div>

    <div class="job-description">
      ${job.description}
    </div>

    ${(job.email || job.phone) ? `
    <div class="contact-section">
      <strong>Contact Information:</strong>
      ${job.email ? `<span class="contact-item">📧 ${job.email}</span>` : ''}
      ${job.phone ? `<span class="contact-item">📞 ${job.phone}</span>` : ''}
    </div>` : ''}

    <div style="margin-top: 20px;">
      <a href="${job.url}" target="_blank" class="apply-btn">View Full Job Details →</a>
    </div>
  </div>`;
  }

  html += `
  <div style="text-align: center; color: #7f8c8d; margin: 40px 0;">
    <p>Report generated specifically for Arnhem region with direct employer filtering</p>
  </div>
</body>
</html>`;

  await fs.writeFile(htmlPath, html);

  // Copy to OneDrive
  const onedrivePath = '/Users/wouterarts/Library/CloudStorage/OneDrive-Recruitin/Daily Recruitment trends report';
  await fs.copyFile(htmlPath, path.join(onedrivePath, `arnhem-direct-jobs-${today}.html`));
  await fs.copyFile(csvPath, path.join(onedrivePath, `arnhem-direct-jobs-${today}.csv`));

  console.log(`📄 HTML Report: ${htmlPath}`);
  console.log(`📊 CSV Export: ${csvPath}`);
  console.log('✅ Files copied to OneDrive');

  // Print summary
  console.log('\n📋 SUMMARY:');
  console.log(`- Total jobs found: ${uniqueJobs.length}`);
  console.log(`- Unique companies: ${new Set(uniqueJobs.map(j => j.company)).size}`);
  console.log(`- Jobs with email: ${uniqueJobs.filter(j => j.email).length}`);
  console.log(`- Jobs with phone: ${uniqueJobs.filter(j => j.phone).length}`);

  return { htmlPath, csvPath, jobs: uniqueJobs };
}

// Run if called directly
if (require.main === module) {
  generateArnhemJobsReport().catch(console.error);
}

module.exports = { generateArnhemJobsReport };