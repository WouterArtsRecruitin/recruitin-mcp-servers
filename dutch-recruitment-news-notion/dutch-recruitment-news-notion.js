#!/usr/bin/env node
// Dutch Recruitment News Agent with Notion Integration
// Zoekt alleen naar Nederlands recruitment nieuws en slaat op in Notion

const express = require('express');
const axios = require('axios');
const { Client } = require('@notionhq/client');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');

const app = express();
app.use(express.json());

// Configuration
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';
const NOTION_API_KEY = process.env.NOTION_API_KEY;

// Initialize Notion client
const notion = new Client({ auth: NOTION_API_KEY });

// Notion Database ID (will be created if not exists)
let NOTION_DATABASE_ID = null;

// Dutch-only search queries
const DUTCH_SEARCH_QUERIES = [
  // Algemene recruitment nieuws
  'recruitment nieuws Nederland vandaag',
  'werving selectie Nederland laatste nieuws',
  'HR nieuws Nederland vandaag',
  'arbeidsmarkt Nederland actueel',

  // Specifieke onderwerpen
  'personeelstekort Nederland oplossingen 2025',
  'krapte arbeidsmarkt Nederland nieuws',
  'AI recruitment Nederland innovatie',
  'recruitment technologie Nederland',

  // Trends en ontwikkelingen
  'recruitment trends Nederland 2025',
  'employer branding Nederland cases',
  'kandidaat ervaring Nederland onderzoek',
  'werving selectie best practices Nederland',

  // Sectoren
  'techniek recruitment Nederland tekort',
  'ICT vacatures Nederland trends',
  'zorg personeel tekort Nederland nieuws',
  'logistiek recruitment Nederland',

  // RPO en outsourcing
  'RPO recruitment process outsourcing Nederland',
  'uitbesteden werving selectie Nederland',
  'recruitment bureau Nederland nieuws',
  'executive search Nederland trends'
];

// Create or get Notion database
async function setupNotionDatabase() {
  try {
    // First, search for existing database
    const response = await notion.search({
      query: 'Recruitment Nieuws Nederland',
      filter: {
        property: 'object',
        value: 'page'
      }
    });

    // Check if any results are databases
    const databases = response.results.filter(r => r.object === 'database');
    if (databases.length > 0) {
      NOTION_DATABASE_ID = databases[0].id;
      console.log('✅ Using existing Notion database');
      return;
    }

    // Use environment variable for database ID
    if (process.env.NOTION_DATABASE_ID) {
      NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
      console.log('✅ Using configured Notion database ID');
      return;
    }

    // Skip database creation - user needs to provide ID
    console.log('⚠️  No Notion database found. Please create one and set NOTION_DATABASE_ID');
    return;

    // Create new database if not exists (disabled for now)
    /*
    const database = await notion.databases.create({
      parent: { type: 'page_id', page_id: process.env.NOTION_PAGE_ID || 'YOUR_PAGE_ID' },
      title: [{ type: 'text', text: { content: 'Recruitment Nieuws Nederland' } }],
      properties: {
        'Titel': { title: {} },
        'URL': { url: {} },
        'Beschrijving': { rich_text: {} },
        'Categorie': {
          select: {
            options: [
              { name: 'AI & Technologie', color: 'blue' },
              { name: 'Personeelstekort', color: 'red' },
              { name: 'Employer Branding', color: 'green' },
              { name: 'Arbeidsmarkt', color: 'yellow' },
              { name: 'RPO & Outsourcing', color: 'purple' },
              { name: 'Trends', color: 'pink' },
              { name: 'Best Practices', color: 'gray' },
              { name: 'Sector Specifiek', color: 'orange' }
            ]
          }
        },
        'Zoekterm': { rich_text: {} },
        'Datum Gevonden': { date: {} },
        'Bron': { rich_text: {} },
        'Status': {
          select: {
            options: [
              { name: 'Nieuw', color: 'blue' },
              { name: 'Gelezen', color: 'green' },
              { name: 'Belangrijk', color: 'red' }
            ]
          }
        }
      }
    });

    NOTION_DATABASE_ID = database.id;
    console.log('✅ Created new Notion database');
    */
  } catch (error) {
    console.error('❌ Notion database setup failed:', error);
    // Use fallback database ID if available
    NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || null;
  }
}

