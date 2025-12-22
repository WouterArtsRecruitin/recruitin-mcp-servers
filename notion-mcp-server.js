#!/usr/bin/env node
// Notion MCP Server for Claude
const express = require('express');
const { Client } = require('@notionhq/client');

const app = express();
const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'notion-mcp-server' });
});

// MCP protocol endpoints
app.post('/list-resources', async (req, res) => {
  try {
    // List our specific database
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      return res.status(400).json({ error: 'NOTION_DATABASE_ID not configured' });
    }
    
    const database = await notion.databases.retrieve({ database_id: databaseId });
    res.json({
      resources: [{
        uri: `notion://database/${database.id}`,
        name: database.title[0]?.plain_text || 'Recruitment Database',
        mimeType: 'application/json'
      }]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/read-resource', async (req, res) => {
  const { uri } = req.body;
  const id = uri.split('/').pop();

  try {
    const data = await notion.search({
      query: '',
      filter: {
        value: 'database',
        property: 'object'
      },
      page_size: 10
    });
    res.json({ contents: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add article to Notion database
app.post('/add-article', async (req, res) => {
  const { title, category, url, summary } = req.body;
  
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      return res.status(400).json({ error: 'NOTION_DATABASE_ID not configured' });
    }

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Name': {
          title: [{ text: { content: title } }]
        }
      }
    });

    res.json({ success: true, pageId: response.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Notion MCP Server running on port ${PORT}`);
});
