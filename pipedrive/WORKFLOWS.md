# 🔄 PIPEDRIVE MCP - WORKFLOW EXAMPLES

**Real-world workflows for Recruitin B.V. recruitment automation**

---

## 🎯 WORKFLOW 1: JobDigger Lead → Pipedrive Deal

**Scenario:** New JobDigger lead comes in for "Allround Monteur" position at ASML Eindhoven

**Execution:**
```
User: "New JobDigger lead: Allround Monteur, ASML Eindhoven, salary €60-70k"

STEP 1: Create Deal
→ Pipedrive MCP: create_deal({
    title: "Allround Monteur - ASML Eindhoven",
    stage_id: 1,  // JobDigger Pipeline - Stage 1: "New Lead"
    value: 65000,  // Average of salary range
    currency: "EUR"
  })

STEP 2: Auto-populate with Market Data
→ Labour Market Intel MCP: analyze_labour_market_professional("Allround Monteur", "Eindhoven")
→ Pipedrive MCP: auto_populate_fields({
    deal_id: [new_deal_id],
    market_data: {
      salary_min: 60000,
      salary_max: 70000,
      salary_avg: 65000,
      demand_level: "High",
      workforce_available: 450
    }
  })

STEP 3: Schedule Intake Activity
→ Pipedrive MCP: create_activity({
    deal_id: [new_deal_id],
    type: "email",
    subject: "Client intake scheduled",
    due_date: "2025-11-02",  // +2 days
    note: "Send intake form via Jotform"
  })

RESULT:
✅ Deal created in Pipeline 12, Stage 1
✅ Market data auto-filled (salary, demand, workforce)
✅ Intake activity scheduled for +2 days
✅ Total time: 8-10 seconds
```

---

## 🔍 WORKFLOW 2: Weekly Pipeline Audit

**Scenario:** Every Friday, analyze Pipeline 12 health and identify bottlenecks

**Execution:**
```
User: "Friday pipeline review for Pipeline 12"

STEP 1: Get Pipeline Stats
→ Pipedrive MCP: get_pipeline_stats(pipeline_id=12)

Returns:
{
  total_deals: 120,
  open_deals: 85,
  won_deals: 25,
  lost_deals: 10,
  conversion_rate: 27.8%,
  total_value: €7,800,000,
  avg_deal_value: €65,000,
  by_stage: [
    { stage: "New Lead", count: 30, value: €1,950,000 },
    { stage: "Intake Scheduled", count: 20, value: €1,300,000 },
    { stage: "Client Meeting", count: 15, value: €975,000 },
    { stage: "Proposal Sent", count: 10, value: €650,000 },
    { stage: "Negotiation", count: 10, value: €650,000 }
  ]
}

STEP 2: Find Bottlenecks (Stale Deals)
→ Pipedrive MCP: find_stale_deals(days_inactive=7, pipeline_id=12)

Returns:
{
  stale_deals: [
    { id: 12345, title: "Monteur - Philips", days_inactive: 14, stage: "Intake Scheduled" },
    { id: 12346, title: "Technician - ASML", days_inactive: 10, stage: "Client Meeting" }
  ],
  count: 2
}

STEP 3: Generate Report
→ Desktop Commander: write_file("/Documents/pipeline_review_2025-10-30.md", [report])

STEP 4: Action Items
For each stale deal:
→ Pipedrive MCP: create_activity({
    deal_id: [stale_deal_id],
    type: "call",
    subject: "Follow-up: Deal stalled",
    due_date: "2025-11-01",
    note: "No activity for [X] days - reach out to client"
  })

RESULT:
✅ Pipeline health report generated
✅ Bottlenecks identified (2 stale deals)
✅ Follow-up activities auto-scheduled
✅ Report saved to Google Drive
✅ Total time: 15-20 seconds
```

---

## 🧹 WORKFLOW 3: Monthly Deal Cleanup

**Scenario:** End of month - archive deals with no activity for 30+ days

**Execution:**
```
User: "Clean up stale deals (30+ days inactive) in all pipelines"

STEP 1: Find Stale Deals
→ Pipedrive MCP: find_stale_deals(days_inactive=30)

Returns: 15 deals across all pipelines

STEP 2: Review & Confirm
Claude shows list:
1. Deal #12340 - "Monteur - ABC" - 45 days inactive
2. Deal #12350 - "Technician - XYZ" - 38 days inactive
...

User: "Archive all"

STEP 3: Bulk Update to Lost
→ Pipedrive MCP: bulk_update_deals({
    deal_ids: [12340, 12350, ...],
    updates: {
      status: "lost",
      lost_reason: "No activity >30 days - auto-archived"
    }
  })

STEP 4: Log for Audit
→ Desktop Commander: write_file("/Documents/archived_deals_2025-10.csv", [deal_data])

RESULT:
✅ 15 deals archived
✅ Pipeline cleaned up
✅ Audit log created
✅ Total time: 10-15 seconds
```

