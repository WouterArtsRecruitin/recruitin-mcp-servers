# 📧 Tech Talent Insights - LinkedIn Newsletter (Eenvoudig)

**Van**: Wouter Arts (Persoonlijk LinkedIn Profiel)
**Naam**: "Tech Talent Insights"
**Format**: LinkedIn Newsletter (native platform)
**Frequentie**: Maandelijks (laatste vrijdag, 17:00)
**Lengte**: 600-800 woorden (lees tijd: 4 min)
**Tone**: Persoonlijk, insider, no-bullshit

---

## 📋 EENVOUDIGE STRUCTUUR (3 Delen)

### DEEL 1: Terugblik Afgelopen Maand (200 woorden)

**Wat**: Persoonlijke observaties + data van jouw placements

**Template**:
```markdown
## [Maand] In 3 Observaties

**[Maand] was [interessant/druk/rustig/...].**

Dit is wat me opviel:

**1. [Observatie 1] - [Specifiek Cijfer]**

[2-3 zinnen met concrete voorbeeld]

Voorbeeld:
"5 van 8 placements hadden counter-offer deze maand. Dat is 62%.

Jaar geleden? 30%. Markt wordt krapper, werkgevers houden vast
aan talent. Dit verandert ons proces: we bereiden kandidaten nu
proactief voor op counter-offers. Result: 7 van 8 accepteerde toch."

**2. [Observatie 2] - [Trend]**

[2-3 zinnen]

Voorbeeld:
"Automation engineer salaris: +€8k year-over-year gemiddeld.

Clients die 'marktconform' bieden zonder specifiek bedrag?
0 sollicitaties. Transparantie wint."

**3. [Observatie 3] - [Proces Learning]**

[2-3 zinnen]

Voorbeeld:
"Snelste placement: 12 dagen. Langste: 45 dagen. Verschil?
Feedback speed. Client A: binnen 4 uur. Client B: 'we moeten
intern afstemmen' (= 2 weken).

Speed kills. Of in dit geval: speed wins."
```

---

### DEEL 2: Artikel Van De Maand (150 woorden)

**Wat**: 1 artikel dat je opviel (van top 3 selector) + korte samenvatting

**Template**:
```markdown
## 📰 Artikel Dat Ik Las

**"[Artikel Titel]"**
Bron: [Publicatie], [Datum]

**Kort samengevat**:
[2-3 zinnen wat het artikel zegt]

Voorbeeld:
"Salaris Vanmorgen publiceerde HR trends 2026. Focus: data analytics,
employee experience, change management, strategic HR partnering.

Mooie buzzwords. Allemaal waar voor corporate kantoorwerk."

**Waarom ik dit deel**:
[1 zin waarom relevant]

Voorbeeld:
"Omdat GEEN ENKELE trend lijst technical recruitment noemt. En dat is
precies het probleem."
```

---

### DEEL 3: Mijn Perspectief (300-400 woorden)

**Wat**: Jouw persoonlijke opinion, insider take, controversieel perspectief

**Template**:
```markdown
## 💭 Mijn Take

[PROVOCERENDE OPENING - statement of vraag]

Voorbeeld:
"HR trends 2026? Vergeet ze. Technical recruitment speelt volgens
compleet andere regels."

[VANUIT DE PRAKTIJK - wat zie jij]

Voorbeeld:
"Deze maand had ik een client die 'culture fit' assessment wilde
doen met 3 ronden interviews.

Ik vroeg: 'Wat is jouw definitie van culture fit?'
Answer: 'Iemand die bij het team past.'

Ik: 'Hoe meet je dat?'
Answer: 'Gevoel.'"

[DATA/VOORBEELD - bewijs je punt]

Voorbeeld:
"Analyse van 47 afwijzingen afgelopen 6 maanden:
23 waren 'culture fit' (49%).

Van die 23:
- 18 hadden GEEN written requirements
- 21 hadden GEEN scorecard
- Alle 23 waren subjectief

Result: €180k in gemiste placements omdat 'gevoel' nee zei."

[JOUW STELLING - wat is de waarheid]

Voorbeeld:
"'Culture fit' zonder meetbare criteria = discrimination risk +
gemiste talent.

'Culture add' met gap analysis = betere hires.

Vraag niet: 'Past hij erbij?'
Vraag: 'Wat brengt hij dat we MISSEN?'"

[CONCREET VOORBEELD - story]

Voorbeeld:
"Team van 6 Siemens engineers. Kandidaat: Rockwell expert, 0 Siemens.

Culture fit logic: Nee (past niet).
Culture add logic: Ja (brengt Rockwell kennis).

Client koos culture add. Nu beste hire van 2025."

[AFSLUITING - call to action of vraag]

Voorbeeld:
"Laatste keer dat je iemand aannam die helemaal NIET paste?

Ik wed: een van je beste hires.

Laat het weten in comments. 👇"
```

