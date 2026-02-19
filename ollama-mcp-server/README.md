# Ollama MCP Server

Local LLM inference via [Ollama](https://ollama.com) for privacy-sensitive recruitment tasks.

## Setup

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull a model
ollama pull llama3.2

# 3. Install dependencies
cd ollama-mcp-server && npm install

# 4. Add to Claude Desktop config (see claude-desktop-config.example.json)
```

## Tools

| Tool | Beschrijving |
|------|-------------|
| `ollama_generate` | Free-form text generation |
| `ollama_summarize` | Samenvatten van artikelen, CVs, vacatures |
| `ollama_translate` | Vertalen NL <> EN (recruitment terminologie) |
| `ollama_extract_keywords` | Skills/keywords extractie uit CVs en vacatures |
| `ollama_score_match` | Kandidaat-vacature matching score (0-100) |
| `ollama_list_models` | Beschikbare lokale modellen tonen |

## Environment Variables

| Variable | Default | Beschrijving |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API endpoint |
| `OLLAMA_DEFAULT_MODEL` | `llama3.2` | Standaard model |

## Waarom lokaal?

- **Privacy** - CV's en kandidaatdata verlaten je machine niet
- **Kosten** - Geen API costs voor hoog-volume taken
- **Snelheid** - Geen netwerk latency voor kleine taken
- **Offline** - Werkt zonder internetverbinding
