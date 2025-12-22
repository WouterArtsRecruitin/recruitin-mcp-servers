#!/usr/bin/env node
// Competitor Monitoring Agent - Track competitor activities and news

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSARdxCQWTc2qwf41D9nweSyzfBzf6B';

// Configure your competitors here
const COMPETITORS = [
  { name: 'Randstad', domains: ['randstad.nl', 'randstad.com'], keywords: 'Randstad recruitment nieuws' },
  { name: 'Adecco', domains: ['adecco.nl'], keywords: 'Adecco Nederland nieuws' },
  { name: 'Manpower', domains: ['manpower.nl'], keywords: 'Manpower recruitment Nederland' },
  { name: 'Tempo-Team', domains: ['tempo-team.nl'], keywords: 'Tempo-Team uitzendbureau nieuws' },
  { name: 'YoungCapital', domains: ['youngcapital.nl'], keywords: 'YoungCapital vacatures nieuws' }
];

async function searchCompetitor(competitor) {
  try {
    console.log(`🔍 Monitoring ${competitor.name}...`);

    // Search for competitor news
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: { 'X-Subscription-Token': BRAVE_API_KEY },
      params: {
        q: competitor.keywords,
        count: 20,
        freshness: 'pw' // Past week
      }
    });

    // Search for job postings
    const jobSearch = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: { 'X-Subscription-Token': BRAVE_API_KEY },
      params: {
        q: `site:${competitor.domains[0]} vacatures OR jobs`,
        count: 10
      }
    });

    return {
      competitor: competitor.name,
      news: response.data.web?.results || [],
      jobs: jobSearch.data.web?.results || [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error monitoring ${competitor.name}:`, error.message);
    return { competitor: competitor.name, news: [], jobs: [] };
  }
}

async function generateCompetitorReport() {
  console.log('\n🎯 COMPETITOR MONITORING REPORT');
  console.log('================================\n');

  const results = [];
  for (const competitor of COMPETITORS) {
    const data = await searchCompetitor(competitor);
    results.push(data);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Generate HTML report
  const reportDir = path.join(__dirname, 'reports');
  await fs.mkdir(reportDir, { recursive: true });

  const today = new Date().toISOString().split('T')[0];
  const reportPath = path.join(reportDir, `competitor-analysis-${today}.html`);

  let html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Competitor Analysis - ${today}</title>
  <style>
    body { font-family: Arial; max-width: 1400px; margin: 0 auto; padding: 20px; background: #f0f4f8; }
    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: 12px; }
    .competitor-card { background: white; margin: 20px 0; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .competitor-name { color: #333; font-size: 24px; font-weight: bold; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
    .section { margin: 20px 0; }
    .section-title { color: #667eea; font-size: 18px; font-weight: 600; margin: 15px 0; }
    .item { padding: 10px; margin: 8px 0; background: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px; }
    .item-title { color: #333; font-weight: 600; text-decoration: none; }
    .item-title:hover { color: #667eea; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat { background: #667eea; color: white; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 28px; font-weight: bold; }
    .stat-label { font-size: 12px; margin-top: 5px; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 Competitor Intelligence Report</h1>
    <p>${new Date().toLocaleString('nl-NL')}</p>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-number">${COMPETITORS.length}</div>
      <div class="stat-label">Competitors Tracked</div>
    </div>
    <div class="stat">
      <div class="stat-number">${results.reduce((sum, r) => sum + r.news.length, 0)}</div>
      <div class="stat-label">News Articles</div>
    </div>
    <div class="stat">
      <div class="stat-number">${results.reduce((sum, r) => sum + r.jobs.length, 0)}</div>
      <div class="stat-label">Job Postings Found</div>
    </div>
  </div>`;

  for (const result of results) {
    html += `
  <div class="competitor-card">
    <div class="competitor-name">${result.competitor}</div>

    <div class="section">
      <div class="section-title">📰 Recent News & Updates (${result.news.length})</div>`;

    result.news.slice(0, 5).forEach(article => {
      html += `
      <div class="item">
        <a href="${article.url}" target="_blank" class="item-title">${article.title}</a>
        <div style="color: #666; font-size: 14px; margin-top: 5px;">${article.description || ''}</div>
      </div>`;
    });

    html += `
    </div>

    <div class="section">
      <div class="section-title">💼 Recent Job Postings (${result.jobs.length})</div>`;

    result.jobs.slice(0, 5).forEach(job => {
      html += `
      <div class="item">
        <a href="${job.url}" target="_blank" class="item-title">${job.title}</a>
      </div>`;
    });

    html += `
    </div>
  </div>`;
  }

  html += `
</body>
</html>`;

  await fs.writeFile(reportPath, html);

  // Also save to OneDrive
  const onedrivePath = '/Users/wouterarts/Library/CloudStorage/OneDrive-Recruitin/Daily Recruitment trends report';
  await fs.copyFile(reportPath, path.join(onedrivePath, `competitor-analysis-${today}.html`));

  console.log('✅ Competitor report generated!');
  console.log(`📄 Saved to: ${reportPath}`);

  return reportPath;
}

// Run if called directly
if (require.main === module) {
  generateCompetitorReport().catch(console.error);
}

module.exports = { generateCompetitorReport };