**Lengte**: 350-450 woorden
**Tone**: Direct, persoonlijk, contrarian waar mogelijk
**Structuur**: Opening → Praktijk → Data → Stelling → Voorbeeld → CTA

---

## 🎨 VISUAL SPECIFICATIE

### Featured Image (LinkedIn Newsletter Header)

**Type**: Simple branded header

**Design**:
```
Template: LinkedIn article header (1200x627px)

Content:
┌────────────────────────────────────────────────┐
│                                                │
│  Tech Talent Insights                          │
│  [Maand] 2026                                  │
│                                                │
│  Door Wouter Arts                              │
│  Technical Recruitment Specialist              │
│                                                │
│  [Recruitin logo]                              │
│                                                │
└────────────────────────────────────────────────┘

Style: Clean, minimal, professional
Colors: Recruitin orange accent, dark blue background
Font: Sans-serif, bold header
Size: 1200x627px (LinkedIn optimal)
```

**Generatie**: Canva template "LinkedIn Article" (5 min)

**Alternatief**: Geen image (text-only werkt ook voor newsletters)

---

## 📌 BRONVERMELDING

### In Newsletter Zelf

**Onderaan artikel sectie**:
```
**Bronnen**:
- [Artikel titel], [Publicatie], [Datum], [Link]
- Recruitin placements data [maand] 2026 (n=[X])
- [Andere bronnen indien gebruikt]
```

**Bij elke data point**:
```
"Volgens UWV Q4 2025..."
"Onze eigen cijfers laten zien..."
"Intelligence Group rapporteert..."
```

**Disclaimer** (onderaan):
```
*Recruitin cijfers gebaseerd op eigen placements Oost-Nederland,
mid-market technical bedrijven 50-800 FTE, 2025-2026.*
```

---

## 📅 PUBLICATIE WORKFLOW

### Laatste Vrijdag Van Maand (17:00)

**17:00-17:15** - Data verzamelen:
```
# In Claude Code:
Generate newsletter data voor [maand]:

Van Pipedrive (afgelopen 30 dagen):
- Total placements
- Avg time-to-fill
- Sector breakdown
- Top 3 observaties (trends, learnings)

Format: Newsletter "Terugblik" sectie
```

**17:15-17:25** - Artikel selecteren:
```bash
# Beste artikel van maand
cd ~/recruitin-mcp-servers
node select-top-articles.js --top3

# Gebruik #1 voor newsletter
```

**17:25-17:45** - Content schrijven:
```
# In Claude Code:
Schrijf LinkedIn newsletter "Tech Talent Insights" [maand]:

Deel 1: Terugblik (data: [paste Pipedrive stats])
Deel 2: Artikel ([paste top artikel])
Deel 3: Mijn take (contrarian/insider perspective)

Tone: Wouter's no-bullshit style
Length: 700 woorden
Bronvermelding: Volledig onderaan
```

**17:45-17:55** - Visual maken (optioneel):
- Canva header (5 min)
- Stats graphic (5 min)

**17:55-18:00** - Publiceren:
1. LinkedIn → Write Article
2. Select "Publish as newsletter"
3. Add featured image
4. Publish
5. Notify subscribers (automatic)

**Total**: 60 minuten (1x per maand)

---

## 💡 EERSTE EDITIE (Voorbeeld - Januari 2026)

