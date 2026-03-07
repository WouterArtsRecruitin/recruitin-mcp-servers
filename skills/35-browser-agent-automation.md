# 35 — Browser & Agent Automation

## Doel
Headless browser automation voor web scraping, dynamic content extractie en AI agent acties via CLI en Chrome DevTools MCP.

## Wanneer activeren
Triggers: browser automation, headless browser, web scrapen, dynamische pagina, Chrome automation, playwright, MCP browser, agent browser, kapture, site scrapen, JavaScript pagina scrapen

## Repos
- CLI tool: WouterArtsRecruitin/agent-browser (Rust + Node.js fallback)
- Chrome MCP: WouterArtsRecruitin/kapture (DevTools Extension + MCP server)

## agent-browser CLI

Installatie:
npm install -g agent-browser
agent-browser install

Commando's:
agent-browser open recruitin.nl
agent-browser snapshot (accessibility tree met refs)
agent-browser click @e2 (klik element bij ref)
agent-browser fill @e3 "tekst" (veld invullen)
agent-browser get text @e1 (tekst ophalen)

## kapture (Chrome DevTools MCP)
- Chrome extensie plus MCP server
- AI agents kunnen browser bedienen via MCP protocol
- Integratie met Claude Code voor browser automation
- Use case: intelligence-hub dynamic content extractie

## Scraping use cases Recruitin
- Vacatures concurrent via Indeed en LinkedIn
- Salaris benchmarks via Glassdoor NL
- Bedrijfsgroei monitoring via LinkedIn Company pages
- Nieuws van dynamische nieuwssites (React/SPA)

## Intelligence Hub integratie
Voor sites die JavaScript vereisen:
Stap 1: agent-browser open target-site.nl
Stap 2: agent-browser snapshot
Output gaat naar intelligence-hub verwerking en vervolgens naar Google Sheets

## Combinaties
- Met 18-intelligence-hub: browser naar marktdata pipeline
- Met 21-recruitment-news: nieuws scrapen dynamische sites
- Met 01-development: Claude Code plus kapture MCP
- Met 03-automation: scraping naar Zapier workflow
