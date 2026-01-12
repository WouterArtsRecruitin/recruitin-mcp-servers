# 📧 LinkedIn Newsletter - Wouter Arts (Maandelijks)

**Format**: LinkedIn Newsletter (vanuit persoonlijk profiel)
**Naam**: "Technical Recruitment Insider" (of jouw keuze)
**Frequentie**: 1x per maand (laatste vrijdag)
**Lengte**: 800-1,200 woorden
**Tone**: Persoonlijk, insider perspective, no-bullshit

---

## 📋 NEWSLETTER STRUCTUUR (Eenvoudig)

### Template (Kopie-Klaar)

```markdown
# Technical Recruitment Insider - [Maand] 2026

**Door Wouter Arts | Recruitin B.V.**

---

## 👋 Deze Maand

[2-3 zinnen persoonlijke intro - wat speelde er deze maand?]

Januari was interessant. [Observatie over de markt, deals, trends].

Deze maand in deze newsletter:
→ Terugblik: Wat we zagen in [maand]
→ Artikel dat me opviel: "[Titel]"
→ Mijn take: [Controversiële of insider perspectief]

---

## 📊 Terugblik [Maand] 2026

**In cijfers** (transparantie):
- Placements: [X] automation/engineering rollen
- Gemiddelde time-to-fill: [X] dagen
- Sectoren: [Top 3 sectoren waar we plaatsten]
- Regio: [Waar waren de meeste placements]

**Wat opviel**:

**1. [Observatie 1]** (concrete trend)
Voorbeeld: "5 van de 8 placements hadden counter-offer. Dat is 62%. Jaar geleden was dit 30%."
→ Wat betekent dit: [Korte analyse]

**2. [Observatie 2]** (market insight)
Voorbeeld: "Siemens TIA Portal kandidaten vragen nu €8k meer dan vorig jaar. Markt accepteert dit."
→ Impact: [Voor hiring managers]

**3. [Observatie 3]** (process learning)
Voorbeeld: "Snelste placement: 12 dagen. Langste: 67 dagen. Verschil? Feedback speed."
→ Lesson: [Wat je hiervan leert]

---

## 📰 Artikel Dat Me Opviel

**Titel**: [Artikel van deze maand - van top 3 selector]

**Bron**: [Publicatie, datum, link]

**Wat het zegt**:
[2-3 zinnen samenvatting van het artikel]

**Waarom interessant**:
[Waarom vond je dit relevant? Wat triggerde je aandacht?]

---

## 💭 Mijn Take (Persoonlijke Opinion)

[DIT IS DE KERN - 400-600 woorden jouw perspectief]

**Structuur**:

**Agree/Disagree**:
"Het artikel heeft gelijk over [X]. Maar..."

**Vanuit De Praktijk**:
"Wat ik de afgelopen maand zag in mijn deals:"
- [Concreet voorbeeld 1 - story]
- [Concreet voorbeeld 2 - data]

**De Nuance Die Ontbreekt**:
"Wat het artikel niet zegt: [insider perspective]"

**Contrarian Element** (optioneel):
"Iedereen denkt [X]. Ik denk [Y]. Waarom..."

**Concrete Voorbeeld**:
[Vertel een korte story van een placement, deal, of kandidaat die dit illustreert]
(Geanonimiseerd: "Een client in Gelderland..." niet namen)

**Conclusie**:
"Dus ja, [artikel punt]. Maar in technical recruitment betekent dat [jouw twist]."

---

## 🎯 Volgende Maand

**Focus**:
[Waar ga je focus op leggen volgende maand?]
Voorbeeld: "Februari: Ik ga 20 Oil & Gas bedrijven bellen. Markt is hot, ze weten het nog niet."

**Experiment**:
[Wat ga je testen/proberen?]
Voorbeeld: "Testing: Skill assessments vóór interviews. Hypothesis: bespaart 40% tijd."

**Uitnodiging**:
[Soft CTA]
"Als je technical recruitment uitdagingen hebt (PLC, Automation, SCADA): reply dit bericht. Ik help graag."

---

## 📚 Bronnen

1. [Hoofdartikel bron + link]
2. Recruitin internal data [maand] 2026 ([X] placements)
3. [Andere bronnen gebruikt]

---

**Tot volgende maand!**

Wouter Arts
Technical Recruitment Specialist
📧 wouter@recruitin.nl | 🌐 recruitin.nl
```

