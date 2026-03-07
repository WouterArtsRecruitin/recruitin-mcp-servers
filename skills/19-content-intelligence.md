# 19 — Content Intelligence System

## Doel
Geautomatiseerd recruitment content genereren: LinkedIn posts, nieuwsbrieven, vacatureteksten, sector-updates op basis van marktdata en ICP-inzichten.

## Wanneer activeren
Triggers: `content genereren`, `content kalender`, `LinkedIn content`, `nieuwsbrief`, `6-week kalender`, `content systeem`, `OGSM`, `content pipeline`, `weekly content`, `automated content`

## Repos
- **Primair:** `WouterArtsRecruitin/recruitin-content-intelligence-system`
- **CLAUDE.md:** Volledige bedrijfsbriefing voor alle content agents

## Bedrijfsidentiteit (uit CLAUDE.md)
- **Positionering:** Enige RPO in NL 100% gericht op techniek
- **Tone of voice:** Vakkundig, direct, resultaatgericht — geen bullshit
- **Wouter's rol:** "Recruitment Architect" — niet gewoon recruiter
- **USP:** AI + data + recruitment = voorsprong op de arbeidsmarkt

## Content pijlers (LinkedIn Authority Blueprint v2.0)
1. **Marktinzichten** — Vacature trends, salaris data, krapte analyses
2. **Klantcases** — Concrete resultaten bij Oil & Gas / Manufacturing klanten
3. **Recruitment tips** — Praktische adviezen voor HR directeuren
4. **Arbeidsmarkt nieuws** — Duiding van sectorontwikkelingen
5. **Recruitin diensten** — RPO, interim, W&S — zonder hard sell

## 6-Week content kalender structuur
| Week | Thema | Kanalen |
|------|-------|---------|
| 1 | Marktdata & krapte | LinkedIn + nieuwsbrief |
| 2 | Klantcase / resultaat | LinkedIn + website |
| 3 | Recruitment tip | LinkedIn |
| 4 | Sector nieuws duiding | LinkedIn + nieuwsbrief |
| 5 | Dienst spotlight | LinkedIn + email |
| 6 | Thought leadership | LinkedIn |

## Content workflows
```
Market Trends (intelligence-hub)
  ↓
Content brief genereren (Claude)
  ↓
Draft LinkedIn post / artikel / email
  ↓
Review → Notion content database
  ↓
Plannen → publiceren
```

## Geïntegreerde tools
- **Notion:** Content database, review workflow, planning
- **Google Sheets:** Performance tracking (impressies, clicks, leads)
- **Pipedrive:** Content → lead koppeling
- **LinkedIn:** Primair publicatiekanaal

## Output types
- LinkedIn posts (tekst + carousel concept)
- Nieuwsbrief (HTML + tekst)
- Vacatureteksten (NL geoptimaliseerd)
- Sector rapporten (PDF via report-templates repo)
- Weekly news digest (recruitment trends)

## Combinaties
- Met `18-intelligence-hub`: marktdata → content brief
- Met `09-recruitment-nl`: vacaturedata → content kalender
- Met `07-content-seo`: SEO-optimalisatie van artikelen
- Met `22-linkedin-optimizer`: posts optimaliseren voor bereik
- Met `08-multichannel-ads`: content → paid amplificatie
