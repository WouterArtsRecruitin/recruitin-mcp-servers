# Wouter Skills Bundle MCP v4

**Complete recruitment automation capabilities for Claude Desktop & Claude Code**

## 📦 What's Included

- **9 Reference Guides** (1000+ pages) - Development, automation, tech-stack, email, agent patterns, prompting, error-handling, explain-code
- **20 Agent Skills** - Orchestrator-worker, routing, supervisor, caching, error recovery, batch processing, and more
- **5 Custom MCP Servers** - Labour market, elite email, Meta ads, recruitment intelligence, JobDigger analyzer
- **5 Production Workflows** - Deal qualification (€23k/mo), cold outreach (€50k+), Meta campaign (€200k+), labour analysis, candidate enrichment

## 🚀 Quick Start

### Installation (One Command)

```bash
npm install
npm run build
```

### Claude Desktop Setup

1. Update `~/.claude/config.json`:
```json
{
  "mcpServers": {
    "wouter-skills-bundle": {
      "command": "node",
      "args": ["/path/to/wouter-skills-bundle/dist/server.js"],
      "environment": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

2. Restart Claude Desktop
3. Go to Settings → Capabilities → Enable "Wouter Skills Bundle v4"

### Claude Code Setup

```bash
claude code --with-mcp wouter-skills-bundle
```

## 🎯 Usage Examples

### In Claude.ai

```
User: "List all my available skills"
Claude: 39 total resources (9 guides, 20 skills, 5 MCPs, 5 workflows)

User: "Show me the implementation roadmap for deal-qualification-v1"
Claude: Step-by-step deployment plan with exact commands

User: "Explain the orchestrator-worker pattern"
Claude: Full explanation with ASCII diagrams and code examples

User: "Find skills related to email automation"
Claude: All matching resources with descriptions
```

## 📚 Reference

### Available Tools

| Tool | Purpose |
|------|---------|
| `list_all_skills` | Discover all 39 resources |
| `get_skill_guide` | Read any of 9 reference guides |
| `get_agent_skill` | Learn any of 20 agent patterns |
| `get_mcp_server_spec` | Get full MCP server specification |
| `get_workflow` | Access any of 5 production workflows |
| `search_skills` | Find resources by keyword |
| `get_implementation_roadmap` | Get step-by-step deployment plan |
| `get_claude_prompt_template` | Get optimized system prompts |

### MCP Servers

1. **Labour Market Intelligence** - Salary data, demand analysis, scarcity scoring
2. **Elite Email** - Campaign management, A/B testing, personalization
3. **Meta Ads** - Campaign creation, audience management, creative optimization
4. **Recruitin Intelligence** - Company analysis, market trends, competitor tracking
5. **JobDigger Analyzer** - Deal scoring, pipeline analysis, revenue forecasting

### Workflows

1. **Deal Qualification** - Score 145 deals in Stage 2 (€23k/month savings)
2. **Cold Outreach** - 3-email sequences to 1000+ companies (€50k+ potential)
3. **Meta Campaign** - 15 audiences, 20 creative variants (€200k+ potential)
4. **Labour Analysis** - Weekly market intelligence (€10k/month ROI)
5. **Candidate Enrichment** - Enrich profiles with Apollo + LinkedIn (€5k/month ROI)

## 🛠️ Development

```bash
npm run build    # Compile TypeScript
npm start        # Run server
npm run dev      # Development mode (auto-reload)
npm run test     # Test in background
npm run stop     # Stop background server
```

## 📋 Project Structure

```
wouter-skills-bundle/
├── src/
│   └── server.ts           # MCP Server source (2500+ lines)
├── dist/
│   └── server.js           # Compiled JavaScript
├── package.json
├── tsconfig.json
├── README.md
└── .github/
    └── workflows/
        └── publish.yml     # Auto-publish on release
```

## 🔐 Environment Variables

Optional (for actual API integration):

```bash
ANTHROPIC_API_KEY=sk-...
APOLLO_API_KEY=...
RESEND_API_KEY=...
SALARY_API_KEY=...
META_API_TOKEN=...
PIPEDRIVE_API_KEY=...
```

## 📖 Documentation

- **SETUP.md** - Complete installation & configuration guide
- **QUICKREF.txt** - One-page quick reference card
- **DEPLOYMENT_CHECKLIST.md** - Auto-generated after setup

## 🧪 Testing

```bash
# Test server starts
npm start
# Should output: "[Wouter Skills Bundle MCP] Server started"

# In Claude.ai
# Ask: "List all my available skills"
# Should get: 39 resources with descriptions
```

## 🚀 Deploy Your First Workflow

Recommended: **Deal Qualification** (2-4 hours)

```
In Claude: "Show me implementation roadmap for deal-qualification-v1"

Claude provides:
1. Setup steps (APIs, configuration)
2. Test data
3. Validation criteria
4. Go-live checklist
```

Expected ROI: €519k unlocked (deals stuck in Stage 2)

## 📊 Status

✅ Production Ready
✅ Tested with Claude 3.5 Sonnet & Opus
✅ Compatible with Claude Desktop & Claude Code
✅ All 39 resources embedded & ready

## 📝 License

MIT - Use freely for Recruitin B.V. internal use and Claude integration

## 👤 Author

Wouter Arts  
Recruitin B.V.  
wouter@recruitin.nl

## 🆘 Support

1. Check README.md in root
2. Review SETUP.md for detailed instructions
3. Check QUICKREF.txt for command reference
4. Test server: `npm start`

## 🔄 Version History

- **4.0.0** (2026-01-24) - Complete bundle with all 39 resources, production ready
- **3.5.0** (2026-01-23) - Added JobDigger analyzer MCP
- **3.0.0** (2026-01-15) - Added 5 production workflows

---

**Last Updated:** 2026-01-24  
**Node Version:** 18+  
**MCP SDK:** 1.2+
