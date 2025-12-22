#!/usr/bin/env node
// Test Notion connection and database

const { Client } = require('@notionhq/client');

const NOTION_API_KEY = 'ntn_N921362306116pa5KHYRvt3AScWH3y2K87Hf4bMwi2x5R3';
const NOTION_DATABASE_ID = 'ntn_F92136230612gVDVUCapsySIsdf67qJlfLAXOR6EHDsek5';

const notion = new Client({ auth: NOTION_API_KEY });

async function testNotionConnection() {
  console.log('🔍 Testing Notion connection...\n');

  try {
    // Test 1: List users
    console.log('1. Testing API connection - listing users...');
    const users = await notion.users.list();
    console.log(`✅ Connected! Found ${users.results.length} users\n`);

    // Test 2: Search for databases
    console.log('2. Searching for databases...');
    const search = await notion.search({
      page_size: 100
    });

    const databases = search.results.filter(r => r.object === 'database');
    console.log(`✅ Found ${databases.length} databases:\n`);

    databases.forEach(db => {
      const title = db.title?.[0]?.plain_text || 'Untitled';
      console.log(`   - ${title}`);
      console.log(`     ID: ${db.id}`);
    });

    // Test 3: Try to access the specific database
    console.log(`\n3. Trying to access database: ${NOTION_DATABASE_ID}`);

    // The database ID provided looks like an API key, not a database ID
    // Database IDs are usually in UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

    if (!NOTION_DATABASE_ID.match(/^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i)) {
      console.log('❌ The database ID format looks incorrect!');
      console.log('   Database IDs should be in UUID format');
      console.log('   Example: a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      console.log('\n📝 To get your database ID:');
      console.log('   1. Open your database in Notion');
      console.log('   2. Click "Share" → "Copy link"');
      console.log('   3. The URL will be: https://notion.so/workspace/DATABASE_ID?v=...');
      console.log('   4. Copy the DATABASE_ID part (32 characters)');
      return;
    }

    // Try to query the database
    try {
      const response = await notion.databases.retrieve({
        database_id: NOTION_DATABASE_ID
      });
      console.log(`✅ Database found: ${response.title?.[0]?.plain_text || 'Untitled'}`);

      // Show properties
      console.log('\n📋 Database properties:');
      Object.keys(response.properties).forEach(prop => {
        console.log(`   - ${prop}`);
      });
    } catch (error) {
      console.log(`❌ Cannot access database: ${error.message}`);
      console.log('\n💡 Make sure to:');
      console.log('   1. Share the database with your integration');
      console.log('   2. Use the correct database ID from the URL');
    }

    // Test 4: Try to add a test entry
    console.log('\n4. Testing write access - adding test article...');
    try {
      const testPage = await notion.pages.create({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          'Titel': {
            title: [{ text: { content: 'Test Article - ' + new Date().toISOString() } }]
          },
          'URL': {
            url: 'https://example.com/test'
          },
          'Beschrijving': {
            rich_text: [{ text: { content: 'This is a test article to verify Notion connection' } }]
          }
        }
      });
      console.log('✅ Test article created successfully!');
      console.log(`   Page ID: ${testPage.id}`);
    } catch (error) {
      console.log(`❌ Failed to create test article: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Connection failed:', error.message);

    if (error.code === 'unauthorized') {
      console.log('\n⚠️  Your API key might be invalid');
      console.log('   Check: https://www.notion.so/my-integrations');
    }
  }
}

testNotionConnection();