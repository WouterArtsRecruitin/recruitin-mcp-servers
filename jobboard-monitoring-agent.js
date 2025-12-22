#!/usr/bin/env node
// Job Board Monitoring Agent - Track vacancies on Indeed, LinkedIn, and other platforms

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSARdxCQWTc2qwf41D9nweSyzfBzf6B';

// Job boards to monitor
const JOB_BOARDS = {
  indeed: {
    name: 'Indeed',
    searchQueries: [
      'site:indeed.nl recruitment manager Amsterdam',
      'site:indeed.nl "HR manager" Nederland',
      'site:indeed.nl recruiter vacature remote',
      'site:indeed.nl talent acquisition specialist'
    ]
  },
  linkedin: {
    name: 'LinkedIn',
    searchQueries: [
      'site:linkedin.com/jobs recruitment Netherlands',
      'site:linkedin.com/jobs "talent acquisition" Amsterdam',
      'site:linkedin.com/jobs HR manager Nederland',
      'site:linkedin.com/jobs recruiter Dutch'
    ]
  },
  nationalevacaturebank: {
    name: 'Nationale Vacaturebank',
    searchQueries: [
      'site:nationalevacaturebank.nl recruitment',
      'site:nationalevacaturebank.nl HR specialist',
      'site:nationalevacaturebank.nl personeelszaken'
    ]
  },
  monsterboard: {
    name: 'Monsterboard',
    searchQueries: [
      'site:monsterboard.nl recruitment consultant',
      'site:monsterboard.nl HR adviseur',
      'site:monsterboard.nl werving selectie'
    ]
  },
  jobbird: {
    name: 'Jobbird',
    searchQueries: [
      'site:jobbird.nl recruiter',
      'site:jobbird.nl HR manager',
      'site:jobbird.nl talent acquisition'
    ]
  }
};

// Industry sectors to track
const SECTORS = [
  'IT / Tech',
  'Healthcare / Zorg',
  'Finance / Banking',
  'Logistics / Supply Chain',
  'Engineering / Techniek',
  'Marketing / Sales'
];

async function searchJobBoard(board, query) {
  try {
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: { 'X-Subscription-Token': BRAVE_API_KEY },
      params: {
        q: query,
        count: 15,
        freshness: 'pd' // Past day for fresh jobs
      }
    });

    return response.data.web?.results || [];
  } catch (error) {
    console.error(`Error searching ${board.name}:`, error.message);
    return [];
  }
}