---

## 📅 PUBLICATIE SCHEMA

### Laatste Vrijdag Van Maand

**Timing**: 17:00 (LinkedIn newsletter optimal)

**Workflow**:
1. **17:00-17:20** - Data verzamelen:
   - Pipedrive: Hoeveel placements deze maand?
   - KPI dashboard: Metrics (time-to-fill, sectors, regio)
   - Top articles selector: Beste artikel van maand

2. **17:20-17:40** - Content schrijven:
   - Terugblik (cijfers + 3 observaties)
   - Artikel samenvatten
   - Jouw take schrijven (persoonlijk, insider)

3. **17:40-17:50** - Visual (optioneel):
   - Featured image (stats graphic of artikel visual)
   - Size: 1200x628px

4. **17:50-18:00** - Publiceren:
   - LinkedIn → Schrijf artikel → Publish as newsletter
   - Notify subscribers (automatic)

**Total**: 60 minuten (1x per maand)

---

## 🎨 VISUAL VOOR NEWSLETTER

### Featured Image (Optioneel maar Recommended)

**Type**: Monthly stats graphic

**Design Brief**:
```
Header: "Technical Recruitment Insider - [Maand] 2026"

Stats boxes (3):
┌─────────────────┬─────────────────┬─────────────────┐
│  [X] PLACEMENTS │  [X] DAGEN      │  [X]% RETENTION │
│  Deze maand     │  Avg time-fill  │  First-year     │
└─────────────────┴─────────────────┴─────────────────┘

Subtitle: "Insights van de Technical Recruitment frontlinie"
Footer: "Door Wouter Arts | Recruitin B.V."

Colors: Recruitin orange + blue
Size: 1200x628px
Style: Clean, data-focused, professional
```

**Generatie**: Canva (template "Newsletter Header", 8 min)

---

## 📊 DATA BRONNEN (Maandelijks)

### Van Pipedrive
```
# In Claude Code:
Generate maandelijkse newsletter data:

Source: Pipedrive deals (afgelopen 30 dagen)

Extract:
- Total placements deze maand
- Avg time-to-fill
- Sector breakdown (top 3)
- Regio spread
- Salary range (min, max, avg)

Format: Stats summary voor newsletter intro
```

### Van Top Articles Selector
```bash
# Best article van maand
cd ~/recruitin-mcp-servers
node select-top-articles.js --top3

# Gebruik #1 artikel voor newsletter deep-dive
```

---

## 💡 CONTENT ANGLES PER MAAND

### Januari: Year-End Reflections
- "2025 terugblik: 156 placements, wat we leerden"
- Artikel: HR trends 2026
- Take: Technical recruitment speelt volgens andere regels

### Februari: Market Conditions
- "Februari cijfers: [data]"
- Artikel: Arbeidsmarkt rapport (UWV/CBS)
- Take: Wat cijfers niet vertellen (insider perspective)

### Maart: Practical Tips
- "Q1 bijna af, [X] placements"
- Artikel: Recruitment tech/automation artikel
- Take: Hoe wij AI gebruiken (practical, transparent)

### April: Salary Trends
- "Q1 salary data: [trends]"
- Artikel: Salaris benchmark artikel
- Take: Onderhandeling tips (voor kandidaten + hiring managers)

**Pattern**: Data (terugblik) + Extern artikel + Jouw insider take

---

## 🎯 LINKEDIN NEWSLETTER SETUP

### Eenmalige Setup (5 minuten)

**Stap 1: Create Newsletter**
1. LinkedIn profiel → Articles → Create newsletter
2. Naam: "Technical Recruitment Insider"
3. Beschrijving: "Maandelijkse insights over automation, engineering & manufacturing recruitment in Nederland. Data, trends & no-bullshit perspectives van de frontlinie."
4. Frequentie: Monthly
5. Publish

**Stap 2: First Issue**
- Gebruik template hierboven
- Invite your connections (LinkedIn asks)
- Publish

**Stap 3: Promote**
1. Post op LinkedIn feed: "Nieuwe newsletter gelanceerd!"
2. Pin to profile (featured section)
3. Mention in email signature

