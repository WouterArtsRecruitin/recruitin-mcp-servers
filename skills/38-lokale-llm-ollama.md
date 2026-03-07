# 38 — Lokale LLM & Ollama

## Doel
Lokale AI modellen draaien zonder API kosten voor intern gebruik, testing, training data generatie en privacy-gevoelige taken.

## Wanneer activeren
Triggers: Ollama, lokaal model, lokale LLM, DeepSeek lokaal, open source model, gratis AI, geen API kosten, Qwen, Kimi, local AI, privacy model, offline AI, model lokaal draaien

## Repos
- Ollama fork: WouterArtsRecruitin/ollama (Kimi-K2.5, DeepSeek, Qwen, Gemma)
- Clawdbot: WouterArtsRecruitin/clawdbot (persoonlijke AI assistent)
- MCP server: WouterArtsRecruitin/recruitin-mcp-servers/ollama-mcp-server

## Installatie Ollama
curl -fsSL https://ollama.com/install.sh | sh

Modellen installeren:
ollama pull deepseek-r1:8b
ollama pull qwen2.5:7b
ollama pull llama3.2:3b

## Aanbevolen modellen per use case

deepseek-r1:8b (4.7GB): Redeneren en analyse
qwen2.5:7b (4.4GB): Algemeen gebruik, goede NL taal
llama3.2:3b (2GB): Snelle taken, lage latency
Kimi-K2.5 (variabel): Lange context documenten

## Ollama MCP server integratie
Via recruitin-mcp-servers/ollama-mcp-server:
- Claude Desktop kan lokale modellen aanroepen
- Gebruik voor data die niet naar Anthropic mag
- GDPR-gevoelige kandidaatdata verwerking
- Kostenloze bulk verwerking

## Clawdbot
Persoonlijke AI assistent op elk OS/platform:
- Cross-platform Windows, Mac, Linux
- Lokale Ollama integratie
- Eenvoudige chat interface
- Geschikt voor snelle queries zonder Claude.ai sessie

## Use cases lokale LLM Recruitin
1. Kandidaatdata privacy via GDPR zonder cloud
2. Training data generatie voor boolean matcher
3. Bulk verwerking van goedkope routinetaken
4. Offline demonstraties bij klanten
5. Nieuwe prompts testen voor productie

## Kosten vergelijking
- Claude API: ongeveer 0.003 euro per 1k tokens
- Ollama lokaal: 0 euro alleen stroom
- Break-even: meer dan 100k tokens per dag

## Combinaties
- Met 01-development: Claude Code plus Ollama vergelijking
- Met 23-prompt-library: prompts lokaal testen
- Met 32-boolean-search: training data genereren
- Met 24-claude-ai-configs: Ollama in MCP desktop config
