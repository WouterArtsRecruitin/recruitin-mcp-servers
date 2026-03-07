# 23 — Prompt Library

## Doel
Gestructureerde bibliotheek van bewezen prompts voor recruitment, marketing, sales en automation taken. Herbruikbaar, optimaliseerbaar, per taaktype georganiseerd.

## Wanneer activeren
Triggers: `prompt`, `prompt template`, `prompt schrijven`, `prompt optimaliseren`, `prompt library`, `betere prompt`, `system prompt`, `instructie schrijven`, `AI instructie`

## Repos
- **Primair:** `WouterArtsRecruitin/prompt-gym` (Next.js + Supabase prompt trainer)
- **Reference:** `WouterArtsRecruitin/prompt-eng-interactive-tutorial` (Anthropic cursus)
- **Aanvullend:** `WouterArtsRecruitin/GEOPTIMALISEERDE_PIPELINE14_PROMPTS_V5.md`

## Prompt categorieën

### Recruitment prompts
| Taak | Prompt type |
|------|-------------|
| Vacaturetekst schrijven | Role + context + output format |
| Kandidaat beoordelen | Evaluatie rubric + scorecard |
| InMail schrijven | Personalisatie template |
| Intake voorbereiding | Vragenlijst generator |
| Boolean search | Zoekopdracht optimizer |

### Marketing prompts
| Taak | Prompt type |
|------|-------------|
| LinkedIn post | Hook + body + CTA structuur |
| Meta ad copy | AIDA framework |
| Email sequence | Multi-touch nurture |
| SEO artikel | Outline + schrijfgids |
| Cold email | Personalisatie + opener |

### Automation prompts
| Taak | Prompt type |
|------|-------------|
| Zapier AI step | JSON output instructie |
| Data enrichment | Extractie + validatie |
| Rapport generatie | Structured output |
| Claude Code opdracht | CLAUDE.md instructie |

## Prompt kwaliteitsstandaarden (Anthropic methode)
1. **Rol definiëren** — "Je bent een expert NL tech recruiter..."
2. **Context geven** — Bedrijf, doelgroep, tone of voice
3. **Taak specificeren** — Concreet, meetbaar, afgebakend
4. **Output format** — JSON / markdown / bullets / prose
5. **Voorbeelden** — Few-shot waar relevant
6. **Constraints** — Wat NIET moet (geen jargon, geen Engels, etc.)

## Prompt Gym app (prompt-gym repo)
- Next.js 15 + Supabase backend
- Interactief prompt testen + opslaan
- Score per prompt op kwaliteitsdimensies
- Netlify deployment

## Combinaties
- Met `01-development`: Claude Code prompts + CLAUDE.md schrijven
- Met `09-recruitment-nl`: recruitment prompt templates
- Met `19-content-intelligence`: content prompts
- Met `03-automation`: Zapier AI step prompts
