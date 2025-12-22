# CV Parser MCP Server

Parse CVs en match tegen JobDigger vacatures met HuggingFace semantic matching.

## Tools

| Tool | Functie |
|------|---------|
| `parse_cv` | Extract naam, email, telefoon, locatie, functie, skills uit CV tekst |
| `match_cv_to_vacancies` | Match CV tegen lijst vacatures, return TIER1/2/3 scores |
| `semantic_match` | HuggingFace API similarity tussen twee teksten |
| `extract_skills` | Skill analyse met scores per categorie |

## Installatie

```bash
cd mcp-servers/cv-parser
pip install -r requirements.txt
```

## Claude Desktop Config

```json
{
  "mcpServers": {
    "cv_parser": {
      "command": "python3",
      "args": ["/path/to/recruitin-automation/mcp-servers/cv-parser/server.py"],
      "env": {
        "HF_TOKEN": "your-huggingface-token"
      }
    }
  }
}
```

## Gebruik

```python
# Parse CV
result = await parse_cv({"cv_text": "Jan Peters\nElektromonteur\nArnhem..."})

# Match tegen vacatures
result = await match_cv_to_vacancies({
    "cv_text": cv_text,
    "vacatures": [{"vacature": "Elektromonteur", "bedrijf": "X", "plaats": "Arnhem"}],
    "limit": 10
})
```

## Taxonomie

**Functies:** elektromonteur, servicemonteur, werkvoorbereider, projectleider, monteur, engineer, operator, lasser, cnc, plc

**Skills:** elektro, mechanisch, lassen, plc, service, projecten, proces, technisch_tekenen

**Regio's:** Gelderland (95%), Adjacent (80%), Randstad (60%)
