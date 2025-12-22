#!/usr/bin/env node
// Technical & Industrial Jobs Agent with Contact Extraction and CSV Export

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSARdxCQWTc2qwf41D9nweSyzfBzf6B';

// Technical & Industrial job keywords
const TECHNICAL_KEYWORDS = [
  // Electrical
  'elektrotechnisch', 'elektricien', 'E&I', 'electrical engineer',
  'installatietechniek', 'elektromonteur', 'PLC programmeur',

  // Mechanical
  'werktuigbouwkundig', 'mechanical engineer', 'monteur technische dienst',
  'onderhoudsmedewerker', 'maintenance engineer', 'storingsmonteur',

  // Industrial
  'industrieel', 'productiemedewerker', 'operator', 'procesoperator',
  'kwaliteitscontroleur', 'productietechnicus', 'assemblagemedewerker',

  // Automation
  'automatisering', 'robot programmeur', 'SCADA', 'MES engineer',
  'industrial automation', 'OT engineer', 'automation specialist',

  // Construction/Civil
  'bouwkundig', 'uitvoerder', 'werkvoorbereider', 'calculator bouw',
  'projectleider techniek', 'BIM modelleur', 'constructeur'
];

// Job boards to search
const JOB_SOURCES = [
  'indeed.nl', 'linkedin.com/jobs', 'techniekwerkt.nl',
  'engineeringnet.nl', 'technischebanenbank.nl', 'werkenbijbam.nl',
  'volkerwessels.com/nl/werken-bij', 'spie-nl.com/werken-bij',
  'installatie.nl/vacatures', 'yacht.nl', 'brunel.nl'
];

// Search for technical jobs
async function searchTechnicalJobs(keyword, source) {
  try {
    // Simpler query format for better results
    const query = `${keyword} vacature ${source}`;

    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: {
        'X-Subscription-Token': BRAVE_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        q: query,
        count: 20
      }
    });

    const results = response.data.web?.results || [];

    // Extract contact info from descriptions
    return results.map(job => {
      const contactInfo = extractContactInfo(job.description || '');
      return {
        title: job.title,
        url: job.url,
        company: extractCompanyName(job.url, job.title),
        location: extractLocation(job.description),
        description: job.description?.substring(0, 200) || '',
        email: contactInfo.email,
        phone: contactInfo.phone,
        keyword: keyword,
        source: source,
        dateFound: new Date().toISOString().split('T')[0]
      };
    });
  } catch (error) {
    console.error(`Error searching ${keyword} on ${source}:`, error.message);
    return [];
  }
}

// Extract contact information
function extractContactInfo(text) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const phoneRegex = /(\+31|0)[\s.-]?(\d{2,3})[\s.-]?(\d{3,4})[\s.-]?(\d{3,4})/g;

  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];

  return {
    email: emails[0] || '',
    phone: phones[0] || ''
  };
}

// Extract company name from URL and title
function extractCompanyName(url, title) {
  // Try to extract from URL domain
  const domain = url.match(/\/\/([^\/]+)/)?.[1] || '';

  // Common patterns in job titles
  const companyPatterns = [
    /bij\s+([A-Z][^\s]+)/i,
    /at\s+([A-Z][^\s]+)/i,
    /\|\s*([^|]+)$/,
    /-\s*([^-]+)$/
  ];

  for (const pattern of companyPatterns) {
    const match = title.match(pattern);
    if (match) return match[1].trim();
  }

  // Fallback to domain
  return domain.replace('www.', '').split('.')[0];
}

// Extract location
function extractLocation(text) {
  const cities = [
    'Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven',
    'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen',
    'Apeldoorn', 'Arnhem', 'Haarlem', 'Enschede', 'Amersfoort',
    'Zaanstad', 'Den Bosch', 'Hoofddorp', 'Maastricht', 'Leiden'
  ];

  for (const city of cities) {
    if (text?.includes(city)) return city;
  }

  return 'Nederland';
}

// Generate CSV file
async function generateCSV(jobs) {
  const csvHeader = 'Title,Company,Location,Email,Phone,URL,Source,Keyword,Date Found\n';

  const csvRows = jobs.map(job => {
    return [
      `"${job.title.replace(/"/g, '""')}"`,
      `"${job.company}"`,
      `"${job.location}"`,
      `"${job.email}"`,
      `"${job.phone}"`,
      `"${job.url}"`,
      `"${job.source}"`,
      `"${job.keyword}"`,
      job.dateFound
    ].join(',');
  });

  return csvHeader + csvRows.join('\n');
}

