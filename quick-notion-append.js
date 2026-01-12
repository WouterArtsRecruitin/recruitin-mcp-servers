#!/usr/bin/env node
const { Client } = require('@notionhq/client');

const notion = new Client({ 
  auth: 'ntn_N921362306116pa5KHYRvt3AScWH3y2K87Hf4bMwi2x5R3'
});

const PARENT_PAGE = '5ceeffd1e99430369aa8bd589966d363';

async function quickAppend() {
  try {
    // Test: Can we read the page first?
    console.log('Testing page access...');
    const page = await notion.pages.retrieve({ page_id: PARENT_PAGE });
    console.log('✅ Page found:', page.properties);
    
    // If we can read it, try to append
    console.log('\nAppending content...');
    await notion.blocks.children.append({
      block_id: PARENT_PAGE,
      children: [{
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: 'Week 2 - 12 januari 2026 - Top 10 News' } }]
        }
      }]
    });
    
    console.log('✅ Content added!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'object_not_found') {
      console.log('\n🔧 FIX:');
      console.log('In Notion:');
      console.log('1. Open page: https://notion.so/5ceeffd1e99430369aa8bd589966d363');
      console.log('2. Click "..." → Connections');
      console.log('3. Add your integration');
      console.log('4. Try again');
    }
  }
}

quickAppend();
