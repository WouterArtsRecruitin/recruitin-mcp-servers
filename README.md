# 📰 Recruitment Content Intelligence - Simpele Handleiding

**Voor**: Wekelijkse LinkedIn + Blog content
**Tijd**: 20 minuten per week
**Opslag**: Top 10 artikelen in Notion (optioneel)

---

## ⚡ QUICK START (3 Stappen)

### Stap 1: Run News Scraper (30 sec)
```bash
cd ~/recruitin-mcp-servers
node generate-news-report-now.js
```

**Je krijgt**: HTML rapport met ~160 technical recruitment nieuws artikelen

---

### Stap 2: Check Top 3 (30 sec)
```bash
node select-top-articles.js --top3
```

**Je krijgt**: Top 3 beste artikelen voor jouw content

---

### Stap 3: Vraag Claude Om Content (5 min)

**In Claude Code chat**:
```
Maak weekly recruitment content op basis van top artikel

Gebruik: docs/linkedin-content-authority.md (mijn schrijfstijl)

Output:
1. LinkedIn Wouter (250 chars, contrarian)
2. LinkedIn Recruitin (350 chars, data story)
3. Blog (1000 woorden)

Met bronvermelding!
```

**Je krijgt**: 3 posts klaar om te publiceren

---

## 📖 GEBRUIKSHANDLEIDING

### Wekelijkse Routine (Vrijdag, 20 min)

**17:00 - Nieuws Verzamelen** (1 min):
```bash
cd ~/recruitin-mcp-servers
node generate-news-report-now.js
```

**17:01 - Top 3 Checken** (1 min):
```bash
node select-top-articles.js --top3
```

Zie je beste artikel? Noteer de titel.

**17:02 - Content Genereren** (5 min):

In Claude Code:
```
Maak content op basis van: [artikel titel]

LinkedIn Wouter: Contrarian take, 250 chars
LinkedIn Recruitin: Data story, 350 chars
Blog: 1000 woorden, praktische tips

Tone: Direct, no-bullshit, data-driven
Bronvermelding: Volledig
```

**17:07 - Review** (3 min):
- Lees de 3 outputs
- Check cijfers kloppen
- Minor edits indien nodig

**17:10 - Opslaan in Notion** (5 min - OPTIONEEL):

**Simpel voorstel**: Alleen top 10 weekly
```
1. Open Notion page "Weekly News"
2. Voeg toe:
   - Titel artikel
   - URL
   - Score
   - Gebruikt voor content? (ja/nee)

Dat's het! Simpel.
```

**17:15 - Publiceren** (5 min):
- LinkedIn Wouter: Post nu (copy-paste)
- LinkedIn Recruitin: Schedule maandag (Buffer)
- Blog: Upload WordPress, schedule maandag

**KLAAR!** 🍺

---

## 💾 OPSLAG: WAT WORDT WAAR BEWAARD?

### HTML Rapporten (Automatic)
**Waar**: `~/recruitin-mcp-servers/reports/`
**Wat**: Alle 163 artikelen per dag
**Format**: HTML (open in browser)
**Bewaard**: Lokaal op je Mac
**Backup**: Naar GitHub (als je wilt)

**Voordeel**: Altijd beschikbaar, geen database nodig
**Nadeel**: Niet doorzoekbaar

---

### Notion (Optioneel - Jouw Voorstel)
**Wat**: **ALLEEN top 10 artikelen** per week
**Waarom**: Simpel, overzichtelijk, geen spam
**Hoe**: Manual copy (5 min/week)

**Simpele Notion Setup**:
```
Page: "Weekly Top 10 News"

Format: Simple table

| Week | Datum | Artikel Titel | URL | Score | Gebruikt? |
|------|-------|---------------|-----|-------|-----------|
| W2   | 12-01 | HR trends 2026 | [link] | 55 | ✅ |
| W2   | 12-01 | Automation werkplaats | [link] | 30 | ❌ |
| ... (8 more) |
```

**Tijd**: 5 minuten per week
**Value**: Overzicht wat je gebruikt hebt, makkelijk terug te vinden

---

### Content Performance (Later - Als Je Wilt Meten)
**Wat**: Gepubliceerde posts + LinkedIn stats
**Database**: "Content Performance Tracker" (zie CONTENT-ANALYTICS-SYSTEM.md)
**Tijd**: 15 min/week
**Value**: Leren wat werkt → Betere content

**Status**: Ontworpen, nog niet actief (wachten op feedback)

---

## 📋 COMMANDS (Copy-Paste Ready)

### Daily/Weekly Commands

**1. Scrape News** (elke vrijdag):
```bash
cd ~/recruitin-mcp-servers && node generate-news-report-now.js
```

**2. Top 10 Weekly**:
```bash
node select-top-articles.js
```

