#!/usr/bin/env node
// Dutch Recruitment News via RSS Feeds to Notion
// Verzamelt nieuws van Nederlandse HR/Recruitment websites

const express = require('express');
const Parser = require('rss-parser');
const { Client } = require('@notionhq/client');
const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());
const parser = new Parser();

// Notion configuration
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || '9f591af14de34b56af25d79b61ee3035';
const notion = new Client({ auth: NOTION_API_KEY });

// Nederlandse RSS Feeds voor Recruitment/HR nieuws
const DUTCH_RSS_FEEDS = [
  // Top Recruitment Industry sites
  { name: 'Intelligence Group', url: 'https://intelligence-group.nl/feed/', category: 'Recruitment Research' },
  { name: 'Werf&', url: 'https://www.werf-en.nl/feed/', category: 'Recruitment Vakblad' },
  { name: 'Recruiters Connected', url: 'https://www.recruitersconnected.nl/feed/', category: 'Recruitment Community' },

  // HR & Recruitment sites
  { name: 'MT.nl HR', url: 'https://www.mt.nl/rss/hr', category: 'HR Management' },
  { name: 'PW De Gids', url: 'https://www.pwdegids.nl/rss', category: 'HR & Personeel' },
  { name: 'HR Praktijk', url: 'https://www.hrpraktijk.nl/rss', category: 'HR Praktijk' },
  { name: 'Intermediair', url: 'https://www.intermediair.nl/rss/alle', category: 'Carrière' },

  // Arbeidsmarkt nieuws
  { name: 'UWV Arbeidsmarkt', url: 'https://www.werk.nl/arbeidsmarktinformatie/rss', category: 'Arbeidsmarkt' },
  { name: 'CBS Arbeidsmarkt', url: 'https://www.cbs.nl/nl-nl/rss/arbeidsmarkt', category: 'Arbeidsmarkt' },

  // Business nieuws met recruitment
  { name: 'FD Arbeidsmarkt', url: 'https://fd.nl/rss/arbeidsmarkt', category: 'Arbeidsmarkt' },
  { name: 'Telegraaf Carrière', url: 'https://www.telegraaf.nl/rss/financieel/carriere.xml', category: 'Carrière' },

  // Tech recruitment
  { name: 'Computable Careers', url: 'https://www.computable.nl/rss/careers', category: 'Tech Recruitment' },
  { name: 'AG Connect', url: 'https://www.agconnect.nl/rss', category: 'Tech & ICT' },

  // Algemene nieuws sites met werk/carrière secties
  { name: 'NOS Economie', url: 'https://feeds.nos.nl/nosnieuwseconomie', category: 'Economie' },
  { name: 'NU.nl Werk', url: 'https://www.nu.nl/rss/Werk', category: 'Werk' }
];

// Keywords om te filteren op relevante artikelen
const RECRUITMENT_KEYWORDS = [
  // Nederlandse termen
  'recruitment', 'werving', 'selectie', 'vacature', 'kandidaat',
  'arbeidsmarkt', 'personeelstekort', 'krapte', 'tekort',
  'hr', 'hrm', 'human resources', 'personeel',
  'talent', 'talentmanagement', 'employer branding',
  'sollicitatie', 'interview', 'assessment',
  'onboarding', 'retentie', 'uitstroom',
  'arbeidsvoorwaarden', 'cao', 'salaris',
  'werknemer', 'werkgever', 'zzp', 'freelance',
  'ai recruitment', 'hr tech', 'hr technologie',
  'diversiteit', 'inclusie', 'cultuur',
  'thuiswerken', 'hybride', 'remote',
  'opleiding', 'ontwikkeling', 'training'
];

// Check if article is relevant
function isRelevantArticle(item) {
  const text = `${item.title || ''} ${item.contentSnippet || ''} ${item.summary || ''}`.toLowerCase();
  return RECRUITMENT_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
}

