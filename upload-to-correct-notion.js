#!/usr/bin/env node
import { Client } from '@notionhq/client';
import fs from 'fs';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = '949d73d7816f4b35b2c806654ad0a3c4'; // Articles Database (created 2026-01-15)

async function upload() {
  console.log('📤 Uploading to LinkedIn Intelligence Hub (Database)...\n');

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

  console.log(`📊 Uploading ${top10.length} articles from ${data.generated_at}\n`);

  let failCount = 0;

  for (let i = 0; i < top10.length; i++) {
    const article = top10[i];

    const properties = {
      'Titel': {
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

    // Only add optional properties if they have values
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

      if (error.code === 'validation_error') {
        console.log(`\n⚠️  Property validation error. Database properties may be named differently.`);
        console.log(`   Run: node find-notion-databases.js to see actual property names`);
      }
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
  console.log(`📄 Check: https://www.notion.so/Weekly-Top-10-News-${DATABASE_ID.replace(/-/g, '')}`);
}

upload().catch(err => {
  console.error('❌', err.message);
  if (err.code === 'object_not_found') {
    console.log('\n🔧 Share page with integration first:');
    console.log('Notion → Page → ... → Connections → Add integration');
  }
  process.exit(1);
});
