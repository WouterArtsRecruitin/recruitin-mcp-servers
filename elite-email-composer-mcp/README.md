# Elite Email Composer MCP Server 🚀

A **next-generation** Model Context Protocol (MCP) server for professional email composition using advanced copywriting frameworks and sector intelligence. This server delivers the quality of expert copywriters with the speed and consistency of AI.

## 🎯 Advanced Features

### **Professional Copywriting Frameworks**
- **Problem-Solution Framework**: Perfect for companies with clear pain points
- **PAS (Problem-Agitate-Solution)**: Ideal for urgent situations requiring immediate action  
- **AIDA (Attention-Interest-Desire-Action)**: Best for general interest and awareness building
- **Value-First**: Optimal for risk-averse decision makers and first contact

### **Sector Intelligence Database**
- **Manufacturing**: Technical recruitment challenges, vacancy data, ROI metrics
- **Technology**: Developer hiring complexities, market statistics, cost analysis
- **Auto-Detection**: Framework selection based on context and goals

### **A/B/C Testing Generation**
- Generate 3 variants using different frameworks
- Effectiveness scoring algorithm (up to 95%)
- Testing recommendations and comparison analysis
- Optimal variant selection based on goals

### **Advanced Personalization**
- Company-specific messaging and pain point targeting
- Sector data integration (CBS, UWV statistics)
- ROI calculations and performance predictions
- Follow-up strategy recommendations

## 📧 Example Output Quality

**Input:**
```
Subject: RPO Partnership
Context: Meeting request for HRM at Philips  
Company: Philips
Sector: manufacturing
Goal: meeting request
Language: nl
```

**Output:**
```
✅ Nederlandse email gegenereerd (Problem-Solution framework)
✅ Gepersonaliseerd voor Philips manufacturing (confidence: 92%)
✅ Sector data geïntegreerd (40% meer vacatures techniek)
✅ ROI metrics toegevoegd (-30% kortere time-to-hire)
✅ Follow-up strategie inclusief
✅ Effectiveness score: 89%

Expected: 42% open rate, 9% reply rate 🚀
```

## 🛠 Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## 🔧 Development

```bash
# Watch mode for development
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## 🎛 Available Tools

### **Core Email Generation**
- `compose_email` - **Advanced email generation** with copywriting frameworks
- `generate_email_variants` - **A/B/C test variants** with effectiveness scoring
- `create_template` - Create reusable email templates with variables
- `format_email` - Auto-format email content with professional styling

### **Email Intelligence**
- `analyze_email` - **Deep analysis** (tone, clarity, professionalism, engagement)
- `translate_email` - Multi-language translation (EN, NL, DE, FR, ES)
- `email_performance` - **Performance metrics** and industry benchmarking

### **Template Management**
- `list_templates` - Browse all available templates (5+ built-in)
- `get_template` - Retrieve and customize specific templates

## 📊 Compose Email Parameters

```typescript
{
  subject: string;           // Email subject line
  context: string;           // Purpose/context (REQUIRED)
  recipient?: string;        // Recipient name
  company?: string;          // Target company (enables personalization)
  sector?: string;           // Industry sector (manufacturing, technology)
  goal?: string;             // Specific goal (meeting request, demo, etc)
  framework?: string;        // PAS, AIDA, Problem-Solution, Value-First
  language?: string;         // en, nl, de, fr, es (default: en)
  tone?: string;            // professional, friendly, formal, urgent
}
```

## 🎯 Usage Examples

### **Dutch Manufacturing Cold Email**
```json
{
  "subject": "RPO Partnership Philips",
  "context": "Recruitment process outsourcing for technical roles",
  "company": "Philips",
  "sector": "manufacturing", 
  "goal": "meeting request",
  "language": "nl"
}
```

### **Tech Company A/B Testing**
```json
{
  "name": "generate_email_variants",
  "arguments": {
    "subject": "Developer Hiring Solution",
    "context": "Solving tech talent shortage",
    "sector": "technology",
    "company": "TechStartup",
    "goal": "product demo"
  }
}
```

### **Email Analysis & Optimization**
```json
{
  "name": "analyze_email",
  "arguments": {
    "content": "Your email content here...",
    "metrics": ["tone", "clarity", "professionalism", "engagement"]
  }
}
```

## 🔗 Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "elite-email-composer": {
      "command": "node",
      "args": ["/Users/yourusername/mcp-servers/elite-email-composer-mcp/dist/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your-key-here"
      }
    }
  }
}
```

## 🧠 Copywriting Intelligence

### **Framework Auto-Detection**
- **Problem/Challenge** keywords → Problem-Solution framework
- **Meeting/Call** keywords → Value-First framework  
- **Urgent/Immediate** keywords → PAS framework
- **General interest** → AIDA framework (default)

### **Sector Intelligence**
- **Manufacturing**: Recruitment capacity, time-to-hire (10-16 weeks), technical expertise shortage
- **Technology**: Developer scarcity, remote hiring challenges, salary inflation
- **Statistics Integration**: CBS data, UWV reports, industry benchmarks

### **ROI Calculations**
- Automatic cost-benefit analysis
- Time-to-hire improvements (-30% to -50%)
- Recruitment cost reductions
- Performance benchmarking vs industry averages

## 📈 Performance Features

- **Effectiveness Scoring**: Algorithm evaluates emails up to 95% effectiveness
- **Open Rate Predictions**: 35-45% typical for well-optimized emails
- **Reply Rate Forecasting**: 8-12% for sector-targeted messages
- **A/B Testing Guidance**: Statistical recommendations for variant testing

## 🎨 Output Formats

### **Standard Email**
```
Subject: [Optimized subject line]
Content: [Framework-based email with sector data]
Effectiveness Score: 89%
ROI Prediction: Expected 42% open, 9% reply
Follow-up Strategy: [3-step sequence]
```

### **A/B/C Variants**
```
Variant A (Problem-Solution): 87% effectiveness
Variant B (Value-First): 91% effectiveness  
Variant C (AIDA): 84% effectiveness

Recommended: Variant B for risk-averse prospects
Testing Advice: A vs B first round, winner vs C second round
```

## 🚀 Next-Level Features

- **Smart Personalization**: Company research integration
- **Follow-up Automation**: 3-step sequence generation
- **Performance Tracking**: Real-time effectiveness monitoring
- **Industry Updates**: Dynamic sector data integration
- **Multi-variant Testing**: Professional A/B/C generation

## 📄 License

MIT License - Built for professional recruitment and business development teams.

---

**Ready to generate emails that convert?** 
Add this MCP server to Claude Desktop and experience copywriting at the level of industry experts! 🎯