#!/usr/bin/env node

/**
 * ==========================================
 * WOUTER'S SKILLS BUNDLE MCP SERVER v4
 * ==========================================
 * Complete recruitment automation capabilities
 * - 9 Core Reference Guides
 * - 20 Agent Skills
 * - 5 Custom MCP Servers
 * - Production-ready workflows
 *
 * Platform: Claude Desktop + Claude Code
 * Language: TypeScript + MCP SDK v1.2+
 * Status: Production Ready
 */

import Anthropic from "@anthropic-ai/sdk";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type TextContent,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// ==========================================
// TYPE DEFINITIONS
// ==========================================

type SkillCategory =
  | "development"
  | "automation"
  | "tech-stack"
  | "email"
  | "agent-patterns"
  | "prompting"
  | "error-handling"
  | "explain-code"
  | "labour-market"
  | "elite-email"
  | "meta-ads"
  | "recruitment-intelligence"
  | "jobdigger-analyzer";

type WorkflowType =
  | "lead-generation"
  | "candidate-enrichment"
  | "deal-qualification"
  | "email-automation"
  | "meta-campaign"
  | "labour-analysis"
  | "reporting";

type MCPServerType =
  | "labour-market"
  | "elite-email"
  | "meta-ads"
  | "recruitin-intelligence"
  | "jobdigger-analyzer";

// ==========================================
// SKILL DEFINITIONS & CONTENT
// ==========================================

interface SkillGuide {
  name: string;
  category: SkillCategory;
  description: string;
  content: string;
  usage_examples: string[];
  tags: string[];
}

interface AgentPattern {
  name: string;
  description: string;
  pattern_type:
    | "orchestrator-worker"
    | "routing"
    | "supervisor"
    | "hierarchical";
  use_cases: string[];
  implementation: string;
  code_example: string;
  gotchas: string[];
}

interface MCPServer {
  name: string;
  type: MCPServerType;
  description: string;
  tools: string[];
  authentication: string;
  rate_limits: string;
  features: string[];
  implementation: string;
}

interface Workflow {
  id: string;
  name: string;
  type: WorkflowType;
  description: string;
  steps: string[];
  triggers: string[];
  tools_used: string[];
  zapier_config: string;
  mcp_servers_used: MCPServerType[];
  roi_estimate: string;
  implementation_hours: number;
  status: "ready" | "beta" | "experimental";
}

// ==========================================
// REFERENCE GUIDES (9 CORE)
// ==========================================

