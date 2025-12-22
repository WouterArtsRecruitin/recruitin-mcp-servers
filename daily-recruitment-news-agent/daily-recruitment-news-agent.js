#!/usr/bin/env node
// Daily Recruitment News Agent - Automated HR & Recruitment News Collector
// Collects daily news about HR, Recruitment, RPO, and Labor Market

const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');

const app = express();
app.use(express.json());

// Configuration
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';
const NEWS_FILE = path.join(__dirname, 'data', 'daily-recruitment-news.json');
const REPORTS_DIR = path.join(__dirname, 'reports');

// ALLEEN Nederlandse recruitment & uitzendbranche queries
const SEARCH_QUERIES = [
  // Nederlandse RPO & Staffing
  'RPO Nederland "Nederlandse markt"',
  'staffing bureaus Nederland 2025',
  'MSP dienstverlening Nederland',
  'detachering Nederland nieuws',

  // Nederlandse ATS & Recruitment Tech
  'ATS systemen Nederlandse bedrijven',
  'recruitment software Nederland vergelijking',
  'HR technologie Nederlandse markt',
  'digitale werving Nederland',

  // Nederlandse Recruitment Marketing
  'recruitment marketing Nederlandse werkgevers',
  'employer branding Nederland cases',
  'talent acquisitie Nederland strategieën',
  'wervingscampagnes Nederlandse bedrijven',

  // Nederlandse uitzendbranche
  'uitzendbranche Nederland ABU NBBU',
  'flexwerk Nederland wetgeving 2025',
  'Nederlandse uitzendbureaus nieuws',
  'payroll Nederland ontwikkelingen',
  'interim management Nederland',

  // Recruitment & werving
  'recruitment bureaus Nederland nieuws',
  'werving selectie Nederland vacatures',
  'executive search Nederland ontwikkelingen',

  // Werkgelegenheid & vacatures
  'werkgelegenheid Nederland UWV rapport',
  'vacatures Nederland tekort arbeidsmarkt',
  'krappe arbeidsmarkt Nederland sectoren',
  'moeilijk vervulbare vacatures Nederland',

  // Arbeidsmarkt cijfers
  'CBS werkloosheid Nederland cijfers',
  'UWV arbeidsmarkt rapport Nederland',
  'vacature intensiteit Nederland statistieken',

  // Nederlandse technische sector
  'technisch personeel Nederland tekort',
  'Nederlandse industrie vacatures',
  'installatietechniek Nederland werving'
];

// Initialize directories
async function initDirectories() {
  await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
  await fs.mkdir(path.join(__dirname, 'reports'), { recursive: true });
  await fs.mkdir(path.join(__dirname, 'logs'), { recursive: true });
}

