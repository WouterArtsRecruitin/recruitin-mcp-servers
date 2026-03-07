# 20 — Vacaturekanon

## Doel
Geautomatiseerd publiceren van vacatures naar meerdere jobboards, socials en eigen kanalen vanuit één workflow.

## Wanneer activeren
Triggers: `vacature publiceren`, `vacaturekanon`, `jobboard`, `vacature uitzetten`, `multiposting`, `vacature distribueren`, `Indeed`, `vacature automatisch`

## Repo
- **Primair:** `WouterArtsRecruitin/vacaturekanon`

## Concept
Vacaturekanon = één vacature input → automatisch uitzetten op:
- Indeed NL
- LinkedIn Jobs
- Eigen website (kandidatentekort.nl / recruitin.nl)
- Notion database
- Pipedrive deal aanmaken

## Workflow
```
Vacature brief (titel, functie, regio, salaris, eisen)
  ↓
Claude genereert geoptimaliseerde vacaturetekst (09-recruitment-nl)
  ↓
Zapier distribueert naar kanalen
  ↓
Pipedrive deal aanmaken met vacaturedata
  ↓
Tracking via UTM parameters per kanaal
```

## Input velden per vacature
| Veld | Voorbeeld |
|------|-----------|
| Functietitel | Senior Java Developer |
| Regio | Arnhem, Gelderland |
| Sector | Manufacturing / Automation |
| Salaris | €75-90k |
| Contractvorm | Vast / Interim |
| Opdrachtgever | Anoniem of named |
| Deadline | 2 weken |

## Combinaties
- Met `09-recruitment-nl`: vacaturetekst genereren
- Met `12-pipedrive-crm`: deal aanmaken per vacature
- Met `04-lead-generation`: inbound leads tracken
- Met `08-multichannel-ads`: vacature als paid campagne
- Met `18-intelligence-hub`: marktconforme salarischeck

## NL Jobboard prioriteiten
1. LinkedIn Jobs (hoogste kwaliteit kandidaten tech)
2. Indeed NL (volume)
3. Technisch Werken / Werkenbijdetechniek (specialistisch)
4. Eigen site (SEO + directe leads)
