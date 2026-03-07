# 21 — Recruitment News Scraper

## Doel
Dagelijks/wekelijks automatisch ophalen van NL recruitment en techniek nieuws, categoriseren en distribueren als digest naar LinkedIn / nieuwsbrief / Notion.

## Wanneer activeren
Triggers: `nieuws scrapen`, `recruitment nieuws`, `sector updates`, `marktnieuws`, `dagelijks nieuws`, `TechnicalRecruitmentNews`, `nieuwsoverzicht`, `trends ophalen`, `RSS`

## Repo
- **Primair:** `WouterArtsRecruitin/TechnicalRecruitmentNews`
- **Live site:** Netlify deployment

## Technische stack
- Node.js + Axios + Cheerio (scraping)
- RSS Parser (feed aggregatie)
- Netlify (hosting + scheduled functions)

## Nieuws categorieën met keywords
| Categorie | Keywords |
|-----------|----------|
| Technisch personeelstekort | tekort, krapte, schaarste, vacature, war for talent |
| Automation & Engineering | automation, engineering, PLC, robotica, industrieel |
| Salarissen 2026 | salaris, loon, CAO, arbeidsvoorwaarden, loonsverhoging |
| AI & Recruitment tech | AI, ATS, HR tech, machine learning, chatbot |
| HR trends arbeidsmarkt | HR trend, flexwerk, ZZP, detachering, personeelsbehoud |
| Elektrotechniek | elektrotechniek, installatie, elektricien, VSK |
| Werktuigbouwkunde | werktuigbouw, CAD, SolidWorks, CNC, machinist |
| Manufacturing & Industrial | ASML, VDL, productie, fabriek, maakindustrie |

## Scraping bronnen (NL)
- Techzine.nl
- Automatiseringgids.nl
- HR Praktijk
- Computable.nl
- Jobat.be (Belgisch maar relevant)
- RSS feeds vakbonden / cao.nl

## Output
- Wekelijks HTML nieuwsoverzicht
- JSON data per categorie
- Top 10 artikelen selectie
- LinkedIn post draft (via 19-content-intelligence)

## Deployment (Netlify)
```
netlify deploy --prod
# Scheduled: elke maandag 06:00 NL tijd
```

## Combinaties
- Met `19-content-intelligence`: nieuws → content brief → LinkedIn post
- Met `18-intelligence-hub`: nieuws → sector trends Google Sheets
- Met `07-content-seo`: nieuws → SEO blog artikel
- Met `08-multichannel-ads`: trending topic → ad campagne
