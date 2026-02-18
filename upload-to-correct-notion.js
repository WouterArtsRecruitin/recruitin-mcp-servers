#!/usr/bin/env node
import { Client } from '@notionhq/client';
import fs from 'fs';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = '2421f7a1ca0141b0994d3fafab3e6eb7'; // Content Calendar - Planning

// Expected properties - will be auto-created if missing
const REQUIRED_PROPERTIES = {
  'Titel': { title: {} },
  'URL': { url: {} },
  'Score': { number: { format: 'number' } },
  'Rank': { number: { format: 'number' } },
  'Week': { rich_text: {} },
  'Gebruikt': { checkbox: {} },
  'Status': { select: { options: [{ name: 'Gebruikt', color: 'green' }, { name: 'Niet gebruikt', color: 'gray' }] } },
};

async function ensureDatabaseProperties() {
  console.log('🔍 Checking database properties...');

  const db = await notion.databases.retrieve({ database_id: DATABASE_ID });
  const existing = Object.keys(db.properties);
  console.log(`   Existing properties: ${existing.join(', ')}`);

  // Find the title property (could be named differently)
  const titleProp = Object.entries(db.properties).find(([, v]) => v.type === 'title');
  const titleName = titleProp ? titleProp[0] : 'Titel';

  const missing = Object.keys(REQUIRED_PROPERTIES).filter(p => {
    if (p === 'Titel') return false; // Title property always exists
    return !existing.includes(p);
  });

  if (missing.length > 0) {
    console.log(`   Adding missing properties: ${missing.join(', ')}`);
    const updates = {};
    for (const prop of missing) {
      updates[prop] = REQUIRED_PROPERTIES[prop];
    }
    await notion.databases.update({ database_id: DATABASE_ID, properties: updates });
    console.log('   ✅ Properties added');
  } else {
    console.log('   ✅ All properties present');
  }

  return titleName;
}

async function upload() {
  console.log('📤 Uploading to Notion Content Calendar...\n');

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filePath = `reports/top-articles-${today}.json`;

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Report not found: ${filePath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath));
  const top10 = data.top_10;

  const now = new Date();
  const weekNumber = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7);
  const weekDate = now.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  // Ensure database has the right properties, get title property name
  const titleName = await ensureDatabaseProperties();

  console.log(`\n📊 Uploading ${top10.length} articles from ${data.generated_at}\n`);

  let failCount = 0;

  for (let i = 0; i < top10.length; i++) {
    const article = top10[i];

    const properties = {
      [titleName]: {
        title: [{ text: { content: `${article.rank}. ${article.title}` } }]
      },
      'URL': { url: article.url },
      'Score': { number: article.score },
      'Rank': { number: article.rank },
      'Week': {
        rich_text: [{ text: { content: `Week ${weekNumber} - ${weekDate}` } }]
      },
      'Gebruikt': { checkbox: article.rank === 1 },
      'Status': {
        select: { name: article.rank === 1 ? 'Gebruikt' : 'Niet gebruikt' }
      }
    };

    if (article.best_angle) {
      properties['Content Angle'] = { select: { name: article.best_angle } };
    }
    if (article.recommended_platform) {
      properties['Platform'] = { select: { name: article.recommended_platform } };
    }

    try {
      await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties
      });

      console.log(`✅ ${article.rank}. ${article.title.substring(0, 60)}...`);

    } catch (error) {
      failCount++;
      console.error(`❌ Failed to upload article ${article.rank}: ${error.message}`);
    }
  }

  if (failCount === top10.length) {
    console.error(`\n❌ ALL ${top10.length} uploads failed!`);
    process.exit(1);
  }

  console.log(`\n✅ ${top10.length - failCount}/${top10.length} articles uploaded to Notion`);
  if (failCount > 0) {
    console.log(`⚠️  ${failCount} articles failed`);
  }
  console.log(`📄 Check: https://www.notion.so/${DATABASE_ID.replace(/-/g, '')}`);
}

upload().catch(err => {
  console.error('❌', err.message);
  if (err.code === 'object_not_found') {
    console.log('\n🔧 Database not found or no access.');
    console.log('Notion → Database → ... → Connections → Add integration');
  }
  process.exit(1);
});
