# 34 — Rapport & Intelligence Sales

## Doel
Betaalde marktintelligentie rapporten (€59), PDF generatie via pdfmonkey, arbeidsmarktanalyse producten en Jotform API integratie voor geautomatiseerde rapport delivery.

## Wanneer activeren
Triggers: marktrapport, intelligence rapport, arbeidsmarktrapport, €59 rapport, PDF genereren, rapport verkopen, labour market intelligence, pdfmonkey, rapport template, analyse rapport verkopen

## Repos
- Rapport templates: WouterArtsRecruitin/report-templates (demo + full versies)
- Platform landing: WouterArtsRecruitin/labour-market-intelligence-landing
- API backend: WouterArtsRecruitin/recruitin-api (Jotform integratie)
- PDF test: WouterArtsRecruitin/test-recruitmentapk-pdf (pdfmonkey)

## Product: Arbeidsmarktrapport

Prijsmodel:
- Standaard rapport: €59 (self-service, direct download)
- Uitgebreid rapport: €149 (inclusief adviesgesprek 30 min)
- Abonnement: €299 per maand (3 rapporten + updates)

## Rapport inhoud (per functiegroep)
1. Arbeidsmarkt overzicht vraag vs. aanbod NL
2. Salarisrange actueel junior/medior/senior
3. Top 10 werkgevers in regio
4. Concurrentie op de arbeidsmarkt
5. Aanbevelingen wervingsstrategie
6. Boolean search strings kant-en-klaar
7. Tijdlijn realistische werving

## Technische flow
Jotform submit (vacaturedetails) naar recruitin-api naar Claude AI analyse naar report-templates invullen naar pdfmonkey PDF generatie naar Resend email delivery naar Stripe betaling naar Pipedrive deal

## recruitin-api (Jotform integratie)
- Framework: Python Flask of FastAPI
- Endpoint: POST /analyse met vacature JSON input
- Claude AI prompt: gestructureerde marktanalyse output
- Output: JSON rapport data naar PDF template

## PDF generatie pdfmonkey
- Template: report-templates full versie
- Data: JSON van recruitin-api
- Output: Branded PDF rapport
- Delivery: Resend email met download link

## Combinaties
- Met 18-intelligence-hub: live marktdata voor rapporten
- Met 09-recruitment-nl: salarisbenchmarks
- Met 15-jotform-typeform: intake formulier
- Met 12-pipedrive-crm: betaalde klant naar deal
- Met 29-conversion-tracking: purchase event tracking