// Main function
async function generateTechnicalJobsReport() {
  console.log('\n⚙️ TECHNICAL & INDUSTRIAL JOBS SCANNER');
  console.log('======================================\n');

  const allJobs = [];
  let searchCount = 0;

  // Search for each keyword (simplified - not per source to avoid rate limits)
  for (const keyword of TECHNICAL_KEYWORDS.slice(0, 8)) { // Search top 8 keywords
    console.log(`🔍 Searching: "${keyword}" vacatures Nederland`);

    const jobs = await searchTechnicalJobs(keyword, 'Nederland');
    allJobs.push(...jobs);
    searchCount++;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Remove duplicates based on URL
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [job.url, job])).values()
  );

  console.log(`\n✅ Found ${uniqueJobs.length} unique technical/industrial jobs`);

  // Generate reports
  const reportDir = path.join(__dirname, 'reports');
  await fs.mkdir(reportDir, { recursive: true });

  const today = new Date().toISOString().split('T')[0];

  // 1. Generate CSV file
  const csvContent = await generateCSV(uniqueJobs);
  const csvPath = path.join(reportDir, `technical-jobs-${today}.csv`);
  await fs.writeFile(csvPath, csvContent);

  // 2. Generate HTML report
  const htmlPath = path.join(reportDir, `technical-jobs-${today}.html`);
  let html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Technical & Industrial Jobs - ${today}</title>
  <style>
    body { font-family: 'Segoe UI', Arial; max-width: 1600px; margin: 0 auto; padding: 20px; background: #f0f2f5; }
    .header { background: linear-gradient(135deg, #2c3e50, #3498db); color: white; padding: 40px; border-radius: 15px; margin-bottom: 30px; }
    h1 { margin: 0; font-size: 32px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .stat-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
    .stat-number { font-size: 36px; font-weight: bold; color: #2c3e50; }
    .stat-label { color: #7f8c8d; margin-top: 5px; }
    .download-section { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
    .download-btn { background: #27ae60; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 10px; }
    .download-btn:hover { background: #229954; }
    .jobs-table { background: white; border-radius: 10px; overflow: hidden; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #34495e; color: white; padding: 15px; text-align: left; }
    td { padding: 12px 15px; border-bottom: 1px solid #ecf0f1; }
    tr:hover { background: #f8f9fa; }
    .contact-info { background: #e8f5e9; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
    .job-link { color: #3498db; text-decoration: none; }
    .job-link:hover { text-decoration: underline; }
    .highlight { background: #fff3cd; padding: 2px 5px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚙️ Technical & Industrial Jobs Report</h1>
    <p>Real-time scanning of technical vacancies with contact extraction</p>
    <p>${new Date().toLocaleString('nl-NL')}</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-number">${uniqueJobs.length}</div>
      <div class="stat-label">Total Jobs Found</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${uniqueJobs.filter(j => j.email).length}</div>
      <div class="stat-label">With Email Contact</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${uniqueJobs.filter(j => j.phone).length}</div>
      <div class="stat-label">With Phone Contact</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${new Set(uniqueJobs.map(j => j.company)).size}</div>
      <div class="stat-label">Unique Companies</div>
    </div>
  </div>

  <div class="download-section">
    <h2>📊 Export Options</h2>
    <p>Download the complete dataset for further analysis:</p>
    <a href="technical-jobs-${today}.csv" class="download-btn">📥 Download CSV File</a>
    <p style="color: #7f8c8d; font-size: 14px; margin-top: 20px;">
      Import this CSV into Excel or Google Sheets for advanced filtering and analysis
    </p>
  </div>

  <div class="jobs-table">
    <h2 style="padding: 20px 20px 0 20px;">🔧 Technical & Industrial Vacancies</h2>
    <table>
      <thead>
        <tr>
          <th>Job Title</th>
          <th>Company</th>
          <th>Location</th>
          <th>Contact</th>
          <th>Keywords</th>
          <th>Source</th>
        </tr>
      </thead>
      <tbody>`;

  // Add job rows
  uniqueJobs.slice(0, 100).forEach(job => {
    const contactInfo = [];
    if (job.email) contactInfo.push(`📧 ${job.email}`);
    if (job.phone) contactInfo.push(`📞 ${job.phone}`);

    html += `
        <tr>
          <td><a href="${job.url}" target="_blank" class="job-link">${job.title}</a></td>
          <td>${job.company}</td>
          <td>${job.location}</td>
          <td>${contactInfo.length > 0 ? `<div class="contact-info">${contactInfo.join('<br>')}</div>` : '-'}</td>
          <td><span class="highlight">${job.keyword}</span></td>
          <td>${job.source}</td>
        </tr>`;
  });

  html += `
      </tbody>
    </table>
  </div>

  <div style="text-align: center; color: #7f8c8d; margin: 40px 0;">
    <p>💡 Tip: Use the CSV export to create mail merge campaigns or import into your CRM</p>
  </div>
</body>
</html>`;

  await fs.writeFile(htmlPath, html);

  // 3. Copy to OneDrive
  const onedrivePath = '/Users/wouterarts/Library/CloudStorage/OneDrive-Recruitin/Daily Recruitment trends report';
  await fs.copyFile(htmlPath, path.join(onedrivePath, `technical-jobs-${today}.html`));
  await fs.copyFile(csvPath, path.join(onedrivePath, `technical-jobs-${today}.csv`));

  console.log(`📄 HTML Report: ${htmlPath}`);
  console.log(`📊 CSV Export: ${csvPath}`);
  console.log('✅ Files copied to OneDrive folder');

  return { htmlPath, csvPath, jobsCount: uniqueJobs.length };
}

// Run if called directly
if (require.main === module) {
  generateTechnicalJobsReport().catch(console.error);
}

module.exports = { generateTechnicalJobsReport };