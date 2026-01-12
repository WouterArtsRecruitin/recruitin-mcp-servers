# 📋 COMPLETE COMMANDS & WORKFLOWS - Recruitin Content Intelligence

**Versie**: 1.0
**Datum**: 12 januari 2026
**Voor**: Wouter Arts - Wekelijks gebruik

---

## 🎯 INHOUDSOPGAVE

1. [Daily Commands](#daily-commands)
2. [Weekly Workflow](#weekly-workflow)
3. [Monthly Workflow](#monthly-workflow)
4. [Complete Command Reference](#command-reference)
5. [Troubleshooting](#troubleshooting)

---

## 🔥 DAILY COMMANDS {#daily-commands}

### News Scraping (Elke Ochtend - Optioneel)

**Command**:
```bash
cd ~/recruitin-mcp-servers
node generate-news-report-now.js
```

**Tijd**: 2 minuten (automatic scraping)
**Output**: HTML rapport in `reports/recruitment-news-[DATE].html`
**Frequentie**: Daily (of alleen vrijdag voor weekly content)

**Wanneer**: Alleen als je daily nieuws wilt volgen. Voor content: 1x per week is genoeg.

---

## ⭐ WEEKLY WORKFLOW {#weekly-workflow}

### Vrijdag 17:00-18:00 (60 minuten)

**COMPLETE WORKFLOW - Kopieer Dit**:

```bash
# ═══════════════════════════════════════════════════════════
# RECRUITIN WEEKLY CONTENT WORKFLOW
# Tijd: 60 minuten | Frequentie: Elke vrijdag 17:00
# Output: LinkedIn (2) + Blog (1) + Notion tracking
# ═══════════════════════════════════════════════════════════

# STAP 1: News Scraping + Top 10 + Notion Upload (2 min)
cd ~/recruitin-mcp-servers
node generate-news-report-now.js && \
node select-top-articles.js && \
node upload-to-correct-notion.js

# Je ziet nu:
# ✅ 163 artikelen scraped
# ✅ Top 10 selected
# ✅ Uploaded to Notion
# ✅ Top artikel: [Titel] (Score: X/100)

# STAP 2: Open HTML Rapport (1 min)
open reports/recruitment-news-*.html
# Scan door artikelen, check of top 3 goed zijn

# STAP 3: Content Generation (10 min - In Claude Code chat)
# Copy-paste dit in Claude:

Maak weekly recruitment content op basis van top artikel:

Artikel: [PASTE TOP ARTIKEL TITEL HIER]
Bron: [PASTE BRON HIER]
URL: [PASTE URL HIER]

Tone: docs/linkedin-content-authority.md (Wouter's no-bullshit style)
- Direct, eerlijk, data-driven
- Contrarian perspectives waar mogelijk

Output 1: LINKEDIN WOUTER (250-300 chars)
Type: Contrarian take
Visual: GEEN (text-only)
Bronvermelding: In eerste comment

Output 2: LINKEDIN RECRUITIN (350-400 chars)
Type: Data story met Recruitin cijfers
Visual: JA - Infographic specs (design brief)
Bronvermelding: In post text

Output 3: BLOG ARTIKEL (1000-1200 woorden)
Structuur: TL;DR → Nieuws → Analyse → Recruitin ervaring → 5 Tips → Conclusie
Visual: JA - 3 images (featured + 2 charts met specs)
Bronvermelding: Volledig (3-laags)

Focus: Technical recruitment (Automation, PLC, SCADA, Engineering)
Regio: Nederland, Oost-Nederland emphasis
Data: Gebruik Recruitin 2025 cijfers waar relevant

# STAP 4: Save Content (2 min)
# Claude geeft output → Copy naar editor
# Save als: weekly-content-[DATE].md (backup)

# STAP 5: Visual Production (25 min)
# Canva Pro:
# 1. LinkedIn infographic (10 min)
# 2. Blog featured image (8 min)
# 3. Blog charts (7 min)

# STAP 6: Review (5 min)
# Check:
# - Cijfers kloppen?
# - Tone goed?
# - Bronnen volledig?
# - Visuals specs duidelijk?

# STAP 7: Notion Content Tracking (5 min)
# Open Notion → Content Library database
# Add new entry:
# - Titel, Type, Publicatie datum
# - Status: Scheduled
# - (Performance vullen over 48h)

# STAP 8: Publishing (10 min)
# LinkedIn Wouter: Post nu (copy-paste)
# LinkedIn Recruitin: Buffer → Schedule maandag 9am (+ upload infographic)
# Blog: WordPress → Upload (+ 3 images) → Schedule maandag 9am

# ═══════════════════════════════════════════════════════════
# DONE! Week content klaar. Weekend in! 🍺
# ═══════════════════════════════════════════════════════════
```

**Total tijd**: 60 minuten
**Output**: 3 posts ready to publish
**Tracking**: In Notion LinkedIn Intelligence Hub

---

## 📧 MONTHLY WORKFLOW {#monthly-workflow}

### Laatste Vrijdag Van Maand (20 minuten)

**MONTHLY NEWSLETTER WORKFLOW**:

```bash
# ═══════════════════════════════════════════════════════════
# LINKEDIN NEWSLETTER - MAANDELIJKS
# Tijd: 20 minuten | Laatste vrijdag van maand, 17:00
# Output: LinkedIn Newsletter "Tech Talent Insights"
# ═══════════════════════════════════════════════════════════

# STAP 1: Data Verzamelen (5 min - In Claude Code)
# Copy-paste:

Generate monthly newsletter data voor [MAAND] 2026:

Bron: Pipedrive deals afgelopen 30 dagen

Extract:
- Total placements deze maand: [X]
- Avg time-to-fill: [X] dagen
- Sector breakdown (top 3)
- Regio spread
- 3 concrete observaties (trends, learnings, insights)

Format: Newsletter "Terugblik" sectie (200 woorden)

# STAP 2: Beste Artikel Van Maand (2 min)
# Check Notion hub: Welk artikel had hoogste score?
# Of run: node select-top-articles.js voor deze maand

# STAP 3: Newsletter Generation (10 min - Claude Code)
# Copy-paste:

Schrijf LinkedIn newsletter "Tech Talent Insights" [MAAND] 2026:

Template: LINKEDIN-NEWSLETTER-EENVOUDIG.md

DEEL 1: Terugblik (200w)
Data: [PASTE PIPEDRIVE DATA]
3 observaties met concrete cijfers

DEEL 2: Artikel (150w)
Artikel: [BESTE ARTIKEL VAN MAAND]
Samenvatting + waarom relevant

DEEL 3: Mijn Take (350-400w)
Tone: Contrarian of insider perspective
Gebaseerd op artikel topic
Include: Praktijk voorbeeld, data, story, CTA

Totaal: 700 woorden
Bronvermelding: Volledig onderaan

# STAP 4: Publish (3 min)
# LinkedIn → Write Article → Select "Publish as Newsletter"
# Title: Tech Talent Insights - [Maand] 2026
# Publish!

# ═══════════════════════════════════════════════════════════
# NEWSLETTER LIVE! Tot volgende maand.
# ═══════════════════════════════════════════════════════════
```

---

## 📋 COMMAND REFERENCE {#command-reference}

### News & Article Selection

**1. Scrape Technical Recruitment News**:
```bash
cd ~/recruitin-mcp-servers
node generate-news-report-now.js
```
**Output**: `reports/recruitment-news-[DATE].html` (163 artikelen)

---

**2. Select Top 10 Weekly**:
```bash
node select-top-articles.js
```
**Output**: Top 10 list in terminal + `reports/top-10-weekly-summary.txt`

---

**3. Select Top 3 (Detailed)**:
```bash
node select-top-articles.js --top3
```
**Output**: Top 3 met scores, reasons, content angles

---

**4. Upload Top 10 to Notion**:
```bash
node upload-to-correct-notion.js
```
**Output**: Top 10 in je LinkedIn Intelligence Hub (Notion)

---

**5. Complete Weekly Chain** (All-in-One):
```bash
node generate-news-report-now.js && \
node select-top-articles.js && \
node upload-to-correct-notion.js
```
**Output**: News → Top 10 → Notion (automatic!)

---

### File Operations

**6. Open Latest HTML Report**:
```bash
open reports/recruitment-news-*.html
```

**7. Copy Top 10 Text (Manual Notion)**:
```bash
cat TOP-10-VOOR-NOTION.txt | pbcopy
```
Then paste in Notion

---

### Notion Integration

**8. Test Notion Connection**:
```bash
cd notion-content-system
python3 notion_content_manager.py --action test
```

**9. Fetch RSS Feeds to Notion** (Optional):
```bash
python3 notion_content_manager.py --action fetch_news --max-items 5 --save
```

---

## 🔧 TROUBLESHOOTING {#troubleshooting}

### "node: command not found"
```bash
brew install node
```

### "Cannot find module 'axios'"
```bash
npm install axios
```

### "Notion upload fails"
**Check**: Page shared met integration?
**Fix**: Manual paste via `TOP-10-VOOR-NOTION.txt`

### "No reports found"
```bash
# Run scraper eerst:
node generate-news-report-now.js
```

---

## 📊 FILES OVERZICHT

**Voor Gebruik**:
- `README.md` - Complete handleiding
- `README-WOUTER.md` - Simpele start
- `generate-news-report-now.js` - News scraper
- `select-top-articles.js` - Top 10 selector
- `upload-to-correct-notion.js` - Notion upload

**Voor Review**:
- `CONTENT-REVIEW-DOCUMENT.md` - Alle content deze week
- `TOP-10-VOOR-NOTION.txt` - Formatted voor Notion
- `RAPPORT-HTML-VOOR-FIGMA.html` - HTML code

**Documentatie**:
- `docs/linkedin-content-authority.md` - Tone of voice
- `docs/RECRUITIN-COMMANDS-LIBRARY-COMPLETE.md` - 51 commands
- `CONTENT-ANALYTICS-SYSTEM.md` - Analytics & tracking

---

**STATUS**: Complete command reference ✅
**Ready**: Voor weekly gebruik ✅

---

*Complete Commands & Workflows | v1.0 | Production Ready*
