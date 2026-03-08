# CLAUDE.md — Recruitin B.V.
# Master AI Configuration — Skills Bundle v5.1
# Bijgewerkt: 2026-03-08

## IDENTITEIT
Naam: Wouter Arts | DGA Recruitin B.V.
Focus: Technisch recruitment Java/Python/DevOps, mid-market 50-800 FTE
Regio: Gelderland, Overijssel, Noord-Brabant
Sectoren: Oil & Gas, Constructie, Productie, Automation, Renewable Energy
Tone: Direct, pragmatisch, Nederlands, geen onnodige intro's

---

## HOE SKILLS LADEN — CLAUDE CODE & COWORK

### Claude Code (CLI / terminal)
Bij elke sessie AUTOMATISCH uitvoeren:
```bash
# Lees master config
cat ~/recruitin-mcp-servers/CLAUDE.md

# Lees relevante skill op basis van taak (zie routing hieronder)
cat ~/recruitin-mcp-servers/skills/18-intelligence-hub.md
cat ~/.claude/skills/references/01-development.md
# etc.
```

**Triggers voor automatisch laden:**
- Sessie start → lees CLAUDE.md altijd eerst
- Keyword herkend → lees bijbehorende skill (zie routing tabel)
- Combinatietaak → lees meerdere skills sequentieel

**Claude Code commando's:**
```bash
/skill 09          # laad skill 09-recruitment-nl
/skill automation  # zoek en laad automation skill
/skills            # toon routing overzicht
```

### Cowork (desktop automation)
Bij taakstart: lees CLAUDE.md + relevante skill(s) als context.
Verwerk skill-inhoud als instructieset voor de automatiseringstask.

**Bestandspaden Cowork:**
- Bundel A (01-17): `~/.claude/skills/references/`
- Bundel B+C (18-38): `~/recruitin-mcp-servers/skills/`
- Bundel D (marketing): `~/.claude/skills/marketing/`

**Stappenplan bij nieuwe taak:**
1. Lees CLAUDE.md voor context + standaarden
2. Identificeer triggers → selecteer skill(s)
3. Lees skill bestand(en)
4. Voer taak uit conform skill-instructies
5. Gebruik tech stack defaults (zie onderaan)

---

## 3-OPTIE PROTOCOL
Bij elke complexe opdracht, bied:
- A) EXPERT — Analyse + verbeteringen + tools + kosten + ROI
- B) AANPASSEN — Ik vul aan, jij wacht op input
- C) DIRECT — Uitvoeren zoals gevraagd

---

## SKILLS ROUTING v5.1

### BUNDEL A — Core Skills (01-17)
Locatie: `~/.claude/skills/references/`

| Triggers | Skill | Bestand |
|----------|-------|---------|
| claude, model, code, git, Claude Code | 01-development | 01-development.md |
| stack, hosting, deploy, Next.js, Vercel | 02-tech-stack | 02-tech-stack.md |
| zapier, automation, MCP, webhook, flow | 03-automation | 03-automation.md |
| lead, funnel, form, scoring, lead gen | 04-lead-generation | 04-lead-generation.md |
| email sequence, deliverability, nurture | 05-email-marketing | 05-email-marketing.md |
| website bouwen, landing page, copy | 06-website-copy | 06-website-copy.md |
| content kalender, blog, SEO strategie | 07-content-seo | 07-content-seo.md |
| Meta campagne, LinkedIn ads, budget | 08-multichannel-ads | 08-multichannel-ads.md |
| recruitment, vacature, kandidaat, salaris NL | 09-recruitment-nl | 09-recruitment-nl.md |
| enrichment, deduplicatie, waterfall | 10-data-enrichment | 10-data-enrichment.md |
| supermetrics, GA4 dashboard | 11-supermetrics | 11-supermetrics.md |
| pipedrive, deal, pipeline, CRM | 12-pipedrive-crm | 12-pipedrive-crm.md |
| canva, design, brand, visual | 13-canva-design | 13-canva-design.md |
| apollo, ICP, prospecting, Apollo.io | 14-apollo-enrichment | 14-apollo-enrichment.md |
| jotform, typeform, form bouwen | 15-jotform-typeform | 15-jotform-typeform.md |
| notion, workspace, kanban, database | 16-notion-workspace | 16-notion-workspace.md |
| github, repo, CI/CD, PR, workflow | 17-github-workflows | 17-github-workflows.md |

