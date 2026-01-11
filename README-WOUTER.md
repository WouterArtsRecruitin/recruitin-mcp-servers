# 👋 Wouter - Begin Hier

**Repo**: recruitin-mcp-servers
**Wat het doet**: Dagelijks recruitment nieuws → Weekly LinkedIn + blog content

---

## ⚡ IN 30 SECONDEN

**Test dit NU**:
```bash
cd ~/recruitin-mcp-servers
npm install axios
node generate-news-report-now.js
```

**Werkt het?** → Zie je "✅ REPORT GENERATED"? → Ga verder!

---

## 📖 WAT KAN IK ERMEE?

### 1. Nieuws Verzamelen (Elke vrijdag)

**Run dit**:
```bash
node generate-news-report-now.js
```

**Krijg je**: HTML rapport met 300+ recruitment nieuws artikelen
**Bronnen**: UWV, CBS, ABU, NBBU, recruitment vakbladen
**⚠️**: GEEN LinkedIn (zoals je wilde!)

---

### 2. Content Maken (In Claude Code)

**Vraag Claude**:
```
Maak weekly recruitment content:

Tone: Zoals in docs/linkedin-content-authority.md (direct, no-bullshit)

Genereer:
1. LinkedIn Wouter (250 chars, contrarian of data story)
2. LinkedIn Recruitin (350 chars, professioneel)
3. Blog recruitin.nl (1000 woorden)

Basis op trending recruitment nieuws
```

**Krijg je**: 3 posts klaar om te posten!

---

## 📁 BELANGRIJKE FILES

**Gebruik deze**:
- `generate-news-report-now.js` ← Run voor nieuws
- `docs/linkedin-content-authority.md` ← Je schrijfstijl
- `docs/daily-news-content-system.md` ← Hoe systeem werkt

**Negeer rest** (49 andere MCP servers voor later)

---

## 🎯 WEKELIJKSE ROUTINE

### Vrijdag (20 minuten)

**17:00 - Nieuws scrapen**:
```bash
cd ~/recruitin-mcp-servers
node generate-news-report-now.js
```

**17:05 - Content genereren** (in Claude):
```
Maak weekly content volgens tone of voice docs
```

**17:15 - Reviewen**: Lees de 3 outputs, edit indien nodig

**17:25 - Posten**:
- LinkedIn Wouter → Post nu
- LinkedIn Recruitin → Schedule maandag 9am
- Blog → Upload WordPress, schedule maandag 9am

**KLAAR!** Weekend in 🍺

---

## 🔑 TONE OF VOICE (Van docs/linkedin-content-authority.md)

**Jouw stem**: "De No-Bullshit Recruitment Expert"

**Kenmerken**:
- ✅ Direct: "Dit werkt niet. Hier is waarom."
- ✅ Eerlijk: "90% vacatureteksten zijn waardeloos"
- ✅ Data-driven: Concrete cijfers, geen vage claims
- ✅ Toegankelijk: Spreektaal, geen corporate jargon
- ✅ Provocerend: Contrarian standpunten

**Post Types**:
1. **Contrarian Take** (hoogste engagement)
2. **Data Story** (authority building)
3. **Behind-the-Scenes** (authenticiteit)
4. **How-To** (thought leadership)

---

## 📊 LINKEDIN ALGORITHME (Van docs)

**Best Practices**:
- Post dinsdag-donderdag, 8-10am
- Eerste 3 regels = hook (moet "meer weergeven" triggeren)
- Reageer op ELKE comment binnen 1 uur
- 3-5 hashtags (onderaan, niet in tekst)
- 1200-1500 characters (sweet spot)

**Vermijd**:
- Links in de post (zet in comment)
- Meer dan 5 hashtags
- "Eens?" of "Deel dit" als CTA

---

## ✅ CONFIGURATIE STATUS

**Repo**: ✅ Geconfigureerd
**News Scraper**: ✅ Ready (generate-news-report-now.js)
**Docs**: ✅ Aanwezig (linkedin + system design)
**GitHub**: ✅ Connected (WouterArtsRecruitin/recruitin-mcp-servers)

**Klaar voor**: Daily news scraping + weekly content generation

---

## 🚀 START NU

**Test command**:
```bash
cd ~/recruitin-mcp-servers && node generate-news-report-now.js
```

**Lukt het?** → Perfect! Je bent ready.

**Lukt niet?** → Zeg welke error, ik help!

---

**RECOMMENDED**: Test de scraper nu (30 sec) 👆