---

## 📈 GROWTH STRATEGY

### Target
- **Maand 1**: 50 subscribers (jouw connecties)
- **Maand 3**: 200 subscribers (organic growth)
- **Maand 6**: 500 subscribers (thought leader status)
- **Maand 12**: 1,000+ subscribers (authority)

### Promotion
**Elke regular post**: Mention newsletter in comment
```
"Dieper duiken in dit topic? Subscribe mijn maandelijkse newsletter 'Technical Recruitment Insider' [link]"
```

**Signature**: Email signature
```
📧 Wouter Arts
Technical Recruitment | Recruitin B.V.
📰 Monthly: linkedin.com/newsletters/technical-recruitment-insider
```

---

## 💰 ROI (Newsletter)

### Benefits
**Authority Building**:
- Newsletter = expert status (LinkedIn badges, credibility)
- Subscribers = warm audience (engagement 3x hoger)
- Long-form = thought leadership (vs short posts)

**Lead Generation**:
- Subscribers opt-in (permission marketing)
- Direct CTA mogelijk (not spammy in newsletter)
- Conversion: 2-3% subscribers → leads (10 leads at 500 subscribers)

**SEO Bonus**:
- LinkedIn articles = indexed by Google
- Backlinks to recruitin.nl
- Brand searches increase

### Time Investment
- **Monthly**: 60 minuten (1x per maand)
- **Value**: Authority positioning = €500-1,000/maand long-term

**ROI**: Onmeetbaar (authority building) maar high-value

---

## ✅ EERSTE NEWSLETTER (Template Ingevuld)

### Example: Januari 2026

