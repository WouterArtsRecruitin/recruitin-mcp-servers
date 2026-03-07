# 27 — Email Templates & Outreach Frameworks

## Doel
Bewezen email templates voor recruitment outreach, kandidaatbenadering, klantacquisitie en nurture sequences — volledig afgestemd op NL tech markt.

## Wanneer activeren
Triggers: `email template`, `outreach email`, `email schrijven`, `kandidaat benaderen`, `klant email`, `follow-up email`, `email sequence`, `nurture mail`, `email campagne`, `resend template`

## Repos
- **Primair:** `WouterArtsRecruitin/elite-email-composer-mcp` (MCP server voor email)
- **Aanvullend:** `WouterArtsRecruitin/recruitin-automation`
- **Technisch:** Resend MCP server voor verzending

## Email categorieën

### 1. Kandidaat outreach (InMail / email)
```
Onderwerp: [Naam], interessante kans bij [bedrijf] in [regio]

Hoi [Naam],

Ik kom je profiel tegen en zie dat je als [functie] werkt bij [huidig bedrijf].

Ik heb een interessante positie voor een [doelfunctie] bij een [sector] bedrijf 
in [regio] — [1 zin USP van de rol].

Salaris: €[X]-[Y]k | [contract type] | [locatie]

Zin om even te sparren? Dan stuur ik je meer info.

Met vriendelijke groet,
Wouter Arts | Recruitin B.V.
```

### 2. Klantacquisitie cold email
```
Onderwerp: [Bedrijfsnaam] — [X] open technische vacatures, wij kunnen helpen

Hoi [Naam],

Ik zie dat [bedrijfsnaam] momenteel zoekt naar [functie(s)] — dit is precies 
ons specialisme: technisch recruitment voor [sector] bedrijven in [regio].

Wij vullen gemiddeld in 8 weken, no-cure-no-pay optie beschikbaar.

Zou een kort gesprek van 15 min waardevol zijn?

Wouter Arts | Recruitin B.V. | recruitin.nl
```

### 3. Follow-up sequence (3-staps)
```
Mail 1 (dag 0): Introductie + propositie
Mail 2 (dag 4): Concrete case study / resultaat
Mail 3 (dag 9): Laatste poging + directe vraag
```

### 4. Kandidatentekort.nl rapport email
```
Onderwerp: Uw gratis vacature-analyse is klaar

Hoi [Naam],

Bijgaand uw persoonlijke arbeidsmarktanalyse voor [functie] in [regio].

Key findings:
- [Finding 1]
- [Finding 2]
- [Finding 3]

Wilt u bespreken wat dit betekent voor uw wervingsstrategie?
```

## Resend technische setup
```javascript
// Via resend-mcp-server
await resend.emails.send({
  from: 'wouter@recruitin.nl',
  to: kandidaat_email,
  subject: onderwerp,
  html: template_html,
  tags: [{ name: 'campaign', value: 'kandidaat-outreach' }]
})
```

## Deliverability standaarden
- SPF + DKIM geconfigureerd op recruitin.nl
- Verzendvolume: max 200/dag cold, onbeperkt warm
- Open rate target: >35%
- Reply rate target: >8% cold, >25% warm

## Combinaties
- Met `05-email-marketing`: sequenties bouwen
- Met `marketing/cold-email`: copy optimaliseren
- Met `09-recruitment-nl`: kandidaat templates
- Met `12-pipedrive-crm`: email → deal koppelen
- Met `25-zapier-templates`: geautomatiseerd verzenden
