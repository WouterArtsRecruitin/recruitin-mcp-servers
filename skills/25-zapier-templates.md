# 25 — Zapier Templates

## Doel
Recruitin-specifieke Zapier workflows, templates en automation patronen voor lead gen, CRM sync, email triggers en data verwerking.

## Wanneer activeren
Triggers: `zapier workflow`, `zapier template`, `zap bouwen`, `automation flow`, `webhook trigger`, `zapier stap`, `zapier integratie`, `zap maken`, `automation bouwen`, `trigger actie`

## Repos
- **Primair:** `WouterArtsRecruitin/recruitin-automation` (custom MCP)
- **Aanvullend:** `WouterArtsRecruitin/recruitin-mcp-servers/zapier-mcp-bridge.py`
- **ICP scoring:** `icp_scoring_zapier.py`

## Core Zapier workflows Recruitin

### 1. Lead capture flow
```
Typeform/Jotform submit
  → Zapier
  → Pipedrive: Person aanmaken
  → Pipedrive: Deal aanmaken (Stage 1)
  → Resend: Welcome email
  → Notion: Lead loggen
```

### 2. Kandidatentekort.nl analyse flow
```
Formulier submit (vacature input)
  → Zapier
  → Claude AI step (analyse genereren)
  → Resend: Rapport emailen
  → Pipedrive: Deal aanmaken
  → Google Sheets: Lead loggen
```

### 3. Apollo → Pipedrive sync
```
Apollo new contact
  → Zapier
  → ICP score berekenen (Python via Zapier Code)
  → Als score >70: Pipedrive Person aanmaken
  → Gmail: Outreach email plannen
```

### 4. JobDigger pipeline trigger
```
Nieuwe vacature in JobDigger
  → Zapier
  → Pipedrive: Deal aanmaken Stage 2
  → Slack: Notificatie Wouter
  → Notion: Vacature loggen
```

### 5. Content publicatie flow
```
Notion content approved
  → Zapier
  → LinkedIn post schedulen
  → Google Sheets: Content tracker updaten
```

## Zapier AI step templates

### Vacaturetekst genereren
```
Model: Claude 3.5 Sonnet
Prompt: "Schrijf een NL vacaturetekst voor {{job_title}} bij {{company}} 
in {{location}}. Salaris: {{salary}}. Tone: professioneel maar menselijk.
Output: titel, intro (2 zinnen), taken (5 bullets), eisen (5 bullets), aanbod (3 bullets)"
```

### ICP scoring
```
Model: Claude 3.5 Sonnet  
Prompt: "Score dit bedrijf als Recruitin ICP (0-100):
Naam: {{company_name}}, Sector: {{industry}}, 
Medewerkers: {{employees}}, Regio: {{location}}
Criteria: tech sector, 50-800 FTE, Gelderland/Overijssel/Noord-Brabant
Output alleen JSON: {score: number, reden: string}"
```

## Combinaties
- Met `03-automation`: MCP + Zapier architectuur
- Met `04-lead-generation`: lead capture flows
- Met `12-pipedrive-crm`: CRM sync workflows
- Met `05-email-marketing`: email trigger sequences
- Met `14-apollo-enrichment`: Apollo → Pipedrive sync
