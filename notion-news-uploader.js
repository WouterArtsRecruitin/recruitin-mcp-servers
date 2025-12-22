#!/usr/bin/env node
// Notion News Uploader - Simplified version for empty database
// Creates pages in Notion database even without defined properties

const { Client } = require('@notionhq/client');
const fs = require('fs').promises;
const path = require('path');

// Notion configuration
const NOTION_API_KEY = 'ntn_N921362306116pa5KHYRvt3AScWH3y2K87Hf4bMwi2x5R3';
const DATABASE_ID = '4073e632539b40b4bfa3289e64a99f1e';

const notion = new Client({ auth: NOTION_API_KEY });

async function uploadNewsToNotion() {
  console.log('📚 Reading collected news from local storage...\n');

  try {
    // Read the latest news file
    const newsDir = path.join(__dirname, 'news-data');
    const files = await fs.readdir(newsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();

    if (jsonFiles.length === 0) {
      console.log('❌ No news files found');
      return;
    }

    const latestFile = jsonFiles[0];
    const newsPath = path.join(newsDir, latestFile);
    const newsData = JSON.parse(await fs.readFile(newsPath, 'utf8'));

    console.log(`📰 Found ${newsData.length} articles in ${latestFile}\n`);

    // Check database structure
    console.log('🔍 Checking Notion database...');
    const db = await notion.databases.retrieve({ database_id: DATABASE_ID });
    console.log(`✅ Connected to: ${db.title?.[0]?.plain_text || 'Untitled'}\n`);

    let successCount = 0;
    let errorCount = 0;

    // Upload each article
    for (const article of newsData.slice(0, 10)) { // Start with first 10
      try {
        console.log(`📝 Adding: ${article.title.substring(0, 60)}...`);

        // Create page with minimal structure
        // Just add as a child page without properties
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
                  text: { content: article.title || 'Untitled' }
                }]
              }
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{
                  type: 'text',
                  text: { content: `📰 Source: ${article.source} | ${article.category}` }
                }]
              }
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{
                  type: 'text',
                  text: { content: `📅 Date: ${new Date(article.date).toLocaleDateString('nl-NL')}` }
                }]
              }
            },
            {
              object: 'block',
              type: 'quote',
              quote: {
                rich_text: [{
                  type: 'text',
                  text: { content: article.description || 'No description' }
                }]
              }
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{
                  type: 'text',
                  text: {
                    content: '🔗 Read more: ',
                  }
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

        // If database has properties, try to use them
        const properties = db.properties || {};

        // Look for a title property
        const titleProp = Object.entries(properties).find(([key, prop]) => prop.type === 'title');
        if (titleProp) {
          pageData.properties[titleProp[0]] = {
            title: [{
              text: { content: article.title }
            }]
          };
        }

        const response = await notion.pages.create(pageData);
        console.log(`   ✅ Added (ID: ${response.id})`);
        successCount++;

        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 200));

      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Upload Summary:`);
    console.log(`   ✅ Successfully uploaded: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📰 Total available: ${newsData.length}`);

    if (successCount < newsData.length) {
      console.log(`\n💡 Run again to upload remaining ${newsData.length - successCount} articles`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.body) {
      console.error('Details:', JSON.stringify(error.body, null, 2));
    }
  }
}

// Run the upload
console.log('🚀 Notion News Uploader');
console.log('📊 Uploading Dutch recruitment news to Notion\n');

uploadNewsToNotion();