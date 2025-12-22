#!/usr/bin/env node
// Dutch Recruitment News Agent - Final Automated Version
// Collects news from Dutch recruitment sources and uploads to Notion

const express = require('express');
const Parser = require('rss-parser');
const { Client } = require('@notionhq/client');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());
const parser = new Parser();

// Configuration from .env
const NOTION_API_KEY = process.env.NOTION_API_KEY || 'ntn_N921362306116pa5KHYRvt3AScWH3y2K87Hf4bMwi2x5R3';
const DATABASE_ID = process.env.NOTION_DATABASE_ID || '4073e632539b40b4bfa3289e64a99f1e';
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL || 'https://hooks.zapier.com/hooks/catch/23933997/u1mitf8/';

const notion = new Client({ auth: NOTION_API_KEY });

// Dutch RSS Feeds - Focus on requested sites
const DUTCH_RSS_FEEDS = [
  // Primary requested sources
  { name: 'Intelligence Group', url: 'https://intelligence-group.nl/feed/', category: 'Recruitment Research' },
  { name: 'Werf&', url: 'https://www.werf-en.nl/feed/', category: 'Recruitment Vakblad' },
  { name: 'Recruiters Connected', url: 'https://www.recruitersconnected.nl/feed/', category: 'Recruitment Community' },

  // Additional Dutch recruitment sources
  { name: 'MT.nl HR', url: 'https://www.mt.nl/rss/hr', category: 'HR Management' },
  { name: 'HR Praktijk', url: 'https://www.hrpraktijk.nl/rss', category: 'HR Praktijk' },
  { name: 'PW De Gids', url: 'https://www.pwdegids.nl/rss', category: 'HR & Personeel' },
  { name: 'Intermediair', url: 'https://www.intermediair.nl/rss/alle', category: 'Carrière' },
  { name: 'FD Arbeidsmarkt', url: 'https://fd.nl/rss/arbeidsmarkt', category: 'Arbeidsmarkt' },
  { name: 'NOS Economie', url: 'https://feeds.nos.nl/nosnieuwseconomie', category: 'Economie' },
  { name: 'NU.nl Werk', url: 'https://www.nu.nl/rss/Werk', category: 'Werk' }
];

// Keywords for filtering
const RECRUITMENT_KEYWORDS = [
  'recruitment', 'werving', 'selectie', 'vacature', 'kandidaat',
  'arbeidsmarkt', 'personeelstekort', 'krapte', 'hr', 'talent',
  'employer branding', 'assessment', 'onboarding', 'rpo',
  'werknemer', 'werkgever', 'sollicitatie', 'interview'
];

// Track uploaded articles
let uploadedUrls = new Set();

async function loadUploadedUrls() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'uploaded-urls.json'), 'utf8');
    uploadedUrls = new Set(JSON.parse(data));
  } catch {
    uploadedUrls = new Set();
  }
}

async function saveUploadedUrls() {
  await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
  await fs.writeFile(
    path.join(__dirname, 'data', 'uploaded-urls.json'),
    JSON.stringify(Array.from(uploadedUrls))
  );
}

function isRelevant(item) {
  const text = `${item.title || ''} ${item.contentSnippet || ''}`.toLowerCase();
  return RECRUITMENT_KEYWORDS.some(kw => text.includes(kw));
}

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
    console.log(`   ❌ Error fetching ${feed.name}: ${error.message}`);
    return [];
  }
}

async function uploadToNotion(article) {
  if (uploadedUrls.has(article.url)) {
    return { success: false, reason: 'duplicate' };
  }

  try {
    const pageData = {
      parent: { database_id: DATABASE_ID },
      properties: {},
      children: [
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{
              type: 'text',
              text: { content: article.title }
            }]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: { content: `📰 ${article.source} | ${article.category}` }
            }]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: { content: `📅 ${new Date(article.date).toLocaleDateString('nl-NL')}` }
            }]
          }
        },
        {
          object: 'block',
          type: 'quote',
          quote: {
            rich_text: [{
              type: 'text',
              text: { content: article.description || 'Geen beschrijving' }
            }]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: { content: '🔗 Lees meer: ' }
            }, {
              type: 'text',
              text: {
                content: article.url,
                link: { url: article.url }
              }
            }]
          }
        }
      ]
    };

    // Try to add title property if database has it
    try {
      const db = await notion.databases.retrieve({ database_id: DATABASE_ID });
      const titleProp = Object.entries(db.properties || {}).find(([_, p]) => p.type === 'title');
      if (titleProp) {
        pageData.properties[titleProp[0]] = {
          title: [{ text: { content: article.title } }]
        };
      }
    } catch {}

    await notion.pages.create(pageData);
    uploadedUrls.add(article.url);
    return { success: true };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