---

## 📧 WORKFLOW 4: Email Error Prevention

**Scenario:** Create deal but detect email typo before submission

**Execution:**
```
User: "Create deal for contact john.doe@aslm.com at ASML"

STEP 1: Validate Email
→ Pipedrive MCP: validate_email("john.doe@aslm.com")

Returns:
{
  valid: false,
  reason: "Did you mean john.doe@asml.com?",
  suggestion: "john.doe@asml.com"
}

STEP 2: Confirm with User
Claude: "⚠️ Email error detected! Domain 'aslm.com' is invalid.
        Did you mean 'asml.com'?"

User: "Yes, fix it"

STEP 3: Create Deal with Corrected Email
→ Pipedrive MCP: create_deal({
    title: "ASML Contact",
    custom_fields: {
      contact_email: "john.doe@asml.com"  // Corrected!
    }
  })

RESULT:
✅ Email typo caught before creation
✅ 90% reduction in email errors
✅ Clean CRM data
```

---

## 🚀 WORKFLOW 5: Complete JobDigger Automation

**Scenario:** End-to-end automation from JobDigger lead to client communication

**Execution:**
```
TRIGGER: New JobDigger scrape result

PHASE 1: Intelligence Gathering (Parallel, 5s)
├─ Labour Market Intel: analyze_labour_market_professional("Allround Monteur", "Eindhoven")
├─ Indeed MCP: search_jobs("Allround Monteur", "Eindhoven", "NL")
└─ Desktop Commander: search_files("/Documents/CV", "Monteur")

PHASE 2: Deal Creation (Sequential, 8s)
├─ Pipedrive MCP: create_deal({
│     title: "Allround Monteur - ASML Eindhoven",
│     stage_id: 1,
│     value: 65000,
│     custom_fields: {
│       job_title: "Allround Monteur",
│       location: "Eindhoven",
│       client: "ASML",
│       salary_min: 60000,
│       salary_max: 70000,
│       market_salary_avg: 65000,  // From Labour Market Intel
│       demand_level: "High",       // From Labour Market Intel
│       workforce_available: 450    // From Labour Market Intel
│     }
│   })
├─ Jotform MCP: create_form("JobDigger Intake - Allround Monteur")
│   └─ Pre-filled: Salary ranges, market data, client info
├─ Pipedrive MCP: create_activity({
│     deal_id: [new_deal_id],
│     type: "email",
│     subject: "Send intake form",
│     due_date: "today",
│     note: "Jotform link: [form_url]"
│   })
└─ Desktop Commander: write_file("/Documents/JobDigger/allround_monteur_asml.md", [strategy])

PHASE 3: Client Communication (Sequential, 5s)
├─ Jotform MCP: assign_form({
│     form_id: [new_form_id],
│     assignee_email: "client@asml.com",
│     assignee_message: "Please complete intake form for Allround Monteur position"
│   })
└─ Pipedrive MCP: update_deal({
      deal_id: [new_deal_id],
      stage_id: 2  // Move to "Intake Scheduled"
    })

TOTAL TIME: 18 seconds
MANUAL WORK SAVED: 2-4 hours

RESULT:
✅ Deal created with complete market intelligence
✅ Intake form generated & sent to client
✅ Activity scheduled for follow-up
✅ Recruitment strategy documented
✅ Deal moved to "Intake Scheduled" stage
```

---

## 📊 WORKFLOW 6: Conversion Rate Optimization

**Scenario:** Monthly analysis to improve pipeline conversion

**Execution:**
```
User: "Analyze Pipeline 12 conversion rates and identify improvements"

STEP 1: Get Current Stats
→ Pipedrive MCP: get_pipeline_stats(pipeline_id=12)

STEP 2: Identify Weak Stages
Claude analyzes:
- Stage 2 → Stage 3: 60% conversion (GOOD)
- Stage 3 → Stage 4: 45% conversion (AVERAGE)
- Stage 4 → Stage 5: 30% conversion (WEAK!)
- Stage 5 → Won: 70% conversion (GOOD)

STEP 3: Deep Dive into Weak Stage
→ Pipedrive MCP: get_deals(pipeline_id=12, stage_id=4, status="open")
→ For each deal: get_deal_activities(deal_id)

STEP 4: Pattern Recognition
Claude identifies:
- Deals with <2 activities have 15% conversion
- Deals with 3-5 activities have 40% conversion
- Deals with 6+ activities have 65% conversion

RECOMMENDATION:
"Increase touchpoints in Stage 4 (Proposal Sent):
1. Schedule follow-up call within 2 days
2. Send reminder email at +7 days
3. Executive check-in at +14 days

Expected impact: +20% conversion (30% → 50%)"

STEP 5: Implement Automation
For all deals entering Stage 4:
→ Pipedrive MCP: create_activity({ type: "call", due_date: "+2 days" })
→ Pipedrive MCP: create_activity({ type: "email", due_date: "+7 days" })
→ Pipedrive MCP: create_activity({ type: "meeting", due_date: "+14 days" })

RESULT:
✅ Weak stage identified (Stage 4: 30% conversion)
✅ Root cause found (insufficient touchpoints)
✅ Automation implemented (3 follow-ups per deal)
✅ Expected: +20% conversion improvement
✅ ROI: €1.3M additional revenue/year
```

