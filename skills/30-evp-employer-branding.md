# 30 — EVP & Employer Branding

## Doel
Employee Value Proposition ontwikkelen, employer branding landingspagina's bouwen en klant recruitment sites opzetten voor technische bedrijven in Gelderland/Overijssel/Noord-Brabant.

## Wanneer activeren
Triggers: `EVP`, `employer branding`, `werkgeversmerk`, `employee value proposition`, `werkgever aantrekkelijk`, `employer branding scan`, `klantsite`, `recruitment marketing`, `why work here`, `arbeidsmarktcommunicatie`

## Repos
- **EVP scan:** `WouterArtsRecruitin/evp-scan-nl`
- **EVP landing:** `WouterArtsRecruitin/evp-landing-recruitin`
- **Whitepaper:** `WouterArtsRecruitin/Whitepaper-EVP`
- **Klant voorbeeld:** `WouterArtsRecruitin/aebi-recruitment-site`

## EVP Framework (5 pijlers)

### 1. Salaris & Arbeidsvoorwaarden
- Marktconform (check via 18-intelligence-hub)
- Secundaire arbeidsvoorwaarden: auto, laptop, training
- Flexibiliteit: hybride, thuiswerken, uren

### 2. Werkomgeving & Cultuur
- Teamdynamiek, leiderschapsstijl
- Kantooromgeving, faciliteiten
- Sociale activiteiten, cohesie

### 3. Loopbaanontwikkeling
- Doorgroeimogelijkheden
- Training & certificering budget
- Mentoring & coaching

### 4. Purpose & Impact
- Maatschappelijke relevantie (energie, productie, infra)
- Projecten die ertoe doen
- Technische uitdaging

### 5. Work-Life Balance
- Werkdruk realistisch
- Verlof regelingen
- Ouderschapsverlof, mantelzorg

## EVP Scan proces
```
Intake gesprek HR (30 min)
  ↓
Medewerkersenquête (15 vragen, Typeform)
  ↓
Benchmark vs. sector (data uit intelligence-hub)
  ↓
EVP Score rapport (PDF)
  ↓
Aanbevelingen + implementatieplan
  ↓
Employer branding content (copy + design brief)
```

## EVP Landingspagina structuur
```
Hero: "Waarom werken bij [Bedrijf]?"
  ↓
5 EVP pijlers (visueel)
  ↓
Medewerkersverhalen (quotes/video)
  ↓
Open vacatures (live feed)
  ↓
Solliciteer CTA → Typeform → Pipedrive
```

## Klantsite template (aebi-voorbeeld)
- Hosting: Netlify of Vercel
- Stack: HTML/CSS of Next.js (afhankelijk van complexiteit)
- Tracking: GA4 + Meta Pixel
- Integratie: Vacaturekanon (skill 20) voor live vacatures

## NL Benchmark data (per sector)
| Sector | Top EVP driver | Zwakste punt gemiddeld |
|--------|---------------|----------------------|
| Manufacturing | Technische uitdaging | Loopbaanontwikkeling |
| Oil & Gas | Salaris | Work-life balance |
| Automation | Innovatie | Flexibiliteit |
| Renewable | Purpose/impact | Salaris vs. tech |
| Constructie | Teamcultuur | Thuiswerken |

## Combinaties
- Met `09-recruitment-nl`: EVP → vacaturetekst tone of voice
- Met `marketing/copywriting`: EVP copy schrijven
- Met `06-website-copy`: employer branding landingspagina
- Met `19-content-intelligence`: EVP → LinkedIn content kalender
- Met `28-recruitmentapk-assessment`: EVP als onderdeel van APK score
