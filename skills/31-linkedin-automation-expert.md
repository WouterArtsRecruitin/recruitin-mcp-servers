# 31 — LinkedIn Automation Expert

## Doel
AI-powered LinkedIn automation voor kandidaat-vacature matching, CV analyse, outreach automatisering en LinkedIn RSC program integratie. Doelstelling: €10k+ MRR via LinkedIn Expert dienstverlening.

## Wanneer activeren
Triggers: `LinkedIn automation`, `CV matching`, `kandidaat matching`, `LinkedIn expert`, `quickscan automation`, `RSC program`, `LinkedIn outreach automatiseren`, `kandidaat scoring`, `LinkedIn AI`, `dutch recruitment intelligence`

## Repos
- **Primair:** `WouterArtsRecruitin/recruitin-linkedin-expert-automation` (Python + SQLite + Claude AI)
- **Intelligence:** `WouterArtsRecruitin/dutch-recruitment-intelligence`
- **RSC tools:** `WouterArtsRecruitin/recruiter-system-connect-development-tools`
- **Aanvullend:** `WouterArtsRecruitin/linkedin-expert-automation`

## Systeem architectuur (recruitin-linkedin-expert-automation)

```
CV Upload (PDF/DOCX/TXT)
  → Document Processing
  → Claude AI analyse
  → Kandidaat-vacature score (0-100)
  → SQLite database opslaan
  → Notificatie (Email/WhatsApp/Slack)
  → Webhook → Zapier integratie
```

## Claude AI matching logica
```python
# Scoring dimensies
scoring = {
    "tech_skills_match": 30,    # Java, Python, DevOps skills
    "experience_level": 20,     # Junior/Medior/Senior
    "sector_fit": 20,           # Oil&Gas, Manufacturing, etc.
    "location_match": 15,       # Gelderland/Overijssel/N-Brabant
    "salary_alignment": 15      # Verwachting vs. budget
}
# Score ≥70 → automatisch in Pipedrive Stage 2
```

## Batch processing
```bash
python batch_processor.py --vacature "Senior Java Developer" \
  --cv-folder ./cvs/ --min-score 65 --output pipedrive
```

## Notificatie integraties
- **Email:** Resend (rich HTML digest)
- **WhatsApp:** Twilio / WhatsApp Business API
- **Slack:** Webhook naar #recruitment kanaal
- **Webhook:** Zapier endpoint voor Pipedrive sync

## Dutch Recruitment Intelligence
- NL arbeidsmarkt data scraping
- Sector-specifieke benchmarks
- Concurrent analyse (andere bureaus)
- Vacature trend monitoring per regio

## LinkedIn RSC Program (recruiter-system-connect-development-tools)
- Development tools voor LinkedIn RSC integratie
- Gestructureerde data uit LinkedIn recruiter
- Compliance met LinkedIn API voorwaarden

## KPIs systeem
| Metric | Target |
|--------|--------|
| CV's verwerkt/dag | >50 |
| Matching accuracy | >85% |
| Time-to-shortlist | <2 uur |
| Kandidaat response rate | >25% |
| MRR target | €10.000 |

## Combinaties
- Met `09-recruitment-nl`: functietitels + salaris benchmarks
- Met `12-pipedrive-crm`: gekwalificeerde kandidaten → CRM
- Met `22-linkedin-optimizer`: profiel SEO + InMail templates
- Met `32-boolean-search`: zoekstrings per functiegroep
- Met `25-zapier-templates`: webhook → Pipedrive automation
