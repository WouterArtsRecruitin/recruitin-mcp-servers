#!/usr/bin/env node
// Dutch Recruitment News - Local Storage Version
// Slaat nieuws op in JSON en HTML formaat voor makkelijke import

const express = require('express');
const Parser = require('rss-parser');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');

const app = express();
app.use(express.json());
const parser = new Parser();

// Nederlandse RSS Feeds
const DUTCH_RSS_FEEDS = [
  // Top Recruitment sites
  { name: 'Intelligence Group', url: 'https://intelligence-group.nl/feed/', category: 'Recruitment Research' },
  { name: 'Werf&', url: 'https://www.werf-en.nl/feed/', category: 'Recruitment Vakblad' },
  { name: 'Recruiters Connected', url: 'https://www.recruitersconnected.nl/feed/', category: 'Recruitment Community' },
  { name: 'MT.nl HR', url: 'https://www.mt.nl/rss/hr', category: 'HR Management' },
  { name: 'HR Praktijk', url: 'https://www.hrpraktijk.nl/rss', category: 'HR Praktijk' },
  { name: 'NOS Economie', url: 'https://feeds.nos.nl/nosnieuwseconomie', category: 'Economie' },
  { name: 'NU.nl Werk', url: 'https://www.nu.nl/rss/Werk', category: 'Werk' }
];

// Keywords voor filtering
const RECRUITMENT_KEYWORDS = [
  'recruitment', 'werving', 'selectie', 'vacature', 'kandidaat',
  'arbeidsmarkt', 'personeelstekort', 'krapte', 'hr', 'talent',
  'employer branding', 'assessment', 'onboarding'
];

// Check relevance
function isRelevant(item) {
  const text = `${item.title || ''} ${item.contentSnippet || ''}`.toLowerCase();
  return RECRUITMENT_KEYWORDS.some(kw => text.includes(kw));
}

// Fetch RSS
async function fetchFeed(feed) {
  try {
    const data = await parser.parseURL(feed.url);
    return data.items
      .filter(isRelevant)
      .slice(0, 10)
      .map(item => ({
        title: item.title,
        url: item.link,
        description: item.contentSnippet || '',
        date: item.pubDate || new Date().toISOString(),
        source: feed.name,
        category: feed.category
      }));
  } catch (error) {
    console.log(`❌ ${feed.name}: ${error.message}`);
    return [];
  }
}

// Collect all news
async function collectNews() {
  console.log('🔍 Collecting Dutch recruitment news...\n');

  let allArticles = [];
  for (const feed of DUTCH_RSS_FEEDS) {
    console.log(`📰 ${feed.name}...`);
    const articles = await fetchFeed(feed);
    allArticles = allArticles.concat(articles);
    console.log(`   ✅ ${articles.length} articles`);
    await new Promise(r => setTimeout(r, 500));
  }

  // Remove duplicates
  const unique = Array.from(
    new Map(allArticles.map(a => [a.url, a])).values()
  );

  // Save to files
  const timestamp = new Date().toISOString().split('T')[0];

  // Save JSON
  const jsonPath = path.join(__dirname, 'news-data', `news-${timestamp}.json`);
  await fs.mkdir(path.dirname(jsonPath), { recursive: true });
  await fs.writeFile(jsonPath, JSON.stringify(unique, null, 2));

  // Save HTML for easy viewing
  const htmlPath = path.join(__dirname, 'news-data', `news-${timestamp}.html`);
  const html = generateHTML(unique, timestamp);
  await fs.writeFile(htmlPath, html);

  // Save CSV for Notion import
  const csvPath = path.join(__dirname, 'news-data', `news-${timestamp}.csv`);
  const csv = generateCSV(unique);
  await fs.writeFile(csvPath, csv);

  console.log(`\n✅ Saved ${unique.length} articles to:`);
  console.log(`   📄 ${jsonPath}`);
  console.log(`   🌐 ${htmlPath}`);
  console.log(`   📊 ${csvPath} (import this to Notion!)`);

  return unique;
}

// Generate HTML
function generateHTML(articles, date) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Recruitment News - ${date}</title>
  <style>
    body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #003366; }
    .article { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .article h3 { margin: 0 0 10px 0; }
    .article a { color: #0066cc; text-decoration: none; }
    .meta { color: #666; font-size: 12px; margin-top: 10px; }
    .source { background: #003366; color: white; padding: 2px 8px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>🇳🇱 Dutch Recruitment News - ${date}</h1>
  <p>Total: ${articles.length} articles</p>
  <hr>
  ${articles.map(a => `
    <div class="article">
      <h3><a href="${a.url}" target="_blank">${a.title}</a></h3>
      <p>${a.description}</p>
      <div class="meta">
        <span class="source">${a.source}</span>
        ${a.category} • ${new Date(a.date).toLocaleDateString('nl-NL')}
      </div>
    </div>
  `).join('')}
</body>
</html>`;
}

// Generate CSV for Notion
function generateCSV(articles) {
  const headers = 'Title,URL,Description,Source,Category,Date';
  const rows = articles.map(a => {
    const escape = (s) => `"${(s || '').replace(/"/g, '""')}"`;
    return [
      escape(a.title),
      escape(a.url),
      escape(a.description),
      escape(a.source),
      escape(a.category),
      escape(a.date)
    ].join(',');
  });
  return [headers, ...rows].join('\n');
}

// Schedule daily
cron.schedule('0 9 * * *', collectNews, { timezone: 'Europe/Amsterdam' });

// Web dashboard
app.get('/', async (req, res) => {
  const files = await fs.readdir(path.join(__dirname, 'news-data')).catch(() => []);
  const htmlFiles = files.filter(f => f.endsWith('.html')).sort().reverse();

  res.send(`
    <h1>📰 Dutch Recruitment News Collector</h1>
    <button onclick="location.href='/collect'">🔄 Collect News Now</button>
    <h2>Recent Collections:</h2>
    <ul>
      ${htmlFiles.map(f => `<li><a href="/view/${f}">${f}</a></li>`).join('')}
    </ul>
    <h3>💡 Import to Notion:</h3>
    <ol>
      <li>Download the CSV file</li>
      <li>In Notion, create a new database</li>
      <li>Click "..." → "Import" → "CSV"</li>
      <li>Select the downloaded CSV file</li>
    </ol>
  `);
});

app.get('/collect', async (req, res) => {
  const articles = await collectNews();
  res.redirect('/');
});

app.get('/view/:file', async (req, res) => {
  const filePath = path.join(__dirname, 'news-data', req.params.file);
  const content = await fs.readFile(filePath, 'utf8');
  res.send(content);
});

app.get('/download/:file', async (req, res) => {
  const filePath = path.join(__dirname, 'news-data', req.params.file);
  res.download(filePath);
});

// Start
const PORT = 3014;
app.listen(PORT, async () => {
  console.log('🚀 Dutch News Collector (Local Storage)');
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log('💾 Saves to: news-data/ folder');
  console.log('📥 Import CSV files to Notion manually');

  // Run initial collection
  console.log('\n🔄 Running initial collection...');
  await collectNews();
});