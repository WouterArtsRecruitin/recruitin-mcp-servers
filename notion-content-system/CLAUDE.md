# CLAUDE.md - Notion Content Manager Instructions

## Project Context

Dit is de Notion Content Manager voor Recruitin B.V. - een systeem voor:
- Dagelijkse recruitment news aggregatie
- LinkedIn content draft management
- Blog artikel voorbereiding

## Commands

### Quick Actions
```bash
# Test Notion connectie
python notion_content_manager.py --action test

# Dagelijkse news fetch (run elke ochtend)
python notion_content_manager.py --action fetch_news --save

# Bekijk drafts
python notion_content_manager.py --action list_drafts
```

### Content Creation
```bash
# Genereer LinkedIn post template
python notion_content_manager.py --action generate --title "NIEUWS_TITEL" --style contrarian

# Maak draft in Notion
python notion_content_manager.py --action create_draft --title "POST_TITEL" --content "CONTENT"
```

## File Locations

- Main script: `notion_content_manager.py`
- Config: `.env` (NOTION_API_KEY)
- Docs: `README.md`

## Notion Database IDs

```python
NEWS_DATABASE_ID = "2e52252c-bb15-8101-b097-cce88691c0d0"
DRAFTS_DATABASE_ID = "2e52252c-bb15-81e9-8215-cee7c7812f6d"
```

## Post Styles

| Style | Best For | Timing |
|-------|----------|--------|
| contrarian | Hot takes, meningen | Woensdag 12:00 |
| data_story | Cijfers, insights | Dinsdag 08:00 |
| how_to | Tips, tutorials | Donderdag 08:00 |
| behind_scenes | Persoonlijk, learnings | Vrijdag 10:00 |

## Tone of Voice

- Direct en eerlijk ("no-bullshit")
- Data-driven met eigen voorbeelden
- Contrarian perspectives
- Altijd afsluiten met vraag
- Max 1300 karakters voor LinkedIn
- 3-5 hashtags onderaan

## ICP Context

Target audience:
- Operations/Technisch Directeuren
- HR Managers
- Scale-up Founders
Bedrijven: 50-800 FTE, Technisch/Productie
Regio: Oost-Nederland
