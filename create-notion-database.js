#!/usr/bin/env node
// Script to create Notion database for Dutch Recruitment News

const { Client } = require('@notionhq/client');

const NOTION_API_KEY = 'ntn_N921362306116pa5KHYRvt3AScWH3y2K87Hf4bMwi2x5R3';
const notion = new Client({ auth: NOTION_API_KEY });

async function createDatabase() {
  try {
    // First, get user information to find a suitable parent
    const users = await notion.users.list();
    console.log('Found users:', users.results.length);

    // Search for any page we can use as parent
    const searchResults = await notion.search({
      page_size: 1
    });

    if (searchResults.results.length === 0) {
      console.log('No pages found. Creating database in root...');
      // Try creating without parent (root level)
      const database = await notion.databases.create({
        parent: { type: 'workspace', workspace: true },
        title: [{ type: 'text', text: { content: 'Recruitment Nieuws Nederland' } }],
        properties: {
          'Titel': { title: {} },
          'URL': { url: {} },
          'Beschrijving': { rich_text: {} },
          'Categorie': {
            select: {
              options: [
                { name: 'AI & Technologie', color: 'blue' },
                { name: 'Personeelstekort', color: 'red' },
                { name: 'Employer Branding', color: 'green' },
                { name: 'Arbeidsmarkt', color: 'yellow' },
                { name: 'RPO & Outsourcing', color: 'purple' },
                { name: 'Trends', color: 'pink' },
                { name: 'Best Practices', color: 'gray' },
                { name: 'Sector Specifiek', color: 'orange' }
              ]
            }
          },
          'Zoekterm': { rich_text: {} },
          'Datum Gevonden': { date: {} },
          'Bron': { rich_text: {} },
          'Status': {
            select: {
              options: [
                { name: 'Nieuw', color: 'blue' },
                { name: 'Gelezen', color: 'green' },
                { name: 'Belangrijk', color: 'red' }
              ]
            }
          }
        }
      });

      console.log('✅ Database created successfully!');
      console.log('Database ID:', database.id);
      console.log('');
      console.log('Add this to your .env file:');
      console.log(`NOTION_DATABASE_ID=${database.id}`);
      return database.id;
    }

    // Use first found page as parent
    const parentPageId = searchResults.results[0].id;
    console.log('Using page as parent:', parentPageId);

    const database = await notion.databases.create({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'Recruitment Nieuws Nederland' } }],
      properties: {
        'Titel': { title: {} },
        'URL': { url: {} },
        'Beschrijving': { rich_text: {} },
        'Categorie': {
          select: {
            options: [
              { name: 'AI & Technologie', color: 'blue' },
              { name: 'Personeelstekort', color: 'red' },
              { name: 'Employer Branding', color: 'green' },
              { name: 'Arbeidsmarkt', color: 'yellow' },
              { name: 'RPO & Outsourcing', color: 'purple' },
              { name: 'Trends', color: 'pink' },
              { name: 'Best Practices', color: 'gray' },
              { name: 'Sector Specifiek', color: 'orange' }
            ]
          }
        },
        'Zoekterm': { rich_text: {} },
        'Datum Gevonden': { date: {} },
        'Bron': { rich_text: {} },
        'Status': {
          select: {
            options: [
              { name: 'Nieuw', color: 'blue' },
              { name: 'Gelezen', color: 'green' },
              { name: 'Belangrijk', color: 'red' }
            ]
          }
        }
      }
    });

    console.log('✅ Database created successfully!');
    console.log('Database ID:', database.id);
    console.log('');
    console.log('Add this to your .env file:');
    console.log(`NOTION_DATABASE_ID=${database.id}`);

    return database.id;

  } catch (error) {
    console.error('Error creating database:', error);

    // If database creation fails, let's find existing databases
    console.log('\nSearching for existing databases...');
    try {
      const search = await notion.search({});
      const databases = search.results.filter(r => r.object === 'database');

      if (databases.length > 0) {
        console.log('\nFound existing databases:');
        databases.forEach(db => {
          console.log(`- ${db.title?.[0]?.plain_text || 'Untitled'}: ${db.id}`);
        });

        console.log('\nYou can use one of these database IDs in your .env file');
      }
    } catch (searchError) {
      console.error('Search failed:', searchError);
    }
  }
}

createDatabase();