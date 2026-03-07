# 36 — Kandidatentekort Platform

## Doel
Kern product van Recruitin: vacature analyse platform op kandidatentekort.nl. V6.0 enhanced productie met AI analyse, automation flows en Jotform API backend.

## Wanneer activeren
Triggers: kandidatentekort, vacature analyse, kandidatentekort.nl, platform V6, analyse automation, Jotform API, vacatureanalyse tool, kandidatentekort automation, vacature-analyse platform

## Repos
- Productie V6: WouterArtsRecruitin/kandidatentekort-v6 (Enhanced Production)
- Automation: WouterArtsRecruitin/kandidatentekort-automation
- Full platform: WouterArtsRecruitin/Kandidatentekortfull
- API: WouterArtsRecruitin/recruitin-api (Jotform integratie)
- Vacature analyse: WouterArtsRecruitin/vacature-analyse

## Platform flow
Bezoeker naar kandidatentekort.nl naar Vacatureformulier invullen naar Zapier trigger naar Claude AI analyse naar Rapport genereren naar Email delivery naar Pipedrive deal naar Followup sequence

## V6.0 Enhanced features
- Verbeterde vacature intake met meer velden
- Snellere Claude AI analyse (minder dan 30 seconden)
- Gepersonaliseerd rapport per sector
- Mobile-first design
- GA4 plus Facebook CAPI dual tracking

## Automation flows

Flow A: Gratis rapport (lead gen)
Typeform submit naar Zapier naar Claude analyse naar Resend rapport email naar Pipedrive Stage 1 deal naar 3-staps nurture sequence

Flow B: Premium rapport (€59)
Stripe betaald naar Webhook naar Diepere Claude analyse naar PDF via pdfmonkey naar Resend delivery naar Pipedrive Stage 2 deal

Flow C: Direct contact (warm lead)
Rapport gelezen plus teruggebeld naar Pipedrive Stage 3 naar Intakegesprek plannen

## Technische stack V6
- Frontend: Next.js 15 App Router of enhanced HTML
- Hosting: Netlify of Vercel
- Analytics: GA4 plus Facebook CAPI
- Forms: Typeform UX of Jotform backend
- Email: Resend transactioneel
- CRM: Pipedrive alle stages
- PDF: pdfmonkey

## Bekende issues
- Automation soms stuck in Stage 2 (519k pipeline waarde)
- Jotform webhook timing inconsistent
- Resend delivery rate te verifiëren

## KPIs platform
- Formulier invullers per week: doel 50+
- Email open rate: doel 45%+
- Rapport naar gesprek conversie: doel 15%
- Cost per lead: doel minder dan 25 euro

## Combinaties
- Met 29-conversion-tracking: GA4 events per stap
- Met 12-pipedrive-crm: alle stages beheren
- Met 34-rapport-sales: premium rapport pipeline
- Met 25-zapier-templates: automation flows
- Met 15-jotform-typeform: formulier optimalisatie
