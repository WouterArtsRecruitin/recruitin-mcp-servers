# 24 — Claude & AI Configs

## Doel
Beheer en optimalisatie van CLAUDE.md configuraties, MCP server setups, Claude Code instellingen en AI agent architecturen voor alle Recruitin projecten.

## Wanneer activeren
Triggers: `CLAUDE.md`, `claude config`, `MCP server`, `claude desktop`, `AI config`, `agent setup`, `MCP configureren`, `claude settings`, `AI architectuur`, `subagent`, `orchestrator`

## Repos
- **Primair:** `WouterArtsRecruitin/recruitin-mcp-servers` (43+ MCP servers)
- **Config voorbeeld:** `claude-desktop-config.example.json`
- **Skills bundle:** `wouter-skills-bundle/` map
- **Aanvullend:** `WouterArtsRecruitin/claude-quickstarts`

## MCP Servers overzicht (recruitin-mcp-servers)

### Core servers
| Server | Functie | Status |
|--------|---------|--------|
| `pipedrive` | CRM operaties | ✅ Actief |
| `recruitin-sales-mcp` | Sales automation | ✅ Actief |
| `elite-email-composer-mcp` | Email schrijven | ✅ Actief |
| `resend-mcp-server` | Email verzenden | ✅ Actief |
| `notion-content-system` | Notion beheer | ✅ Actief |
| `ollama-mcp-server` | Lokale LLM | ✅ Actief |
| `huggingface-mcp-server` | HuggingFace modellen | ✅ Actief |
| `labour-market-intelligence` | Marktdata | ✅ Actief |
| `pipedrive-bulk-importer` | Bulk CRM import | ✅ Actief |
| `cv-parser` | CV analyse | ✅ Actief |
| `cv-vacancy-matcher` | CV-vacature match | ✅ Actief |
| `recruitment-orchestrator` | Multi-agent orchestratie | ✅ Actief |

## claude-desktop-config.json structuur
```json
{
  "mcpServers": {
    "pipedrive": { "command": "node", "args": ["./pipedrive/index.js"] },
    "recruitin-sales": { "command": "node", "args": ["./recruitin-sales-mcp/index.js"] },
    "elite-email": { "command": "node", "args": ["./elite-email-composer-mcp/index.js"] }
  }
}
```

## CLAUDE.md best practices (uit eigen repos)
1. **Bedrijfsbriefing bovenaan** — identiteit, ICP, tone of voice
2. **Skill routing tabel** — triggers → skill files
3. **3-optie protocol** — Expert / Aanpassen / Direct
4. **Tech stack defaults** — hosting, CRM, forms, email
5. **Actieve projecten** — kandidatentekort.nl, JobDigger, etc.
6. **Combinatieregels** — welke skills samen te gebruiken

## Zapier MCP bridge
- `zapier-mcp-bridge.py` — verbindt Zapier workflows met MCP servers
- Gebruik: externe triggers → Claude agent acties

## Combinaties
- Met `03-automation`: MCP server integraties
- Met `01-development`: Claude Code workflows
- Met `17-github-workflows`: CI/CD voor MCP servers
- Met `23-prompt-library`: system prompts voor agents
