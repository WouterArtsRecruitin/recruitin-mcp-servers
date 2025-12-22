# 🎯 CV-Vacancy Matcher MCP Server

MCP Server waarmee Claude direct kandidaten kan matchen met vacatures.

## Quick Start

```bash
# Install
pip install -r requirements.txt

# Set environment
export HF_TOKEN="hf_..."
export RESEND_API_KEY="re_..."

# Run development mode
fastmcp dev server.py

# Or production
fastmcp run server.py
```

## Claude Desktop Config

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cv-vacancy-matcher": {
      "command": "fastmcp",
      "args": ["run", "/path/to/server.py"],
      "env": {
        "HF_TOKEN": "your_token",
        "RESEND_API_KEY": "your_key"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `zoek_vacatures` | Zoek vacatures op functie/skills |
| `match_kandidaat` | Match kandidaat en genereer rapport |
| `stuur_matching_email` | Stuur matches per email |
| `lijst_vacatures` | Toon alle vacatures |
| `vacature_details` | Details van specifieke vacature |

## Example Usage in Claude

```
User: "Zoek vacatures voor een Ploegleider met lean ervaring"

Claude: [calls zoek_vacatures]
🎯 5 vacatures gevonden voor 'Ploegleider'

1. Ploegleider Productie (93% match)
   🏢 ASML | 📍 Veldhoven
   💰 €55,000-70,000
   ...
```

```
User: "Stuur deze matches naar jan@email.nl"

Claude: [calls stuur_matching_email]
✅ Email verzonden naar jan@email.nl met 10 matches!
```

---
Recruitin B.V. - warts@recruitin.nl
