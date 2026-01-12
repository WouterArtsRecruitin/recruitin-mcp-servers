#!/usr/bin/env node
const { Client } = require('@notionhq/client');
const fs = require('fs');

const notion = new Client({ auth: 'ntn_N921362306116pa5KHYRvt3AScWH3y2K87Hf4bMwi2x5R3' });
const HUB_PAGE_ID = '27c2252cbb1581a5bbfcef3736d7c14e';

async function uploadDocs() {
  console.log('📤 Uploading documentation to Notion...\n');

  // Document 1: Commands & Workflows
  const commandsContent = fs.readFileSync('COMPLETE-COMMANDS-WORKFLOWS.md', 'utf-8');
  const commandsSummary = commandsContent.substring(0, 2000); // First 2000 chars

  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'heading_1',
      heading_1: {
        rich_text: [{ text: { content: '📋 Complete Commands & Workflows' } }],
        color: 'blue'
      }
    }]
  });

  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'callout',
      callout: {
        rich_text: [{
          text: { content: 'Weekly Content Workflow: News scraper → Top 10 selector → Notion upload → Content generation → Publishing. Complete guide below.' }
        }],
        icon: { emoji: '⚡' },
        color: 'blue_background'
      }
    }]
  });

  console.log('✅ Commands section added\n');

  // Document 2: Database Design
  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'heading_1',
      heading_1: {
        rich_text: [{ text: { content: '📊 Content Tracking Database Design' } }],
        color: 'green'
      }
    }]
  });

  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'callout',
      callout: {
        rich_text: [{
          text: { content: 'Track elke post: Titel, Type, Engagement rate, Comments, Performance tier (A/B/C/D). Simpele table of full database - jouw keuze!' }
        }],
        icon: { emoji: '📊' },
        color: 'green_background'
      }
    }]
  });

  console.log('✅ Database design section added\n');

  // Add Quick Start
  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'heading_2',
      heading_2: {
        rich_text: [{ text: { content: '⚡ Quick Start - Weekly Workflow' } }]
      }
    }]
  });

  const workflow = [
    '1. Run: node generate-news-report-now.js (scrape news)',
    '2. Run: node select-top-articles.js (get top 10)',
    '3. Run: node upload-to-correct-notion.js (save to Notion)',
    '4. Claude: "Maak weekly content" (generate posts)',
    '5. Notion: Add to Content Performance Tracker',
    '6. Publish: LinkedIn + Blog',
    '7. Monday: Update metrics (48h later)',
    'Total time: 60 min/week'
  ];

  for (const step of workflow) {
    await notion.blocks.children.append({
      block_id: HUB_PAGE_ID,
      children: [{
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: step } }]
        }
      }]
    });
  }

  console.log('✅ Workflow steps added\n');

  // Add link to GitHub
  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { text: { content: '🔗 Volledige documentatie op GitHub: ' } },
          { 
            text: { content: 'recruitin-mcp-servers', link: { url: 'https://github.com/WouterArtsRecruitin/recruitin-mcp-servers' } },
            annotations: { bold: true }
          }
        ]
      }
    }]
  });

  console.log('✅ GitHub link added\n');

  // Final divider
  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{ type: 'divider', divider: {} }]
  });

  console.log('✅ DOCUMENTATION UPLOADED TO NOTION!');
  console.log('📄 View: https://notion.so/27c2252cbb1581a5bbfcef3736d7c14e\n');
}

uploadDocs().catch(err => console.error('❌', err.message));