```markdown
# Technical Recruitment Insider - Januari 2026

**Door Wouter Arts | Recruitin B.V.**

---

## 👋 Nieuw Jaar, Nieuwe Inzichten

Januari = tijd voor voornemens en trendlijsten.

Ik las 12 "HR trends 2026" artikelen deze maand. Geen enkele had het over PLC programmeurs, automation engineers, of waarom technical recruitment compleet andere regels heeft.

Deze newsletter: wél.

Deze maand:
→ Terugblik: Wat januari ons leerde (data!)
→ Artikel: "HR-trends 2026" (en waarom het niet klopt voor ons)
→ Mijn take: Waarom technical recruitment anders is

---

## 📊 Terugblik Januari 2026

**In cijfers**:
- Placements: 8 (Automation: 5, Instrumentation: 2, Electrical: 1)
- Gemiddelde time-to-fill: 24 dagen (dit was snel!)
- Sectoren: O&G (4), Manufacturing (3), Renewable (1)
- Regio: Gelderland (5), Overijssel (2), Brabant (1)

**Wat opviel**:

**1. Speed Wins (Echt Waar)**
Snelste placement: 12 dagen (Automation Engineer, Siemens, Arnhem).
Why so fast? Client feedback binnen 4 uur. Elke keer.

Langste: 45 dagen (zelfde role, andere client).
Why so slow? "We moeten intern afstemmen" = 2 weken per ronde.

Verschil: 33 dagen = kandidaat had 2 andere offers in die tijd.

Lesson: Snelheid > perfectie in decision making.

**2. Counter-Offers Zijn De Nieuwe Normaal**
5 van 8 kandidaten kreeg counter-offer van current employer.
Dat is 62%. Vorig jaar was dit 30%.

Betekent: Markt is krapper, werkgevers panicked.

Onze aanpak: Proactief voorbereiden.
"Je krijgt waarschijnlijk counter-offer. Laten we scenario's doorlopen."
Result: 7 van 8 accepteerden onze offer (88% vs 62% wanneer we niet voorbereiden).

**3. Siemens > Rockwell (In Oost-Nederland)**
Tech stack split deze maand: 6 Siemens, 2 Rockwell.
Vorig jaar was dit 50/50.

Waarom shift? Nieuwe projecten bij O&G clients zijn Siemens-based.
Impact: Rockwell specialisten harder te plaatsen (minder vraag).

---

## 📰 Artikel Dat Me Opviel

**"HR-trends 2026: vier belangrijke rollen voor HR-managers"**

**Bron**: Salaris Vanmorgen (2 januari 2026)
Link: https://www.salarisvanmorgen.nl/...

**Wat het zegt**:
HR managers moeten in 2026 focus op: data analytics, employee experience, change management, en strategic partnering.

Mooie woorden. Allemaal waar voor corporate HR.

**Maar voor technical recruitment?** Compleet andere priorities.

---

## 💭 Mijn Take: "Culture Fit" Moet Dood

Het artikel noemt "culture fit" 4x.

Ik haat die term.

**Waarom?**

Afgelopen 6 maanden analyseerde ik 47 kandidaat afwijzingen (onze deals die niet doorgingen).

**Reden #1**: "Culture fit" (23 van 47 = 49%)

**Vraag**: "Wat bedoel je met culture fit?"

**Antwoorden**:
- "Gevoel" (9x)
- "Past niet in team" - geen verdere uitleg (8x)
- "Te junior" - voor een SENIOR role (4x)
- "Overqualified" - aka te duur (2x)

**Echte reden** (als je doorvraagt):
Ze hadden geen duidelijke requirements. "Culture fit" is een excuus.

**Data proof**:
Van die 23 "culture fit" afwijzingen:
- 18 hadden GEEN written job requirements (alleen vacaturetekst)
- 21 hadden GEEN interview scorecard (subjectief scoren)
- 15 hadden GEEN salary budget approved (gokken)

**Result**: €180k in gemiste placements. Omdat "gevoel" zei nee.

**Wat WÉL werkt: "Culture Add"**

Stop met vragen: "Past hij in ons team?"
Start met vragen: "Wat brengt hij dat we MISSEN?"

**Voorbeeld uit januari**:
Client had team van 6 automation engineers. Allen Siemens.
Kandidaat: Rockwell expert, 0 Siemens ervaring.

"Culture fit" logic: Afwijzen (wij doen Siemens, hij niet).
"Culture add" logic: Aannemen (brengt Rockwell kennis, leert Siemens in 3 maanden, diversity in tech stack).

Client koos culture add.

**Result** (na 2 maanden):
Beste hire van 2025 (volgens client feedback). Solved 2 Rockwell integrations die niemand anders kon. Traint nu rest van team.

**Mijn stelling**:
"Culture fit" zonder meetbare criteria = discrimination risk + gemiste talent.
"Culture add" met duidelijke gap analysis = betere hires + diverse teams.

**Vraag voor jou**:
Laatste keer dat je iemand aannam die NIET paste? Die helemaal anders was?
Ik wed: een van je beste hires.

---

## 🎯 Volgende Maand (Februari)

**Mijn focus**:
20 Oil & Gas bedrijven bellen. Markt is hot (offshore projects starting Q1). Ze weten het nog niet, maar ze gaan automation talent nodig hebben.

Proactive > reactive in recruitment.

**Experiment**:
Skill assessments vóór interviews. Hypothesis: bespaart 40% tijd, betere quality.
Update je volgende maand!

**Als je technical recruitment uitdaging hebt**:
Automation, PLC, SCADA, Instrumentation roles?
50-800 FTE bedrijf in Oost-Nederland?

Reply dit bericht. Of email: wouter@recruitin.nl

---

**Tot volgende maand!** 🚀

Wouter

P.S. - Deze newsletter blijft advertisement-free. Alleen insights, data, en eerlijke takes.

---

*Technical Recruitment Insider | Maandelijks | By Wouter Arts*
*Subscribe: [LinkedIn newsletter link]*
```

---

## 📊 CONTENT GENERATION COMMAND

### Maandelijkse Newsletter (Laatste Vrijdag)

**Claude Code Command**:
```
Genereer LinkedIn newsletter voor [maand] 2026:

Format: Wouter's "Technical Recruitment Insider"

Structuur:
1. INTRO (2-3 zinnen - wat speelde deze maand)

2. TERUGBLIK (data + 3 observaties):
   Source: Pipedrive placements afgelopen 30 dagen
   - Total placements: [X]
   - Avg time-to-fill: [X] dagen
   - Sectors: [breakdown]
   - 3 concrete observaties (trends, learnings, insights)

3. ARTIKEL DAT OPVIEL:
   Source: Top 3 selector (beste artikel van maand)
   - Artikel titel + bron
   - Korte samenvatting (3 zinnen)
   - Waarom interessant

4. MIJN TAKE (400-600 woorden):
   - Agree/disagree met artikel
   - Vanuit praktijk (concrete voorbeelden deze maand)
   - Nuance die ontbreekt
   - Contrarian element (optioneel)
   - Story/voorbeeld ter illustratie
   - Conclusie + twist

5. VOLGENDE MAAND:
   - Focus gebied
   - Experiment
   - Uitnodiging (soft CTA)

Tone: Wouter's style (direct, data-driven, no-bullshit, persoonlijk)
Length: 1000-1200 woorden
Bronvermelding: Volledig onderaan

Include: Personal stories, concrete data, insider perspectives
```

