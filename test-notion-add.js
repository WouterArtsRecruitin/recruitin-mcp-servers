const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: 'ntn_N921362306116pa5KHYRvt3AScWH3y2K87Hf4bMwi2x5R3'
});

const DATABASE_ID = '4073e632539b40b4bfa3289e64a99f1e';

async function addTestArticle() {
  try {
    // First check what properties the database has
    console.log('📋 Checking database structure...');
    const db = await notion.databases.retrieve({ database_id: DATABASE_ID });

    console.log('\n✅ Successfully connected to database!');
    console.log('Database title:', db.title?.[0]?.plain_text || 'Untitled');

    console.log('\n📊 Database properties:');
    const properties = {};
    for (const [key, value] of Object.entries(db.properties)) {
      console.log(`- ${key} (${value.type})`);
      properties[key] = value.type;
    }

    // Try to determine the right property names
    const titleProperty = Object.keys(properties).find(key =>
      key.toLowerCase().includes('name') ||
      key.toLowerCase().includes('title') ||
      key.toLowerCase().includes('titel') ||
      properties[key] === 'title'
    );

    if (!titleProperty) {
      console.log('\n❌ Could not find title property');
      return;
    }

    console.log(`\n🔧 Using "${titleProperty}" as title property`);

    // Add a test recruitment news article
    const pageData = {
      parent: { database_id: DATABASE_ID },
      properties: {}
    };

    // Add title
    pageData.properties[titleProperty] = {
      title: [{
        text: {
          content: '🎯 TEST: Intelligence Group - Nieuw onderzoek arbeidsmarkt krapte'
        }
      }]
    };

    // Try to add other properties if they exist
    const urlProperty = Object.keys(properties).find(key =>
      key.toLowerCase().includes('url') || key.toLowerCase().includes('link')
    );

    if (urlProperty && properties[urlProperty] === 'url') {
      pageData.properties[urlProperty] = {
        url: 'https://intelligence-group.nl/test-article'
      };
    }

    const descProperty = Object.keys(properties).find(key =>
      key.toLowerCase().includes('desc') || key.toLowerCase().includes('beschrijving')
    );

    if (descProperty && properties[descProperty] === 'rich_text') {
      pageData.properties[descProperty] = {
        rich_text: [{
          text: {
            content: 'Test artikel over arbeidsmarkt krapte in Nederland'
          }
        }]
      };
    }

    console.log('\n📝 Creating test page...');
    const response = await notion.pages.create(pageData);

    console.log('✅ Test article added successfully!');
    console.log('Page ID:', response.id);
    console.log('URL:', response.url);

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.body) {
      console.error('Details:', JSON.stringify(error.body, null, 2));
    }
  }
}

addTestArticle();