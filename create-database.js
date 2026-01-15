#!/usr/bin/env node
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: 'ntn_n921362306174F3yoW5yeNwFGnruLy9JiB0YV2GANOAe3c' });
const PARENT_PAGE_ID = '2e62252cbb15812697a9eb7166e6b3b8'; // Weekly Top 10 News page

async function createDatabase() {
  console.log('📊 Creating database structure...\n');

  try {
    const database = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: PARENT_PAGE_ID
      },
      title: [
        {
          type: 'text',
          text: {
            content: 'Articles Database'
          }
        }
      ],
      properties: {
        'Titel': {
          title: {}
        },
        'URL': {
          url: {}
        },
        'Score': {
          number: {
            format: 'number'
          }
        },
        'Rank': {
          number: {
            format: 'number'
          }
        },
        'Week': {
          rich_text: {}
        },
        'Content Angle': {
          select: {
            options: [
              { name: 'Industry Trends', color: 'blue' },
              { name: 'Tech Innovation', color: 'purple' },
              { name: 'Recruitment Strategy', color: 'green' },
              { name: 'Market Analysis', color: 'orange' }
            ]
          }
        },
        'Platform': {
          select: {
            options: [
              { name: 'LinkedIn', color: 'blue' },
              { name: 'Blog', color: 'green' },
              { name: 'Newsletter', color: 'purple' }
            ]
          }
        },
        'Gebruikt': {
          checkbox: {}
        },
        'Status': {
          select: {
            options: [
              { name: 'Gebruikt', color: 'green' },
              { name: 'Niet gebruikt', color: 'gray' }
            ]
          }
        }
      }
    });

    console.log('✅ Database created successfully!');
    console.log('\n📋 Database Details:');
    console.log('   ID:', database.id);
    console.log('   URL:', database.url);
    console.log('\n🔧 Update your upload script with this database ID:');
    console.log(`   const DATABASE_ID = '${database.id.replace(/-/g, '')}';`);
    console.log('\n📝 Next steps:');
    console.log('   1. Update upload-to-correct-notion.js with new database ID');
    console.log('   2. Run: bash complete-upload-workflow.sh');

  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    if (error.code === 'object_not_found') {
      console.log('\n⚠️  Parent page not accessible. Make sure integration has access to:');
      console.log('   📰 Weekly Top 10 News');
      console.log('   ID:', PARENT_PAGE_ID);
    }
  }
}

createDatabase();