```markdown
# Tech Talent Insights - Januari 2026

**Door Wouter Arts**

---

Januari was krap.

8 placements, allemaal technical (automation, instrumentation, electrical). Gemiddelde time-to-fill: 24 dagen. Dat is snel. Normaal is 28.

Wat maakte het verschil? Clients die snappen dat technical talent niet wacht.

---

## Januari In 3 Observaties

**1. Counter-Offers Zijn De Nieuwe Normaal - 62%**

5 van 8 kandidaten kreeg counter-offer. Dat is 62%. Jaar geleden: 30%.

Betekent: Werkgevers houden vast. Markt is krapper.

Onze aanpak: Proactief voorbereiden. "Je krijgt waarschijnlijk counter. Laten we scenarios doorlopen."

Result: 7 van 8 accepteerde onze offer (88%).

**2. Siemens Premium Stijgt - +€8k**

Siemens TIA Portal kandidaten vragen €8k meer dan vorig jaar. Markt accepteert dit.

Rockwell? Stabiel.

Impact: Siemens candidates worden duurder. Clients moeten budgets aanpassen of Rockwell accepteren (trainbaar).

**3. Snelheid = Alles - 12 vs 45 Dagen**

Snelste placement: 12 dagen (client feedback binnen 4h elke keer).
Langste: 45 dagen (client: "we moeten intern bespreken" = 2 weken wait).

Verschil: 33 dagen. Kandidaat had in die tijd 2 andere offers.

Lesson: Beslissen < 24h of verlies talent.

---

## 📰 Artikel Dat Ik Las

**"HR-trends 2026: vier belangrijke rollen voor HR-managers"**
Bron: Salaris Vanmorgen, 2 januari 2026

**Wat het zegt**:
HR moet focussen op data analytics, employee experience, change management en strategic partnering in 2026.

Allemaal waar. Voor corporate kantoorwerk.

**Waarom ik dit deel**:
Omdat technical recruitment = 0% hiervan.

---

## 💭 Mijn Take: Vergeet HR Trends

HR trends lijsten zijn elk jaar hetzelfde.

"AI in recruitment!" (sinds 2020)
"Employee experience!" (sinds 2018)
"Data-driven HR!" (sinds 2015)

Maar voor technical recruitment? Andere spelregels.

**Technical ≠ Corporate**:

Corporate HR: "Culture fit" assessment, 3 interview ronden, persoonlijkheidstest.

Technical: Skill test (30 min PLC troubleshooting), 1 interview (culture check), hire.

Why? Omdat Siemens TIA Portal kennis = meetbaar. "Teamspirit" = niet.

**Voorbeeld uit januari**:

Client wilde "culture fit" ronden toevoegen.

Ik: "Wat meet je dan?"
Client: "Of hij bij team past."
Ik: "Hoe weet je dat?"
Client: "Gevoel."

Ik liet hem 23 afwijzingsredenen zien van afgelopen half jaar.
Alle 23: "Culture fit". GEEN had concrete criteria.

Result: €180k in gemiste placements door "gevoel".

We deden skill test instead. Pass = hire. Fail = stop.

Nieuwe client acceptance rate: 78% (was 45%).

**Punt**: Technical recruitment = engineering probleem. Niet HR probleem.

Meetbare criteria > vibes.
Speed > proces.
Skill test > persoonlijkheidstest.

**Laatste keer dat je iemand aannam op "gevoel"?**

Hoelang bleef ie? 🤔

---

## 🎯 Februari Focus

Volgende maand: 20 Oil & Gas bedrijven bellen.

Offshore projects starten Q1. Ze gaan automation talent nodig hebben. Ze weten het nog niet.

Proactive > reactive.

**Als je technical recruitment uitdaging hebt**: Reply dit bericht.

---

**Tot volgende maand!**

Wouter
📧 wouter@recruitin.nl

---

**Bronnen**:
- Salaris Vanmorgen: "HR-trends 2026", 2 jan 2026
- Recruitin placements januari 2026 (n=8)
- Eigen analyse afwijzingsredenen (n=23, 6 maanden)

*Tech Talent Insights | Maandelijks | Subscribe: [link]*
```

**Lengte**: 647 woorden ✅
**Tone**: Persoonlijk, direct, data-backed ✅
**Delen**: 3 (terugblik + artikel + opinion) ✅

---

## 🎨 VISUAL: GEEN IMAGE NODIG

**Beslissing**: ❌ Geen featured image

**Waarom**:
- LinkedIn newsletters = text-first (zoals blog)
- Image optioneel (niet verplicht)
- Focus = content, niet visual
- Tijd besparen: 10 minuten

**Als je toch wilt**:
- Simple header graphic (naam newsletter + maand)
- 5 minuten Canva
- 1200x627px

---

## 📊 GENERATIE COMMAND

### Maandelijke Newsletter (In Claude Code)

