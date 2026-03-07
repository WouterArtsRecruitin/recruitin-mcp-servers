# 33 — Recruitment KPI Dashboard

## Doel
KPI tracking voor recruitment performance, LinkedIn RPS score monitoring en geautomatiseerde rapportgeneratie via CSV en Zapier.

## Wanneer activeren
Triggers: KPI dashboard, recruitment metrics, LinkedIn RPS, performance dashboard, rapport genereren, recruitment rapportage, time-to-fill, cost-per-hire, dashboard bouwen, statistieken recruitment

## Repos
- Dashboard v2: WouterArtsRecruitin/recruitment-dashboard-v2
- LinkedIn RPS: WouterArtsRecruitin/linkedin-rps-dashboard
- Rapport generator: WouterArtsRecruitin/claude-report-generator (CSV + Zapier)
- Basis: WouterArtsRecruitin/recruitment-dashboard

## Core KPIs Recruitin

Pipeline metrics:
- Time-to-fill per vacature (target: minder dan 6 weken)
- Cost-per-hire per klant
- Stage-to-stage conversie (Stage 1 naar 2 naar 3 naar deal)
- Deal waarde pipeline (huidig: 799k totaal, 519k stuck Stage 2)

Kandidaat metrics:
- Shortlist ratio (ingestuurd vs. geplaatst)
- Interview-to-offer ratio
- Offer acceptance rate (target: meer dan 80%)

LinkedIn metrics:
- RPS (Recruiter Performance Score)
- InMail response rate (target: meer dan 25%)
- Profile views trends

## Claude Report Generator
- Deployment: Render.com (Python Flask)
- Input: CSV via Google Sheets of Zapier webhook
- Output: HTML/PDF rapporten
- POST /weekly?prospects=10 voor weekrapport
- POST /monthly?sector=all voor maandrapport

## LinkedIn RPS dashboard
- RPS score tracking over tijd
- Benchmark vs. sector recruiters
- Score interpretatie:
  - Lager dan 50: urgente verbetering nodig
  - 50-75: normaal, optimaliseer InMail
  - 75+: excellent, schaal op

## Combinaties
- Met 11-supermetrics: GA4 data naar dashboard
- Met 12-pipedrive-crm: deal data als KPI feed
- Met 22-linkedin-optimizer: RPS verbetering acties
- Met 25-zapier-templates: automatisch rapport triggers
- Met 34-rapport-sales: dashboard als klantrapport basis
