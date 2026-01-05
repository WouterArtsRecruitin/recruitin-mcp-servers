# JobDigger Automation - MCP Integration Guide

**Purpose**: MCP server integration patterns voor JobDigger automation
**Related Repo**: github.com/WouterArtsRecruitin/jobdigger-automation

---

## 🎯 MCP Servers Gebruikt in JobDigger Automation

### 1. Pipedrive MCP (Core)

**Usage in JobDigger**:
```javascript
// Import scored leads naar Pipedrive
mcp.pipedrive.create_deal({
  title: `${company} - ${vacancy}`,
  person_id: contact_id,
  org_id: org_id,
  custom_fields: {
    'lead_score': combi_score,        // d26add6b2e2a01044e468d4a8724011acb29799d
    'vacature_titel': vacancy_title,  // 4fe89b5e450089a5dd5168e92fe69bb98463f4f6
    'locatie': location,              // 185eed88f971fcf8d8016ae96f38704fe4328f4f
    'lead_source': 'JobDigger',       // 67bfc338be9f4390c99e60a100b436d668c08b2a
  }
})
```

**Custom Fields Mapping**:
- See `SKILLS_BUNDLE_REFERENCE.md` voor complete field IDs

---

### 2. Apollo MCP (Enrichment)

**Potential Usage**:
```javascript
// Contact enrichment voor JobDigger leads
mcp.apollo.find_contact({
  name: contact_name,
  company: company_name,
  enrichment: true
})

// Returns:
// - LinkedIn URL
// - Job title
// - Email (if available)
// - Company size
```

**Integration Point**:
- V1 template processor → Apollo enrichment → Enhanced ICP scoring

---

### 3. LinkedIn MCP (Future)

**Needed Capabilities**:
```javascript
// Boolean search execution
mcp.linkedin.execute_search({
  boolean_string: "Werkvoorbereider Elektrotechniek OR ...",
  filters: {
    location: "Netherlands",
    current_company: ["Strukton", "BAM", ...]
  }
})

// Profile export
mcp.linkedin.export_profiles({
  search_id: search_id,
  format: "RPS",
  max_results: 25
})

// InMail sending
mcp.linkedin.send_inmail({
  profile_id: profile_id,
  subject: subject,
  body: body,
  track: true
})
```

**Status**: Not built yet - would be HIGH value MCP server

---

## 🔧 Recommended MCP Servers to Build

### Priority 1: JobDigger API MCP (if API exists)

```yaml
name: jobdigger-mcp
capabilities:
  - search_vacancies
  - export_vacancies
  - get_company_details
  - track_downloads
```

**Use Case**: Automated daily export download

---

### Priority 2: LinkedIn Recruiter MCP

```yaml
name: linkedin-recruiter-mcp
capabilities:
  - execute_boolean_search
  - export_rps_csv
  - send_inmail
  - track_responses
  - get_profile_details
```

**Use Case**: Complete V2 automation (no manual LinkedIn work!)

---

### Priority 3: KvK API MCP

```yaml
name: kvk-api-mcp
capabilities:
  - lookup_company
  - get_company_size
  - get_sbi_code
  - validate_kvk_number
```

**Use Case**: Company size enrichment in V1

---

## 📊 Integration Patterns

### Pattern 1: Sequential Enrichment

```
JobDigger Export
  ↓ V1 Processing
Scored Leads
  ↓ MCP: KvK enrichment (company size)
Enhanced Leads
  ↓ MCP: Apollo enrichment (contact LinkedIn)
Fully Enriched Leads
  ↓ MCP: Pipedrive import
Deals Created
```

---

### Pattern 2: Parallel Processing

```
LinkedIn RPS Export
  ↓
[MCP: Profile Analysis] + [MCP: Company Lookup] + [MCP: Skills Validation]
  ↓ (parallel)
Enriched Profiles
  ↓ V2 AI Matching
Ranked Candidates
```

---

## 🎯 MCP Configuration voor JobDigger

**Claude Desktop Config** (`~/.claude/config.json`):

```json
{
  "mcpServers": {
    "pipedrive": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-pipedrive"],
      "env": {
        "PIPEDRIVE_API_KEY": "09982bf303e355d84fb62e25191c6c39a3683df5"
      }
    },
    "apollo": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-apollo"],
      "env": {
        "APOLLO_API_KEY": "${APOLLO_API_KEY}"
      }
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-notion"],
      "env": {
        "NOTION_API_KEY": "${NOTION_API_KEY}"
      }
    }
  }
}
```

---

## 🚀 Future MCP Servers to Build

| Server | Priority | Effort | Impact |
|--------|----------|--------|--------|
| **LinkedIn Recruiter** | 🔴 HIGH | 2 weeks | Eliminates manual sourcing |
| **JobDigger API** | 🟡 MEDIUM | 1 week | Auto-downloads |
| **KvK API** | 🟡 MEDIUM | 3 days | Company enrichment |
| **Email Tracker** | 🟢 LOW | 1 week | InMail analytics |

---

*MCP Integration Guide | JobDigger Automation | 2026-01-05*