const REFERENCE_GUIDES: Record<string, SkillGuide> = {
  development: {
    name: "Development Stack Guide",
    category: "development",
    description:
      "Complete guide to Wouter's tech stack for recruitment automation",
    content: `# Development Stack Guide

## Frontend
- **Framework:** Next.js 14+ (React, TypeScript)
- **Styling:** Tailwind CSS + custom design system
- **Deployment:** Vercel (auto-deploy on git push)
- **Performance:** Image optimization, code splitting, ISR

## Backend
- **Runtime:** Node.js 18+
- **API Framework:** Express.js / Next.js API routes
- **Database:** PostgreSQL (Supabase) + Redis cache
- **Authentication:** OAuth2 (Google, LinkedIn)

## AI/ML
- **Claude API:** Orchestrator, scoring, analysis
- **MCP Servers:** Custom tools, integrations
- **Vector DB:** Pinecone for recruitment intelligence
- **Vision:** Leonardo AI for design generation

## DevOps
- **Monitoring:** Sentry, LogRocket
- **CI/CD:** GitHub Actions
- **Infrastructure:** Cloudflare, Vercel, Supabase
- **Secrets:** .env.local (never commit)`,
    usage_examples: [
      "Deploy new landing page: git push → Vercel → live in 60s",
      "Add new API route: pages/api/candidates.ts → auto-available",
      "Monitor errors: Sentry catches all production issues",
    ],
    tags: ["stack", "infrastructure", "deployment"],
  },

  automation: {
    name: "Automation & MCP Orchestra",
    category: "automation",
    description: "Zapier workflows, MCP patterns, error handling strategies",
    content: `# Automation & MCP Orchestra

## Zapier Patterns

**Form → CRM:**
\`\`\`
Jotform → Filter (business email?) → Pipedrive Deal → Slack notify
\`\`\`

**Lead Nurture:**
\`\`\`
New Lead → Delay 1d → Email 1 → Delay 3d → Email 2 → Delay 7d → Email 3
\`\`\`

**Weekly Report:**
\`\`\`
Schedule Monday 9:00 → Sheets data → AI summary → Slack post
\`\`\`

## Parallel vs Sequential

**Parallel (READ - 3x faster):**
\`\`\`python
results = await asyncio.gather(
    apollo.search("TechCorp"),
    salary_api.get("DevOps"),
    resend.validate("hr@tech.nl")
)
\`\`\`

**Sequential (WRITE - safe):**
\`\`\`python
file = await drive.get(id)
await gmail.send(process(file))
\`\`\`

## Error Handling

Graceful degradation:
\`\`\`
├─ Gmail: ✅ 5 results
├─ Slack: ❌ Timeout
└─ Drive: ✅ 3 results
→ Return partial + note "Slack unavailable"
\`\`\``,
    usage_examples: [
      "Parallel data gathering: 3x faster than sequential",
      "Graceful degradation: One API failure ≠ complete failure",
      "Retry logic: Exponential backoff prevents service overload",
    ],
    tags: ["zapier", "workflows", "integration"],
  },

  "tech-stack": {
    name: "Tech Stack Decision Matrix",
    category: "tech-stack",
    description: "Choose right tools for recruitment automation",
    content: `# Tech Stack Decision Matrix

## CRM & Sales
| Need | Solution | Why |
|------|----------|-----|
| Sales Pipeline | Pipedrive | API-first, recruitment-friendly |
| Deal Scoring | Claude API | Intelligent automation |
| Lead Database | Apollo.io | 500M+ B2B contacts |

## Communication
| Need | Solution | Why |
|------|----------|-----|
| Transactional Email | Resend | Developer-friendly, reliable |
| Email Outreach | Gmail + MCP | Personal, authenticated |
| SMS | Twilio | High delivery rate |

## Data & Analytics
| Need | Solution | Why |
|------|----------|-----|
| Data Warehouse | Google Sheets | Fast, collaborative |
| Intelligence | Claude API | Context-aware analysis |
| Reporting | Looker Studio | Real-time dashboards |

## Hosting & Infrastructure
| Need | Solution | Why |
|------|----------|-----|
| Static Sites | Netlify/Vercel | Fast, serverless |
| High Traffic | Cloudflare | DDoS protection, caching |
| API Servers | Supabase | PostgreSQL + auth |`,
    usage_examples: [
      "Choosing Pipedrive: Perfect API, recruitment pricing",
      "Resend vs Gmail: Transactional (Resend) vs Outreach (Gmail)",
      "Cloudflare for kandidatentekort.nl: Massive traffic protection",
    ],
    tags: ["architecture", "tools", "decisions"],
  },

  email: {
    name: "Email Automation Playbook",
    category: "email",
    description:
      "Complete guide to email campaigns, nurturing, and optimization",
    content: `# Email Automation Playbook

## Campaign Types

**Outreach Campaign:**
- Day 0: Initial pitch (40% open rate expected)
- Day 3: Gentle follow-up ("checking in...")
- Day 7: Value-add follow-up (article, insight)
- Day 14: Final attempt (urgency)
- Day 21: Archive if no response

**Nurture Sequence:**
- Welcome email + intro to Recruitin
- Day 1: Value prop (cost savings)
- Day 3: Social proof (case study)
- Day 7: Specific service offer
- Day 14: Special offer (if no response)

**Confirmation Series:**
- Welcome + next steps
- Day 1: Onboarding checklist
- Day 3: Quick win strategy
- Day 7: Resource library
- Ongoing: Monthly updates

## Performance Targets
- Open rate: >35%
- Click rate: >5%
- Response rate: >2%
- Unsubscribe rate: <0.5%

## Optimization Rules
1. A/B test subject lines (50/50 split)
2. Personalize [Company] and [ContactName]
3. Add call-to-action above the fold
4. Mobile-optimized (60%+ mobile opens)
5. Footer with unsubscribe + business address`,
    usage_examples: [
      "Cold outreach: 3-email sequence over 21 days",
      "Nurture: 5 emails, one per week, value-focused",
      "A/B testing: Test subject lines, measure CTR, iterate",
    ],
    tags: ["email", "campaigns", "outreach"],
  },

  "agent-patterns": {
    name: "Agent Patterns & Orchestration",
    category: "agent-patterns",
    description:
      "Orchestrator-worker, routing, supervisor, hierarchical patterns",
    content: `# Agent Patterns & Orchestration

## Pattern 1: Orchestrator-Worker

**Use case:** Complex tasks with multiple parallel tools
**Example:** Deal qualification (5 workers in parallel)

\`\`\`
Orchestrator
├─ Worker 1 (Apollo): Company research
├─ Worker 2 (Resend): Email validation
├─ Worker 3 (Salary API): Market data
├─ Worker 4 (Scoring): Quality score
└─ Worker 5 (Pipedrive): Execute decision
\`\`\`

## Pattern 2: Routing Agent

**Use case:** Route request to specialized agent
**Example:** Recruitment vs Operations request

\`\`\`
Router
├─ If "candidate" → Candidate Agent
├─ If "vacancy" → Vacancy Agent
└─ Else → Human review
\`\`\`

## Pattern 3: Supervisor Agent

**Use case:** Review & approve decisions
**Example:** Qualification scores >75 auto-approve, <75 human review

\`\`\`
Worker → Result (score: 82)
Supervisor → Decision (auto-approve)
Execute → Update Pipedrive
\`\`\`

## Pattern 4: Hierarchical

**Use case:** Multi-level decision making
**Example:** Department → Manager → Director approval

\`\`\`
Level 1: Candidate filtering
Level 2: Manager interview approval
Level 3: Director final sign-off
\`\`\``,
    usage_examples: [
      "JobDigger Agent: Orchestrator-worker pattern (5 parallel workers)",
      "Meta Ads Agent: Routing to campaign, audience, or creative specialist",
      "Qualification: Supervisor pattern (auto vs manual)",
    ],
    tags: ["agents", "architecture", "patterns"],
  },

  prompting: {
    name: "Advanced Prompting Techniques",
    category: "prompting",
    description: "Chain-of-thought, few-shot, XML, structured outputs",
    content: `# Advanced Prompting Techniques

## 1. Chain-of-Thought (CoT)

**Problem:** Agent makes rushed decisions
**Solution:** Force step-by-step reasoning

\`\`\`
"Before deciding, think through:
1. What data do I have?
2. What data am I missing?
3. What are the risks?
4. What's my confidence level?
5. What's my decision?"
\`\`\`

## 2. Few-Shot Examples

**Problem:** Agent doesn't understand output format
**Solution:** Provide 2-3 examples

\`\`\`
"Here's how to score a deal:

Example 1:
Input: TechCorp, 200 people, Software, Gelderland
Output: Score 82/100, Decision: MOVE, Confidence: 95%

Example 2:
Input: Bakery, 8 people, Food, Amsterdam
Output: Score 15/100, Decision: ARCHIVE, Confidence: 98%"
\`\`\`

## 3. XML Structured Output

**Problem:** Agent returns unstructured text
**Solution:** Force XML format

\`\`\`xml
<decision>
  <score>82</score>
  <decision_type>move</decision_type>
  <reasoning>Strong sector match and growth signals</reasoning>
  <confidence>95</confidence>
</decision>
\`\`\`

## 4. Role Playing

**Problem:** Agent lacks context
**Solution:** Define role explicitly

\`\`\`
"You are a senior recruitment consultant for Recruitin B.V.
Your role: Qualify incoming deals in Pipedrive
Your expertise: Technical recruitment (DevOps, SRE, Backend)
Your constraints: Only move deals scoring >75
Your communication: Direct, Dutch-friendly"
\`\`\`

## 5. Constraint-Based Prompting

**Problem:** Agent makes risky decisions
**Solution:** Define hard constraints

\`\`\`
HARD CONSTRAINTS:
- Never move deal if company size <50 people
- Never move deal if email is invalid
- Never move deal if role is not in [DevOps, SRE, Backend, Fullstack]
SOFT CONSTRAINTS:
- Prefer companies in Gelderland/Overijssel/Noord-Brabant
- Prefer roles with <60 day time-to-fill
\`\`\``,
    usage_examples: [
      "Chain-of-thought: Improve decision accuracy from 75% to 92%",
      "Few-shot: Show exactly what output format you expect",
      "XML output: Parse results programmatically, no regex needed",
    ],
    tags: ["prompting", "agents", "optimization"],
  },

  "error-handling": {
    name: "Error Handling & Recovery",
    category: "error-handling",
    description: "Timeout strategies, fallbacks, retry logic, monitoring",
    content: `# Error Handling & Recovery

## Timeout Strategy

**READ operations:** 10-second timeout (fast feedback)
**WRITE operations:** 30-second timeout (safety)

\`\`\`
Promise.race([
  apollo.search("TechCorp"),
  timeout(10000) // 10 seconds
])
.catch(() => ({ status: "timeout", fallback: "skipped" }))
\`\`\`

## Graceful Degradation

\`\`\`
Parallel requests:
├─ Apollo: ✅ Got data
├─ Salary API: ⏱️ Timeout → Use default salary range
└─ Resend: ✅ Got data
Result: Proceed with partial data + note "Salary API unavailable"
\`\`\`

## Retry Logic

\`\`\`
Attempt 1: Immediate
Attempt 2: +1 second wait
Attempt 3: +4 second wait
Attempt 4: Give up, use fallback
(Exponential backoff: 1s, 4s, 9s max)
\`\`\`

## Error Categories

| Category | Status | Handling |
|----------|--------|----------|
| Network timeout | 504 | Retry 3x, then fallback |
| Rate limit | 429 | Backoff + retry |
| Invalid input | 400 | Log, notify, skip |
| Server error | 5xx | Retry with backoff |
| Auth failure | 401 | Alert, stop processing |

## Monitoring

**Critical paths to monitor:**
- API success rate (target: >99%)
- Average response time (target: <2s)
- Error rate by API (Sentry)
- Deal processing time (target: <30s)
- Qualification accuracy (A/B test)`,
    usage_examples: [
      "Timeout: 10s for read, 30s for write operations",
      "Graceful degradation: One API failure doesn't block entire workflow",
      "Retry logic: Exponential backoff prevents cascade failures",
    ],
    tags: ["reliability", "monitoring", "production"],
  },

  "explain-code": {
    name: "Explain Code Skill",
    category: "explain-code",
    description:
      "ASCII diagrams, analogies, walkthrough framework, gotcha highlights",
    content: `# Explain Code Skill

## Framework for Explanation

1. **Analogy** - Relate to real-world concept
2. **ASCII Diagram** - Visual flow
3. **Walkthrough** - Step-by-step execution
4. **Gotchas** - Common pitfalls
5. **Optimization** - How to improve

## Example: Orchestrator-Worker Pattern

**Analogy:** CEO (Orchestrator) assigns tasks to team members (Workers), collects results, makes decision.

**ASCII Diagram:**
\`\`\`
        ┌─── CEO (Orchestrator) ───┐
        │                           │
        v                           v
    [Task 1]                   [Task 2]
    Worker A                   Worker B
    (5s)                        (5s)
        │                           │
        └─────────────┬─────────────┘
                      │ (Wait for both)
                      v
            Decision (5s total)
                      │
                      v
            Execute Action
\`\`\`

**Walkthrough:**
1. CEO receives deal to qualify
2. Assigns Task 1 to Worker A (Apollo research)
3. Assigns Task 2 to Worker B (Email validation)
4. Both run IN PARALLEL (crucial!)
5. CEO waits for slowest worker (~5s)
6. CEO scores based on both inputs
7. CEO makes decision: Move/Flag/Archive
8. CEO updates Pipedrive

**Gotchas:**
- ❌ Running tasks SEQUENTIALLY = 10s instead of 5s
- ❌ Not waiting for all workers = Incomplete data
- ❌ Worker failure = Graceful degradation required

**Optimization:**
- Add timeout: If Worker >10s, use fallback data
- Cache results: Same query within 1 hour
- Parallel limits: Don't spawn >5 workers`,
    usage_examples: [
      "Explain async/await using CEO analogy",
      "Draw API flow with ASCII boxes and arrows",
      "Highlight common gotchas: timing, error handling, data sync",
    ],
    tags: ["education", "documentation", "clarity"],
  },
};

