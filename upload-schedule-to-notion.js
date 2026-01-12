#!/usr/bin/env node
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: 'ntn_N921362306116pa5KHYRvt3AScWH3y2K87Hf4bMwi2x5R3' });
const HUB_PAGE_ID = '27c2252cbb1581a5bbfcef3736d7c14e';

async function uploadSchedule() {
  console.log('📅 Uploading weekly schedule to Notion...\n');

  // Heading
  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'heading_1',
      heading_1: {
        rich_text: [{ text: { content: '📅 Weekly Content Schedule' } }],
        color: 'purple'
      }
    }]
  });

  // Summary callout
  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'callout',
      callout: {
        rich_text: [{
          text: { content: '⏱️ Total: 80 min/week | Vrijdag: 60 min (creation) | Maandag: 20 min (tracking) | Di/Wo/Do: 15 min (engagement)' }
        }],
        icon: { emoji: '⚡' },
        color: 'purple_background'
      }
    }]
  });

  // Friday schedule
  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'heading_2',
      heading_2: {
        rich_text: [{ text: { content: 'VRIJDAG 17:00-18:00 (Content Creation)' } }]
      }
    }]
  });

  const fridayTasks = [
    '17:00-17:05 | News Scraping → node generate-news-report-now.js',
    '17:05-17:15 | Content Generation → Claude "Maak weekly content"',
    '17:15-17:40 | Visual Production → Canva (infographic + images)',
    '17:40-17:50 | Review & Edit → Check cijfers, tone, bronnen',
    '17:50-18:00 | Publishing → LinkedIn Wouter (post) + Recruitin/Blog (schedule Monday)'
  ];

  for (const task of fridayTasks) {
    await notion.blocks.children.append({
      block_id: HUB_PAGE_ID,
      children: [{
        type: 'to_do',
        to_do: {
          rich_text: [{ text: { content: task } }],
          checked: false
        }
      }]
    });
  }

  // Monday schedule
  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'heading_2',
      heading_2: {
        rich_text: [{ text: { content: 'MAANDAG 10:00-10:20 (Metrics & Insights)' } }]
      }
    }]
  });

  const mondayTasks = [
    '09:00 | Content goes live (automatic - check)',
    '10:00-10:10 | Update Metrics → LinkedIn analytics naar Notion',
    '10:10-10:20 | Generate Insights → Claude analyze performance'
  ];

  for (const task of mondayTasks) {
    await notion.blocks.children.append({
      block_id: HUB_PAGE_ID,
      children: [{
        type: 'to_do',
        to_do: {
          rich_text: [{ text: { content: task } }],
          checked: false
        }
      }]
    });
  }

  // Best posting times
  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'heading_2',
      heading_2: {
        rich_text: [{ text: { content: '⏰ Optimale Posting Tijden' } }]
      }
    }]
  });

  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{
          text: { content: 'LinkedIn Wouter: Dinsdag 8-9am (beste reach) OF Vrijdag 18:00 (makkelijk)' }
        }]
      }
    }]
  });

  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{
          text: { content: 'LinkedIn Recruitin: Maandag 9-10am (week start, schedule via Buffer)' }
        }]
      }
    }]
  });

  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{
          text: { content: 'Blog: Maandag 9am (SEO optimal, schedule via WordPress)' }
        }]
      }
    }]
  });

  // Outlook import instructions
  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'heading_2',
      heading_2: {
        rich_text: [{ text: { content: '📥 Outlook Import' } }]
      }
    }]
  });

  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          text: { content: 'Download content-schedule.ics van GitHub → Outlook → File → Import → All events automatic!' }
        }]
      }
    }]
  });

  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { text: { content: '📂 Download: ' } },
          { 
            text: { 
              content: 'content-schedule.ics',
              link: { url: 'https://github.com/WouterArtsRecruitin/recruitin-mcp-servers/blob/main/content-schedule.ics' }
            }
          }
        ]
      }
    }]
  });

  // Divider
  await notion.blocks.children.append({
    block_id: HUB_PAGE_ID,
    children: [{ type: 'divider', divider: {} }]
  });

  console.log('✅ SCHEDULE UPLOADED TO NOTION!');
  console.log('📄 View: https://notion.so/27c2252cbb1581a5bbfcef3736d7c14e\n');
}

uploadSchedule().catch(err => console.error('❌', err.message));