```
Genereer LinkedIn newsletter "Tech Talent Insights" voor [maand] 2026:

DEEL 1: Terugblik (200 woorden)
Source: Pipedrive placements afgelopen 30 dagen
- Total placements: [X]
- Avg time-to-fill: [X]d
- 3 concrete observaties (specifieke cijfers + learnings)

Format:
"[Maand] In 3 Observaties"
1. [Observatie + cijfer + voorbeeld]
2. [Observatie + cijfer + voorbeeld]
3. [Observatie + cijfer + voorbeeld]

DEEL 2: Artikel (150 woorden)
Source: Top article van maand (van select-top-articles.js)
- Artikel: [paste titel + bron]
- Samenvatting: Wat zegt het? (2-3 zinnen)
- Waarom ik dit deel: [relevantie]

DEEL 3: Mijn Take (300-400 woorden)
Tone: Contrarian of insider perspective
Based on: Artikel topic
Include:
- Opening (provocerend)
- Vanuit praktijk (concrete voorbeeld)
- Data/bewijs (cijfers)
- Jouw stelling (wat is waarheid)
- Story (illustratie)
- CTA (vraag engagement)

Total length: 650-750 woorden
Tone: Wouter's no-bullshit style (docs/linkedin-content-authority.md)

BRONVERMELDING:
- Bij elk cijfer (in-text)
- Volledige lijst onderaan
- Disclaimer eigen data

Output: Complete newsletter ready to publish on LinkedIn
```

---

## 📅 PUBLICATIE SCHEMA

### Maandelijks Ritme

| Maand | Publicatie | Focus Thema | Artikel Type |
|-------|------------|-------------|--------------|
| **Jan 2026** | 31 jan 17:00 | HR trends vs Technical | Contrarian |
| **Feb 2026** | 28 feb 17:00 | Salaris trends | Data story |
| **Mrt 2026** | 28 mrt 17:00 | Q1 review + AI | Behind-scenes |
| **Apr 2026** | 25 apr 17:00 | Skills shortage | How-to |

**Patroon**: Data terugblik → Extern artikel → Persoonlijke take (afwisselend contrarian/data/story)

---

## 🚀 LINKEDIN NEWSLETTER SETUP (5 minuten)

### Eenmalige Activatie

**Stap 1**: Ga naar LinkedIn profiel → Articles

**Stap 2**: Klik "Create a newsletter"

**Stap 3**: Configuratie
- **Naam**: "Tech Talent Insights"
- **Beschrijving**: "Maandelijkse insider perspectives over technical recruitment. Automation, engineering, manufacturing. Data, trends & no-bullshit takes. Door Wouter Arts."
- **Logo**: Upload Recruitin logo of jouw foto
- **Frequency**: Monthly

**Stap 4**: Publish eerste editie

**Stap 5**: Promote
- Post op feed: "Nieuwe newsletter! Eerste editie live"
- Feature op profiel (pin)
- Email signature update

---

## 📈 GROWTH TARGETS

### Subscribers

| Timeline | Target | Strategie |
|----------|--------|-----------|
| **Maand 1** | 50 | Jouw connecties (invite) |
| **Maand 3** | 150 | Mention in posts |
| **Maand 6** | 400 | Organic growth + shares |
| **Maand 12** | 800+ | Authority status |

### Engagement

| Metric | Target |
|--------|--------|
| Open rate | 50%+ (subscribers opt-in) |
| Comments | 10+ per editie |
| Shares | 5+ |
| Replies | 3-5 (leads) |

---

## 💰 ROI

**Time Investment**:
- Per editie: 60 minuten (1x per maand)
- Per jaar: 12 uur total

**Value**:
- Authority building: Unmeasurable maar high
- Lead generation: 3-5 leads/maand (€45k+ LTV)
- Thought leadership: Industry recognition
- SEO: Backlinks + brand searches

**ROI**: €15k-25k/jaar (conservative, alleen leads)

**Plus**: Authority positioning (onbetaalbaar)

---

## ✅ READY TO LAUNCH

**Template**: ✅ Eenvoudig & effectief
**Data source**: ✅ Pipedrive + top articles
**Tone guide**: ✅ Wouter's style
**Publishing**: ✅ LinkedIn native
**Visual**: ❌ Optioneel (save time)
**Bronvermelding**: ✅ Volledig

**Eerste editie**: 31 januari 2026 (laatste vrijdag)

---

**Wil je dat ik de eerste editie nu genereer voor januari?** 🚀

*Of eerst feedback op template?*