async function analyzeSectorTrends() {
  const sectorData = {};

  for (const sector of SECTORS) {
    try {
      const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        headers: { 'X-Subscription-Token': BRAVE_API_KEY },
        params: {
          q: `"${sector}" vacatures Nederland 2025 trends`,
          count: 10
        }
      });

      sectorData[sector] = {
        articles: response.data.web?.results?.length || 0,
        trending: response.data.web?.results?.slice(0, 3) || []
      };

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error analyzing ${sector}:`, error.message);
      sectorData[sector] = { articles: 0, trending: [] };
    }
  }

  return sectorData;
}

async function generateJobBoardReport() {
  console.log('\n💼 JOB BOARD MONITORING');
  console.log('========================\n');

  const allResults = {};
  let totalJobs = 0;

  // Search each job board
  for (const [key, board] of Object.entries(JOB_BOARDS)) {
    console.log(`🔍 Scanning ${board.name}...`);
    allResults[key] = { name: board.name, jobs: [] };

    for (const query of board.searchQueries) {
      const results = await searchJobBoard(board, query);
      allResults[key].jobs.push(...results);
      totalJobs += results.length;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Get sector trends
  console.log('📊 Analyzing sector trends...');
  const sectorTrends = await analyzeSectorTrends();

  // Generate report
  const reportDir = path.join(__dirname, 'reports');
  await fs.mkdir(reportDir, { recursive: true });

  const today = new Date().toISOString().split('T')[0];
  const reportPath = path.join(reportDir, `jobboard-analysis-${today}.html`);

  let html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Job Board Analysis - ${today}</title>
  <style>
    body { font-family: 'Segoe UI', Arial; max-width: 1400px; margin: 0 auto; padding: 20px; background: #f5f6fa; }
    .header { background: linear-gradient(135deg, #3498db, #2ecc71); color: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    h1 { margin: 0; font-size: 32px; }
    .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
    .metric-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
    .metric-value { font-size: 36px; font-weight: bold; color: #2c3e50; }
    .metric-label { color: #7f8c8d; margin-top: 5px; font-size: 14px; }
    .jobboard-section { background: white; margin: 20px 0; padding: 25px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
    .jobboard-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3498db; padding-bottom: 15px; margin-bottom: 20px; }
    .jobboard-name { font-size: 22px; font-weight: 600; color: #2c3e50; }
    .job-count { background: #3498db; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; }
    .job-item { padding: 12px; margin: 10px 0; background: #f8f9fa; border-left: 4px solid #3498db; border-radius: 5px; transition: all 0.3s; }
    .job-item:hover { transform: translateX(5px); box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
    .job-title { color: #2c3e50; text-decoration: none; font-weight: 500; }
    .job-title:hover { color: #3498db; }
    .sector-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .sector-card { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; text-align: center; }
    .sector-name { font-weight: 600; margin-bottom: 10px; }
    .sector-count { font-size: 24px; font-weight: bold; }
    .chart-container { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Job Board Intelligence Report</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Real-time analysis of recruitment opportunities across major platforms</p>
    <p style="margin: 5px 0 0 0; opacity: 0.8;">${new Date().toLocaleString('nl-NL')}</p>
  </div>

  <div class="dashboard">
    <div class="metric-card">
      <div class="metric-value">${Object.keys(JOB_BOARDS).length}</div>
      <div class="metric-label">Job Boards Monitored</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${totalJobs}</div>
      <div class="metric-label">Total Jobs Found</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${SECTORS.length}</div>
      <div class="metric-label">Sectors Analyzed</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">24h</div>
      <div class="metric-label">Data Freshness</div>
    </div>
  </div>

  <div class="chart-container">
    <h2>🎯 Sector Trends</h2>
    <div class="sector-grid">`;

  for (const [sector, data] of Object.entries(sectorTrends)) {
    html += `
      <div class="sector-card">
        <div class="sector-name">${sector}</div>
        <div class="sector-count">${data.articles}</div>
        <div style="font-size: 12px; margin-top: 5px;">trending articles</div>
      </div>`;
  }

  html += `
    </div>
  </div>`;

  // Add job board results
  for (const [key, board] of Object.entries(allResults)) {
    const uniqueJobs = [...new Set(board.jobs.map(j => j.url))].slice(0, 10);

    html += `
  <div class="jobboard-section">
    <div class="jobboard-header">
      <div class="jobboard-name">💼 ${board.name}</div>
      <div class="job-count">${board.jobs.length} vacatures</div>
    </div>`;

    board.jobs.slice(0, 10).forEach(job => {
      html += `
    <div class="job-item">
      <a href="${job.url}" target="_blank" class="job-title">${job.title}</a>
      <div style="color: #7f8c8d; font-size: 13px; margin-top: 5px;">${job.description || ''}</div>
    </div>`;
    });

    html += `
  </div>`;
  }

  html += `
  <div style="text-align: center; color: #7f8c8d; margin: 40px 0;">
    <p>Report generated by Job Board Monitoring Agent</p>
    <p>Next update: Tomorrow at 09:00</p>
  </div>
</body>
</html>`;

  await fs.writeFile(reportPath, html);

  // Copy to OneDrive
  const onedrivePath = '/Users/wouterarts/Library/CloudStorage/OneDrive-Recruitin/Daily Recruitment trends report';
  await fs.copyFile(reportPath, path.join(onedrivePath, `jobboard-analysis-${today}.html`));

  console.log('✅ Job board report generated!');
  console.log(`📄 Report: ${reportPath}`);

  return reportPath;
}

// Run if called directly
if (require.main === module) {
  generateJobBoardReport().catch(console.error);
}

module.exports = { generateJobBoardReport };