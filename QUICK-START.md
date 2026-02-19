# Recruitin MCP Servers - Quick Start Guide

## Vereisten

- **Node.js** >= 18
- **Ollama** geinstalleerd en draaiend (`ollama serve`)
- **Ollama model** gedownload: `ollama pull llama3.2`
- **Claude Desktop** of **Claude Code** voor MCP integratie

---

## 1. Installatie

```bash
# Clone de repo
git clone https://github.com/WouterArtsRecruitin/recruitin-mcp-servers.git
cd recruitin-mcp-servers

# Installeer dependencies voor elke MCP server
cd ollama-mcp-server && npm install && cd ..
cd ollama-sales-mcp && npm install && cd ..
cd ollama-intelligence-mcp && npm install && cd ..
cd ollama-content-mcp && npm install && cd ..
cd jobdigger-mcp && npm install && cd ..
```

## 2. Ollama starten

```bash
# Start Ollama (moet draaien op achtergrond)
ollama serve

# Download het model (eenmalig)
ollama pull llama3.2
```

## 3. Claude Desktop configuratie

Kopieer `claude-desktop-config.example.json` naar je Claude Desktop config:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Pas de paden aan naar je lokale installatie.

---

## MCP Servers Overzicht

### Ollama General (`ollama-mcp-server`)
```bash
node ollama-mcp-server/index.js
```

| Command | Wat het doet |
|---------|-------------|
| `ollama_generate` | Vrije tekst generatie met Ollama |
| `ollama_summarize` | Tekst samenvatten |
| `ollama_translate` | Vertalen (NL/EN/DE) |
| `ollama_extract_keywords` | Keywords extraheren uit tekst |
| `ollama_score_match` | Kandidaat-vacature match scoren |
| `ollama_list_models` | Beschikbare Ollama modellen tonen |

---

### Ollama Sales (`ollama-sales-mcp`)
```bash
node ollama-sales-mcp/index.js
```

| Command | Wat het doet | Voorbeeld |
|---------|-------------|-----------|
| `sales_score_prospect` | Score een bedrijf als prospect (0-100) | `{ "company_name": "ASML", "vacancy_info": "zoekt 3 software engineers" }` |
| `sales_generate_outreach` | Koude acquisitie email | `{ "company_name": "Thales", "contact_name": "Jan", "vacancy_title": "PLC Programmeur" }` |
| `sales_email_sentiment` | Sentiment + urgentie van email | `{ "email_text": "Bedankt voor je bericht, we hebben interesse..." }` |
| `sales_draft_reply` | Concept antwoord genereren | `{ "received_email": "...", "goal": "meeting plannen" }` |
| `sales_classify_email` | Email classificeren (lead/klant/spam) | `{ "email_text": "...", "sender": "jan@bedrijf.nl" }` |
| `sales_extract_lead_info` | Contactgegevens uit tekst halen | `{ "text": "Jan de Vries, CTO bij TechCorp, 06-12345678" }` |
| `sales_followup_sequence` | Follow-up email sequence (3-5 emails) | `{ "company_name": "Philips", "context": "geen reactie op eerste email" }` |
| `sales_objection_handler` | Antwoord op bezwaren | `{ "objection": "We werken al met een ander bureau" }` |

---

### Ollama Intelligence (`ollama-intelligence-mcp`)
```bash
node ollama-intelligence-mcp/index.js
```

| Command | Wat het doet | Voorbeeld |
|---------|-------------|-----------|
| `intel_vacancy_analysis_v2` | Vacature analyse op 6 dimensies | `{ "vacancy_text": "...", "company_name": "ASML" }` |
| `intel_vacancy_improve` | Verbeterde vacaturetekst genereren | `{ "vacancy_text": "...", "improvements_focus": "seo" }` |
| `intel_target_audience` | Doelgroep profiel | `{ "function_title": "PLC Programmeur", "sector": "Food" }` |
| `intel_competitor_analysis` | Concurrent analyseren | `{ "competitor_name": "Brunel", "focus_area": "technisch recruitment" }` |
| `intel_market_trends` | Arbeidsmarkt trends | `{ "topic": "AI Engineers", "timeframe": "kort" }` |
| `intel_salary_benchmark` | Salaris benchmark | `{ "function_title": "DevOps Engineer", "experience_years": 5 }` |
| `intel_sector_report` | Sector rapport | `{ "sector": "semiconductor", "region": "Eindhoven" }` |
| `intel_candidate_persona` | Ideaal kandidaat persona | `{ "vacancy_title": "Lead Developer", "must_haves": "React, AWS" }` |
| `intel_hiring_difficulty` | Wervingsmoeilijkheid (0-100) | `{ "function_title": "Embedded C++ Developer" }` |

**Vacature Analyse V2 dimensies:**
1. Inhoud & Compleetheid
2. SEO & Vindbaarheid
3. Employer Branding
4. Kandidaat Aantrekkelijkheid
5. Marktcompetitiviteit
6. Conversie Potentieel

---

### Ollama Content (`ollama-content-mcp`)
```bash
node ollama-content-mcp/index.js
```

