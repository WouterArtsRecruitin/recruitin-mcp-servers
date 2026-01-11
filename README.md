# 🚀 Recruitin MCP Servers + Content Intelligence

**43+ MCP servers + Daily News Scraping + Weekly Content Generation**

🔗 **Repo**: https://github.com/WouterArtsRecruitin/recruitin-mcp-servers

---

## ⚡ QUICK START (2 Minuten)

### Test News Scraper Nu:

```bash
cd ~/recruitin-mcp-servers
npm install axios
node generate-news-report-now.js
```

**Zie je "✅ REPORT GENERATED"?** → Open rapport:
```bash
open reports/recruitment-news-*.html
```

**Werkt?** ✅ Je bent ready! Lees verder ↓

---

## 📖 DOCUMENTATIE (Kies wat je nodig hebt)

### Voor Beginners (Start Hier)

| File | Leestijd | Wat |
|------|----------|-----|
| **README-WOUTER.md** | 2 min | Simpele start guide (voor jou) |
| **LEES-DIT-EERST.md** | 1 min | Welke file moet ik lezen? |
| **QUICK-START-CONTENT-SYSTEM.md** | 5 min | Test systeem in 3 stappen |
| **GEBRUIKSHANDLEIDING-SIMPEL.md** | 5 min | Wekelijks gebruik (vrijdag routine) |

### Voor Dagelijks Gebruik

| File | Gebruik |
|------|---------|
| **docs/RECRUITIN-COMMANDS-LIBRARY-COMPLETE.md** | 51 commands (copy-paste ready) |
| **docs/linkedin-content-authority.md** | Wouter's tone of voice + post templates |
| **docs/daily-news-content-system.md** | Complete systeem design |

### Voor Automation Setup

| File | Doel |
|------|------|
| **CONTENT-INTELLIGENCE-README.md** | Technical overview |
| **.github/workflows/** | GitHub Actions (automatic running) |

---

## 🎯 WAT KAN DIT?

### 1. Daily News Scraping (Automatic)

**Scrapet 25 Nederlandse recruitment bronnen**:
- UWV (arbeidsmarkt cijfers)
- CBS (statistieken)
- ABU/NBBU (uitzendbranche)
- Recruitment vakbladen
- Technische sector nieuws

**Output**: HTML dashboard (300+ artikelen/dag)
**⚠️**: GEEN LinkedIn scraping - alleen nieuws sites

---

### 2. Weekly Content Generation

**Input**: 7 daily news reports
**Process**: Claude AI analyseert trends
**Output**: 3 content stukken:
- LinkedIn post (Wouter Arts - personal)
- LinkedIn post (Recruitin - bedrijf)
- Blog artikel (www.recruitin.nl)

**Tijd**: 15 min review + publish (was: 4 uur manual)

---

### 3. 43+ MCP Servers

**Categories**:
- Recruitment tools (10)
- CRM & Sales (5)
- Communication (7)
- Data & Storage (6)
- AI & Generation (4)
- Design & Viz (2)
- Specialized agents (9+)

**See**: Original README.md (scroll down) voor complete lijst

---

## 📁 REPO STRUCTUUR

```
recruitin-mcp-servers/
│
├── 📰 NEWS & CONTENT
│   ├── generate-news-report-now.js     ← RUN DIT (news scraper)
│   ├── daily-recruitment-news-agent.js
│   ├── reports/ (generated daily news)
│   └── weekly-content/ (generated content)
│
├── 📖 DOCS (Start Hier)
│   ├── README-WOUTER.md               ← BEGIN HIER!
│   ├── RECRUITIN-COMMANDS-LIBRARY-COMPLETE.md  ← 51 commands
│   ├── linkedin-content-authority.md  ← Tone of voice
│   └── daily-news-content-system.md   ← System design
│
├── 🤖 MCP SERVERS (43+)
│   ├── brave-search-mcp-server.js
│   ├── labour-market-intelligence/
│   ├── cv-parser/
│   ├── email-mcp-server.js
│   └── [40+ other servers...]
│
└── ⚙️ AUTOMATION
    └── .github/workflows/ (GitHub Actions)
```

---

## 🎯 GEBRUIK

### Optie A: Simpel (Handmatig)

**Elke vrijdag (20 min)**:
1. Run news scraper: `node generate-news-report-now.js`
2. Vraag Claude: "Maak weekly content volgens tone of voice docs"
3. Post content (copy-paste)

**Done!** Geen automation needed.

---

### Optie B: Automated (GitHub Actions)

**Setup 1x (15 min)**:
- Add GitHub Secrets (API keys)
- Enable workflows
- KLAAR!

**Daarna automatic**:
- Daily 7am: News scrapes
- Friday 17:00: Content generates
- Jij: Review + post (15 min)

**Guide**: See CONTENT-INTELLIGENCE-README.md

---

## 🔑 TONE OF VOICE (Wouter's Style)

**Van docs/linkedin-content-authority.md**:

**Kenmerken**:
- ✅ Direct ("Dit werkt niet. Hier is waarom.")
- ✅ Eerlijk ("90% vacatureteksten zijn waardeloos")
- ✅ Data-driven (concrete cijfers, geen vage claims)
- ✅ Provocerend (contrarian standpunten)

**Post Types**:
1. Contrarian Take (hoogste engagement)
2. Data Story (authority building)
3. Behind-the-Scenes (authenticiteit)
4. How-To (thought leadership)

**Voorbeelden**: See `docs/linkedin-content-authority.md`

---

## 💰 ROI

**Content Intelligence System**:
- Kosten: €30/maand (Brave API)
- Bespaart: 5h/week × €50 = €1,000/maand
- Netto: **€970/maand** = **€11,640/jaar**

**Plus**: 43 MCP servers voor recruitment automation
**Plus**: 16 Claude Code skills (if used together)

**Total Potential**: €283k+/jaar

---

## 📞 QUICK LINKS

- **GitHub**: https://github.com/WouterArtsRecruitin/recruitin-mcp-servers
- **Start Guide**: README-WOUTER.md
- **Commands**: docs/RECRUITIN-COMMANDS-LIBRARY-COMPLETE.md (51 commands)
- **Tone of Voice**: docs/linkedin-content-authority.md

---

## ✅ NEXT STEPS

### 1. Test News Scraper (Nu - 30 sec)
```bash
node generate-news-report-now.js
```

### 2. Read Start Guide (5 min)
```
open README-WOUTER.md
```

### 3. Generate Content (In Claude Code)
```
Maak weekly recruitment content volgens docs/linkedin-content-authority.md
```

---

**Status**: Repo configured ✅
**Ready For**: Daily news + weekly content
**ROI**: €11,640/jaar

🚀 **GO!**