**3. Top 3 Voor Jou** (detailed):
```bash
node select-top-articles.js --top3
```

**4. Open HTML Rapport**:
```bash
open reports/recruitment-news-*.html
```

**5. Generate Content** (In Claude Code):
```
Maak weekly content:
- Basis: Top artikel
- Tone: docs/linkedin-content-authority.md
- Output: LinkedIn (2) + Blog (1)
- Bronvermelding: Volledig
```

---

### Notion Commands (Optioneel)

**6. Fetch RSS Feeds** (4 bronnen → Notion):
```bash
cd notion-content-system
python3 notion_content_manager.py --action fetch_news --max-items 5 --save
```

**7. Test Notion Connection**:
```bash
python3 notion_content_manager.py --action test
```

---

## 🎯 WAT WORDT WAAR OPGESLAGEN? (Samenvatting)

```
┌─────────────────────────────────────────────────────┐
│  AUTOMATISCH (Elke Run)                             │
├─────────────────────────────────────────────────────┤
│  Brave Search (31 queries)                          │
│  → 163 artikelen                                    │
│  → Saved: HTML rapport (lokaal)                     │
│  → Locatie: ~/recruitin-mcp-servers/reports/       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  OPTIONEEL (Als je wilt)                            │
├─────────────────────────────────────────────────────┤
│  RSS Feeds (4 bronnen)                              │
│  → 6 artikelen                                      │
│  → Saved: Notion database (cloud)                   │
│  → Needs: Database setup (10 min)                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  JOUW VOORSTEL (Simpel & Effectief)                │
├─────────────────────────────────────────────────────┤
│  Top 10 Weekly                                      │
│  → Manual copy (5 min/week)                         │
│  → Saved: Notion table (simpel)                     │
│  → Kolommen: Titel, URL, Score, Gebruikt?          │
└─────────────────────────────────────────────────────┘
```

**Recommendation**: Start met HTML (werkt nu), voeg Notion toe als je het nodig hebt

---

## 📁 BELANGRIJKSTE FILES

**Voor Gebruik**:
1. **README-WOUTER.md** - Simpele start (2 min lezen)
2. **generate-news-report-now.js** - Run dit voor nieuws
3. **select-top-articles.js** - Run dit voor top 10/top 3
4. **docs/linkedin-content-authority.md** - Jouw schrijfstijl

**Voor Review Morgen**:
5. **CONTENT-REVIEW-DOCUMENT.md** - Alle gegenereerde content
6. **RAPPORT-HTML-VOOR-FIGMA.html** - HTML voor Figma design

**Voor Later**:
7. **CONTENT-ANALYTICS-SYSTEM.md** - Feedback loop (meten & optimaliseren)
8. **LINKEDIN-NEWSLETTER-EENVOUDIG.md** - Maandelijkse newsletter

---

## 🎯 SIMPELE NOTION SETUP (Jouw Voorstel)

### Optie: Weekly Top 10 Table

**In Notion** (5 min setup):

**Stap 1**: Create page "Weekly Top 10 News"

**Stap 2**: Add simple table:
```
Week | Datum | Titel | URL | Score | Gebruikt
W2   | 12-01 | HR trends 2026 | [link] | 55 | ✅
W2   | 12-01 | Automation werkplaats | [link] | 30 | ❌
W2   | 12-01 | [8 more...] | ... | ... | ...
```

**Stap 3**: Elke vrijdag (5 min):
```bash
# Run top 10 selector
node select-top-articles.js

# Copy top 10 naar Notion table (manual)
# Just: Titel, URL, Score
```

**KLAAR!** Simpel archief zonder database complexity.

---

## ✅ STATUS CHECK

**Wat werkt NU**:
- ✅ News scraper (163 artikelen/dag)
- ✅ Top 10 selector (automatic scoring)
- ✅ Top 3 voor jou (best articles)
- ✅ HTML rapporten (saved lokaal)
- ✅ Content generation (via Claude)

**Wat NIET automatisch is**:
- ❌ Artikelen → Notion (manual setup needed)
- ❌ Content → Notion (kan je doen, niet automatic)

**Jouw voorstel**:
- ✅ Top 10 weekly → Notion table (5 min manual/week)
- ✅ Simpel, geen database gedoe
- ✅ Genoeg voor overzicht

**Mijn advies**: Doe jouw voorstel! Simpel = beter.

---

## 📞 MORGEN

**Open**:
1. `CONTENT-REVIEW-DOCUMENT.md` (alle content outputs)
2. Review content
3. Geef feedback
4. Publish!

**Optioneel**:
- Create simpele Notion table voor top 10 weekly

---

**Tot morgen!** 🚀

*Alles staat klaar in: ~/recruitin-mcp-servers/*
*GitHub: https://github.com/WouterArtsRecruitin/recruitin-mcp-servers*
