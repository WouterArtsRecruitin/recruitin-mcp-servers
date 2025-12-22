# 🚀 Recruitin MCP Servers Collection

Comprehensive collection of 35+ Model Context Protocol (MCP) servers for recruitment automation, data analysis, and workflow optimization.

## 📋 Table of Contents

- [Overview](#overview)
- [MCP Servers List](#mcp-servers-list)
- [Installation](#installation)
- [Claude Desktop Configuration](#claude-desktop-configuration)
- [Categories](#categories)

## 🎯 Overview

This repository contains all MCP servers used by Recruitin B.V. for:
- Recruitment automation
- Candidate matching
- Market intelligence
- Email automation
- CRM integration
- Data analysis
- Workflow orchestration

## 📦 MCP Servers List

### Core Recruitment Tools (10)
1. **cv-parser** - Parse CVs and extract candidate information
2. **cv-vacancy-matcher** - AI-powered CV to vacancy matching
3. **elite-email-composer** - Intelligent recruitment email generation
4. **vacancy-analysis-agent** - Analyze and optimize job postings
5. **jobboard-monitoring-agent** - Monitor job boards for opportunities
6. **recruitment-orchestrator** - Workflow automation hub
7. **labour-market-intelligence** - Market analysis and insights
8. **technical-industrial-jobs-agent** - Technical job analysis
9. **arnhem-direct-jobs-agent** - Local job market monitoring
10. **dutch-recruitment-news-agent** - Industry news aggregation

### CRM & Sales Tools (5)
11. **pipedrive** - Full Pipedrive CRM integration
12. **pipedrive-bulk-importer** - Bulk import to Pipedrive
13. **recruitin-sales-mcp** - Sales pipeline automation
14. **pipedrive-mcp-server** - Alternative Pipedrive interface
15. **apollo** (via recruitment-orchestrator) - Apollo.io integration

### Communication Tools (7)
16. **email-mcp-server** - Email sending and management
17. **resend-mcp-server** - Resend API integration
18. **slack-mcp-server** - Slack integration
19. **whatsapp-business-mcp-server** - WhatsApp Business API
20. **notion-mcp-server** - Notion workspace integration
21. **email-alternative-mcp** - Alternative email handler
22. **elite-email-composer-mcp** - Advanced email composition

### Intelligence & Analysis (8)
23. **company-insights-agent** - Company research and analysis
24. **competitor-monitoring-agent** - Track competitor activities
25. **prospect-intelligence-agent** - Prospect research automation
26. **salary-benchmark-agent** - Salary data analysis
27. **technical-salary-benchmark-agent** - Tech role salaries
28. **daily-recruitment-news-agent** - Daily news digest
29. **dutch-news-agent-final** - Dutch market news
30. **brave-search-mcp-server** - Web search integration

### Integration & Automation (5)
31. **zapier-mcp-bridge** - Zapier workflow integration
32. **typeform-mcp-server** - Typeform survey integration
33. **jotform-mcp-server** - JotForm integration
34. **airtable-mcp-server** - Airtable database integration
35. **linkedin-mcp-server** - LinkedIn automation

### AI & Data Tools (5)
36. **huggingface-mcp-server** - HuggingFace AI models
37. **google-ai-mcp** - Google AI integration
38. **leonardo-ai-mcp-server** - Leonardo AI for images
39. **leonardo-sdk-mcp-server** - Leonardo SDK interface
40. **memory-mcp-server** - Persistent memory storage

### Developer Tools (3)
41. **figma-mcp-server** - Figma design integration
42. **d3js-mcp-server** - Data visualization
43. **vanilla-js-mcp-server** - Basic JavaScript utilities

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Claude Desktop

### Quick Install
```bash
# Clone the repository
git clone https://github.com/WouterArtsRecruitin/recruitin-mcp-servers.git
cd recruitin-mcp-servers

# Install all dependencies
./install-all.sh
```

### Manual Installation

For specific servers:

**Node.js servers:**
```bash
cd [server-name]
npm install
```

**Python servers:**
```bash
cd [server-name]
pip install -r requirements.txt
```

## ⚙️ Claude Desktop Configuration

1. Copy the example configuration:
```bash
cp claude-desktop-config.example.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

2. Add your API keys:
- `PIPEDRIVE_API_TOKEN`
- `HF_TOKEN` (HuggingFace)
- `RESEND_API_KEY`
- `APOLLO_IO_API_KEY`
- `LEONARDO_API_KEY`

3. Restart Claude Desktop

## 📁 Categories

### 🎯 Recruitment & HR
Tools for candidate sourcing, matching, and assessment

### 💼 Sales & CRM
Pipedrive integration and sales automation

### 📧 Communication
Email, Slack, WhatsApp, and other messaging tools

### 📊 Analytics & Intelligence
Market analysis, competitor monitoring, salary benchmarking

### 🔗 Integrations
Zapier, Typeform, Airtable, and other third-party services

### 🤖 AI & Machine Learning
HuggingFace, Google AI, Leonardo for advanced AI capabilities

### 🛠️ Developer Tools
Figma, D3.js, and utility functions

## 📄 Documentation

Each server has its own README with:
- Feature list
- Installation instructions
- Configuration requirements
- Usage examples
- API documentation

## 🚀 Quick Start Examples

### Parse a CV
```javascript
// Using cv-parser
await parse_cv({
  content: "CV content here...",
  filename: "candidate.pdf"
})
```

### Send an Email
```javascript
// Using resend-mcp-server
await send_email({
  to: ["candidate@email.com"],
  from: "recruiter@company.com",
  subject: "Job Opportunity",
  html: "<p>Email content</p>"
})
```

### Search Companies
```javascript
// Using company-insights-agent
await search_company({
  name: "TechCorp",
  location: "Amsterdam"
})
```

## 🔒 Security

- All API keys stored in environment variables
- No credentials committed to repository
- Secure communication protocols
- Regular security audits

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📝 License

© 2024 Recruitin B.V. - All Rights Reserved

---

**Need help?** Contact: wouter@recruitin.nl