---

## 🔗 WORKFLOW 7: Cross-MCP Integration

**Scenario:** Connect Pipedrive with all other MCPs for ultimate automation

**Execution:**
```
TRIGGER: Jotform submission (JobDigger intake form)

1. Jotform MCP: get_submissions(form_id="jobdigger_intake")
   └─ Extract: Client name, job title, location, salary range

2. Pipedrive MCP: search_deals(term="[client_name] [job_title]")
   └─ Check: Does deal already exist?

3. IF deal exists:
   → Pipedrive MCP: update_deal(deal_id, custom_fields={...from form...})
   → Pipedrive MCP: move_deal(deal_id, stage_id=3)  // Move to "Client Meeting"
   
   ELSE create new:
   → Pipedrive MCP: create_deal({...from form...})
   → Labour Market Intel: analyze_labour_market_professional(job_title, location)
   → Pipedrive MCP: auto_populate_fields(deal_id, market_data={...})

4. Google Drive MCP: search_files("CV [job_title]")
   → Find: Relevant candidate CVs

5. Desktop Commander: Python analysis
   → Match: CVs to job requirements
   → Score: Candidates by fit (80%, 75%, 65%, ...)

6. Pipedrive MCP: create_activity({
     deal_id,
     type: "task",
     subject: "Review top 3 candidates",
     note: "CV links: [...]"
   })

7. Pipedrive MCP: create_activity({
     deal_id,
     type: "email",
     subject: "Send shortlist to client",
     due_date: "+1 day"
   })

RESULT:
✅ Jotform → Pipedrive (automatic)
✅ Market data populated (Labour Market Intel)
✅ Candidate matching (Desktop Commander + Google Drive)
✅ Activities auto-created (next steps clear)
✅ Total time: 15-20 seconds
✅ Manual work saved: 4-6 hours
```

---

## 💡 PRO TIPS

**Tip 1: Batch Operations at Off-Peak Hours**
```
Best time for bulk_update_deals: After hours (8pm-6am)
Why: Less API load, faster execution, no conflicts with manual work
```

**Tip 2: Use Custom Fields Strategically**
```
Good: salary_min, salary_max, market_demand
Bad: notes_field_1, misc_data, other_info
Why: Specific fields enable better analytics & automation
```

**Tip 3: Activity Types Matter**
```
Use correct types:
- "call" → Phone calls
- "email" → Email follow-ups
- "meeting" → In-person/video meetings
- "task" → Internal to-dos
- "deadline" → Important dates

Why: Better reporting & calendar integration
```

**Tip 4: Stage Transitions**
```
Always verify stage_id before move_deal:
→ Pipedrive MCP: get_pipeline_stages(pipeline_id=12)
→ Note down: Stage IDs & names
→ Use in automation

Why: Stage IDs can change, names are descriptive
```

**Tip 5: Error Handling**
```
Always check tool results:
IF result.success === false:
  → Log error
  → Retry with exponential backoff
  → Notify user if persistent

Why: Network issues, rate limits, validation errors happen
```

---

## 🎓 WORKFLOW TEMPLATES

**Template 1: Lead Qualification**
```
1. create_deal(title, stage_id=1)
2. validate_email(contact_email)
3. auto_populate_fields(deal_id, market_data)
4. create_activity(type="call", subject="Qualification call")
```

**Template 2: Deal Progression**
```
1. get_deal(deal_id)
2. get_deal_activities(deal_id)
3. IF activities.length >= 3 AND last_activity < 3 days ago:
     move_deal(deal_id, next_stage_id)
   ELSE:
     create_activity(type="follow-up")
```

**Template 3: Monthly Cleanup**
```
1. find_stale_deals(days_inactive=30)
2. FOR each stale_deal:
     bulk_update_deals([...], {status: "lost", lost_reason: "Auto-archived"})
3. write_file("archived_deals.csv", [data])
```

---

## ✅ WORKFLOW CHECKLIST

Before implementing automation:
- [ ] Identify trigger (manual/scheduled/event-based)
- [ ] Map required tools & MCPs
- [ ] Test with single deal first
- [ ] Add error handling
- [ ] Document workflow
- [ ] Train team on new process
- [ ] Monitor for 1 week
- [ ] Optimize based on results

---

**Questions? Need custom workflow?**
Contact: Wouter @ Recruitin B.V.

Built with ❤️ by Claude
Version 1.0.0 | October 2025