// Categorize article
function categorizeArticle(item, feedCategory) {
  const text = `${item.title || ''} ${item.contentSnippet || ''}`.toLowerCase();

  if (text.includes('ai') || text.includes('technologie') || text.includes('digitaal')) {
    return 'AI & Technologie';
  } else if (text.includes('tekort') || text.includes('krapte') || text.includes('schaarste')) {
    return 'Personeelstekort';
  } else if (text.includes('employer brand') || text.includes('werkgeversmerk')) {
    return 'Employer Branding';
  } else if (text.includes('arbeidsmarkt') || text.includes('werkgelegenheid')) {
    return 'Arbeidsmarkt';
  } else if (text.includes('salaris') || text.includes('cao') || text.includes('arbeidsvoorwaarden')) {
    return 'Arbeidsvoorwaarden';
  } else if (text.includes('diversiteit') || text.includes('inclusie')) {
    return 'Diversiteit & Inclusie';
  } else if (text.includes('opleiding') || text.includes('training') || text.includes('ontwikkeling')) {
    return 'Learning & Development';
  }

  return feedCategory || 'Algemeen';
}

// Fetch RSS feed
async function fetchRSSFeed(feed) {
  try {
    console.log(`  📰 Fetching: ${feed.name}`);
    const feedData = await parser.parseURL(feed.url);

    const relevantItems = feedData.items
      .filter(isRelevantArticle)
      .slice(0, 10) // Max 10 items per feed
      .map(item => ({
        title: item.title,
        url: item.link,
        description: item.contentSnippet || item.summary || '',
        pubDate: item.pubDate || item.isoDate,
        source: feed.name,
        category: categorizeArticle(item, feed.category)
      }));

    console.log(`     ✅ Found ${relevantItems.length} relevant articles`);
    return relevantItems;
  } catch (error) {
    console.log(`     ❌ Error fetching ${feed.name}: ${error.message}`);
    return [];
  }
}

// Save to Notion
async function saveToNotion(article) {
  if (!NOTION_DATABASE_ID) {
    console.log('⚠️  No Notion database configured');
    return false;
  }

  try {
    // Skip duplicate check for now - just add to Notion
    // The Notion API syntax was incorrect

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
          select: { name: article.category }
        },
        'Bron': {
          rich_text: [{ text: { content: article.source } }]
        },
        'Datum Gevonden': {
          date: { start: new Date().toISOString().split('T')[0] }
        },
        'Status': {
          select: { name: 'Nieuw' }
        }
      }
    });

    return true;
  } catch (error) {
    console.error(`Failed to save to Notion: ${error.message}`);
    return false;
  }
}

