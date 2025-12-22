# Pipedrive Automation Setup - Gedetailleerde Stappen

## Email Sequence Timeline
```
Email 1: Immediate (Day 0)
Email 2: Day 7 (if no reply)
Email 3: Day 14 (if no reply)  
Email 4: Day 21 (if no reply)
Email 5: Day 35 (if no reply)
Email 6: Day 49 (if no reply)
```

## Automation Actions Setup

### Action 1: Send Email 1 (Immediate)
- **Action Type**: Send email
- **Template**: "Corporate Recruiter Email 1 - RPO Bridge" (ID 36)
- **Delay**: None (immediate)
- **Condition**: None
- **To**: Deal person (primary contact)

### Action 2: Wait Period
- **Action Type**: Wait
- **Duration**: 7 days
- **Condition**: None

### Action 3: Send Email 2 (Day 7)
- **Action Type**: Send email  
- **Template**: "Corporate Recruiter Email 2 - Value Add" (ID 37)
- **Delay**: None
- **Condition**: "No email reply received" (in last 7 days)
- **To**: Deal person (primary contact)

### Action 4: Wait Period
- **Action Type**: Wait
- **Duration**: 7 days
- **Condition**: None

### Action 5: Send Email 3 (Day 14)
- **Action Type**: Send email
- **Template**: "Corporate Recruiter Email 3 - Case Study" (ID 38) 
- **Delay**: None
- **Condition**: "No email reply received" (in last 7 days)
- **To**: Deal person (primary contact)

### Action 6: Wait Period
- **Action Type**: Wait
- **Duration**: 7 days
- **Condition**: None

### Action 7: Send Email 4 (Day 21)
- **Action Type**: Send email
- **Template**: "Corporate Recruiter Email 4 - Competitor Reference" (ID 39)
- **Delay**: None
- **Condition**: "No email reply received" (in last 7 days)
- **To**: Deal person (primary contact)

### Action 8: Wait Period  
- **Action Type**: Wait
- **Duration**: 14 days
- **Condition**: None

### Action 9: Send Email 5 (Day 35)
- **Action Type**: Send email
- **Template**: "Corporate Recruiter Email 5 - Industry Insight" (ID 40)
- **Delay**: None
- **Condition**: "No email reply received" (in last 14 days)
- **To**: Deal person (primary contact)

### Action 10: Wait Period
- **Action Type**: Wait
- **Duration**: 14 days  
- **Condition**: None

### Action 11: Send Email 6 (Day 49)
- **Action Type**: Send email
- **Template**: "Corporate Recruiter Email 6 - Value Summary" (ID 41)
- **Delay**: None
- **Condition**: "No email reply received" (in last 14 days)
- **To**: Deal person (primary contact)

## Stop Conditions
De automation stopt automatisch als:
- Email reply ontvangen
- Meeting/call gepland  
- Deal stage changes to "Won"
- Deal stage changes to "Lost"
- Deal wordt deleted

## Advanced Settings
- **Working hours**: Alleen emails sturen op werkdagen 09:00-17:00
- **Time zone**: Europe/Amsterdam
- **Email frequency**: Max 1 email per dag per contact