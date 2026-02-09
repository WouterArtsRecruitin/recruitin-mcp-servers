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

  // Upload each article as database item
  for (let i = 0; i < top10.length; i++) {
    const article = top10[i];

    try {
      await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          // REQUIRED: Title property (assuming "Titel" or "Title")
          'Titel': {
            title: [{ text: { content: `${article.rank}. ${article.title}` } }]
          },

          // URL property (assuming "URL" or "Link")
          'URL': {
            url: article.url
          },

          // Score property (assuming "Score" number field)
          'Score': {
            number: article.score
          },

          // Rank property (assuming "Rank" number field)
          'Rank': {
            number: article.rank
          },

          // Week property (assuming "Week" text or number field)
          'Week': {
            rich_text: [{ text: { content: `Week ${weekNumber} - ${weekDate}` } }]
          },

          // Best angle property (assuming "Content Angle" select or text)
          'Content Angle': article.best_angle ? {
            select: { name: article.best_angle }
          } : undefined,

          // Platform recommendation (assuming "Platform" select or text)
          'Platform': article.recommended_platform ? {
            select: { name: article.recommended_platform }
          } : undefined,

          // Used for content status (assuming "Gebruikt" checkbox)
          'Gebruikt': {
            checkbox: article.rank === 1 // Top article marked as used
          },

          // Status property (assuming "Status" select)
          'Status': {
            select: { name: article.rank === 1 ? 'Gebruikt' : 'Niet gebruikt' }
          }
        }
      });

      console.log(`✅ ${article.rank}. ${article.title.substring(0, 60)}...`);

    } catch (error) {
      console.error(`❌ Failed to upload article ${article.rank}: ${error.message}`);

      // If property doesn't exist, show helpful error
      if (error.code === 'validation_error') {
        console.log(`\n⚠️  Property validation error. Database properties may be named differently.`);
        console.log(`   Run: node find-notion-databases.js to see actual property names`);
      }
    }
  }

  console.log('\n✅ TOP 10 UPLOADED TO NOTION DATABASE!');
  console.log(`📄 Check: https://www.notion.so/Weekly-Top-10-News-${DATABASE_ID.replace(/-/g, '')}`);
}

upload().catch(err => {
  console.error('❌', err.message);
  if (err.code === 'object_not_found') {
    console.log('\n🔧 Share page with integration first:');
    console.log('Notion → Page → ... → Connections → Add integration');
  }
});
