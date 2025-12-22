# Recruitin Sales MCP Server

MCP server voor het automatiseren van de complete Recruitin sales workflow.

## Tools

| Tool | Beschrijving |
|------|-------------|
| `recruitin_labor_market` | Arbeidsmarkt quickscan met UWV 2025 data |
| `recruitin_fees` | Fee calculator (19% retainer / 24% NCNP) |
| `recruitin_pipedrive_check` | Check duplicaten in Pipedrive |
| `recruitin_pipedrive_create` | Maak person/org/deal in Pipedrive |
| `recruitin_email` | Genereer outreach email template |
| `recruitin_pitch` | Genereer sales pitch data |
| `recruitin_workflow` | Complete workflow in één keer |

## Installatie

### 1. Clone/download naar lokale map

```bash
# Maak folder aan
mkdir -p ~/mcp-servers/recruitin-sales-mcp
cd ~/mcp-servers/recruitin-sales-mcp

# Kopieer bestanden
# - index.js
# - package.json

# Installeer dependencies
npm install
```

### 2. Claude Desktop configuratie

Voeg toe aan `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) of `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "recruitin-sales": {
      "command": "node",
      "args": ["/Users/JOUWNAAM/mcp-servers/recruitin-sales-mcp/index.js"],
      "env": {
        "PIPEDRIVE_API_KEY": "jouw-pipedrive-api-key"
      }
    }
  }
}
```

### 3. Herstart Claude Desktop

## Gebruik

### Arbeidsmarkt scan
```
Gebruik recruitin_labor_market met sector: "equipment"
```

Output:
```json
{
  "sector": "equipment",
  "scarcity": 65,
  "regions": ["Gelderland", "Overijssel", "Noord-Brabant", "Utrecht", "Zuid-Holland"],
  "source": "UWV 2025"
}
```

### Fee calculator
```
Gebruik recruitin_fees met salaryMin: 5100, salaryMax: 6500, bonus: 20
```

Output:
```json
{
  "annual": { "min": 79315, "max": 101030 },
  "retainer": { "pct": 19, "min": 15070, "max": 19196 },
  "ncnp": { "pct": 24, "min": 19036, "max": 24247 }
}
```

### Complete workflow
```
Gebruik recruitin_workflow met:
- jobTitle: "Service Manager"
- company: "Zeppelin Equipment"
- contactName: "Marco van Meegdenburg"
- contactEmail: "m.vanmeegdenburg@zeppelin.com"
- salaryMin: 5100
- salaryMax: 6500
- bonus: 20
- sector: "equipment"
- timeline: "withHoliday"
- createPipedrive: true
```

Output: Arbeidsmarkt data + fees + email template + pitch data + Pipedrive IDs

## Sectoren (UWV 2025 krapte)

| Sector | Krapte |
|--------|--------|
| Bouw | 65% |
| Equipment | 65% |
| Industrie | 59% |
| Techniek | 58% |
| ICT | 55% |
| Zorg | 52% |

## Fee structuur

- **Retainer**: 19% van jaarsalaris
- **No Cure No Pay**: 24% van jaarsalaris
- **Jaarsalaris berekening**: maandsalaris × 12.96 (incl. vakantiegeld)

## Timelines

- **standard**: 8-10 weken
- **withHoliday**: 10-12 weken (met kerst/zomervakantie)

## Environment Variables

| Variabele | Vereist | Beschrijving |
|-----------|---------|--------------|
| `PIPEDRIVE_API_KEY` | Voor Pipedrive tools | Je Pipedrive API key |

## Troubleshooting

### Server start niet
```bash
# Check Node versie (moet v18+)
node --version

# Check dependencies
npm install

# Test handmatig
node index.js
```

### Pipedrive werkt niet
- Check of `PIPEDRIVE_API_KEY` correct is ingesteld
- Check of API key actief is in Pipedrive settings

## Roadmap

- [ ] Vacature URL scraping (Indeed, LinkedIn)
- [ ] Contact scraping (Apollo.io integratie)
- [ ] Gamma.ai API integratie voor pitch decks
- [ ] Automatische follow-up sequences