---

## 🎨 NEWSLETTER VISUAL

**Featured Image**: Monthly stats header

**Design** (Canva, 10 min):
```
Template: Newsletter header (1200x628)

Content:
- Header: "Technical Recruitment Insider"
- Subheader: "[Maand] 2026"
- Stats: [X] placements | [X]d avg | [X]% retention
- Author: "Door Wouter Arts"
- Brand: Recruitin logo

Colors: Recruitin orange/blue gradient
Style: Professional, clean, data-focused
```

---

## 📅 JAARKALENDER

| Maand | Publicatie Datum | Focus Thema | Status |
|-------|------------------|-------------|--------|
| Jan 2026 | 31 jan, 17:00 | HR trends vs Technical reality | ✅ Template ready |
| Feb 2026 | 28 feb, 17:00 | Market conditions & salary trends | 🔜 |
| Mrt 2026 | 28 mrt, 17:00 | Q1 review & AI in recruitment | 🔜 |
| Apr 2026 | 25 apr, 17:00 | Skill shortage & sourcing strategies | 🔜 |
| Mei 2026 | 30 mei, 17:00 | Client success stories | 🔜 |
| Jun 2026 | 27 jun, 17:00 | H1 review & H2 forecast | 🔜 |

**Repeat pattern**: Data terugblik + Trending artikel + Persoonlijke take

---

## 💡 TIPS VOOR SUCCESS

### Consistentie
- ✅ Zelfde dag elke maand (laatste vrijdag 17:00)
- ✅ Zelfde format (readers weten wat te verwachten)
- ✅ Zelfde lengte (~1,200 woorden)

### Authenticiteit
- ✅ Echte cijfers (jouw placements)
- ✅ Echte stories (geanonimiseerd)
- ✅ Echte mening (geen safe corporate speak)

### Value First
- ✅ Insights delen (niet verkopen)
- ✅ Data transparent (build trust)
- ✅ CTA soft (reply/email, not "koop nu")

### Engagement
- ✅ Vraag stellen aan einde
- ✅ Respond to comments (within 24h)
- ✅ Feature subscriber questions (volgende maand)

---

## 🚀 LAUNCH CHECKLIST

### Eerste Newsletter (Januari 2026)

- [ ] LinkedIn newsletter aanmaken (naam, beschrijving)
- [ ] Data verzamelen (Pipedrive stats januari)
- [ ] Artikel selecteren (top 3 selector)
- [ ] Content schrijven (template gebruiken)
- [ ] Visual maken (stats header, 10 min)
- [ ] Review (grammar, tone, data accuracy)
- [ ] Publish (vrijdag 31 jan, 17:00)
- [ ] Promote (LinkedIn feed post)
- [ ] Engage (respond to comments)

---

## 📊 SUCCESS METRICS

### Newsletter KPIs

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Subscribers | 50 | 200 | 500 |
| Open rate | 60% | 55% | 50% |
| Click rate | 8% | 10% | 12% |
| Replies | 5 | 15 | 30 |
| Leads generated | 1-2 | 3-5 | 8-12 |

---

## ✅ KLAAR VOOR EERSTE ISSUE

**Template**: Ready ✅
**Data source**: Pipedrive ✅
**Article selector**: Ready (select-top-articles.js) ✅
**Tone guide**: docs/linkedin-content-authority.md ✅

**Next**: Laatste vrijdag januari (31 jan) → Publish eerste newsletter! 🚀

---

*LinkedIn Newsletter Template | Monthly | Wouter Arts Personal Profile*
*Focus: Technical Recruitment Insights | Data-Driven | No-Bullshit*
