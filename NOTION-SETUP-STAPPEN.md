# 🔧 NOTION SETUP - 2 Minuten

**Probleem**: Page niet shared met integration
**Oplossing**: 2 simpele stappen in Notion

---

## ⚡ QUICK FIX (2 minuten)

### Stap 1: Open Je LinkedIn Intelligence Hub

**In browser**: Open https://notion.so/5ceeffd1e99430369aa8bd589966d363

Of: Zoek in Notion naar "LinkedIn Intelligence Hub"

---

### Stap 2: Share Met Integration

**In de Notion page**:

1. Click **"..."** (rechtsboven, naast "Share")
2. Scroll naar beneden → **"Connections"**
3. Click **"Connect to"**
4. Zoek: **"Claude MCP"** (of jouw integration naam)
5. Click **"Connect"**

**Done!** ✅

---

### Stap 3: Run Upload Script (30 sec)

**Terug naar terminal**:
```bash
cd ~/recruitin-mcp-servers
node upload-top10-to-notion.js
```

**Zie je**:
```
✅ Added heading: Week 2
✅ Added: HR-trends 2026...
✅ Added: Automation werkplaatsen...
... (10 artikelen)

✅ Top 10 uploaded to Notion hub!
```

**Check Notion**: Refresh page → Top 10 staat er! 🎉

---

## 🎯 ALTERNATIEF (Nog Simpeler)

**Als Notion integration gedoe is**:

**Manual** (5 min):
1. Open Notion hub
2. Copy-paste dit:

```
═══════════════════════════════════════════════
Week 2 - 12 januari 2026
═══════════════════════════════════════════════

📊 Top 10 Technical Recruitment News

1. ⭐ HR-trends 2026 (55/100) - GEBRUIKT
   Salaris Vanmorgen, 2 jan 2026
   https://www.salarisvanmorgen.nl/2026/01/02/partner-sd-worx-hr-trends-2026-vier-belangrijke-rollen-voor-hr-managers/

   Content: LinkedIn Wouter (contrarian) + Recruitin (data) + Blog

2. Automation werkplaatsen (30/100)
   Metaal Magazine
   https://www.metaalmagazine.nl/partners/onderhoud-en-automatisering-in-industriele-werkplaatsen-hoe-slimme-keuzes-productiviteit-verhogen/107731/

3-10. Overige artikelen (30/100)
   (Technical keywords, maar geen actual news)

═══════════════════════════════════════════════

📝 Content Gegenereerd:
→ LinkedIn Wouter: "Culture fit kritiek" (zie CONTENT-REVIEW-DOCUMENT.md)
→ LinkedIn Recruitin: "Tech vs HR data comparison"
→ Blog: "HR Trends 2026 Voor Technical Recruitment"

Status: Ready for review & publish
```

**DONE!** Simpel en snel.

---

## 🎯 MIJN AANBEVELING

**Voor nu**: Manual copy-paste (5 min)
**Waarom**:
- ✅ Werkt meteen (geen integration setup)
- ✅ Flexibel (je bepaalt format)
- ✅ Simpel (gewoon tekst)

**Later** (als je wilt):
- Setup Notion integration (10 min)
- Dan: `node upload-top10-to-notion.js` = automatic ✅

**Start simpel. Automatiseer als het loont.**

---

## ✅ VOOR NU - MANUAL COPY

**Open**:
1. Je Notion "LinkedIn Intelligence Hub"
2. Add nieuwe sectie (paste text hierboven)
3. KLAAR!

**Tijd**: 2 minuten

**Check morgen**: Staat top 10 in Notion? ✅

---

**Wil je dat ik de Notion integration setup uitleg? Of is manual OK voor nu?** 🎯