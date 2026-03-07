# 28 — RecruitmentAPK & Assessment

## Doel
Kandidaat assessment tools, RecruitmentAPK scan, FlowMaster Pro assessments en A/B testen van conversiepagina's voor recruitment doeleinden.

## Wanneer activeren
Triggers: `RecruitmentAPK`, `assessment`, `APK scan`, `kandidaat beoordelen`, `FlowMaster`, `recruitment scan`, `A/B test`, `assessment tool`, `kandidaat score`, `quickscan`

## Repos
- **Primair:** `WouterArtsRecruitin/Recruitment-APK`
- **Website:** `WouterArtsRecruitin/recruitmentapk-website`
- **Assessment:** `WouterArtsRecruitin/flowmaster-assessment` (Typeform-based)
- **Live:** `WouterArtsRecruitin/flowmaster-live` (productiesite)
- **A/B test:** `WouterArtsRecruitin/recruitmentapk-ab-test` (Netlify Edge Functions)

## RecruitmentAPK concept
De "APK" voor je recruitment proces — gestructureerde scan van:
1. **Werkgeversmerk** — Hoe aantrekkelijk ben je als werkgever?
2. **Wervingsproces** — Doorlooptijd, kandidaatervaring, conversie
3. **Arbeidsmarktpositie** — Salaris vs. markt, regio bereik
4. **Tech & tools** — ATS, LinkedIn, jobboards
5. **Resultaten** — Time-to-fill, cost-per-hire, kwaliteit hires

## FlowMaster Pro V4
- Platform: Typeform embed + Netlify hosting
- Flow: 15-20 vragen → score → aanbevelingen → Pipedrive deal
- Output: PDF rapport + email digest
- Integratie: Zapier → Pipedrive → Resend email

## A/B test setup (recruitmentapk-ab-test)
```
Netlify Edge Functions → Split traffic 50/50
Variant A: Directe scan CTA
Variant B: Gratis rapport CTA
Metrics: Conversieratio, cost-per-lead
```

## Assessment scoring rubric
| Categorie | Gewicht | Max score |
|-----------|---------|-----------|
| Werkgeversmerk | 25% | 25 |
| Wervingsproces | 25% | 25 |
| Arbeidsmarktpositie | 20% | 20 |
| Tech & tools | 15% | 15 |
| Resultaten | 15% | 15 |
| **Totaal** | **100%** | **100** |

**Score interpretatie:**
- 80-100: Sterk — optimaliseer voor schaalbaarheid
- 60-79: Goed — 2-3 quick wins mogelijk
- 40-59: Gemiddeld — structurele verbetering nodig
- <40: Kritisch — RPO aanbevolen

## Deployment
- Hosting: Netlify (recruitmentapk.nl)
- Meta Pixel: `1735907367288442` (tracking via `recruitmentapk-meta-pixel` repo)
- Analytics: GA4 + Facebook CAPI

## Combinaties
- Met `12-pipedrive-crm`: assessment → deal aanmaken Stage 1
- Met `29-conversion-tracking`: pixel firing per assessment stap
- Met `09-recruitment-nl`: vacature context voor beoordeling
- Met `35-rapport-sales`: rapport genereren na assessment
- Met `25-zapier-templates`: form submit → CRM flow