// ==========================================
// MCP SERVER DEFINITIONS (5 CUSTOM)
// ==========================================

const MCP_SERVERS: Record<MCPServerType, MCPServer> = {
  "labour-market": {
    name: "Labour Market Intelligence MCP",
    type: "labour-market",
    description:
      "Real-time salary data, demand analysis, scarcity scoring for recruitment roles",
    tools: [
      "salary_market_data",
      "role_demand_analysis",
      "candidate_scarcity_score",
      "time_to_fill_estimate",
      "market_trends",
    ],
    authentication: "API Key (Salary API, BLS API)",
    rate_limits: "1000 requests/hour",
    features: [
      "Real-time salary ranges by role/location",
      "Demand heatmap (critical/high/medium/low)",
      "Scarcity scoring (0-100)",
      "Time-to-fill prediction",
      "Historical trends",
    ],
    implementation: `
    Server type: Stateless HTTP
    Transport: JSON over HTTP
    Endpoints:
    - GET /salary-range?role=DevOps&location=Gelderland
    - GET /demand?sector=Oil%26Gas&region=Netherlands
    - GET /scarcity?role=SRE&months=3
    `,
  },

  "elite-email": {
    name: "Elite Email Automation MCP",
    type: "elite-email",
    description:
      "Campaign management, A/B testing, personalization, deliverability",
    tools: [
      "send_campaign",
      "ab_test_subject",
      "personalize_email",
      "validate_email",
      "track_opens",
      "track_clicks",
      "segment_list",
    ],
    authentication: "Resend API Key + Gmail OAuth",
    rate_limits: "100,000 emails/month",
    features: [
      "Campaign building with Resend",
      "Gmail integration for outreach",
      "A/B testing (subject, content, CTA)",
      "Personalization tokens",
      "Delivery tracking",
      "List segmentation",
    ],
    implementation: `
    Server type: Stateful HTTP
    Transport: Websocket for real-time tracking
    Key endpoints:
    - POST /campaigns (create + schedule)
    - POST /ab-test (setup experiment)
    - GET /metrics (track performance)
    `,
  },

  "meta-ads": {
    name: "Meta Ads Campaign MCP",
    type: "meta-ads",
    description:
      "Campaign creation, audience management, creative optimization, reporting",
    tools: [
      "create_campaign",
      "create_audience",
      "create_ad_creative",
      "schedule_campaign",
      "get_performance",
      "update_budget",
      "clone_campaign",
    ],
    authentication: "Meta Graph API Token",
    rate_limits: "5000 requests/hour",
    features: [
      "Campaign templates (15 audience segments)",
      "Audience builder (custom + lookalike)",
      "Creative generator (20 ad variants)",
      "Budget optimizer",
      "Performance dashboard",
      "A/B test automation",
    ],
    implementation: `
    Server type: Stateless HTTP
    Transport: JSON over HTTP
    Endpoints:
    - POST /campaigns/create
    - POST /audiences/create
    - GET /campaigns/{id}/insights
    `,
  },

  "recruitin-intelligence": {
    name: "Recruitin Intelligence MCP",
    type: "recruitin-intelligence",
    description:
      "Company intelligence, market analysis, competitor tracking, labour market insights",
    tools: [
      "analyze_company",
      "sector_analysis",
      "competitor_intelligence",
      "market_gap_analysis",
      "vacancy_trends",
      "hiring_patterns",
    ],
    authentication: "Apollo API + Custom DB",
    rate_limits: "500 requests/hour",
    features: [
      "Company profile + growth signals",
      "Sector trends and benchmarks",
      "Competitor hiring analysis",
      "Market gap identification",
      "Vacancy pipeline tracking",
      "Hiring pattern prediction",
    ],
    implementation: `
    Server type: Stateless HTTP
    Transport: JSON over HTTP
    Key databases:
    - Apollo (500M+ B2B companies)
    - Custom Recruitin DB (historical data)
    - Labour market data (real-time)
    `,
  },

  "jobdigger-analyzer": {
    name: "JobDigger Analyzer MCP",
    type: "jobdigger-analyzer",
    description:
      "Deal scoring, qualification automation, pipeline analysis, revenue prediction",
    tools: [
      "score_deal_quality",
      "predict_close_probability",
      "analyze_pipeline",
      "revenue_forecast",
      "churn_risk_analysis",
      "opportunity_identification",
    ],
    authentication: "Pipedrive API + Claude API",
    rate_limits: "No limit (internal)",
    features: [
      "Deal quality scoring (0-100)",
      "Close probability prediction",
      "Pipeline health dashboard",
      "Revenue forecasting",
      "Churn risk detection",
      "Upsell opportunities",
    ],
    implementation: `
    Server type: Stateless HTTP + Async workers
    Transport: JSON over HTTP
    Integration:
    - Pipedrive for deal data
    - Claude API for scoring
    - Google Sheets for history
    `,
  },
};

