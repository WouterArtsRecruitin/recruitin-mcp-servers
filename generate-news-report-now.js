#!/usr/bin/env node
// Manual trigger for Daily Recruitment News collection
// This script directly calls the collection function to generate a report NOW

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSARdxCQWTc2qwf41D9nweSyzfBzf6B';
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

// FOCUS: TECHNICAL RECRUITMENT (Automation, Engineering, Manufacturing)
const SEARCH_QUERIES = [
  // Technical Recruitment Specifiek
  'technical recruitment Nederland trends site:nl',
  'engineering recruitment Nederland site:nl',
  'technisch personeel tekort Nederland site:nl',
  'automation engineer arbeidsmarkt Nederland site:nl',

  // Manufacturing & Industrial Sector
  'site:technischwerken.nl personeelstekort',
  'site:engineeringnet.nl recruitment nieuws',
  'site:technieknederland.nl arbeidsmarkt',
  'manufacturing recruitment Nederland site:nl',
  'industrial recruitment trends Nederland site:nl',

  // Technical Skills & Arbeidsmarkt
  'PLC programmeur arbeidsmarkt Nederland site:nl',
  'SCADA specialist tekort Nederland site:nl',
  'automation techniek personeelstekort site:nl',
  'werktuigbouwkundig engineer markt site:nl',
  'elektrotechniek personeelstekort Nederland site:nl',

  // UWV & CBS - Technical Sector Focus
  'site:uwv.nl technische beroepen arbeidsmarkt',
  'site:uwv.nl moeilijk vervulbare vacatures techniek',
  'site:cbs.nl vacatures technische sector',
  'site:cbs.nl spanning arbeidsmarkt industrie',

  // Recruitment Tech (AI, automation tools)
  'site:recruitmenttech.nl AI recruitment',
  'site:recruitmenttech.nl automation recruitment',
  'recruitment automation Nederland site:nl',

  // Recruitment Vakbladen (technical focus)
  'site:werf-en.nl technical recruitment',
  'site:recruitmentmatters.nl engineering recruitment',
  '"intelligence group" technische arbeidsmarkt site:nl',

  // Salary & Benchmark Data (technical roles)
  'engineering salaris benchmark Nederland site:nl',
  'technical recruitment salaris trends site:nl',
  'automation engineer salaris 2026 site:nl',

  // Oil & Gas, Energy, Manufacturing News
  'oil gas recruitment Nederland site:nl',
  'renewable energy recruitment Nederland site:nl',
  'manufacturing hiring trends Nederland site:nl',

  // Regional Focus (Oost-Nederland)
  'arbeidsmarkt Gelderland techniek site:nl',
  'personeelstekort Overijssel industrie site:nl',
  'technical recruitment Brabant site:nl'
];

// Search Brave for news
async function searchBrave(query) {
  try {
    console.log(`  🔍 Searching: ${query}`);
    const response = await axios.get(BRAVE_API_URL, {
      headers: {
        'X-Subscription-Token': BRAVE_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        q: query,
        count: 20,
        country: 'nl', // Nederland only
        search_lang: 'nl', // Nederlandse taal
        freshness: 'pw', // Afgelopen week
        ui_lang: 'nl-NL' // UI in Nederlands
      }
    });

    return {
      query: query,
      results: response.data.web?.results || [],
      news: response.data.news?.results || []
    };
  } catch (error) {
    console.error(`  ❌ Error searching "${query}":`, error.message);
    return { query, results: [], news: [] };
  }
}

