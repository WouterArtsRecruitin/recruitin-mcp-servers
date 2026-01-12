# 📅 WEEKLY CONTENT SCHEDULE - Outlook Agenda

**Voor**: Wekelijkse content creation routine
**Platform**: Outlook Calendar (recurring events)
**Tijd**: 90 minuten total per week (verspreid over 3 dagen)

---

## 📊 WEEKLY OVERVIEW

```
VRIJDAG (60 min)
├─ 17:00-17:05  News scraping + Top 10 (5 min)
├─ 17:05-17:15  Content generation (10 min)
├─ 17:15-17:40  Visual production (25 min)
├─ 17:40-17:50  Review & edit (10 min)
└─ 17:50-18:00  Publishing + scheduling (10 min)

MAANDAG (20 min)
├─ 09:00        Content goes live (automatic)
├─ 10:00-10:10  Metrics update (10 min)
└─ 10:10-10:20  Weekly insights (10 min)

DINSDAG-DONDERDAG (0 min)
└─ Engagement only (respond to comments as they come)

═══════════════════════════════════════════════════════════
TOTAL: 80 minuten per week
═══════════════════════════════════════════════════════════
```

---

## 📅 DETAILED SCHEDULE

### 🔥 VRIJDAG

#### 17:00-17:05 | News Scraping & Top 10 Selection

**Outlook Event**:
```
Titel: 📰 Content Intelligence - News Scraping
Tijd: Vrijdag 17:00-17:05 (5 min)
Recurring: Elke vrijdag
Reminder: 10 min van tevoren
Categorie: Content Creation
```

**Taken**:
```bash
# Run 3 commands:
cd ~/recruitin-mcp-servers && \
node generate-news-report-now.js && \
node select-top-articles.js --top3 && \
node upload-to-correct-notion.js
```