async function collectAndUploadNews() {
  console.log('\n🔍 Starting Dutch recruitment news collection...');
  console.log(`⏰ ${new Date().toLocaleString('nl-NL')}\n`);

  await loadUploadedUrls();

  let allArticles = [];
  let uploadedCount = 0;
  let skippedCount = 0;

  // Collect from all feeds
  for (const feed of DUTCH_RSS_FEEDS) {
    console.log(`📰 Fetching: ${feed.name}...`);
    const articles = await fetchFeed(feed);
    allArticles = allArticles.concat(articles);
    await new Promise(r => setTimeout(r, 500));
  }

  // Remove duplicates
  const uniqueArticles = Array.from(
    new Map(allArticles.map(a => [a.url, a])).values()
  );

  console.log(`\n📊 Found ${uniqueArticles.length} unique articles`);

  // Upload to Notion
  console.log('\n📤 Uploading to Notion...\n');

  for (const article of uniqueArticles) {
    const result = await uploadToNotion(article);

    if (result.success) {
      console.log(`✅ ${article.title.substring(0, 60)}...`);
      uploadedCount++;
    } else if (result.reason === 'duplicate') {
      skippedCount++;
    } else {
      console.log(`❌ Failed: ${article.title.substring(0, 30)}... (${result.reason})`);
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  await saveUploadedUrls();

  // Summary
  console.log('\n📈 Summary:');
  console.log(`   ✅ New articles uploaded: ${uploadedCount}`);
  console.log(`   ⏭️  Skipped (duplicates): ${skippedCount}`);
  console.log(`   📰 Total in database: ${uploadedUrls.size}`);

  // Send Zapier notification if new articles
  if (uploadedCount > 0 && ZAPIER_WEBHOOK_URL) {
    try {
      const axios = require('axios');
      await axios.post(ZAPIER_WEBHOOK_URL, {
        type: 'dutch_news_update',
        message: `${uploadedCount} nieuwe recruitment artikelen toegevoegd`,
        timestamp: new Date().toISOString(),
        articles: uniqueArticles.slice(0, 5).map(a => ({
          title: a.title,
          url: a.url,
          source: a.source
        }))
      });
      console.log('📧 Zapier notification sent');
    } catch {
      console.log('⚠️  Zapier notification failed');
    }
  }

  return { uploaded: uploadedCount, skipped: skippedCount, total: uniqueArticles.length };
}

// Schedule daily at 9:00 AM Amsterdam time
cron.schedule('0 9 * * *', collectAndUploadNews, {
  timezone: 'Europe/Amsterdam'
});

// Web dashboard
app.get('/', async (req, res) => {
  await loadUploadedUrls();

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Dutch Recruitment News Agent</title>
  <style>
    body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #FF6B35, #003366); color: white; padding: 30px; border-radius: 12px; }
    .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .status { display: inline-block; padding: 5px 10px; background: #4CAF50; color: white; border-radius: 4px; }
    .source { display: inline-block; margin: 5px; padding: 8px 12px; background: #e3f2fd; border-radius: 4px; }
    button { background: #FF6B35; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; }
    button:hover { background: #E55A2B; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🇳🇱 Dutch Recruitment News Agent</h1>
    <p>Automated collection from ${DUTCH_RSS_FEEDS.length} Dutch sources → Notion database</p>
  </div>

  <div class="card">
    <h2>Status</h2>
    <p><span class="status">ACTIVE</span> Daily collection at 9:00 AM Amsterdam time</p>
    <p>📊 Articles in database: ${uploadedUrls.size}</p>
    <p>✅ Notion database: Connected (${DATABASE_ID.substring(0, 8)}...)</p>
    <p>📧 Zapier webhook: ${ZAPIER_WEBHOOK_URL ? 'Configured' : 'Not configured'}</p>
  </div>

  <div class="card">
    <h2>News Sources</h2>
    ${DUTCH_RSS_FEEDS.map(feed => `<span class="source">${feed.name}</span>`).join('')}
  </div>

  <div class="card">
    <h2>Actions</h2>
    <button onclick="collectNews()">🔄 Collect News Now</button>
    <button onclick="window.open('https://notion.so/${DATABASE_ID}', '_blank')">📝 Open Notion Database</button>
  </div>

  <script>
    async function collectNews() {
      if (confirm('Start news collection now?')) {
        const btn = event.target;
        btn.disabled = true;
        btn.textContent = 'Collecting...';

        const response = await fetch('/collect', { method: 'POST' });
        const result = await response.json();

        alert(\`Collection complete!\\n✅ New: \${result.uploaded}\\n⏭️ Skipped: \${result.skipped}\\n📰 Total found: \${result.total}\`);
        location.reload();
      }
    }
  </script>
</body>
</html>`;

  res.send(html);
});

app.post('/collect', async (req, res) => {
  const result = await collectAndUploadNews();
  res.json(result);
});

// Start server
const PORT = 3015;

async function start() {
  app.listen(PORT, () => {
    console.log('🚀 Dutch Recruitment News Agent - Final Version');
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`📰 Monitoring ${DUTCH_RSS_FEEDS.length} Dutch news sources`);
    console.log('✅ Direct Notion integration active');
    console.log('⏰ Scheduled daily at 9:00 AM Amsterdam time');
    console.log('\nFocus sources:');
    console.log('  - Intelligence Group');
    console.log('  - Werf&');
    console.log('  - Recruiters Connected\n');
  });

  // Run initial collection
  console.log('🔄 Running initial collection...');
  await collectAndUploadNews();
}

start();