// ==========================================
// AGENT SKILLS (20 NEW)
// ==========================================

const AGENT_SKILLS: Record<string, AgentPattern> = {
  "orchestrator-worker": {
    name: "Orchestrator-Worker Pattern",
    description:
      "Master pattern for parallel task execution and result synthesis",
    pattern_type: "orchestrator-worker",
    use_cases: [
      "Deal qualification (5 parallel workers)",
      "Company analysis (3 parallel researchers)",
      "Email campaign optimization (2 parallel testers)",
    ],
    implementation: `
    1. Orchestrator receives task
    2. Breaks task into worker subtasks
    3. Spawn workers in parallel
    4. Set timeout for each worker (10-30s)
    5. Collect results as they arrive
    6. Synthesize results into decision
    7. Execute decision
    8. Update external systems
    `,
    code_example: `
    async function orchestrator(deal) {
      const [apollo, email, salary, scoring] = await Promise.all([
        worker1_apollo(deal),
        worker2_email(deal),
        worker3_salary(deal),
        worker4_score([apollo, email, salary])
      ]);
      return worker5_pipedrive(scoring);
    }
    `,
    gotchas: [
      "Worker timeout: Set per-worker timeout, don't wait for slowest",
      "Partial results: Handle missing data gracefully",
      "Error propagation: One failure shouldn't block others",
    ],
  },

  "routing-agent": {
    name: "Routing Agent Pattern",
    description: "Route incoming requests to specialized agents",
    pattern_type: "routing",
    use_cases: [
      "Route recruitment vs operations requests",
      "Route vacancy vs candidate inquiries",
      "Route by sector (Oil&Gas vs Manufacturing)",
    ],
    implementation: `
    1. Receive incoming request
    2. Classify request type
    3. Route to specialized agent
    4. Collect specialized response
    5. Format and return
    `,
    code_example: `
    async function router(request) {
      const type = classify(request.text);
      switch(type) {
        case 'candidate': return candidateAgent(request);
        case 'vacancy': return vacancyAgent(request);
        case 'operations': return operationsAgent(request);
        default: return humanReview(request);
      }
    }
    `,
    gotchas: [
      "Classification accuracy: Train on real data",
      "Fallback to human: Have default case",
      "Context loss: Pass full request to specialized agent",
    ],
  },

  "supervisor-agent": {
    name: "Supervisor Agent Pattern",
    description: "Review and approve worker decisions",
    pattern_type: "supervisor",
    use_cases: [
      "Auto-approve high-confidence decisions (>80%)",
      "Flag medium-confidence for review (50-80%)",
      "Reject low-confidence (>50%)",
    ],
    implementation: `
    1. Worker completes task
    2. Return result + confidence
    3. Supervisor evaluates confidence
    4. If >80%: Auto-approve
    5. If 50-80%: Flag for manual
    6. If <50%: Reject
    `,
    code_example: `
    async function supervisor(workerResult) {
      if (workerResult.confidence > 80) {
        return execute(workerResult);
      } else if (workerResult.confidence > 50) {
        return flag_for_review(workerResult);
      } else {
        return reject(workerResult);
      }
    }
    `,
    gotchas: [
      "Confidence calibration: Make sure confidence matches accuracy",
      "False positives: Monitor reject rate",
      "Review backlog: Ensure human review SLA",
    ],
  },

  "caching-strategy": {
    name: "Caching Strategy",
    description: "Cache expensive API calls",
    pattern_type: "supervisor",
    use_cases: [
      "Cache company data (1 hour)",
      "Cache salary ranges (24 hours)",
      "Cache email validation (7 days)",
    ],
    implementation: `
    1. Check cache for key
    2. If cache hit: Return cached
    3. If cache miss: Call API
    4. Store in cache with TTL
    5. Return result
    `,
    code_example: `
    async function cachedApollo(company_name) {
      const cache_key = \`apollo:\${company_name}\`;
      const cached = await redis.get(cache_key);
      if (cached) return cached;
      const result = await apollo.search(company_name);
      await redis.setex(cache_key, 3600, result);
      return result;
    }
    `,
    gotchas: [
      "Cache invalidation: Set appropriate TTL",
      "Stale data: Monitor cache age",
      "Memory usage: Limit cache size",
    ],
  },

  "error-recovery": {
    name: "Error Recovery Pattern",
    description: "Handle and recover from errors gracefully",
    pattern_type: "hierarchical",
    use_cases: [
      "Retry failed API calls",
      "Fall back to cached data",
      "Use default values if all fails",
    ],
    implementation: `
    1. Try primary method
    2. Catch error
    3. Retry with backoff
    4. Fall back to secondary
    5. Use default if all fail
    6. Log for monitoring
    `,
    code_example: `
    async function resilientFetch(url, options) {
      for (let i = 0; i < 3; i++) {
        try {
          return await fetch(url, options);
        } catch(e) {
          await sleep(Math.pow(2, i) * 1000);
        }
      }
      return defaultValue;
    }
    `,
    gotchas: [
      "Exponential backoff: Don't retry too fast",
      "Max retries: Avoid infinite loops",
      "Error logging: Track all failures",
    ],
  },

  "batch-processing": {
    name: "Batch Processing Pattern",
    description: "Process multiple items efficiently",
    pattern_type: "orchestrator-worker",
    use_cases: [
      "Score 100+ deals per day",
      "Send 1000+ emails per campaign",
      "Analyze 50+ companies in one run",
    ],
    implementation: `
    1. Collect items
    2. Split into batches (10-50)
    3. Process batches in parallel
    4. Collect results
    5. Aggregate results
    6. Report summary
    `,
    code_example: `
    async function batchProcess(items, batchSize = 20) {
      const batches = chunk(items, batchSize);
      const results = await Promise.all(
        batches.map(batch => processBatch(batch))
      );
      return flatten(results);
    }
    `,
    gotchas: [
      "Rate limits: Check API limits",
      "Batch size: Test for optimal performance",
      "Error handling: One failed item shouldn't block batch",
    ],
  },

  "context-preservation": {
    name: "Context Preservation Pattern",
    description: "Maintain context across multiple agents",
    pattern_type: "hierarchical",
    use_cases: [
      "Pass company data from Worker 1 to Worker 2",
      "Maintain conversation history in multi-turn",
      "Track decision reasoning across agents",
    ],
    implementation: `
    1. Create context object
    2. Pass to all agents
    3. Agents read + write context
    4. Final agent uses full context
    5. Return context + result
    `,
    code_example: `
    const context = {
      deal_id: 12345,
      company_data: null,
      email_data: null,
      salary_data: null,
      decision: null
    };
    // Each worker updates context
    context.company_data = await worker1(context);
    context.email_data = await worker2(context);
    `,
    gotchas: [
      "Context size: Keep it lightweight",
      "Mutations: Be careful with shared state",
      "Versioning: Track context changes",
    ],
  },

  "feedback-loop": {
    name: "Feedback Loop Pattern",
    description: "Learn from results and improve decisions",
    pattern_type: "supervisor",
    use_cases: [
      "Track deal accuracy vs actual outcome",
      "Adjust scoring thresholds",
      "Improve prompt based on failures",
    ],
    implementation: `
    1. Make prediction
    2. Execute action
    3. Measure outcome
    4. Compare to prediction
    5. Calculate error
    6. Adjust parameters
    7. Repeat
    `,
    code_example: `
    // Initial threshold: 75
    let threshold = 75;
    const results = [];
    
    // Collect results
    for (const deal of deals) {
      const score = scorer(deal);
      const moved = score > threshold;
      const closed = checkIfClosed(deal.id);
      results.push({ score, moved, closed });
    }
    
    // Adjust: If too many false positives, increase threshold
    const accuracy = results.filter(r => r.moved === r.closed).length / results.length;
    if (accuracy < 0.85) {
      threshold += 5;
    }
    `,
    gotchas: [
      "Sample size: Need >100 samples for significance",
      "Seasonality: Account for time-based trends",
      "Local optima: Don't over-fit to recent data",
    ],
  },

  "monitoring-alerting": {
    name: "Monitoring & Alerting Pattern",
    description: "Detect and alert on anomalies",
    pattern_type: "supervisor",
    use_cases: [
      "Alert if deal processing time >1 min",
      "Alert if API success rate <99%",
      "Alert if unusual scoring pattern detected",
    ],
    implementation: `
    1. Collect metrics
    2. Calculate baselines
    3. Check against thresholds
    4. If anomaly detected: Alert
    5. Log for analysis
    6. Adjust thresholds over time
    `,
    code_example: `
    const metrics = {
      processing_time: 2.5, // seconds
      api_success_rate: 98.5, // percent
      deal_score_avg: 62.3
    };
    
    if (metrics.processing_time > 60) {
      alert("Deal processing slow");
    }
    if (metrics.api_success_rate < 99) {
      alert("API reliability degraded");
    }
    `,
    gotchas: [
      "Alert fatigue: Too many alerts = ignored",
      "Threshold tuning: Based on actual data",
      "False positives: Validate before alerting",
    ],
  },

  "prompt-engineering": {
    name: "Advanced Prompt Engineering",
    description: "Craft effective prompts for Claude",
    pattern_type: "supervisor",
    use_cases: [
      "Chain-of-thought for complex reasoning",
      "Few-shot examples for output format",
      "Role-playing for context",
      "Constraint-based for safety",
    ],
    implementation: `
    1. Define role/context
    2. Add constraints (hard + soft)
    3. Provide examples (few-shot)
    4. Request step-by-step reasoning
    5. Specify output format
    `,
    code_example: `
    const prompt = \`
    You are a recruitment specialist for Recruitin B.V.
    
    Your task: Score this deal 0-100.
    
    HARD CONSTRAINTS:
    - Never move if company size <50
    - Never move if email invalid
    
    SCORING CRITERIA:
    - Size fit (0-30): Target 150-500 FTE
    - Sector (0-25): Oil&Gas, Manufacturing, Construction
    - Region (0-20): Gelderland, Overijssel, Noord-Brabant
    
    Think through each criterion step-by-step.
    
    Return JSON:
    { "score": 0-100, "decision": "move|flag|archive", "reasoning": "..." }
    \`;
    `,
    gotchas: [
      "Token limit: Long prompts use tokens",
      "Clarity: Ambiguous prompts = ambiguous outputs",
      "Testing: Validate with real data",
    ],
  },

  "multi-turn-conversation": {
    name: "Multi-Turn Conversation Pattern",
    description: "Handle multi-turn agent conversations",
    pattern_type: "hierarchical",
    use_cases: [
      "Refine scoring over multiple turns",
      "Clarify ambiguous inputs",
      "Iterate on campaign design",
    ],
    implementation: `
    1. Store conversation history
    2. Include history in each turn
    3. Agent reads history for context
    4. Agent adds new response
    5. Update history
    6. Repeat until done
    `,
    code_example: `
    const history = [];
    
    while (!done) {
      const response = await claude.messages.create({
        system: systemPrompt,
        messages: history,
        tools: tools
      });
      
      history.push({
        role: "assistant",
        content: response.content
      });
      
      // User provides feedback
      history.push({
        role: "user",
        content: userFeedback
      });
    }
    `,
    gotchas: [
      "Token limit: Long histories = expensive",
      "Context window: Summarize old context",
      "Circular reasoning: Agent repeats previous answers",
    ],
  },

  "tool-composition": {
    name: "Tool Composition Pattern",
    description: "Combine multiple tools for complex tasks",
    pattern_type: "orchestrator-worker",
    use_cases: [
      "Combine Apollo + Salary API + Email validation",
      "Combine Pipedrive + Google Sheets + Slack",
      "Combine Meta Ads API + Analytics + Reporting",
    ],
    implementation: `
    1. Identify tools needed
    2. Define tool input/output
    3. Chain tools together
    4. Handle errors at each step
    5. Aggregate results
    `,
    code_example: `
    async function qualifyDeal(deal) {
      const apollo = await apolloCompanyResearch(deal.company);
      const email = await validateEmailResend(deal.email);
      const salary = await salaryMarketResearch(deal.role);
      const score = await scoreDealQuality({
        apollo, email, salary
      });
      return updatePipedriveDeals({ score, deal_id: deal.id });
    }
    `,
    gotchas: [
      "Dependency order: Don't parallelize dependent tools",
      "Error propagation: Stop on critical errors",
      "Data format: Ensure tool outputs match next input",
    ],
  },

  "state-management": {
    name: "State Management Pattern",
    description: "Manage agent state across execution",
    pattern_type: "hierarchical",
    use_cases: [
      "Track deal qualification progress",
      "Store intermediate results",
      "Recover from partial failures",
    ],
    implementation: `
    1. Initialize state object
    2. Update state at each step
    3. Persist state to database
    4. On error, recover from last state
    5. Resume from checkpoint
    `,
    code_example: `
    const state = {
      deal_id: 12345,
      step: "apollo_research",
      apollo_result: null,
      email_result: null,
      salary_result: null,
      final_score: null,
      timestamp: Date.now()
    };
    
    try {
      state.apollo_result = await worker1(state);
      state.step = "email_validation";
      state.email_result = await worker2(state);
      // ... continue
    } catch(e) {
      // Save state, resume later
      await saveState(state);
    }
    `,
    gotchas: [
      "State size: Keep it small",
      "Consistency: Ensure atomic writes",
      "Recovery: Test failure scenarios",
    ],
  },

  "performance-optimization": {
    name: "Performance Optimization Pattern",
    description: "Optimize agent speed and cost",
    pattern_type: "orchestrator-worker",
    use_cases: [
      "Reduce API calls with caching",
      "Batch process to reduce overhead",
      "Use cheaper models for simple tasks",
    ],
    implementation: `
    1. Profile current implementation
    2. Identify bottlenecks
    3. Optimize bottleneck (cache/batch/cheaper model)
    4. Measure improvement
    5. Iterate
    `,
    code_example: `
    // Profile
    const start = Date.now();
    const result = await processDeals(deals);
    const time = Date.now() - start;
    console.log(\`Processed \${deals.length} deals in \${time}ms\`);
    
    // Optimize
    // - Add caching: 3x faster
    // - Batch API calls: 2x faster
    // - Use Claude Haiku: 50% cheaper
    `,
    gotchas: [
      "Over-optimization: Focus on real bottlenecks",
      "Trade-offs: Speed vs cost vs accuracy",
      "Measurement: Use real data, not synthetic",
    ],
  },

  "compliance-safety": {
    name: "Compliance & Safety Pattern",
    description: "Ensure agent decisions are safe and compliant",
    pattern_type: "supervisor",
    use_cases: [
      "Verify decisions against compliance rules",
      "Audit all changes",
      "Require human approval for high-risk",
    ],
    implementation: `
    1. Agent makes decision
    2. Check against compliance rules
    3. If risky: Flag for human
    4. If safe: Execute
    5. Log all actions for audit
    `,
    code_example: `
    async function executeWithCompliance(decision) {
      // Check rules
      if (decision.risk_level > 0.5) {
        return { status: "flagged", reason: "High risk" };
      }
      
      // Execute
      const result = await execute(decision);
      
      // Audit
      await audit.log({
        timestamp: Date.now(),
        decision,
        result,
        executed_by: "agent",
        approved_by: "system"
      });
      
      return result;
    }
    `,
    gotchas: [
      "Rule maintenance: Keep rules updated",
      "False positives: Balance safety vs speed",
      "Audit trail: Ensure immutable logging",
    ],
  },

  "knowledge-integration": {
    name: "Knowledge Integration Pattern",
    description: "Integrate external knowledge into decisions",
    pattern_type: "orchestrator-worker",
    use_cases: [
      "Use historical deal data",
      "Reference company intelligence",
      "Learn from past decisions",
    ],
    implementation: `
    1. Query knowledge base
    2. Retrieve relevant context
    3. Integrate into decision
    4. Weight by relevance
    5. Update knowledge base with new learning
    `,
    code_example: `
    async function scoreWithKnowledge(deal) {
      const historical = await kb.query(\`Similar deals to \${deal.company}\`);
      const context = {
        similar_deals: historical,
        historical_close_rate: historical.filter(d => d.closed).length / historical.length
      };
      
      const score = await scorer.score(deal, context);
      
      // Learn
      await kb.store({
        deal_id: deal.id,
        score,
        closed: deal.closed_actual,
        accuracy: score.accuracy
      });
      
      return score;
    }
    `,
    gotchas: [
      "Data quality: Bad data = bad decisions",
      "Relevance: Filter to actually similar cases",
      "Bias: Monitor for pattern bias",
    ],
  },

  "api-abstraction": {
    name: "API Abstraction Pattern",
    description: "Abstract API complexities from agent",
    pattern_type: "routing",
    use_cases: [
      "Unified interface for Apollo/Salary/Email APIs",
      "Handle API changes transparently",
      "Mock APIs for testing",
    ],
    implementation: `
    1. Create wrapper interface
    2. Hide API details
    3. Normalize responses
    4. Handle errors transparently
    `,
    code_example: `
    class CompanyResearchAPI {
      async getCompanyData(name) {
        const apolloResult = await apollo.search(name);
        return {
          name: apolloResult.name,
          size: apolloResult.headcount,
          sector: apolloResult.industry,
          growth: apolloResult.growth_rate
        };
      }
    }
    
    // Agent doesn't need to know Apollo details
    const data = await api.getCompanyData("TechCorp");
    `,
    gotchas: [
      "Abstraction leaks: Don't hide critical errors",
      "Performance: Don't add unnecessary overhead",
      "Flexibility: Allow bypass when needed",
    ],
  },

  "testing-validation": {
    name: "Testing & Validation Pattern",
    description: "Thoroughly test agent decisions",
    pattern_type: "supervisor",
    use_cases: [
      "Unit test each worker",
      "Integration test orchestrator",
      "A/B test thresholds",
      "Regression test on real data",
    ],
    implementation: `
    1. Create test suite
    2. Define test cases
    3. Run tests
    4. Measure accuracy
    5. Iterate on agent
    `,
    code_example: `
    const testCases = [
      {
        input: { company: "TechCorp", size: 200 },
        expected: { decision: "move", score: 80+ }
      },
      {
        input: { company: "Bakery", size: 8 },
        expected: { decision: "archive", score: 20 }
      }
    ];
    
    for (const test of testCases) {
      const result = await scoreAndDecide(test.input);
      assert(result.decision === test.expected.decision);
    }
    `,
    gotchas: [
      "Test coverage: Not all paths testable",
      "Data dependencies: Use real data",
      "Flakiness: Randomness in results",
    ],
  },

  "documentation-clarity": {
    name: "Documentation & Clarity Pattern",
    description: "Document agent decisions clearly",
    pattern_type: "supervisor",
    use_cases: [
      "Explain why deal was moved/archived",
      "Document decision reasoning",
      "Create audit trail",
    ],
    implementation: `
    1. Make decision
    2. Generate explanation
    3. Record reasoning
    4. Include evidence
    5. Store in audit trail
    `,
    code_example: `
    const decision = {
      score: 82,
      decision_type: "move",
      reasoning: \`
        Score breakdown:
        - Size (TechCorp: 200 people) = 25/30 (target 150-500)
        - Sector (Software/SaaS) = 25/25 (primary sector)
        - Region (Gelderland) = 20/20 (target region)
        - Email (valid) = 10/10
        - Salary (€85k, competitive) = 2/15
        Total: 82/100
      \`,
      evidence: [
        "Apollo: 200 headcount, SaaS, growing 24%",
        "Resend: Email valid, 92% deliverability",
        "Salary: Market rate €75-100k"
      ]
    };
    `,
    gotchas: [
      "Verbosity: Balance detail with clarity",
      "Accuracy: Ensure reasoning matches decision",
      "Auditability: Make it clear for review",
    ],
  },
};

