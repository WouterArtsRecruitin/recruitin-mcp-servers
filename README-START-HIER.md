# ⚡ START HIER - recruitin-mcp-servers

**Repo**: recruitin-mcp-servers (PUBLIC)
**Doel**: Daily recruitment news → Weekly LinkedIn + blog content
**Status**: Ready to use ✅

---

## 🎯 IN 3 STAPPEN

### STAP 1: Test News Scraper (2 min)

```bash
cd ~/recruitin-mcp-servers
npm install axios
node generate-news-report-now.js
```

**Je ziet**:
```
✅ REPORT GENERATED!
📊 Total articles: 347
```

**Check**:
```bash
open reports/recruitment-news-*.html
```

→ HTML pagina met recruitment nieuws ✅

---

### STAP 2: Lees Content Guidelines (5 min)

**Belangrijke files**:
- `docs/linkedin-content-authority.md` ← Wouter's LinkedIn tone of voice
- `docs/daily-news-content-system.md` ← Complete systeem design

**Wat staat erin**:
- LinkedIn post templates (4 types)
- Content formules
- Wouter's schrijfstijl ("no-bullshit expert")
- SEO guidelines

---

### STAP 3: Genereer Content (In Claude Code)

**Vraag Claude**:
```
Maak weekly recruitment content:

Gebruik de tone of voice van docs/linkedin-content-authority.md

Genereer:
1. LinkedIn post Wouter (contrarian take, 250 chars)
2. LinkedIn post Recruitin (data story, 350 chars)
3. Blog artikel (1000 woorden, praktische tips)

Topic: [Trending recruitment news topic]
```

**Je krijgt**: 3 posts ready to publish

---

## 📁 REPO STRUCTUUR

```
recruitin-mcp-servers/
│
├── generate-news-report-now.js  ← RUN DIT (news scraper)
├── daily-recruitment-news-agent.js
│
├── docs/
│   ├── linkedin-content-authority.md  ← LEES DIT (tone of voice)
│   ├── daily-news-content-system.md   ← LEES DIT (systeem design)
│   └── QUICK-START.md (komt zo)
│
├── reports/                      ← Generated HTML rapporten
│   └── recruitment-news-[DATE].html
│
├── weekly-content/               ← Generated content
│   └── weekly-content-[DATE].md
│
└── [49 andere MCP servers...]
```

---

## 🎯 BELANGRIJKSTE FILES

### Voor Gebruik:
1. **generate-news-report-now.js** - Run dit voor nieuws
2. **docs/linkedin-content-authority.md** - Tone of voice guidelines
3. **docs/daily-news-content-system.md** - Complete systeem uitleg

### Voor Begrip:
- Deze README
- CONTENT-INTELLIGENCE-README.md (in repo)

---

## 💡 VOORBEELDEN (Van linkedin-content-authority.md)

### LinkedIn Post Type 1: Contrarian Take

```
Recruiters die "culture fit" als selectiecriterium
gebruiken zijn lui.

Ik zei wat ik zei.

In 6 maanden: 47 kandidaten afgewezen op "culture fit".
Geen enkele hiring manager kon uitleggen wat dat betekent.

Echte probleem? Geen duidelijke job requirements.
"Culture fit" = vuilnisbak voor ongedefinieerde criteria.

Weet je wat wél werkt? "Culture add" - wat brengt
iemand dat jullie nog NIET hebben?

Wanneer nam jij iemand aan die helemaal NIET paste?
```

**Tone**: Direct, controversial, data-backed

---

### LinkedIn Post Type 2: Data Story

```
€519.000 aan deals. Vast in Stage 2. Al 3 maanden.

Dit is mijn Pipedrive van vanochtend.

Wat ik leerde van 65 vastgelopen deals:
→ 73% had geen "next step" gedefinieerd
→ 41% wachtte op info die nooit gevraagd was
→ 28% had simpelweg geen follow-up in 14+ dagen

De fix: elke deal krijgt nu "blokkade reden" veld.
Verplicht.

Resultaat na 2 weken: 12 deals door naar Stage 3.

Wat is jouw grootste pipeline-killer?
```

**Tone**: Eerlijk, kwetsbaar, specifiek

---

## 🚀 GEBRUIK DEZE REPO VOOR

### Dagelijks (Optioneel - Voor News Monitoring)
```bash
node generate-news-report-now.js
open reports/recruitment-news-*.html
```

### Wekelijks (Content Creatie)
```
# In Claude Code chat:
Maak weekly content volgens docs/linkedin-content-authority.md richtlijnen
```

### Als Needed (MCP Tools)
- 49 andere MCP servers available
- Zie main README.md voor complete lijst

---

## 📊 GITHUB REPO STATUS

**Remote**: https://github.com/WouterArtsRecruitin/recruitin-mcp-servers
**Branch**: main
**Status**: Public
**Commits**: 2 (initial + jobdigger integration)

---

## ✅ NEXT STEPS

### Nu (Test):
```bash
node generate-news-report-now.js
```

### Vandaag (Content):
```
# In Claude:
Maak LinkedIn + blog content voor deze week
```

### Deze Week (Push Updates):
```bash
git add docs/
git commit -m "Add content intelligence docs"
git push
```

---

**Simpel toch?**
1. Run scraper → Get news
2. Ask Claude → Get content
3. Post → Done!

**Test het nu!** 🚀