### BUNDEL B — Intelligence & Automation (18-27)
Locatie: `~/recruitin-mcp-servers/skills/`

| Triggers | Skill | Bestand |
|----------|-------|---------|
| intelligence, marktdata, ICP monitor, concurrent | 18-intelligence-hub | 18-intelligence-hub.md |
| content genereren, content kalender, OGSM | 19-content-intelligence | 19-content-intelligence.md |
| vacature publiceren, vacaturekanon, jobboard | 20-vacaturekanon | 20-vacaturekanon.md |
| nieuws scrapen, recruitment nieuws, RSS | 21-recruitment-news | 21-recruitment-news.md |
| LinkedIn profiel, SSI score, InMail | 22-linkedin-optimizer | 22-linkedin-optimizer.md |
| prompt, prompt template, system prompt | 23-prompt-library | 23-prompt-library.md |
| CLAUDE.md, MCP server, claude config | 24-claude-ai-configs | 24-claude-ai-configs.md |
| zapier workflow, zap bouwen, automation flow | 25-zapier-templates | 25-zapier-templates.md |
| Next.js, boilerplate, frontend bouwen | 26-nextjs-boilerplates | 26-nextjs-boilerplates.md |
| email template, outreach email, Resend | 27-email-templates | 27-email-templates.md |

### BUNDEL C — Producten & Platforms (28-38)
Locatie: `~/recruitin-mcp-servers/skills/`

| Triggers | Skill | Bestand |
|----------|-------|---------|
| RecruitmentAPK, assessment, APK scan, FlowMaster | 28-recruitmentapk-assessment | 28-recruitmentapk-assessment.md |
| tracking, pixel, CAPI, GA4 events, GTM | 29-conversion-tracking | 29-conversion-tracking.md |
| EVP, employer branding, werkgeversmerk | 30-evp-employer-branding | 30-evp-employer-branding.md |
| LinkedIn automation, CV matching, kandidaat scoring | 31-linkedin-automation-expert | 31-linkedin-automation-expert.md |
| boolean search, zoekstring, sourcing | 32-boolean-search-sourcing | 32-boolean-search-sourcing.md |
| KPI dashboard, recruitment metrics, LinkedIn RPS | 33-recruitment-kpi-dashboard | 33-recruitment-kpi-dashboard.md |
| marktrapport, 59 euro rapport, pdfmonkey | 34-rapport-intelligence-sales | 34-rapport-intelligence-sales.md |
| browser automation, headless, scrapen, kapture | 35-browser-agent-automation | 35-browser-agent-automation.md |
| kandidatentekort, vacature analyse, V6 | 36-kandidatentekort-platform | 36-kandidatentekort-platform.md |
| RecruitPro, recruitment platform, SaaS | 37-recruitpro-platform | 37-recruitpro-platform.md |
| Ollama, lokaal model, DeepSeek, gratis AI | 38-lokale-llm-ollama | 38-lokale-llm-ollama.md |

### BUNDEL D — Marketing Skills
Locatie: `~/.claude/skills/marketing/`

| Triggers | Skill | Bestand |
|----------|-------|---------|
| copy schrijven, headline, CTA | copywriting | copywriting.md |
| pagina converteert niet, CRO, bounce rate | page-cro | page-cro.md |
| SEO audit, niet ranken, traffic | seo-audit | seo-audit.md |
| AI SEO, AEO, ChatGPT zichtbaar | ai-seo | ai-seo.md |
| ad copy, ad variaties, Facebook/Google | ad-creative | ad-creative.md |
| cold email, outreach, niemand reageert | cold-email | cold-email.md |
| content strategie, wat schrijven | content-strategy | content-strategy.md |
| LinkedIn post, social media, carousel | social-content | social-content.md |