// Search Brave for news
async function searchBrave(query) {
  try {
    const response = await axios.get(BRAVE_API_URL, {
      headers: {
        'X-Subscription-Token': BRAVE_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        q: query,
        count: 20,
        country: 'nl', // Focus op Nederland
        search_lang: 'nl', // Nederlandse taal
        freshness: 'pw' // Past week voor meer resultaten
      }
    });

    return {
      query: query,
      results: response.data.web?.results || [],
      news: response.data.news?.results || [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error searching for "${query}":`, error.message);
    return { query, results: [], news: [], error: error.message };
  }
}

// Collect all news
async function collectDailyNews() {
  console.log('🔍 Starting daily recruitment news collection...');

  const allResults = [];

  for (const query of SEARCH_QUERIES) {
    console.log(`  Searching: ${query}`);
    const results = await searchBrave(query);
    allResults.push(results);

    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Process and deduplicate results
  const processedNews = processResults(allResults);

  // Save to file
  await saveNewsData(processedNews);

  // Generate report
  await generateDailyReport(processedNews);

  // Send notifications if configured
  await sendNotifications(processedNews);

  console.log('✅ Daily news collection complete!');

  return processedNews;
}

// Process and deduplicate results
function processResults(allResults) {
  const uniqueArticles = new Map();

  allResults.forEach(searchResult => {
    // Process web results
    searchResult.results.forEach(article => {
      const key = article.url || article.title;
      if (!uniqueArticles.has(key)) {
        uniqueArticles.set(key, {
          title: article.title,
          url: article.url,
          description: article.description,
          source: article.page_age || 'Recent',
          query: searchResult.query,
          type: 'web'
        });
      }
    });

    // Process news results
    searchResult.news.forEach(article => {
      const key = article.url || article.title;
      if (!uniqueArticles.has(key)) {
        uniqueArticles.set(key, {
          title: article.title,
          url: article.url,
          description: article.description,
          source: article.age || 'Recent',
          query: searchResult.query,
          type: 'news'
        });
      }
    });
  });

  // Convert to array and categorize
  const articles = Array.from(uniqueArticles.values());

  return {
    date: new Date().toISOString(),
    totalArticles: articles.length,
    categories: categorizeArticles(articles),
    topArticles: articles.slice(0, 20),
    allArticles: articles
  };
}

// Categorize articles by topic
function categorizeArticles(articles) {
  const categories = {
    'RPO & Staffing': [],
    'ATS & Recruitment Tech': [],
    'Recruitment Marketing': [],
    'Uitzendbranche': [],
    'Werkgelegenheid & Vacatures': [],
    'Recruitment & Werving': [],
    'Arbeidsmarkt Cijfers': [],
    'Personeelstekorten': [],
    'Technische Sector': [],
    'CAO & Lonen': [],
    'Wetgeving & Beleid': [],
    'Overig': []
  };

  articles.forEach(article => {
    const text = `${article.title} ${article.description}`.toLowerCase();

    if (text.includes('rpo') || text.includes('staffing') || text.includes('msp') || text.includes('managed service') || text.includes('outsourc')) {
      categories['RPO & Staffing'].push(article);
    } else if (text.includes('ats') || text.includes('applicant tracking') || text.includes('recruitment software') || text.includes('hr tech') || text.includes('recruitment technologie')) {
      categories['ATS & Recruitment Tech'].push(article);
    } else if (text.includes('recruitment marketing') || text.includes('employer brand') || text.includes('talent acquisitie') || text.includes('recruitment campagne')) {
      categories['Recruitment Marketing'].push(article);
    } else if (text.includes('uitzend') || text.includes('abu') || text.includes('nbbu') || text.includes('flex') || text.includes('detacher')) {
      categories['Uitzendbranche'].push(article);
    } else if (text.includes('werkgelegenheid') || text.includes('vacature') || text.includes('werkloosheid') || text.includes('banen')) {
      categories['Werkgelegenheid & Vacatures'].push(article);
    } else if (text.includes('recruitment') || text.includes('werving') || text.includes('selectie') || text.includes('headhunt')) {
      categories['Recruitment & Werving'].push(article);
    } else if (text.includes('cbs') || text.includes('uwv') || text.includes('cijfer') || text.includes('statistiek')) {
      categories['Arbeidsmarkt Cijfers'].push(article);
    } else if (text.includes('tekort') || text.includes('krapte') || text.includes('schaars') || text.includes('moeilijk vervulbaar')) {
      categories['Personeelstekorten'].push(article);
    } else if (text.includes('technisch') || text.includes('techniek') || text.includes('industrie') || text.includes('installatie')) {
      categories['Technische Sector'].push(article);
    } else if (text.includes('cao') || text.includes('loon') || text.includes('salaris') || text.includes('arbeidsvoorwaarden')) {
      categories['CAO & Lonen'].push(article);
    } else if (text.includes('wetgeving') || text.includes('beleid') || text.includes('regeling') || text.includes('wet')) {
      categories['Wetgeving & Beleid'].push(article);
    } else {
      categories['Overig'].push(article);
    }
  });

  return categories;
}

// Save news data
async function saveNewsData(newsData) {
  const existingData = await loadExistingData();
  existingData.push(newsData);

  // Keep last 30 days of data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentData = existingData.filter(entry =>
    new Date(entry.date) > thirtyDaysAgo
  );

  await fs.writeFile(NEWS_FILE, JSON.stringify(recentData, null, 2));
}

// Load existing data
async function loadExistingData() {
  try {
    const data = await fs.readFile(NEWS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Generate daily report
async function generateDailyReport(newsData) {
  const today = new Date().toISOString().split('T')[0];
  const reportPath = path.join(REPORTS_DIR, `recruitment-news-${today}.html`);

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Recruitment News - ${today}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f7fa;
    }
    .header {
      background: linear-gradient(135deg, #003366, #0066cc);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    h1 {
      margin: 0;
      font-size: 28px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #003366;
    }
    .stat-label {
      color: #666;
      margin-top: 5px;
    }
    .category {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .category h2 {
      color: #003366;
      border-bottom: 2px solid #e1e4e8;
      padding-bottom: 10px;
    }
    .article {
      padding: 15px 0;
      border-bottom: 1px solid #e1e4e8;
    }
    .article:last-child {
      border-bottom: none;
    }
    .article-title {
      font-weight: 600;
      color: #0066cc;
      text-decoration: none;
      display: block;
      margin-bottom: 5px;
    }
    .article-title:hover {
      text-decoration: underline;
    }
    .article-description {
      color: #666;
      line-height: 1.5;
    }
    .article-meta {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }
    .empty-category {
      color: #999;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Daily Recruitment News</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-number">${newsData.totalArticles}</div>
      <div class="stat-label">Total Articles</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${Object.keys(newsData.categories).length}</div>
      <div class="stat-label">Categories</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${SEARCH_QUERIES.length}</div>
      <div class="stat-label">Search Queries</div>
    </div>
  </div>

  ${Object.entries(newsData.categories).map(([category, articles]) => `
    <div class="category">
      <h2>${category} (${articles.length})</h2>
      ${articles.length > 0 ? articles.slice(0, 5).map(article => `
        <div class="article">
          <a href="${article.url}" target="_blank" class="article-title">${article.title}</a>
          <div class="article-description">${article.description || ''}</div>
          <div class="article-meta">Source: ${article.source} | Query: ${article.query}</div>
        </div>
      `).join('') : '<p class="empty-category">No articles in this category today</p>'}
    </div>
  `).join('')}
</body>
</html>
  `;

  await fs.writeFile(reportPath, html);
  console.log(`📄 Report saved: ${reportPath}`);

  return reportPath;
}

// Send notifications (via Zapier webhook if configured)
async function sendNotifications(newsData) {
  if (!process.env.ZAPIER_WEBHOOK_URL) {
    return;
  }

  try {
    const summary = {
      date: newsData.date,
      totalArticles: newsData.totalArticles,
      topStories: newsData.topArticles.slice(0, 5).map(a => ({
        title: a.title,
        url: a.url
      })),
      categoryCounts: Object.entries(newsData.categories).reduce((acc, [cat, articles]) => {
        acc[cat] = articles.length;
        return acc;
      }, {})
    };

    await axios.post(process.env.ZAPIER_WEBHOOK_URL, {
      type: 'daily_recruitment_news',
      data: summary
    });

    console.log('📧 Notification sent via Zapier');
  } catch (error) {
    console.error('Failed to send Zapier notification:', error.message);
  }
}

// Schedule daily collection (9 AM every day)
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Running scheduled daily news collection...');
  await collectDailyNews();
});

// MCP Endpoints
app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  switch(name) {
    case 'collect_news':
      const newsData = await collectDailyNews();
      res.json({
        success: true,
        articlesFound: newsData.totalArticles,
        categories: Object.keys(newsData.categories),
        message: 'Daily news collected successfully'
      });
      break;

    case 'get_latest_news':
      const existingData = await loadExistingData();
      const latest = existingData[existingData.length - 1] || null;
      res.json(latest);
      break;

    case 'get_category_news':
      const data = await loadExistingData();
      const latestData = data[data.length - 1];
      const categoryName = args.category || 'AI & Technology';
      res.json({
        category: categoryName,
        articles: latestData?.categories[categoryName] || []
      });
      break;

    case 'search_news':
      const searchResults = await searchBrave(args.query);
      res.json(searchResults);
      break;

    default:
      res.status(404).json({ error: 'Tool not found' });
  }
});

// Web dashboard
app.get('/dashboard', async (req, res) => {
  const data = await loadExistingData();
  const latest = data[data.length - 1];

  if (!latest) {
    res.send('<h1>No news data yet. Run collection first.</h1>');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const reportPath = path.join(REPORTS_DIR, `recruitment-news-${today}.html`);

  try {
    const report = await fs.readFile(reportPath, 'utf8');
    res.send(report);
  } catch {
    res.send('<h1>No report available for today</h1>');
  }
});

// Initialize and start
const PORT = 3011;

async function start() {
  await initDirectories();

  app.listen(PORT, () => {
    console.log('🚀 Daily Recruitment News Agent Started');
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log('⏰ Scheduled to run daily at 9:00 AM');
    console.log('');
    console.log('Commands:');
    console.log('  - Manual collection: "Collect recruitment news now"');
    console.log('  - View latest: "Show latest recruitment news"');
    console.log('  - Search specific: "Search news about AI in recruitment"');
  });

  // Run initial collection if no data exists
  const existingData = await loadExistingData();
  if (existingData.length === 0) {
    console.log('🔄 Running initial news collection...');
    await collectDailyNews();
  }
}

start();