| Command | Wat het doet | Voorbeeld |
|---------|-------------|-----------|
| `content_linkedin_post` | LinkedIn post schrijven | `{ "topic": "AI in recruitment", "type": "thought_leadership" }` |
| `content_linkedin_carousel` | Carousel slides (5-10) | `{ "topic": "5 hiring fouten", "style": "tips", "num_slides": 7 }` |
| `content_meta_campaign` | Meta/FB/IG campagne | `{ "campaign_goal": "lead_generation", "product_service": "Recruitment APK" }` |
| `content_hashtag_strategy` | Hashtag strategie | `{ "topic": "tech recruitment", "platform": "linkedin" }` |
| `content_ab_variants` | A/B test varianten | `{ "original_text": "...", "element_to_test": "hook" }` |
| `content_weekly_calendar` | Weekkalender (ma-vr) | `{ "week_theme": "employer branding", "focus_vacatures": "PLC, DevOps" }` |
| `content_repurpose` | Content hergebruiken | `{ "source_content": "...", "source_format": "blog", "target_format": "linkedin_post" }` |
| `content_engagement_hooks` | Scroll-stopping openers | `{ "topic": "salaris transparantie", "style": "controversial" }` |

**Post types:** `thought_leadership`, `vacature`, `tip`, `behind_the_scenes`, `poll`, `case_study`, `markt_update`

---

### JobDigger (`jobdigger-mcp`)
```bash
node jobdigger-mcp/index.js
```

#### V1 - Lead Scoring & Enrichment
| Command | Wat het doet | Voorbeeld |
|---------|-------------|-----------|
| `jobdigger_score_lead` | Lead scoren (0-100) | `{ "company_name": "VDL", "vacancy_title": "Werkvoorbereider" }` |
| `jobdigger_enrich_company` | Bedrijf verrijken | `{ "company_name": "Nexperia", "vacancy_titles": "IC Designer, Test Engineer" }` |
| `jobdigger_batch_prioritize` | Batch leads prioriteren | `{ "leads": "VDL - Engineer - Eindhoven; ASML - Developer - Veldhoven" }` |

#### V2 - Profile Matching
| Command | Wat het doet | Voorbeeld |
|---------|-------------|-----------|
| `jobdigger_analyze_profile` | Kandidaat profiel analyseren | `{ "profile_text": "10 jaar ervaring C++...", "target_role": "Lead Developer" }` |
| `jobdigger_match_vacancy` | Kandidaat-vacature match | `{ "candidate_profile": "...", "vacancy_text": "..." }` |
| `jobdigger_boolean_search` | Boolean search genereren | `{ "function_title": "DevOps Engineer", "must_have_skills": "AWS, Docker, K8s" }` |

#### V3 - Email Sequence Automation
| Command | Wat het doet | Voorbeeld |
|---------|-------------|-----------|
| `jobdigger_generate_sequence` | 6-email outreach sequence | `{ "company_name": "Thales", "contact_name": "Jan Smit", "vacancy_title": "Software Architect", "tech_stack": "Java, AWS" }` |
| `jobdigger_personalize_email` | Email personaliseren | `{ "email_template": "...", "company_name": "Thales", "contact_name": "Jan", "personalization_context": "recent nieuw kantoor geopend" }` |

---

## Dagelijks Gebruik (Workflows)

### Ochtend: Leads & Email
```
1. sales_email_sentiment    → Inkomende emails analyseren
2. sales_classify_email     → Classificeer en prioriteer
3. sales_draft_reply        → Conceptantwoorden genereren
4. jobdigger_score_lead     → Nieuwe JobDigger leads scoren
```

### Middag: Acquisitie
```
1. jobdigger_batch_prioritize → Top leads van de dag
2. jobdigger_enrich_company   → Verrijk top-5 bedrijven
3. jobdigger_generate_sequence → Email sequences voor A-leads
4. sales_generate_outreach     → Directe outreach voor urgente leads
```

### Einde dag: Content & Analyse
```
1. content_linkedin_post     → Dagelijkse LinkedIn post
2. intel_market_trends       → Check trends voor morgen
3. content_weekly_calendar   → Plan volgende week (vrijdag)
```

### Wekelijks: Strategie
```
1. intel_sector_report        → Sector analyse
2. intel_competitor_analysis  → Concurrent check
3. content_meta_campaign      → Meta campagne bijwerken
4. intel_vacancy_analysis_v2  → Klant-vacatures analyseren
```

---

## Environment Variables

```bash
# Ollama (optioneel - defaults werken lokaal)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.2

# Voor andere MCP servers
PIPEDRIVE_API_TOKEN=your-token
ANTHROPIC_API_KEY=your-key
BRAVE_API_KEY=your-key
NOTION_API_KEY=your-key
RESEND_API_KEY=your-key
```

---

## Troubleshooting

| Probleem | Oplossing |
|----------|-----------|
| `ECONNREFUSED` | Start Ollama: `ollama serve` |
| Model niet gevonden | Download: `ollama pull llama3.2` |
| Trage responses | Gebruik kleiner model: `OLLAMA_DEFAULT_MODEL=llama3.2:1b` |
| Out of memory | Gebruik `llama3.2:1b` of `phi3:mini` |

---

*Recruitin MCP Servers | Quick Start Guide | 2026-02*