// Search Brave for Dutch news
async function searchBraveDutch(query) {
  try {
    const response = await axios.get(BRAVE_API_URL, {
      headers: {
        'X-Subscription-Token': BRAVE_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        q: `${query} site:.nl`, // Focus on Dutch websites
        country: 'nl',  // Netherlands
        search_lang: 'nl', // Dutch language
        count: 20,
        freshness: 'pw' // Past week
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

// Categorize Dutch article
function categorizeDutchArticle(article) {
  const text = `${article.title} ${article.description}`.toLowerCase();

  if (text.includes('ai') || text.includes('artificial') || text.includes('automatisering') || text.includes('technologie')) {
    return 'AI & Technologie';
  } else if (text.includes('tekort') || text.includes('krapte') || text.includes('schaarste')) {
    return 'Personeelstekort';
  } else if (text.includes('employer brand') || text.includes('werkgeversmerk') || text.includes('evp')) {
    return 'Employer Branding';
  } else if (text.includes('arbeidsmarkt') || text.includes('werkgelegenheid')) {
    return 'Arbeidsmarkt';
  } else if (text.includes('rpo') || text.includes('outsourc') || text.includes('uitbesteden')) {
    return 'RPO & Outsourcing';
  } else if (text.includes('trend') || text.includes('toekomst') || text.includes('ontwikkeling')) {
    return 'Trends';
  } else if (text.includes('best practice') || text.includes('tips') || text.includes('aanpak')) {
    return 'Best Practices';
  } else if (text.includes('techniek') || text.includes('ict') || text.includes('zorg') || text.includes('logistiek')) {
    return 'Sector Specifiek';
  }

  return 'Arbeidsmarkt'; // Default category
}

// Save article to Notion
async function saveToNotion(article, query) {
  if (!NOTION_DATABASE_ID) {
    console.log('⚠️  Notion database not configured');
    return;
  }

  try {
    // Check if article already exists
    const existing = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      filter: {
        property: 'URL',
        url: { equals: article.url }
      }
    });

    if (existing.results.length > 0) {
      console.log(`  Skip: Already in Notion - ${article.title}`);
      return;
    }

    // Add to Notion
    await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        'Titel': {
          title: [{ text: { content: article.title || 'Geen titel' } }]
        },
        'URL': {
          url: article.url
        },
        'Beschrijving': {
          rich_text: [{ text: { content: article.description || '' } }]
        },
        'Categorie': {
          select: { name: categorizeDutchArticle(article) }
        },
        'Zoekterm': {
          rich_text: [{ text: { content: query } }]
        },
        'Datum Gevonden': {
          date: { start: new Date().toISOString().split('T')[0] }
        },
        'Bron': {
          rich_text: [{ text: { content: new URL(article.url).hostname } }]
        },
        'Status': {
          select: { name: 'Nieuw' }
        }
      }
    });

    console.log(`  ✅ Saved to Notion: ${article.title}`);
  } catch (error) {
    console.error(`  ❌ Failed to save: ${error.message}`);
  }
}

