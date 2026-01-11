# 📝 Notion Content Manager - Integration Guide

**Integreert**: Daily news → Notion databases → Content drafts
**Status**: Production Ready ✅

---

## ⚡ QUICK START (5 minuten)

### Setup

```bash
cd ~/recruitin-mcp-servers/notion-content-system

# 1. Create .env file
cp .env.example .env

# 2. Add Notion API key
echo "NOTION_API_KEY=secret_[YOUR_KEY]" >> .env

# 3. Install dependencies
pip install notion-client python-dotenv requests feedparser

# 4. Test connection
python notion_content_manager.py --action test
```

**Zie je "✅ Connection successful"?** → Ready to use!

---

## 🎯 WAT DOET HET?

### Feature 1: RSS News Fetching

**Haalt nieuws op van 4 bronnen**:
- Werf& (recruitment nieuws NL)
- RecruitmentTech (HR tech)
- HR Praktijk (algemeen HR)
- MT/Sprout (business nieuws)

**Saved in**: Notion database "Recruitment News"
**Scored on**: ICP relevance (0-100)

---

### Feature 2: Content Draft Management

**Creates**: LinkedIn post drafts in Notion
**Styles**: 4 post types (contrarian, data story, how-to, behind scenes)
**Workflow**: News → Draft → Review → Publish

---

### Feature 3: Template Generation

**Generates**: LinkedIn post templates from news
**Based on**: Wouter's tone of voice
**Output**: Ready-to-edit drafts

---

## 📋 COMMANDS

### Daily News Fetch (Elke ochtend)

```bash
# Haal nieuws op en sla op in Notion
python notion_content_manager.py --action fetch_news --save

# Limiteer tot top 3 meest relevante
python notion_content_manager.py --action fetch_news --max-items 3 --save
```

**Result**: News items in Notion database

---

### Create LinkedIn Draft

```bash
# Maak draft van nieuws item
python notion_content_manager.py --action create_draft \
  --title "Arbeidsmarkt Update Q4" \
  --content "Je post content hier..." \
  --style contrarian
```

**Styles**:
- `contrarian` - Hot takes, meningen (hoogste engagement)
- `data_story` - Cijfers, insights (authority building)
- `how_to` - Tips, tutorials (thought leadership)
- `behind_scenes` - Persoonlijk, learnings (authenticiteit)

---

### List Drafts

```bash
# Bekijk alle content drafts in Notion
python notion_content_manager.py --action list_drafts
```

---

### Generate Post Template

```bash
# Auto-generate post van nieuws titel
python notion_content_manager.py --action generate \
  --title "CBS: Vacatures dalen met 3,3%" \
  --style data_story
```

**Output**: Post template in Wouter's tone of voice

---

## 🔗 NOTION SETUP

### Stap 1: Create Notion Integration

1. Ga naar: https://www.notion.so/my-integrations
2. Click "New integration"
3. Naam: "Recruitin Content Manager"
4. Workspace: Selecteer je workspace
5. Capabilities: ✅ Read, ✅ Update, ✅ Insert content
6. Submit

**Kopieer API key** (begint met `secret_`)

---

### Stap 2: Share Databases (BELANGRIJK!)

**In Notion**:
1. Open database "Recruitment News"
2. Click "..." → "Connections"
3. Add "Recruitin Content Manager"
4. Repeat voor "Content Drafts" database

**Zonder dit**: Script kan databases niet lezen/schrijven!

---

### Stap 3: Verify Database IDs

**Check in script** (`notion_content_manager.py` line 50-52):
```python
NEWS_DATABASE_ID = "2e52252c-bb15-8101-b097-cce88691c0d0"
DRAFTS_DATABASE_ID = "2e52252c-bb15-81e9-8215-cee7c7812f6d"
```

**Als je andere databases gebruikt**: Update deze IDs

**Find database ID**: Open database in Notion → URL bevat ID:
```
https://notion.so/workspace/[DATABASE_ID]?v=...
                            ^^^^^^^^^^^^^ Dit deel
```

---

## 🔄 WORKFLOW INTEGRATION

### Combine Met News Scraper

**Daily Workflow**:
```bash
# 1. Scrape recruitment nieuws (Brave Search)
cd ~/recruitin-mcp-servers
node generate-news-report-now.js

# 2. Fetch RSS feeds → Notion
python notion-content-system/notion_content_manager.py --action fetch_news --save

# 3. Review in Notion (open database in browser)

# 4. Generate content drafts (via Claude Code - zie below)
```

---

### Generate Content via Claude Code

**In Claude Code chat**:
```
Maak weekly content op basis van:
1. Brave Search news (reports/recruitment-news-*.html)
2. Notion RSS feeds (database: Recruitment News)

Genereer volgens docs/linkedin-content-authority.md:
- LinkedIn Wouter (contrarian take, 250 chars)
- LinkedIn Recruitin (data story, 350 chars)
- Blog (1000 woorden)

Save drafts to Notion database "Content Drafts"
```

---

## 📊 NOTION DATABASE SCHEMA

### Database 1: Recruitment News