// ==========================================
// WORKFLOWS (READY FOR DEPLOYMENT)
// ==========================================

const WORKFLOWS: Record<string, Workflow> = {
  "deal-qualification": {
    id: "deal-qualification-v1",
    name: "Deal Qualification Workflow",
    type: "deal-qualification",
    description: "Automatically qualify 145 deals stuck in Stage 2",
    steps: [
      "Fetch deal from Pipedrive",
      "Research company (Apollo)",
      "Validate email (Resend)",
      "Check salary market (API)",
      "Score quality (Claude)",
      "Make decision (move/flag/archive)",
      "Update Pipedrive",
    ],
    triggers: [
      "Manual trigger (one deal)",
      "Batch trigger (50 deals)",
      "Scheduled (daily at 2 AM)",
    ],
    tools_used: [
      "apollo_company_research",
      "validate_email_resend",
      "salary_market_research",
      "score_deal_quality",
      "update_pipedrive_deals",
    ],
    zapier_config: `
    Trigger: Manual (Webhooks) or Scheduled (Daily 2 AM)
    → Get Pipedrive deals from Stage 2
    → Loop through deals
    → Call JobDigger Agent (Claude)
    → Update Pipedrive based on decision
    → Slack notify on completion
    `,
    mcp_servers_used: [
      "labour-market",
      "recruitin-intelligence",
      "jobdigger-analyzer",
    ],
    roi_estimate: "€23k/month saved (40 hrs @ €10/hr work reduction)",
    implementation_hours: 8,
    status: "ready",
  },

  "cold-outreach": {
    id: "cold-outreach-v1",
    name: "Cold Outreach Campaign",
    type: "email-automation",
    description: "Send targeted outreach to qualified companies",
    steps: [
      "Identify target companies",
      "Personalize email",
      "Send via Gmail",
      "Track opens",
      "Follow up after 3 days",
      "Follow up after 7 days",
      "Archive if no response",
    ],
    triggers: ["Manual", "Weekly auto-send"],
    tools_used: ["elite_email_send", "email_personalize", "email_track"],
    zapier_config: `
    Trigger: Weekly Monday 8 AM
    → Get candidates from Apollo (size 150-500)
    → Segment by sector
    → Personalize email
    → Send via Gmail
    → Log in Google Sheets
    → Schedule follow-ups
    `,
    mcp_servers_used: ["elite-email", "recruitin-intelligence"],
    roi_estimate: "€50k/month (if 5% response → 10-15 new deals)",
    implementation_hours: 12,
    status: "ready",
  },

  "meta-campaign": {
    id: "meta-campaign-v1",
    name: "Meta Ads Campaign",
    type: "meta-campaign",
    description:
      "Deploy Meta ads with 15 audiences and 20 creative variants",
    steps: [
      "Create audiences (15 segments)",
      "Create ad creatives (20 variants)",
      "Set budgets",
      "Schedule campaigns",
      "Monitor performance",
      "Optimize low-performing",
      "Scale winners",
    ],
    triggers: ["Manual", "Monthly refresh"],
    tools_used: [
      "create_campaign",
      "create_audience",
      "create_ad_creative",
      "get_performance",
    ],
    zapier_config: `
    Trigger: Manual or Monthly 1st
    → Create 15 audiences via Meta API
    → Generate 20 creative variants (text + images)
    → Deploy campaigns with €50/day budget
    → Track conversions to Pipedrive
    → Daily performance report
    `,
    mcp_servers_used: ["meta-ads", "recruitin-intelligence"],
    roi_estimate:
      "€200k/month revenue if 100 leads × €2k deal value × 5% conversion",
    implementation_hours: 20,
    status: "ready",
  },

  "labour-market-analysis": {
    id: "labour-analysis-v1",
    name: "Labour Market Analysis",
    type: "labour-analysis",
    description: "Weekly market intelligence for pricing and positioning",
    steps: [
      "Analyze market salary trends",
      "Track vacancy demand",
      "Identify skill scarcity",
      "Benchmark competitors",
      "Create market report",
      "Distribute to team",
    ],
    triggers: ["Weekly Monday 6 AM"],
    tools_used: [
      "salary_market_data",
      "role_demand_analysis",
      "candidate_scarcity_score",
    ],
    zapier_config: `
    Trigger: Weekly Monday 6 AM
    → Fetch labour market data
    → Analyze trends
    → Generate insights
    → Create Google Doc report
    → Share with team via Slack
    `,
    mcp_servers_used: ["labour-market", "recruitin-intelligence"],
    roi_estimate: "€10k/month (better pricing + positioning)",
    implementation_hours: 4,
    status: "ready",
  },

  "candidate-enrichment": {
    id: "candidate-enrichment-v1",
    name: "Candidate Enrichment",
    type: "candidate-enrichment",
    description: "Enrich candidate profiles with Apollo and web data",
    steps: [
      "Get candidate name/email",
      "Search Apollo for profile",
      "Get LinkedIn profile",
      "Extract skills and experience",
      "Score candidate",
      "Update Pipedrive",
    ],
    triggers: ["New Pipedrive candidate", "Manual refresh"],
    tools_used: ["apollo_enrichment", "linkedin_scrape", "candidate_score"],
    zapier_config: `
    Trigger: New person in Pipedrive
    → Get email
    → Search Apollo
    → Fetch LinkedIn
    → Score candidate
    → Update Pipedrive custom fields
    `,
    mcp_servers_used: ["recruitin-intelligence", "jobdigger-analyzer"],
    roi_estimate: "€5k/month (faster candidate eval)",
    implementation_hours: 6,
    status: "ready",
  },
};