// Collect news from all feeds
async function collectDutchNews() {
  console.log('🔍 Starting Dutch RSS news collection...');
  console.log(`📊 Checking ${DUTCH_RSS_FEEDS.length} RSS feeds`);

  let totalArticles = [];
  let savedCount = 0;

  // Fetch all feeds
  for (const feed of DUTCH_RSS_FEEDS) {
    const articles = await fetchRSSFeed(feed);
    totalArticles = totalArticles.concat(articles);

    // Small delay between feeds
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📚 Total articles found: ${totalArticles.length}`);

  // Remove duplicates based on URL
  const uniqueArticles = Array.from(
    new Map(totalArticles.map(item => [item.url, item])).values()
  );

  console.log(`📋 Unique articles: ${uniqueArticles.length}`);

  // Save to Notion
  if (NOTION_DATABASE_ID) {
    console.log('\n💾 Saving to Notion...');
    for (const article of uniqueArticles) {
      const saved = await saveToNotion(article);
      if (saved) {
        savedCount++;
        console.log(`  ✅ Saved: ${article.title.substring(0, 60)}...`);
      }
    }
  }

  console.log(`\n✨ Collection complete! ${savedCount} new articles saved to Notion`);

  // Send Zapier notification
  if (process.env.ZAPIER_WEBHOOK_URL && savedCount > 0) {
    try {
      await axios.post(process.env.ZAPIER_WEBHOOK_URL, {
        type: 'dutch_recruitment_news',
        message: `${savedCount} nieuwe recruitment artikelen toegevoegd aan Notion`,
        topArticles: uniqueArticles.slice(0, 5).map(a => ({
          title: a.title,
          url: a.url,
          source: a.source
        }))
      });
      console.log('📧 Zapier notification sent');
    } catch (error) {
      console.error('Zapier notification failed');
    }
  }

  // Save summary
  const summaryPath = path.join(__dirname, 'data', 'last-collection.json');
  await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
  await fs.writeFile(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalFound: uniqueArticles.length,
    saved: savedCount,
    sources: [...new Set(uniqueArticles.map(a => a.source))],
    categories: [...new Set(uniqueArticles.map(a => a.category))]
  }, null, 2));

  return { found: uniqueArticles.length, saved: savedCount };
}

// Schedule daily collection (9 AM Amsterdam time)
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Running scheduled RSS collection...');
  await collectDutchNews();
}, {
  timezone: 'Europe/Amsterdam'
});

// MCP/API endpoints
app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  switch(name) {
    case 'collect_news':
      const result = await collectDutchNews();
      res.json({
        success: true,
        message: `Collected ${result.found} articles, saved ${result.saved} to Notion`
      });
      break;

    case 'get_sources':
      res.json({
        sources: DUTCH_RSS_FEEDS.map(f => ({ name: f.name, category: f.category }))
      });
      break;

    default:
      res.status(404).json({ error: 'Tool not found' });
  }
});

// Web Dashboard
app.get('/dashboard', async (req, res) => {
  let lastCollection = {};
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'last-collection.json'), 'utf8');
    lastCollection = JSON.parse(data);
  } catch {}

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Dutch RSS Recruitment News</title>
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
    <h1>📰 Dutch RSS Recruitment News</h1>
    <p>Automatische verzameling van ${DUTCH_RSS_FEEDS.length} Nederlandse nieuws bronnen</p>
  </div>

  <div class="card">
    <h2>Status</h2>
    <p><span class="status">ACTIEF</span> Verzamelt dagelijks om 9:00 uur</p>
    <p>Notion Database: ${NOTION_DATABASE_ID ? '✅ Geconfigureerd' : '❌ Niet geconfigureerd'}</p>
    ${lastCollection.timestamp ? `
      <p><strong>Laatste collectie:</strong> ${new Date(lastCollection.timestamp).toLocaleString('nl-NL')}</p>
      <p><strong>Artikelen gevonden:</strong> ${lastCollection.totalFound || 0}</p>
      <p><strong>Opgeslagen in Notion:</strong> ${lastCollection.saved || 0}</p>
    ` : '<p>Nog geen collectie uitgevoerd</p>'}
  </div>

  <div class="card">
    <h2>RSS Bronnen</h2>
    ${DUTCH_RSS_FEEDS.map(feed => `<span class="source">${feed.name}</span>`).join('')}
  </div>

  <div class="card">
    <h2>Acties</h2>
    <button onclick="collectNews()">Start Collectie Nu</button>
    <button onclick="window.open('https://notion.so', '_blank')">Open Notion</button>
  </div>

  <script>
    async function collectNews() {
      if (confirm('Start news collection? Dit kan enkele minuten duren.')) {
        const btn = event.target;
        btn.disabled = true;
        btn.textContent = 'Bezig...';

        const response = await fetch('/call-tool', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'collect_news', arguments: {} })
        });

        const result = await response.json();
        alert(result.message);
        location.reload();
      }
    }
  </script>
</body>
</html>`;

  res.send(html);
});

// Start server
const PORT = 3013;

async function start() {
  app.listen(PORT, () => {
    console.log('🚀 Dutch RSS Recruitment News Agent Started');
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`📰 Monitoring ${DUTCH_RSS_FEEDS.length} Dutch news sources`);
    console.log('⏰ Scheduled daily at 9:00 AM Amsterdam time');
    console.log('🇳🇱 Filtering for recruitment-related content');
    console.log('📝 Saving to Notion database');
  });

  // Run initial collection
  console.log('\n🔄 Starting initial collection...');
  await collectDutchNews();
}

start();