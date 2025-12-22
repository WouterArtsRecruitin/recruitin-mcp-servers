#!/usr/bin/env node
// Find all Notion databases in your workspace

const { Client } = require('@notionhq/client');

const NOTION_API_KEY = 'ntn_N921362306116pa5KHYRvt3AScWH3y2K87Hf4bMwi2x5R3';
const notion = new Client({ auth: NOTION_API_KEY });

async function findDatabases() {
  try {
    console.log('🔍 Searching for all databases in your Notion workspace...\n');

    // Search for all items
    const searchResults = await notion.search({
      page_size: 100
    });

    // Filter for databases
    const databases = searchResults.results.filter(item => item.object === 'database');

    if (databases.length === 0) {
      console.log('❌ No databases found in your workspace');
      console.log('\nMake sure your Notion integration has access to the databases.');
      console.log('Go to the database in Notion, click Share, and add your integration.');
      return;
    }

    console.log(`✅ Found ${databases.length} database(s):\n`);

    databases.forEach((db, index) => {
      const title = db.title?.[0]?.plain_text || 'Untitled Database';
      console.log(`${index + 1}. ${title}`);
      console.log(`   ID: ${db.id}`);
      console.log(`   URL: ${db.url}`);
      console.log(`   Created: ${new Date(db.created_time).toLocaleDateString()}`);

      // Show properties
      if (db.properties) {
        const propertyNames = Object.keys(db.properties);
        console.log(`   Properties: ${propertyNames.join(', ')}`);
      }
      console.log('');
    });

    // Look for recruitment-related database
    const recruitmentDb = databases.find(db => {
      const title = db.title?.[0]?.plain_text?.toLowerCase() || '';
      return title.includes('recruitment') ||
             title.includes('nieuws') ||
             title.includes('hr') ||
             title.includes('vacature');
    });

    if (recruitmentDb) {
      const title = recruitmentDb.title?.[0]?.plain_text || 'Untitled';
      console.log('🎯 Recommended database for recruitment news:');
      console.log(`   "${title}"`);
      console.log(`   ID: ${recruitmentDb.id}`);
      console.log('\n📝 Add this to your .env file:');
      console.log(`NOTION_DATABASE_ID=${recruitmentDb.id}`);
    } else {
      // Use first database as fallback
      const firstDb = databases[0];
      const title = firstDb.title?.[0]?.plain_text || 'Untitled';
      console.log('💡 You can use this database:');
      console.log(`   "${title}"`);
      console.log(`   ID: ${firstDb.id}`);
      console.log('\n📝 Add this to your .env file:');
      console.log(`NOTION_DATABASE_ID=${firstDb.id}`);
    }

    console.log('\n✨ Or create a new database in Notion with these columns:');
    console.log('   - Titel (Title)');
    console.log('   - URL (URL)');
    console.log('   - Beschrijving (Text)');
    console.log('   - Categorie (Select)');
    console.log('   - Zoekterm (Text)');
    console.log('   - Datum Gevonden (Date)');
    console.log('   - Bron (Text)');
    console.log('   - Status (Select)');

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.code === 'unauthorized') {
      console.log('\n⚠️  Your Notion API key might be invalid.');
      console.log('Check your API key at: https://www.notion.so/my-integrations');
    } else if (error.code === 'restricted_resource') {
      console.log('\n⚠️  The integration doesn\'t have access to your databases.');
      console.log('Go to each database in Notion, click Share, and add your integration.');
    }
  }
}

findDatabases();