---

## COMBINATIE REGELS

| Taak | Skills laden |
|------|-------------|
| Meta ad + landing page | 08 + ad-creative + page-cro |
| Recruitment website | 06 + copywriting + page-cro |
| Cold outreach campagne | 05 + 09 + cold-email |
| SEO voor kandidatentekort.nl | 07 + seo-audit + ai-seo |
| LinkedIn recruitment content | 09 + 22 + social-content |
| Apollo leads → email → ads | 14 + cold-email + ad-creative |
| Marktdata → content → LinkedIn | 18 + 19 + social-content |
| Vacature → publiceren → tracken | 09 + 20 + 12 |
| Nieuws → post → amplificatie | 21 + 19 + 08 |
| CV matching → CRM → outreach | 31 + 12 + 27 |
| Assessment → rapport → deal | 28 + 34 + 12 |
| Boolean → sourcing → pipeline | 32 + 31 + 12 |
| EVP scan → landingspagina → ads | 30 + 06 + 08 |
| Tracking setup nieuw project | 29 + 26 + 11 |

---

## TECH STACK DEFAULTS

| Component | Keuze |
|-----------|-------|
| Frontend framework | Next.js 15 App Router |
| Styling | Tailwind CSS + shadcn/ui |
| Hosting primair | Vercel |
| Hosting static | Netlify |
| CDN | Cloudflare |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| CRM | Pipedrive |
| Forms UX | Typeform |
| Forms betalingen | Jotform |
| Email transactioneel | Resend |
| Automation | Zapier |
| PDF generatie | pdfmonkey |

---

## ACTIEVE PROJECTEN
- kandidatentekort.nl — Lead gen vacature-analyse (V6 productie)
- JobDigger Pipeline — opgelost, pipeline actief
- Meta Campaigns — 15 audiences, 20 ad varianten
- RecruitmentAPK — Assessment tool + A/B test
- LinkedIn Expert Automation — 10k MRR target
- Rapport Sales — 59 euro marktrapportages

## NL SALARISSEN 2025 (tech)
- Junior: 35-55k euro
- Medior: 55-75k euro
- Senior: 75-100k euro
- Lead/Principal: 90-130k euro
- Amsterdam toeslag: +10-15%

## GDPR STANDAARD
- Kandidaatdata: max 2 jaar bewaren
- Toestemming: expliciet voor outreach
- Gevoelige data: lokale LLM (38) of encryptie
- Privacy by design in alle nieuwe features

---

## SLASH COMMANDO'S
/recruitment | /pipedrive | /apollo | /automation
/ad-creative | /cold-email | /copywriting | /seo-audit
/boolean | /kandidatentekort | /assessment | /rapport
/tracking | /EVP | /dashboard | /linkedin-automation

---

## DIRECTORY STRUCTUUR
```
recruitin-mcp-servers/
  CLAUDE.md                         ← master config (dit bestand)
  skills/
    18-intelligence-hub.md
    19-content-intelligence.md
    20-vacaturekanon.md
    21-recruitment-news.md
    22-linkedin-optimizer.md
    23-prompt-library.md
    24-claude-ai-configs.md
    25-zapier-templates.md
    26-nextjs-boilerplates.md
    27-email-templates.md
    28-recruitmentapk-assessment.md
    29-conversion-tracking.md
    30-evp-employer-branding.md
    31-linkedin-automation-expert.md
    32-boolean-search-sourcing.md
    33-recruitment-kpi-dashboard.md
    34-rapport-intelligence-sales.md
    35-browser-agent-automation.md
    36-kandidatentekort-platform.md
    37-recruitpro-platform.md
    38-lokale-llm-ollama.md

~/.claude/skills/references/        ← Bundel A (01-17)
~/.claude/skills/marketing/         ← Bundel D (8 marketing skills)
```