// Collect Dutch news
async function collectDutchNews() {
  console.log('🔍 Starting Dutch recruitment news collection...');
  console.log('📊 Searching only .nl websites and Dutch content');

  let totalSaved = 0;

  for (const query of DUTCH_SEARCH_QUERIES) {
    console.log(`\n🔎 Searching: ${query}`);
    const results = await searchBraveDutch(query);

    // Process web results
    for (const article of results.results) {
      // Filter for Dutch sources
      if (article.url && (article.url.includes('.nl') || article.language === 'nl')) {
        await saveToNotion(article, query);
        totalSaved++;
      }
    }

    // Process news results
    for (const article of results.news) {
      if (article.url && (article.url.includes('.nl') || article.language === 'nl')) {
        await saveToNotion(article, query);
        totalSaved++;
      }
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Collection complete! ${totalSaved} articles saved to Notion`);

  // Send Zapier notification if configured
  if (process.env.ZAPIER_WEBHOOK_URL) {
    try {
      await axios.post(process.env.ZAPIER_WEBHOOK_URL, {
        type: 'dutch_recruitment_news',
        message: `${totalSaved} nieuwe Nederlandse recruitment artikelen toegevoegd aan Notion`,
        timestamp: new Date().toISOString()
      });
      console.log('📧 Zapier notification sent');
    } catch (error) {
      console.error('Zapier notification failed:', error.message);
    }
  }

  return totalSaved;
}

// Schedule daily collection (9 AM Amsterdam time)
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Running scheduled Dutch news collection...');
  await collectDutchNews();
}, {
  timezone: 'Europe/Amsterdam'
});

// MCP Endpoints
app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  switch(name) {
    case 'collect_dutch_news':
      const count = await collectDutchNews();
      res.json({
        success: true,
        articlesFound: count,
        message: `${count} Dutch recruitment articles saved to Notion`
      });
      break;

    case 'search_dutch_news':
      const searchResults = await searchBraveDutch(args.query || 'recruitment Nederland');
      res.json(searchResults);
      break;

    case 'get_notion_stats':
      if (NOTION_DATABASE_ID) {
        const response = await notion.databases.query({
          database_id: NOTION_DATABASE_ID,
          page_size: 100
        });
        res.json({
          totalArticles: response.results.length,
          database_id: NOTION_DATABASE_ID
        });
      } else {
        res.json({ error: 'Notion database not configured' });
      }
      break;

    default:
      res.status(404).json({ error: 'Tool not found' });
  }
});

// Web dashboard
app.get('/dashboard', async (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dutch Recruitment News - Notion Integration</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f7fa;
    }
    .header {
      background: linear-gradient(135deg, #FF6B35, #003366);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    h1 { margin: 0; font-size: 28px; }
    .info-card {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      background: #4CAF50;
      color: white;
      border-radius: 4px;
      font-size: 14px;
    }
    .query-list {
      background: #f0f0f0;
      padding: 15px;
      border-radius: 8px;
      margin: 10px 0;
    }
    .query-item {
      padding: 5px 0;
      border-bottom: 1px solid #ddd;
    }
    .query-item:last-child {
      border-bottom: none;
    }
    button {
      background: #FF6B35;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      margin: 10px 5px;
    }
    button:hover {
      background: #E55A2B;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🇳🇱 Dutch Recruitment News Agent</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Automatische verzameling van Nederlands recruitment nieuws naar Notion</p>
  </div>

  <div class="info-card">
    <h2>Status</h2>
    <p><span class="status">ACTIEF</span> Agent draait en verzamelt dagelijks om 9:00 uur</p>
    <p>Notion Database: ${NOTION_DATABASE_ID ? '✅ Geconfigureerd' : '❌ Niet geconfigureerd'}</p>
    <p>Brave Search: ${BRAVE_API_KEY ? '✅ Actief' : '❌ Geen API key'}</p>
  </div>

  <div class="info-card">
    <h2>Zoektermen (${DUTCH_SEARCH_QUERIES.length} queries)</h2>
    <div class="query-list">
      ${DUTCH_SEARCH_QUERIES.map(q => `<div class="query-item">• ${q}</div>`).join('')}
    </div>
  </div>

  <div class="info-card">
    <h2>Acties</h2>
    <button onclick="collectNews()">Start Handmatige Collectie</button>
    <button onclick="window.open('https://notion.so', '_blank')">Open Notion</button>
    <button onclick="viewStats()">Bekijk Statistieken</button>
  </div>

  <div class="info-card">
    <h2>Categorieën in Notion</h2>
    <ul>
      <li>AI & Technologie - Automatisering en technologie in recruitment</li>
      <li>Personeelstekort - Artikelen over krapte op de arbeidsmarkt</li>
      <li>Employer Branding - Werkgeversmerk en EVP</li>
      <li>Arbeidsmarkt - Algemene arbeidsmarkt ontwikkelingen</li>
      <li>RPO & Outsourcing - Uitbesteden van recruitment</li>
      <li>Trends - Toekomst en ontwikkelingen</li>
      <li>Best Practices - Tips en succesvolle aanpakken</li>
      <li>Sector Specifiek - Techniek, ICT, Zorg, Logistiek</li>
    </ul>
  </div>

  <script>
    async function collectNews() {
      if (confirm('Wil je nu nieuws verzamelen? Dit kan enkele minuten duren.')) {
        alert('Collectie gestart! Check de console voor voortgang.');
        const response = await fetch('/call-tool', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'collect_dutch_news', arguments: {} })
        });
        const result = await response.json();
        alert(\`Collectie voltooid! \${result.articlesFound} artikelen opgeslagen in Notion.\`);
      }
    }

    async function viewStats() {
      const response = await fetch('/call-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'get_notion_stats', arguments: {} })
      });
      const result = await response.json();
      alert(\`Notion Database Stats:\\nTotaal artikelen: \${result.totalArticles || 'Onbekend'}\\nDatabase ID: \${result.database_id || 'Niet geconfigureerd'}\`);
    }
  </script>
</body>
</html>
  `;
  res.send(html);
});

// Initialize and start
const PORT = 3012;

async function start() {
  await setupNotionDatabase();

  app.listen(PORT, () => {
    console.log('🚀 Dutch Recruitment News Agent (Notion Edition) Started');
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log('⏰ Scheduled to run daily at 9:00 AM Amsterdam time');
    console.log('🇳🇱 Focusing on Dutch recruitment news only');
    console.log('📝 Saving directly to Notion database');
    console.log('');
    console.log('Commands:');
    console.log('  - "Verzamel Nederlands recruitment nieuws"');
    console.log('  - "Zoek nieuws over [onderwerp] in Nederland"');
    console.log('  - "Toon Notion statistieken"');
  });

  // Run initial collection if first time
  const statsFile = path.join(__dirname, 'data', 'last-run.json');
  try {
    await fs.readFile(statsFile);
  } catch {
    console.log('🔄 First run detected - starting initial collection...');
    await collectDutchNews();
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    await fs.writeFile(statsFile, JSON.stringify({ lastRun: new Date().toISOString() }));
  }
}

start();