// Generate report
async function generateReport() {
  console.log('\n📰 GENERATING RECRUITMENT NEWS REPORT');
  console.log('=====================================\n');

  const allResults = [];
  let totalArticles = 0;

  // Collect news from all queries
  for (const query of SEARCH_QUERIES) {
    const results = await searchBrave(query);
    allResults.push(results);
    // Filter out stichtingrpo.nl from count
    const filteredResults = results.results.filter(article => !article.url.includes('stichtingrpo.nl'));
    const filteredNews = results.news.filter(article => !article.url.includes('stichtingrpo.nl'));
    totalArticles += filteredResults.length + filteredNews.length;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }

  // Irrelevant sources filter (KWALITEIT > KWANTITEIT)
  const irrelevantSources = [
    // Regionale omroepen (geen recruitment nieuws)
    'stichtingrpo.nl', 'hartvannederland.nl', 'rtvnoord.nl',
    'omroepbrabant.nl', 'omroepgelderland.nl', 'rtvutrecht.nl',
    'omroepwest.nl', 'rtvdrenthe.nl', 'l1.nl',

    // Job boards (vacatures, geen nieuws)
    'indeed.nl', 'monsterboard.nl', 'nationale-vacaturebank.nl',
    'jobbird.nl', 'intermediair.nl/vacatures', 'werkenbij.nl',
    'vacatures.nl', 'jobdigger.nl', 'technischwerken.nl/vacatures',

    // Recruitment bureaus (vacature listings)
    'extra-talent.nl', 'brunel.nl', 'yacht.nl', 'randstad.nl',
    'unique.nl', 'olympia.nl', 'tempo-team.nl',

    // Social media & algemene lijsten
    'sortlist.nl', 'linkedin.com', 'facebook.com', 'twitter.com',

    // Niet-relevante algemene sites
    'marktplaats.nl', 'funda.nl', 'wikipedia.org'
  ];

  // Additional keyword filters (filter titles)
  const excludeTitleKeywords = [
    'vacature', 'vacancy', 'solliciteer', 'werken bij', 'werkenbij',
    'gezocht:', 'hiring', 'we zoeken', 'ben jij', 'word jij'
  ];

  function isRelevantArticle(article) {
    // Filter op URL
    if (irrelevantSources.some(source => article.url.includes(source))) {
      return false;
    }

    // Filter op titel (geen vacature postings)
    const titleLower = article.title.toLowerCase();
    if (excludeTitleKeywords.some(kw => titleLower.includes(kw))) {
      return false;
    }

    return true;
  }

  // Count articles per source (excluding irrelevant sources)
  const sourceCounts = {};
  allResults.forEach(result => {
    const filteredResults = result.results.filter(article =>
      !irrelevantSources.some(source => article.url.includes(source))
    );
    const filteredNews = result.news.filter(article =>
      !irrelevantSources.some(source => article.url.includes(source))
    );
    const sourceCount = filteredResults.length + filteredNews.length;
    if (sourceCount > 0) {
      sourceCounts[result.query] = sourceCount;
    }
  });

  // Sort sources by article count
  const sortedSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1]);

  // Generate HTML report
  const today = new Date().toISOString().split('T')[0];
  const reportDir = path.join(__dirname, 'reports');
  await fs.mkdir(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `recruitment-news-${today}.html`);

  let html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Recruitment News Report - ${today}</title>
  <style>
    body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f7fa; }
    .header { background: linear-gradient(135deg, #003366, #0066cc); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
    h1 { margin: 0; font-size: 28px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-number { font-size: 32px; font-weight: bold; color: #003366; }
    .stat-label { color: #666; margin-top: 5px; }
    .category { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .category h2 { color: #003366; border-bottom: 2px solid #e1e4e8; padding-bottom: 10px; }
    .article { padding: 15px 0; border-bottom: 1px solid #e1e4e8; }
    .article:last-child { border-bottom: none; }
    .article-title { font-weight: 600; color: #0066cc; text-decoration: none; display: block; margin-bottom: 5px; }
    .article-title:hover { text-decoration: underline; }
    .article-description { color: #555; font-size: 14px; line-height: 1.5; }
    .article-source { color: #888; font-size: 12px; margin-top: 5px; }
    .timestamp { color: #666; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Recruitment & Werkgelegenheid Nieuws</h1>
    <p>Focus: Uitzendbranche, Vacatures & Arbeidsmarkt</p>
    <p>${new Date().toLocaleString('nl-NL')}</p>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-number">${totalArticles}</div>
      <div class="stat-label">Recruitment Artikelen</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${SEARCH_QUERIES.length}</div>
      <div class="stat-label">Bronnen Doorzocht</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${allResults.filter(r => r.results.length > 0).length}</div>
      <div class="stat-label">Relevante Bronnen</div>
    </div>
  </div>

  <div class="category">
    <h2>📊 Bronnen Overzicht</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f0f0f0;">
          <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Bron / Zoekterm</th>
          <th style="text-align: center; padding: 10px; border: 1px solid #ddd; width: 120px;">Aantal Artikelen</th>
        </tr>
      </thead>
      <tbody>
${sortedSources.map(([source, count]) => `        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${source}</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #ddd; font-weight: bold;">${count}</td>
        </tr>`).join('\n')}
        <tr style="background: #f9f9f9; font-weight: bold;">
          <td style="padding: 8px; border: 1px solid #ddd;">TOTAAL</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${totalArticles}</td>
        </tr>
      </tbody>
    </table>
  </div>
`;

  // Add articles by category
  for (const searchResult of allResults) {
    if (searchResult.results.length === 0 && searchResult.news.length === 0) continue;

    html += `
  <div class="category">
    <h2>${searchResult.query}</h2>
`;

    // Add web results (filter for quality - using shared function)
    searchResult.results
      .filter(article => isRelevantArticle(article))
      .slice(0, 10).forEach(article => {
      html += `
    <div class="article">
      <a href="${article.url}" target="_blank" class="article-title">${article.title}</a>
      <div class="article-description">${article.description || ''}</div>
      <div class="article-source">${article.url}</div>
    </div>
`;
    });

    // Add news results (filter for quality)
    searchResult.news
      .filter(article => isRelevantArticle(article))
      .slice(0, 5).forEach(article => {
      html += `
    <div class="article">
      <a href="${article.url}" target="_blank" class="article-title">📰 ${article.title}</a>
      <div class="article-description">${article.description || ''}</div>
      <div class="article-source">${article.url}</div>
    </div>
`;
    });

    html += `
  </div>
`;
  }

  html += `
  <div class="timestamp">
    <p>Report generated at: ${new Date().toLocaleString('nl-NL')}</p>
    <p>Powered by Brave Search API</p>
  </div>
</body>
</html>
`;

  // Save report
  await fs.writeFile(reportPath, html);

  console.log('\n✅ REPORT GENERATED SUCCESSFULLY!');
  console.log('📄 Report saved to:', reportPath);
  console.log('📊 Total articles found:', totalArticles);
  console.log('\nOpen the report in your browser:');
  console.log(`open ${reportPath}`);

  return reportPath;
}

// Run immediately
generateReport().catch(console.error);