**Properties**:
- **Title** (title) - Article titel
- **Source** (select) - Werf&, RecruitmentTech, CBS, etc.
- **URL** (url) - Link to article
- **Published** (date) - Publication date
- **Summary** (rich text) - Short summary
- **Relevance Score** (number) - 0-100 ICP match
- **Categories** (multi-select) - Salary, Trends, Tech, Policy
- **Content Created** (checkbox) - Content gemaakt van dit nieuws?

---

### Database 2: Content Drafts

**Properties**:
- **Title** (title) - Post titel
- **Type** (select) - LinkedIn Personal, LinkedIn Company, Blog
- **Style** (select) - Contrarian, Data Story, How-To, Behind Scenes
- **Content** (rich text) - Post content
- **Status** (select) - Draft, Review, Scheduled, Published
- **Scheduled Date** (date) - Wanneer posten?
- **Source News** (relation) - Link to news item
- **Performance** (rich text) - Engagement metrics (na publish)

---

## 💡 GEBRUIK VOORBEELDEN

### Voorbeeld 1: Daily News Collection

```bash
# Morning routine (07:00)
cd ~/recruitin-mcp-servers/notion-content-system
python notion_content_manager.py --action fetch_news --save
```

**Result**: Top recruitment nieuws van vandaag in Notion

---

### Voorbeeld 2: Create Content Draft

```bash
# Van interessant nieuws item
python notion_content_manager.py --action generate \
  --title "UWV: Spanning arbeidsmarkt op record" \
  --style data_story
```

**Output**: Post template in Wouter's style
**Then**: Copy to Notion database manually or edit in place

---

### Voorbeeld 3: Review Workflow

**In Notion**:
1. Open "Recruitment News" database
2. Filter: Relevance Score > 70
3. Select interessant item
4. Check "Content Created" ✓
5. Open "Content Drafts"
6. Create new draft (link to news item)
7. Write post (use templates from linkedin-content-authority.md)
8. Set Status: Review
9. Schedule date

---

## 🔧 INTEGRATION MET RECRUITIN SYSTEEM

### Combine With:

**News Scraper** (`generate-news-report-now.js`):
- Brave Search → HTML reports
- RSS feeds → Notion database
- Combined: Complete news coverage

**Content Generator** (Claude Code):
- Notion database → Trending topics
- Claude AI → Content generation
- Output → Notion drafts

**Publishing** (Manual/Automated):
- Notion → Copy content
- LinkedIn/Website → Publish
- Track performance → Back to Notion

---

## 📊 DAILY WORKFLOW (Complete)

```
07:00 - News Collection
├─ Brave Search scraper (generate-news-report-now.js)
├─ RSS feed fetcher (notion_content_manager.py)
└─ All news in Notion database (scored + categorized)

17:00 - Content Review (Friday)
├─ Check Notion "Recruitment News" (high relevance items)
├─ Select content-worthy items (3-5 per week)
└─ Mark for content creation

17:15 - Content Generation (Claude Code)
├─ "Generate weekly content from Notion news database"
├─ Claude reads database
├─ Generates 3-4 posts
└─ Saves to Notion "Content Drafts"

18:00 - Review & Schedule
├─ Review drafts in Notion
├─ Edit if needed
├─ Set publish dates
└─ Copy to LinkedIn/WordPress
```

---

## 🎯 NOTION DATABASE IDS (Pre-Configured)

```python
NEWS_DATABASE_ID = "2e52252c-bb15-8101-b097-cce88691c0d0"
DRAFTS_DATABASE_ID = "2e52252c-bb15-81e9-8215-cee7c7812f6d"
PARENT_HUB_ID = "27c2252c-bb15-815b-b21b-e75a8c70d8d7"
```

**Als databases nog niet bestaan**: Create ze in Notion met deze namen:
- "Recruitment News"
- "Content Drafts"
- "Content Hub" (parent page)

---

## 💰 ROI

**Notion Integration Value**:
- Centralized content management
- Team collaboration (multiple users)
- Performance tracking (engagement metrics)
- Content calendar (scheduled posts)
- News archive (searchable)

**Time Saved**: +30 min/week (vs spreadsheets/docs)
**Value**: €650/jaar additional

---

## ✅ SETUP CHECKLIST

- [ ] Notion integration created
- [ ] API key in `.env` file
- [ ] Dependencies installed (`pip install...`)
- [ ] Databases shared with integration
- [ ] Test run successful (`--action test`)
- [ ] First news fetch worked (`--action fetch_news`)
- [ ] Draft creation tested (`--action create_draft`)

---

## 📞 TROUBLESHOOTING

### "NOTION_API_KEY not found"
```bash
# Check .env exists
cat .env

# Should show:
# NOTION_API_KEY=secret_xxx

# If not, create:
echo "NOTION_API_KEY=secret_YOUR_KEY_HERE" > .env
```

### "Could not find database"
**Fix**: Share database with integration in Notion
- Database → ... → Connections → Add integration

### "Import error: notion-client"
```bash
pip install notion-client python-dotenv requests feedparser --break-system-packages
```

---

## 🚀 READY TO USE

**Repo**: https://github.com/WouterArtsRecruitin/recruitin-mcp-servers
**Path**: `notion-content-system/`
**Status**: Ready for Notion integration ✅

**Next**: Setup Notion API key en test!
