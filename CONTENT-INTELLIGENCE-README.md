# 📰 Content Intelligence System - Quick Guide

**Repository**: recruitin-mcp-servers (PUBLIC)
**Feature**: Daily news scraping → Weekly content generation
**Status**: Production Ready ✅

---

## ⚡ QUICK START (2 Minuten)

### Test De News Scraper

```bash
cd ~/recruitin-mcp-servers
npm install axios
node generate-news-report-now.js
```

**Expected**:
```
✅ REPORT GENERATED SUCCESSFULLY!
📄 Report saved to: reports/recruitment-news-2026-01-11.html
📊 Total articles: 347
```

**Open Report**:
```bash
open reports/recruitment-news-*.html
```

Je ziet nu een HTML dashboard met 300+ recruitment nieuws artikelen.

---

## 🎯 WAT DOET HET?

### Daily News Scraping

**Scrapet 25 Nederlandse bronnen**:
- UWV (arbeidsmarkt cijfers)
- CBS (statistieken)
- ABU/NBBU (uitzendbranche)
- Recruitment vakbladen
- Financieel Dagblad
- NOS/NU.nl (werkgelegenheid)

**Output**: Professional HTML rapport
**Frequency**: Daily (automatic via GitHub Actions) of manual
**⚠️ GEEN LinkedIn scraping** - Alleen nieuws sites

---

### Weekly Content Generation

**Input**: 7 daily news reports
**Process**: Claude AI analyseert trends
**Output**: 3 content stukken:
1. LinkedIn post (Wouter Arts - personal)
2. LinkedIn post (Recruitin - bedrijf)
3. Blog artikel (www.recruitin.nl)

**Frequency**: Weekly (Friday 17:00)
**Time**: 15 min review + publish

---

## 📁 REPO STRUCTUUR

```
recruitin-mcp-servers/
│
├── generate-news-report-now.js    ← NEWS SCRAPER (RUN DIT)
├── daily-recruitment-news-agent.js ← Alternative met cron
│
├── reports/                        ← Daily HTML rapporten
│   └── recruitment-news-[DATE].html
│
├── weekly-content/                 ← Weekly outputs
│   └── weekly-content-[DATE].md
│
├── .github/workflows/              ← Automation
│   ├── daily-news-scraper.yml
│   └── weekly-content-gen.yml
│
├── docs/                           ← Documentatie
│   ├── QUICK-START.md
│   └── USAGE-GUIDE.md
│
└── [49 andere MCP servers]
```

---

## 🚀 GEBRUIK

### Optie A: Handmatig (Simpel)

**Elke vrijdag**:
```bash
# 1. Scrape nieuws
node generate-news-report-now.js

# 2. In Claude Code chat:
"Maak weekly content op basis van recruitment nieuws"

# 3. Post content (copy-paste)
```

**Tijd**: 20 min/week
**Voordeel**: Volledige controle
**Nadeel**: Moet het elke week zelf runnen

---

### Optie B: Automated (GitHub Actions)

**Setup 1x** (15 min):
1. Add GitHub Secrets (API keys)
2. Enable workflows
3. KLAAR!

**Daarna automatic**:
- Dagelijks 7am: News scrapes
- Vrijdag 17:00: Content generates
- Jij: Review + post (15 min)

**Setup Guide**: Zie [`GITHUB-ACTIONS-SETUP.md`](GITHUB-ACTIONS-SETUP.md)

---

## 📊 GITHUB ACTIONS (Optioneel)

### Daily News Scraper

**File**: `.github/workflows/daily-news-scraper.yml`
**Schedule**: Every day 7:00 AM
**Does**: Runs generate-news-report-now.js
**Output**: Commits report to repo

**Setup**:
- Add secret: `BRAVE_API_KEY`
- Enable workflow
- Done!

### Weekly Content Generator

**File**: `.github/workflows/weekly-content-gen.yml`
**Schedule**: Every Friday 17:00
**Does**: Selects top 10 → Uploads to Notion → Generates content via Claude API
**Output**:
- `weekly-content/content-YYYY-MM-DD.json`
- `reports/top-articles-YYYY-MM-DD.json`
- GitHub Issue with content preview

**Setup**:
- Add secrets: `BRAVE_API_KEY`, `ANTHROPIC_API_KEY`, `NOTION_API_KEY`
- Enable workflow
- Done!

---

## 🔑 API KEYS NEEDED

### For Manual Use
**None!** API key hardcoded in script (voor testing)

### For Automation (GitHub Actions)
**Add as GitHub Secrets**:
1. `BRAVE_API_KEY` = *(set via GitHub Secrets)*
2. `ANTHROPIC_API_KEY` = `sk-ant-api03-[YOUR_KEY]`

**Where**: GitHub repo → Settings → Secrets → Actions

---

## 💡 VOORBEELDEN

### Genereer Content (In Claude Code)

```
Maak weekly recruitment content:

Topic: AI in recruitment (trending deze week)

Genereer:
- LinkedIn Wouter (persoonlijk, 250 chars)
- LinkedIn Recruitin (bedrijf, 350 chars)
- Blog artikel (1000 woorden, praktische tips)

Focus: Technical recruitment Nederland
```

**Output**: Alle 3 posts ready to publish

---

## 📞 LINKS

- **GitHub Repo**: https://github.com/WouterArtsRecruitin/recruitin-mcp-servers
- **Issues**: Create issue als iets niet werkt
- **Docs**: Zie `docs/` directory

---

## ✅ NEXT STEPS

### Nu (Test)
```bash
node generate-news-report-now.js
```

### Deze Week (Gebruik)
- Vrijdag: Scrape + genereer content
- Post LinkedIn + blog
- Track engagement

### Volgende Week (Automatiseren - optioneel)
- Setup GitHub Actions
- Add API secrets
- Enable automation

---

**Status**: Repo geconfigureerd ✅
**Ready**: Voor content intelligence use ✅
**Next**: Test de scraper! 🚀
