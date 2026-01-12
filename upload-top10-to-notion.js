#!/usr/bin/env node
/**
 * Upload Top 10 Weekly Articles to Existing Notion Hub
 * Page ID: 5ceeffd1e99430369aa8bd589966d363
 */

const { Client } = require('@notionhq/client');
const fs = require('fs');

// Notion setup
const NOTION_API_KEY = process.env.NOTION_API_KEY || 'ntn_N921362306116pa5KHYRvt3AScWH3y2K87Hf4bMwi2x5R3';
const LINKEDIN_HUB_PAGE_ID = '5ceeffd1e99430369aa8bd589966d363';

const notion = new Client({ auth: NOTION_API_KEY });

async function uploadTop10() {
  console.log('📤 Uploading top 10 to Notion...\n');

  // Read top 10 data
  const topArticlesFile = 'reports/top-articles-2026-01-12.json';
  const data = JSON.parse(fs.readFileSync(topArticlesFile, 'utf-8'));
  const top10 = data.top_10;

  // Get week number and date
  const now = new Date();
  const weekNum = Math.ceil((now.getDate()) / 7);
  const dateStr = now.toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' });

  // Create heading
  await notion.blocks.children.append({
    block_id: LINKEDIN_HUB_PAGE_ID,
    children: [{
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{
          type: 'text',
          text: { content: `Week ${weekNum} - ${dateStr}` }
        }]
      }
    }]
  });

  console.log(`✅ Added heading: Week ${weekNum}\n`);

  // Add divider
  await notion.blocks.children.append({
    block_id: LINKEDIN_HUB_PAGE_ID,
    children: [{ object: 'block', type: 'divider', divider: {} }]
  });

  // Add top 10 articles
  for (let i = 0; i < top10.length; i++) {
    const article = top10[i];
    
    // Article entry
    const emoji = i === 0 ? '⭐ ' : '';
    const gebruikt = i === 0 ? ' → GEBRUIKT voor content' : '';
    
    await notion.blocks.children.append({
      block_id: LINKEDIN_HUB_PAGE_ID,
      children: [{
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: `${i + 1}. ${emoji}${article.title}` },
              annotations: { bold: i === 0 }
            }
          ]
        }
      }]
    });

    // URL as bullet
    await notion.blocks.children.append({
      block_id: LINKEDIN_HUB_PAGE_ID,
      children: [{
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            { type: 'text', text: { content: 'Score: ' } },
            { type: 'text', text: { content: `${article.score}/100` }, annotations: { bold: true } },
            { type: 'text', text: { content: gebruikt } }
          ]
        }
      }]
    });

    await notion.blocks.children.append({
      block_id: LINKEDIN_HUB_PAGE_ID,
      children: [{
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            type: 'text',
            text: { content: article.url, link: { url: article.url } }
          }]
        }
      }]
    });

    console.log(`✅ Added: ${article.title.substring(0, 50)}...`);
  }

  // Add summary
  await notion.blocks.children.append({
    block_id: LINKEDIN_HUB_PAGE_ID,
    children: [{
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: [{
          type: 'text',
          text: { 
            content: `📊 Deze week: ${top10.length} artikelen | Beste: "${top10[0].title}" (${top10[0].score}/100) | Content: LinkedIn (2) + Blog (1)`
          }
        }],
        icon: { emoji: '📰' }
      }
    }]
  });

  console.log('\n✅ Top 10 uploaded to Notion hub!');
  console.log(`📄 View: https://notion.so/${LINKEDIN_HUB_PAGE_ID.replace(/-/g, '')}`);
}

uploadTop10().catch(err => {
  console.error('❌ Error:', err.message);
  console.log('\nTroubleshooting:');
  console.log('1. Check NOTION_API_KEY is set');
  console.log('2. Check page is shared with integration');
  console.log('3. Check page ID is correct');
});