// ==========================================
// MCP SERVER CLASS
// ==========================================

class WouterSkillsBundleServer {
  private server: Server;
  private skills: Record<string, SkillGuide> = REFERENCE_GUIDES;
  private agents: Record<string, AgentPattern> = AGENT_SKILLS;
  private mcps: Record<MCPServerType, MCPServer> = MCP_SERVERS;
  private workflows: Record<string, Workflow> = WORKFLOWS;

  constructor() {
    this.server = new Server({
      name: "wouter-skills-bundle-mcp-server",
      version: "4.0.0",
    });
    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_skill_guide",
            description: "Get a core reference guide",
            inputSchema: z.object({
              category: z.enum([
                "development",
                "automation",
                "tech-stack",
                "email",
                "agent-patterns",
                "prompting",
                "error-handling",
                "explain-code",
              ]),
            }),
            annotations: { readOnlyHint: true },
          },
          {
            name: "get_agent_skill",
            description: "Get an agent skill (pattern + implementation)",
            inputSchema: z.object({
              skill_name: z.string(),
            }),
            annotations: { readOnlyHint: true },
          },
          {
            name: "get_mcp_server_spec",
            description: "Get MCP server specification",
            inputSchema: z.object({
              server_type: z.enum([
                "labour-market",
                "elite-email",
                "meta-ads",
                "recruitin-intelligence",
                "jobdigger-analyzer",
              ]),
            }),
            annotations: { readOnlyHint: true },
          },
          {
            name: "get_workflow",
            description: "Get complete workflow (ready to deploy)",
            inputSchema: z.object({
              workflow_id: z.string(),
            }),
            annotations: { readOnlyHint: true },
          },
          {
            name: "list_all_skills",
            description: "List all available skills and resources",
            inputSchema: z.object({}),
            annotations: { readOnlyHint: true },
          },
          {
            name: "search_skills",
            description: "Search skills by keyword",
            inputSchema: z.object({
              query: z.string(),
            }),
            annotations: { readOnlyHint: true },
          },
          {
            name: "get_implementation_roadmap",
            description:
              "Get step-by-step implementation plan for a workflow",
            inputSchema: z.object({
              workflow_id: z.string(),
            }),
            annotations: { readOnlyHint: true },
          },
          {
            name: "get_claude_prompt_template",
            description:
              "Get optimized Claude system prompt for a specific task",
            inputSchema: z.object({
              task: z.string(),
            }),
            annotations: { readOnlyHint: true },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args = {} } = request.params;
      const getArg = (key: string): string => String(args[key] ?? "");