**Checklist**:
- [ ] News scraped (zie ✅ REPORT GENERATED)
- [ ] Top 3 getoond (noteer #1 artikel)
- [ ] Notion updated (check in browser)

---

#### 17:05-17:15 | Content Generation

**Outlook Event**:
```
Titel: ✍️ Content Generation (Claude)
Tijd: Vrijdag 17:05-17:15 (10 min)
Recurring: Elke vrijdag
Reminder: Geen (volgt direct na scraping)
Categorie: Content Creation
```

**Taken**:
```
In Claude Code:

Maak weekly content op basis van:

Artikel: [TOP ARTIKEL VAN TOP 3]
Bron: [BRON]
URL: [URL]

Output:
1. LinkedIn Wouter (250-300 chars, contrarian)
2. LinkedIn Recruitin (350-400 chars, data story)
3. Blog (1000-1200 woorden)

Tone: docs/linkedin-content-authority.md
Bronvermelding: Volledig
Visual specs: Ja
```

**Checklist**:
- [ ] 3 outputs ontvangen van Claude
- [ ] Character counts OK (LinkedIn limits)
- [ ] Bronvermelding aanwezig
- [ ] Visual specs duidelijk

---

#### 17:15-17:40 | Visual Production

**Outlook Event**:
```
Titel: 🎨 Visuals Maken (Canva)
Tijd: Vrijdag 17:15-17:40 (25 min)
Recurring: Elke vrijdag
Reminder: Geen
Categorie: Content Creation
Tools: Canva Pro
```

**Taken**:
1. **LinkedIn Recruitin Infographic** (10 min)
   - Canva → Instagram Post → "Data Comparison"
   - Size: 1200x628px
   - Recruitin brand colors
   - Export PNG

2. **Blog Featured Image** (8 min)
   - Canva → Blog Banner template
   - Size: 1200x630px
   - Alt text klaar

3. **Blog Charts** (7 min)
   - Excel → Charts maken → Screenshot
   - Of Canva chart templates
   - Size: 800x400px
   - Source credit onderaan

**Checklist**:
- [ ] LinkedIn infographic (PNG, 1200x628)
- [ ] Blog featured (JPG, 1200x630)
- [ ] Blog chart 1 (PNG, 800x400)
- [ ] Blog chart 2 (PNG, 600x300) - optioneel
- [ ] Alle images hebben source credit

---

#### 17:40-17:50 | Review & Edit

**Outlook Event**:
```
Titel: 📝 Content Review
Tijd: Vrijdag 17:40-17:50 (10 min)
Recurring: Elke vrijdag
Reminder: Geen
Categorie: Content Creation
```

**Taken**:
- [ ] Lees alle 3 posts (LinkedIn x2 + Blog)
- [ ] Check cijfers kloppen (verify data points)
- [ ] Check bronnen volledig (alle sources listed)
- [ ] Minor edits (tone, flow, typos)
- [ ] Visuals check (quality OK?)

**Save Checklist**:
- [ ] Content saved (backup copy)
- [ ] Visuals saved (organized folder)

---

#### 17:50-18:00 | Publishing & Scheduling

**Outlook Event**:
```
Titel: 🚀 Publiceren & Schedulen
Tijd: Vrijdag 17:50-18:00 (10 min)
Recurring: Elke vrijdag
Reminder: Geen
Categorie: Content Creation
```

**Taken**:

**1. LinkedIn Wouter** (3 min):
- Open LinkedIn (personal)
- New post
- Copy-paste content
- Verify character count
- **Post NU** (vrijdag 18:00 is OK)
- Pin bronvermelding comment direct

**2. LinkedIn Recruitin** (4 min):
- Open Buffer (of LinkedIn scheduler)
- New post voor company page
- Copy-paste content
- Upload infographic
- **Schedule: Maandag 09:00**
- Save

**3. Blog** (3 min):
- WordPress → New Post
- Copy-paste content
- Upload 3 images (featured + 2 charts)
- Add alt text
- Set category + tags
- **Schedule: Maandag 09:00**
- Save draft

**Checklist**:
- [ ] LinkedIn Wouter: Posted ✅
- [ ] LinkedIn Recruitin: Scheduled (Monday 9am)
- [ ] Blog: Scheduled (Monday 9am)

---

### ⭐ MAANDAG

#### 09:00 | Content Goes Live (Automatic)

**Outlook Event**:
```
Titel: 📢 Content Live! (Check)
Tijd: Maandag 09:00-09:05 (5 min)
Recurring: Elke maandag
Reminder: 9am (at time)
Categorie: Content Monitoring
```

**Taken**:
- [ ] Check LinkedIn company post (live?)
- [ ] Check blog article (live?)
- [ ] Verify links work
- [ ] First engagement (like own posts, respond to early comments)

---

#### 10:00-10:10 | Metrics Update (48h Data)

**Outlook Event**:
```
Titel: 📊 LinkedIn Stats Update
Tijd: Maandag 10:00-10:10 (10 min)
Recurring: Elke maandag
Reminder: 10 min van tevoren
Categorie: Analytics
```

**Taken**:

**Voor elk post** (vrijdag/weekend gepost):
1. Open LinkedIn post
2. Click "View analytics"
3. Note cijfers:
   - Impressions: [X]
   - Engagement rate: [X]%
   - Likes: [X]
   - Comments: [X]
   - Shares: [X]
   - Profile visits: [X]

4. Update Notion "Content Performance Tracker":
   - Find post entry
   - Fill all metrics
   - Status: Published → Measured
   - Tier: Auto-berekend (A/B/C/D)

**Checklist**:
- [ ] Wouter post metrics updated
- [ ] Recruitin post metrics updated
- [ ] Blog analytics checked (Google Analytics)
- [ ] Tier assigned (A/B/C/D)

---

#### 10:10-10:20 | Weekly Insights Generation

**Outlook Event**:
```
Titel: 💡 Weekly Content Insights
Tijd: Maandag 10:10-10:20 (10 min)
Recurring: Elke maandag
Reminder: Geen (direct na metrics)
Categorie: Analytics
```

**Taken**:

In Claude Code:
```
Analyze weekly content performance:

POST 1 (Wouter - Contrarian):
- Impressions: [X]
- Engagement: [Y]%
- Comments: [Z]
- Tier: [A/B/C/D]

POST 2 (Recruitin - Data Story):
- Impressions: [X]
- Engagement: [Y]%
- Comments: [Z]
- Tier: [A/B/C/D]

POST 3 (Blog):
- Views: [X]
- Time on page: [Y] min
- Conversions: [Z]

Generate insights:
1. What worked? (3 bullets)
2. What didn't? (2 bullets)
3. Recommendations next week (3 actions)
4. Pattern detected? (timing, angle, format)

Save to: Notion dashboard insights section
```

**Checklist**:
- [ ] Insights generated
- [ ] Saved in Notion
- [ ] Action items for next week noted

---

### 📅 DINSDAG-DONDERDAG

#### Doorlopend | Engagement Monitoring

**Outlook Event**:
```
Titel: 💬 LinkedIn Engagement Check
Tijd: Dinsdag-Donderdag 10:00-10:10 (10 min)
Recurring: Di, Wo, Do
Reminder: 10am
Categorie: Engagement
Priority: Low (quick check)
```

**Taken**:
- [ ] Check LinkedIn notifications
- [ ] Respond to comments (Wouter + Recruitin posts)
- [ ] Like meaningful comments
- [ ] Answer questions

**Tijd**: 5-10 min total (verspreid over 3 dagen)

**Regel**: Respond binnen 24h (LinkedIn algoritme boost)

---

## 🗓️ MONTHLY ADDITIONS

### Laatste Vrijdag Van Maand

#### 17:00-17:20 | Monthly Newsletter

**Outlook Event**:
```
Titel: 📧 LinkedIn Newsletter (Monthly)
Tijd: Laatste vrijdag, 17:00-17:20 (20 min)
Recurring: Monthly (last Friday)
Reminder: 1 dag van tevoren
Categorie: Newsletter
```

**Taken**:
1. Pipedrive data ophalen (placements deze maand)
2. Top artikel van maand (check Notion)
3. Generate newsletter (Claude)
4. Publish LinkedIn Newsletter
5. Promote in feed

**Checklist**:
- [ ] Data verzameld
- [ ] Artikel geselecteerd
- [ ] Newsletter geschreven
- [ ] Published op LinkedIn
- [ ] Promoted

---

### Eerste Maandag Van Maand

#### 10:00-10:20 | Monthly Review

**Outlook Event**:
```
Titel: 📊 Monthly Content Review
Tijd: Eerste maandag, 10:00-10:20 (20 min)
Recurring: Monthly (first Monday)
Reminder: 9am day before
Categorie: Analytics
```

**Taken**:
- [ ] Review all posts van afgelopen maand
- [ ] Identify best performers (top 5)
- [ ] Identify worst performers (bottom 3)
- [ ] Patterns analysis (Claude)
- [ ] Adjust strategy next month
- [ ] Document learnings

---

## 📋 COMPLETE WEEKLY CALENDAR

### Week Overzicht (Voor Outlook)

```
┌──────────────────────────────────────────────────────────┐
│  MAANDAG                                                 │
├──────────────────────────────────────────────────────────┤
│  09:00  Content goes live (automatic)                    │
│  10:00  📊 Metrics update (10 min)                       │
│  10:10  💡 Weekly insights (10 min)                      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  DINSDAG                                                 │
├──────────────────────────────────────────────────────────┤
│  10:00  💬 Engagement check (5 min)                      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  WOENSDAG                                                │
├──────────────────────────────────────────────────────────┤
│  10:00  💬 Engagement check (5 min)                      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  DONDERDAG                                               │
├──────────────────────────────────────────────────────────┤
│  10:00  💬 Engagement check (5 min)                      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  VRIJDAG                                                 │
├──────────────────────────────────────────────────────────┤
│  17:00  📰 News scraping (5 min)                         │
│  17:05  ✍️  Content generation (10 min)                  │
│  17:15  🎨 Visual production (25 min)                    │
│  17:40  📝 Review & edit (10 min)                        │
│  17:50  🚀 Publishing (10 min)                           │
│  18:00  Weekend! 🍺                                      │
└──────────────────────────────────────────────────────────┘

WEEKEND: Vrij (content scheduled, loopt automatic maandag)
```

**Total**: 80 minuten/week
- Vrijdag: 60 min (content creation)
- Maandag: 20 min (tracking)
- Di/Wo/Do: 15 min total (engagement)

---

## 📅 POSTING SCHEDULE (Optimale Tijden)

### LinkedIn Wouter (Personal)

**Beste Tijden** (Nederlandse markt):
- **Dinsdag 8-9am** ← BESTE (hoogste reach)
- Woensdag 12-1pm
- Donderdag 8-9am

**Jouw Schedule**:
- **Post vrijdag 18:00** (direct na creation)
- OF: Schedule voor **dinsdag 8am** (betere reach, maar planning ahead)

**Aanbeveling**: Vrijdag 18:00 = makkelijk, dinsdag 8am = optimaal

---

### LinkedIn Recruitin (Company)

**Beste Tijden**:
- **Maandag 9-10am** ← BESTE (week start)
- Dinsdag 9-10am
- Woensdag 9-10am

**Jouw Schedule**:
- **Schedule: Maandag 9am** (via Buffer)
- Posted automatic
- Check 9:30am of het live staat

---

### Blog (Website)

**Beste Tijden** (SEO crawling patterns):
- **Maandag 9am** ← BESTE (week start, fresh content signal)
- Dinsdag 9am
- Woensdag 9am

**Jouw Schedule**:
- **Schedule: Maandag 9am** (WordPress)
- Goes live automatic
- Check 10am voor errors

---

## 📊 REVIEW FILE SCHEMA

### Notion: Content Performance Tracker

**Update Momenten**:

**VRIJDAG 18:00** (Bij publicatie):
```
Create new entry:

Metadata:
- Titel, Type, Angle, Word Count
- Visual type, Source artikel
- Publicatie datum/tijd
- Status: Published

Performance: [Empty - vullen maandag]
```

**MAANDAG 10:00** (48h later):
```
Update entry:

Performance metrics:
- Impressions, Engagement rate
- Likes, Comments, Shares
- Profile visits, Link clicks
- Status: Measured
- Tier: Auto-berekend
```

**MAANDAG 10:10** (Insights):
```
Add to dashboard:

Weekly insights:
- Best performer: [Post] ([X]%)
- Learning: [What worked]
- Action: [Next week focus]
```

---

## 🔔 OUTLOOK CALENDAR EVENTS (Importeer Deze)

### Recurring Events Setup

**Event 1: VRIJDAG - Content Creation Block**
```
Subject: 📰 Weekly Content Creation
Start: Vrijdag 17:00
End: Vrijdag 18:00
Recurrence: Weekly (every Friday)
Reminder: 10 min before
Category: Content
Priority: High
Notes:
  Commands:
  cd ~/recruitin-mcp-servers
  node generate-news-report-now.js && node select-top-articles.js --top3

  Then: Claude content generation
  Then: Canva visuals
  Then: Publish + Schedule

  Checklist: See COMPLETE-COMMANDS-WORKFLOWS.md
```

---

**Event 2: MAANDAG - Metrics & Insights**
```
Subject: 📊 Content Metrics Update
Start: Maandag 10:00
End: Maandag 10:20
Recurrence: Weekly (every Monday)
Reminder: 9:50am
Category: Analytics
Priority: Medium
Notes:
  1. LinkedIn analytics (wouter + recruitin posts)
  2. Update Notion database (all metrics)
  3. Generate weekly insights (Claude)
  4. Save to dashboard

  File: CONTENT-TRACKING-DATABASE-DESIGN.md
```

---

**Event 3: DI/WO/DO - Engagement**
```
Subject: 💬 LinkedIn Engagement
Start: 10:00
End: 10:10
Recurrence: Weekly (Tuesday, Wednesday, Thursday)
Reminder: 10am
Category: Engagement
Priority: Low
Notes:
  Quick check:
  - Respond to comments
  - Like meaningful replies
  - Answer questions

  Max 10 min total
```

---

**Event 4: LAATSTE VRIJDAG - Newsletter**
```
Subject: 📧 Monthly Newsletter (Tech Talent Insights)
Start: Laatste vrijdag 17:00
End: Laatste vrijdag 17:20
Recurrence: Monthly (last Friday)
Reminder: 1 day before
Category: Newsletter
Priority: High
Notes:
  1. Pipedrive data (placements deze maand)
  2. Beste artikel van maand (Notion)
  3. Generate newsletter (Claude)
  4. Publish LinkedIn Newsletter
  5. Promote

  Template: LINKEDIN-NEWSLETTER-EENVOUDIG.md
```

---

## 📥 OUTLOOK .ICS FILE (Importeer Dit)

Ik maak een .ics bestand dat je direct in Outlook kan importeren:

**File**: `content-schedule.ics`

```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Recruitin//Content Intelligence//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH

BEGIN:VEVENT
UID:content-creation-friday@recruitin.nl
DTSTAMP:20260112T000000Z
DTSTART:20260117T160000Z
DTEND:20260117T170000Z
RRULE:FREQ=WEEKLY;BYDAY=FR
SUMMARY:📰 Weekly Content Creation
DESCRIPTION:Complete workflow:\n1. News scraping (5min)\n2. Content generation (10min)\n3. Visuals (25min)\n4. Review (10min)\n5. Publish (10min)\n\nCommands: See COMPLETE-COMMANDS-WORKFLOWS.md
CATEGORIES:Content Creation
PRIORITY:5
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:Start content creation in 10 min
END:VALARM
END:VEVENT

BEGIN:VEVENT
UID:metrics-monday@recruitin.nl
DTSTAMP:20260112T000000Z
DTSTART:20260120T090000Z
DTEND:20260120T091000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
SUMMARY:📊 Content Metrics Update
DESCRIPTION:Update Notion with LinkedIn stats:\n- Impressions\n- Engagement rate\n- Comments\n- Generate weekly insights\n\nFile: CONTENT-TRACKING-DATABASE-DESIGN.md
CATEGORIES:Analytics
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
END:VALARM
END:VEVENT

BEGIN:VEVENT
UID:engagement-check@recruitin.nl
DTSTAMP:20260112T000000Z
DTSTART:20260114T090000Z
DTEND:20260114T091000Z
RRULE:FREQ=WEEKLY;BYDAY=TU,WE,TH
SUMMARY:💬 LinkedIn Engagement
DESCRIPTION:Respond to comments (5-10 min)\nLike replies\nAnswer questions
CATEGORIES:Engagement
PRIORITY:3
END:VEVENT

BEGIN:VEVENT
UID:newsletter-monthly@recruitin.nl
DTSTAMP:20260112T000000Z
DTSTART:20260131T160000Z
DTEND:20260131T162000Z
RRULE:FREQ=MONTHLY;BYSETPOS=-1;BYDAY=FR
SUMMARY:📧 Monthly Newsletter - Tech Talent Insights
DESCRIPTION:LinkedIn Newsletter:\n1. Pipedrive data\n2. Beste artikel\n3. Mijn take\n\nTemplate: LINKEDIN-NEWSLETTER-EENVOUDIG.md
CATEGORIES:Newsletter
PRIORITY:5
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Newsletter tomorrow! Prepare data.
END:VALARM
END:VEVENT

END:VCALENDAR
```

---

## 📥 IMPORTEER IN OUTLOOK

### Optie A: Via File

**File gemaakt**: `content-schedule.ics`

**Import**:
1. Outlook → File → Import
2. Select `content-schedule.ics`
3. Import to calendar
4. **DONE!** Alle events recurring ✅

---

### Optie B: Manual Setup (Als .ics niet werkt)

**In Outlook Calendar**:

**Maak 4 recurring events**:

1. **Vrijdag 17:00-18:00** - "Content Creation"
2. **Maandag 10:00-10:20** - "Metrics Update"
3. **Di/Wo/Do 10:00-10:10** - "Engagement"
4. **Laatste Vrijdag 17:00-17:20** - "Newsletter" (monthly)

---

## 🎯 QUICK REFERENCE CHECKLIST

### Print Dit Uit (Wekelijkse Checklist)

```
═══════════════════════════════════════════════════════════
WEEKLY CONTENT CHECKLIST
═══════════════════════════════════════════════════════════

VRIJDAG 17:00-18:00 (60 min)
─────────────────────────────────────────────────────────
□ 17:00 Run: node generate-news-report-now.js
□ 17:02 Run: node select-top-articles.js --top3
□ 17:03 Run: node upload-to-correct-notion.js
□ 17:05 Claude: "Maak weekly content"
□ 17:15 Canva: Infographic (10 min)
□ 17:25 Canva: Blog images (15 min)
□ 17:40 Review: Content + visuals
□ 17:50 Publish: LinkedIn Wouter (now)
□ 17:53 Schedule: LinkedIn Recruitin (Monday 9am)
□ 17:56 Schedule: Blog (Monday 9am)
□ 18:00 DONE! Weekend in 🍺

MAANDAG 10:00-10:20 (20 min)
─────────────────────────────────────────────────────────
□ 09:00 Check: Content live? (LinkedIn + Blog)
□ 10:00 LinkedIn: View analytics (Wouter post)
□ 10:05 LinkedIn: View analytics (Recruitin post)
□ 10:10 Notion: Update metrics (both posts)
□ 10:15 Claude: Generate weekly insights
□ 10:18 Notion: Save insights to dashboard
□ 10:20 DONE!

DI/WO/DO 10:00 (5 min each)
─────────────────────────────────────────────────────────
□ Check LinkedIn notifications
□ Respond to comments
□ Like + engage

═══════════════════════════════════════════════════════════
```

**Print & Pin**: Naast je bureau voor eerste 4 weken (tot het automatisch gaat)

---

## 🔔 REMINDERS & ALERTS

### Outlook Reminders Configuratie

**Vrijdag Content Creation**:
- Reminder: 16:50 (10 min van tevoren)
- Alert: "Content creation start in 10 min - save what you're doing"

**Maandag Metrics**:
- Reminder: 09:50 (10 min van tevoren)
- Alert: "LinkedIn stats ready - update Notion"

**Newsletter (Monthly)**:
- Reminder: 1 dag van tevoren (donderdag)
- Alert: "Newsletter tomorrow - collect Pipedrive data"

---

## 📊 TRACKING TEMPLATE (Notion)

### Simpele Wekelijkse Tracking Table

**In Notion** (onder LinkedIn Hub):

```
═══════════════════════════════════════════════════════════
📊 CONTENT PERFORMANCE LOG
═══════════════════════════════════════════════════════════

Week | Post | Type | Pub Datum | Engagement | Comments | Tier
─────┼──────┼──────┼───────────┼────────────┼──────────┼─────
W2   | Culture fit | Wouter | 14-01 | 5.8% | 23 | A
W2   | Tech data | Recruitin | 13-01 | 3.2% | 8 | B
W2   | HR blog | Blog | 13-01 | 340 views | - | -
─────┼──────┼──────┼───────────┼────────────┼──────────┼─────
W3   | [Next week] | ... | ... | ... | ... | ...
```

**Update**:
- Vrijdag: Add new row (metadata)
- Maandag: Fill metrics
- Simpel. Overzichtelijk.

---

## ✅ SETUP ACTIONS (Morgen)

### 1. Import Calendar Events (5 min)

**Download .ics file**:
```bash
# File is ready in repo
open ~/recruitin-mcp-servers/content-schedule.ics
```

**Import in Outlook**:
- File → Import → Select .ics
- All events imported with recurring ✅

---

### 2. Create Notion Tracking Table (5 min)

**In Notion "LinkedIn Intelligence Hub"**:
- New page: "📊 Content Performance Log"
- Add table (simpele versie - 7 kolommen)
- Done!

---

### 3. Test First Entry (5 min)

**Add deze week's posts**:
- Row 1: Wouter post (metadata only - metrics volgen maandag)
- Row 2: Recruitin post
- Row 3: Blog

**Practice**: Voor je het eerste keer doet (leer het systeem)

---

## 🎯 FINAL CHECKLIST

**Morgen Setup**:
- [ ] Import .ics in Outlook (5 min)
- [ ] Create Notion tracking table (5 min)
- [ ] Add first 3 entries (test, 5 min)
- [ ] Review CONTENT-REVIEW-DOCUMENT.md
- [ ] Publish content if ready

**Volgende Week**:
- [ ] Calendar events triggeren automatic
- [ ] Follow workflow
- [ ] Track in Notion
- [ ] Optimize based on data

---

**Status**: Complete weekly schedule designed ✅
**Ready**: Voor Outlook import ✅
**Notion**: Tracking framework ready ✅

---

*Weekly Content Schedule | Outlook Calendar | Notion Tracking*
*Total Time: 80 min/week | Verspreid over 3 dagen*