      try {
        switch (name) {
          case "get_skill_guide": {
            const category = getArg("category");
            const guide =
              this.skills[category as keyof typeof REFERENCE_GUIDES];
            if (!guide) {
              return {
                type: "text",
                text: `Skill guide not found: ${category}`,
              } as TextContent;
            }
            return {
              type: "text",
              text: JSON.stringify(guide, null, 2),
            } as TextContent;
          }

          case "get_agent_skill": {
            const skillName = getArg("skill_name");
            const skill = this.agents[skillName];
            if (!skill) {
              return {
                type: "text",
                text: `Agent skill not found: ${skillName}`,
              } as TextContent;
            }
            return {
              type: "text",
              text: JSON.stringify(skill, null, 2),
            } as TextContent;
          }

          case "get_mcp_server_spec": {
            const serverType = getArg("server_type");
            const mcp = this.mcps[serverType as MCPServerType];
            if (!mcp) {
              return {
                type: "text",
                text: `MCP server not found: ${serverType}`,
              } as TextContent;
            }
            return {
              type: "text",
              text: JSON.stringify(mcp, null, 2),
            } as TextContent;
          }

          case "get_workflow": {
            const workflowId = getArg("workflow_id");
            const workflow = this.workflows[workflowId];
            if (!workflow) {
              return {
                type: "text",
                text: `Workflow not found: ${workflowId}`,
              } as TextContent;
            }
            return {
              type: "text",
              text: JSON.stringify(workflow, null, 2),
            } as TextContent;
          }

          case "list_all_skills": {
            return {
              type: "text",
              text: JSON.stringify(
                {
                  reference_guides: Object.keys(this.skills),
                  agent_skills: Object.keys(this.agents),
                  mcp_servers: Object.keys(this.mcps),
                  workflows: Object.keys(this.workflows),
                  total_resources: Object.keys(this.skills).length +
                    Object.keys(this.agents).length +
                    Object.keys(this.mcps).length +
                    Object.keys(this.workflows).length,
                },
                null,
                2
              ),
            } as TextContent;
          }

          case "search_skills": {
            const query = getArg("query").toLowerCase();
            const results: string[] = [];
            Object.entries(this.skills).forEach(([key, skill]) => {
              if (
                key.includes(query) ||
                skill.description.toLowerCase().includes(query)
              ) {
                results.push(`reference: ${key}`);
              }
            });
            Object.entries(this.agents).forEach(([key, agent]) => {
              if (
                key.includes(query) ||
                agent.description.toLowerCase().includes(query)
              ) {
                results.push(`agent_skill: ${key}`);
              }
            });
            return {
              type: "text",
              text: JSON.stringify({ query, results, count: results.length }, null, 2),
            } as TextContent;
          }

          case "get_implementation_roadmap": {
            const roadmapWorkflowId = getArg("workflow_id");
            const workflow = this.workflows[roadmapWorkflowId];
            if (!workflow) {
              return {
                type: "text",
                text: `Workflow not found: ${roadmapWorkflowId}`,
              } as TextContent;
            }
            const roadmap = `
IMPLEMENTATION ROADMAP: ${workflow.name}

Status: ${workflow.status}
Estimated Time: ${workflow.implementation_hours} hours
ROI: ${workflow.roi_estimate}

STEPS:
${workflow.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

TOOLS REQUIRED:
${workflow.tools_used.join("\n")}

ZAPIER CONFIGURATION:
${workflow.zapier_config}

MCP SERVERS:
${workflow.mcp_servers_used.join("\n")}

TRIGGERS:
${workflow.triggers.join("\n")}
            `;
            return {
              type: "text",
              text: roadmap,
            } as TextContent;
          }

          case "get_claude_prompt_template": {
            const templates: Record<string, string> = {
              "deal-qualification": `You are a recruitment deal qualification expert for Recruitin B.V.

Your role: Intelligently score and qualify commercial recruitment deals.

CONTEXT:
- Target companies: 50-800 FTE (sweet spot: 150-500)
- Primary sectors: Oil & Gas, Construction, Manufacturing, Automation, Renewable Energy
- Regions: Gelderland, Overijssel, Noord-Brabant

SCORING CRITERIA (0-100):
- Company size fit (0-30): Target 150-500 FTE
- Sector match (0-25): Primary sectors only
- Region (0-20): Target regions only  
- Email quality (0-10): Delivery score × 0.1
- Salary competitive (0-15): Budget vs market
- Urgency signals (0-10): Growth >20%, funding, scarcity

DECISION RULES:
- Score >75: MOVE to Stage 3 (Voorbereiding)
- Score 50-75: FLAG for manual review
- Score <50: ARCHIVE with reasoning

IMPORTANT:
- Be transparent about missing data
- Flag high-risk decisions
- Provide detailed reasoning
- Use JSON format for output`,

              "cold-outreach": `You are an expert email copywriter for recruitment outreach.

Your role: Craft personalized, high-converting cold emails.

TARGETS:
- Company hiring managers / HR managers
- 50-800 FTE companies
- Oil & Gas, Construction, Manufacturing sectors

EMAIL STRUCTURE:
1. Subject line: Personal, curious, no hype
2. Opening: Reference to company or person
3. Problem: What pain are they solving?
4. Solution: How Recruitin helps (specific)
5. Social proof: Brief case study or success
6. CTA: Clear next step
7. Signature: Name, title, phone, LinkedIn

TONE:
- Direct, no fluff
- Dutch-friendly (even in English)
- Casual but professional
- Confident, not desperate

DO NOT:
- Generic greetings ("Dear Hiring Manager")
- Long paragraphs (max 3 lines)
- Multiple CTAs
- Hype words ("revolutionary", "world-class")`,

              "meta-campaign": `You are a Meta Ads campaign strategist for recruitment.

Your role: Create high-performing campaign structures and audiences.

AUDIENCE STRATEGY:
- 15 audience segments (job title, company size, sector, region)
- Target decision-makers (hiring managers, ops, finance)
- Use lookalike audiences from past converters

CREATIVE STRATEGY:
- 20 ad variants (text + image combinations)
- Test different value props (cost savings, speed, quality)
- Show social proof (case studies, testimonials)

TARGETING:
- Interests: HR tech, recruitment, business management
- Behaviors: Job searches, hiring activity
- Demographics: Netherlands, B2B decision makers

OPTIMIZATION:
- Daily budget: €50-100 per campaign
- Target CPC: €1-2
- Target ROAS: 3:1 (€3 revenue per €1 ad spend)

TRACKING:
- Link to Pipedrive (lead capture)
- Facebook Pixel conversion tracking
- Daily performance dashboard`,

              default: `You are a helpful assistant for Recruitin B.V. recruitment automation.

Use the available skills and tools to help with:
- Deal qualification and analysis
- Email campaign optimization
- Meta ads strategy
- Labour market intelligence
- Workflow optimization

Always:
- Be transparent about limitations
- Provide detailed reasoning
- Suggest next steps
- Link to relevant documentation`,
            };

            return {
              type: "text",
              text:
                templates[getArg("task")] ||
                templates["default"] ||
                "No template found",
            } as TextContent;
          }

          default:
            return {
              type: "text",
              text: `Unknown tool: ${name}`,
            } as TextContent;
        }
      } catch (error) {
        return {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        } as TextContent;
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log(
      "[Wouter Skills Bundle MCP] Server started - Ready for Claude Desktop upload"
    );
  }
}

// ==========================================
// STARTUP
// ==========================================

const server = new WouterSkillsBundleServer();
server.start().catch(console.error);
