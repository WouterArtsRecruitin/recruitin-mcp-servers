# 📊 CONTENT TRACKING DATABASE & DASHBOARD - Complete Ontwerp

**Doel**: Track elke post → Meten wat werkt → Data-driven optimalisatie
**Platform**: Notion (gebruik je bestaande LinkedIn Intelligence Hub)
**Tijd**: 10 min setup, 5 min/week maintenance

---

## 🗄️ DATABASE SCHEMA

### Notion Database: "Content Performance Tracker"

**Locatie**: Onder je LinkedIn Intelligence Hub
**Type**: Database (table view + gallery view + dashboard view)

---

### PROPERTIES (20 velden - Praktisch)

#### 📝 Content Info (Bij Creatie)

**1. Titel** (Title)
- Post/artikel titel
- Voorbeeld: "HR trends contrarian take"

**2. Type** (Select)
- LinkedIn Personal (Wouter)
- LinkedIn Company (Recruitin)
- Blog (recruitin.nl)
- Newsletter (monthly)

**3. Content Angle** (Select)
- Contrarian Take
- Data Story
- How-To / Practical
- Behind-the-Scenes

**4. Word Count** (Number)
- Aantal woorden
- Voorbeeld: 298, 1047

**5. Visual Type** (Select)
- Geen (text-only)
- Infographic
- Chart/Graph
- Photo
- Video

**6. Source Artikel** (URL)
- Link naar nieuws artikel basis
- Voorbeeld: https://www.salarisvanmorgen.nl/...

**7. Bronvermelding Compleet** (Checkbox)
- ✅ = Alle bronnen vermeld
- ❌ = Incomplete

---

#### 📅 Publishing Info

**8. Publicatie Datum** (Date)
- Wanneer gepost
- Voorbeeld: 14-01-2026

**9. Publicatie Tijd** (Select)
- 08:00-09:00 (morning prime)
- 12:00-13:00 (lunch)
- 17:00-18:00 (evening)
- Weekend

**10. Platform** (Select)
- Wouter Personal Profile
- Recruitin Company Page
- Beide

**11. Status** (Select)
- Draft
- Scheduled
- Published
- Archived

---

#### 📊 Performance Metrics (48h na publicatie)

**12. Impressions** (Number)
- Total views
- Van LinkedIn analytics

**13. Engagement Rate** (Number)
- Percentage (berekend: interactions/impressions * 100)
- Voorbeeld: 5.8

**14. Likes** (Number)
- Reactions count

**15. Comments** (Number)
- Comment count

**16. Shares** (Number)
- Reshares count

**17. Saves** (Number)
- LinkedIn bookmarks

**18. Profile Visits** (Number)
- Clicks naar profiel

**19. Link Clicks** (Number)
- Voor posts met URL (blog links, website)

---

#### 🎯 Analysis (Wekelijks)

**20. Performance Tier** (Select)
- A (Top 20% - Replicate!)
- B (Above average)
- C (Average)
- D (Below average - Learn why)

**Auto-berekend op basis van**:
- A: Engagement >5%
- B: Engagement 3-5%
- C: Engagement 2-3%
- D: Engagement <2%

---

## 📊 DATABASE VIEWS

### View 1: GALLERY (Visual Overview)

**Layout**: Cards met preview
**Grouped by**: Performance Tier (A/B/C/D)
**Sort**: By Engagement Rate (highest first)

**Card Properties**:
- Titel (groot)
- Type badge
- Engagement rate (prominent)
- Publicatie datum

**Filter**: This month (laatste 30 dagen)

---

### View 2: TABLE (Detailed Data)

**Columns** (zichtbaar):
| Titel | Type | Angle | Pub Datum | Tijd | Impressions | Engagement | Comments | Tier |

**Sort**: By Publicatie Datum (newest first)
**Filter**: All time (complete history)

**Use**: Data analyse, export to CSV

---

### View 3: DASHBOARD (Weekly Performance)

**Layout**: Board view
**Grouped by**: Week
**Cards**: Per post

**Properties visible**:
- Titel
- Type (Wouter/Recruitin/Blog)
- Engagement rate (big number)
- Tier badge

**Filter**: Last 8 weeks

---

### View 4: BEST PERFORMERS (Learning)

**Layout**: Table
**Filter**: Performance Tier = A
**Sort**: Engagement Rate (highest first)
**Limit**: Top 20

**Use**: Learn from best → Replicate winning formulas

**Grouped by**: Content Angle (see which angles work best)

---

## 🎨 DASHBOARD DESIGN

### Notion Page: "Content Performance Dashboard"

**Locatie**: Als subpage onder LinkedIn Intelligence Hub

---

### SECTION 1: THIS WEEK (Gallery View)

```
═══════════════════════════════════════════════════════════════
📊 THIS WEEK PERFORMANCE
═══════════════════════════════════════════════════════════════

[Gallery View - Filter: Last 7 days]

┌─────────────────┬─────────────────┬─────────────────┐
│  POST 1         │  POST 2         │  POST 3         │
│  [Wouter]       │  [Recruitin]    │  [Blog]         │
│  Engagement:    │  Engagement:    │  Impressions:   │
│  5.8% 🟢        │  3.2% 🟡        │  340            │
│  Tier: A        │  Tier: B        │  Tier: -        │
│  23 comments    │  8 comments     │  (pending)      │
└─────────────────┴─────────────────┴─────────────────┘
```

**Auto-updates**: Als je metrics invult

---

### SECTION 2: PERFORMANCE TRENDS (Charts)

**Embed Notion Chart**:

**Chart 1: Engagement Rate Over Time** (Line chart)
- X-axis: Week number
- Y-axis: Avg engagement rate %
- Lines: Wouter (blauw), Recruitin (oranje)
- Time period: Last 12 weeks

**Chart 2: Post Performance by Angle** (Bar chart)
- Bars: Contrarian, Data Story, How-To, Behind-Scenes
- Value: Avg engagement rate per angle
- Shows: Which angle works best

**Chart 3: Best Publishing Times** (Bar chart)
- Bars: 8am, 12pm, 5pm
- Value: Avg engagement per time slot
- Shows: Optimal posting time

---

### SECTION 3: INSIGHTS & LEARNINGS (Text Block)

**Auto-Generated Weekly** (via Claude):

```
🎯 WEEKLY INSIGHTS - Week [X]

BEST PERFORMERS:
✅ "HR trends contrarian" (5.8%) - Contrarian angle works!
✅ Post met data (4.5%) - Cijfers trekken aandacht

UNDERPERFORMERS:
⚠️ Generic tips post (2.1%) - Te algemeen
⚠️ Friday evening post (2.8%) - Timing suboptimaal

PATTERNS DETECTED:
→ Dinsdag 8-9am = beste reach (avg 5.2%)
→ Text-only posts = hogere engagement (5.1% vs 3.8%)
→ Contrarian > How-to (5.5% vs 2.8%)

RECOMMENDATIONS NEXT WEEK:
1. MORE contrarian takes (proven winner)
2. Post dinsdag/woensdag morning (not friday)
3. Skip visuals voor Wouter posts (text performs better)
4. Include more data points (engagement trigger)

A/B TEST NEXT:
→ Short (250 chars) vs Long (1200 chars)
→ Data in opening vs data in middle
```

---

### SECTION 4: TOP PERFORMERS ALL-TIME (Table)

**Linked Database View**: "Content Performance Tracker"
**Filter**: Tier = A
**Sort**: Engagement Rate DESC
**Limit**: Top 10

**Columns**:
| Rank | Titel | Type | Angle | Engagement | Comments | Tier |
|------|-------|------|-------|------------|----------|------|
| 1 | Culture fit kritiek | Wouter | Contrarian | 5.8% | 23 | A |
| 2 | ... | ... | ... | ... | ... | ... |

**Use**: Templates voor toekomstige content (what works)

---

### SECTION 5: A/B TESTS (Tracker)

**Database**: "Content Experiments"

| Test | Hypothesis | Control | Variant | Result | Conclusion |
|------|------------|---------|---------|--------|------------|
| Timing | Dinsdag 8am > Vrijdag 5pm | Post A (Vr 5pm) | Post B (Di 8am) | +45% engagement | ✅ Confirm |
| Length | Short > Long | 250 chars | 1200 chars | -10% engagement | ❌ Reject |

**Status**: Planning / Running / Complete

---

## 📝 WEEKLY TRACKING WORKFLOW

### Maandag Ochtend (10 minuten)

**METRICS UPDATE - 48h Na Publicatie**:

```bash
# ═══════════════════════════════════════════════════════════
# WEEKLY METRICS UPDATE
# Tijd: 10 minuten | Elke maandag 10:00
# Actie: LinkedIn stats → Notion database
# ═══════════════════════════════════════════════════════════

# STAP 1: Open LinkedIn Posts (Vrijdag/Weekend gepost)
# Voor elk post:

# LinkedIn → Post → "View analytics" → Note cijfers:

LINKEDIN WOUTER POST:
- Impressions: [X]
- Engagement rate: [X]%
- Reactions: [X]
- Comments: [X]
- Shares: [X]
- Profile visits: [X]

LINKEDIN RECRUITIN POST:
- [Same metrics]

# STAP 2: Update Notion Database

# Open: Content Performance Tracker database
# Find: Posts van afgelopen weekend
# Update properties:
# - Impressions: [X]
# - Engagement Rate: [X]
# - Likes/Comments/Shares: [X]
# - Status: Published → Measured

# STAP 3: Auto-Tier Assignment

# Notion formula (in Performance Tier property):
# if(prop("Engagement Rate") > 5, "A",
#    if(prop("Engagement Rate") > 3, "B",
#       if(prop("Engagement Rate") > 2, "C", "D")))

# Tiers updaten automatic!

# STAP 4: Quick Insights (In Claude Code)

Analyze deze week's content performance:

Post 1 (Wouter): [X] impressions, [Y]% engagement, [Z] comments
Post 2 (Recruitin): [X] impressions, [Y]% engagement, [Z] comments

Compare:
- Which performed better?
- Why? (angle, timing, visual, topic)
- Replicate for next week?

Output: 3 bullet insights + 2 recommendations

# Save insights in dashboard

# ═══════════════════════════════════════════════════════════
# DONE! Metrics tracked. Insights documented.
# ═══════════════════════════════════════════════════════════
```

---

## 📈 PERFORMANCE DASHBOARD (Notion Template)

### Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│  CONTENT PERFORMANCE DASHBOARD                             │
│  LinkedIn Intelligence Hub                                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📊 QUICK STATS (This Month)                               │
│                                                            │
│  ┌──────────────┬──────────────┬──────────────┐           │
│  │  12 POSTS    │  4.2% AVG    │  2,150       │           │
│  │  Published   │  Engagement  │  Impressions │           │
│  └──────────────┴──────────────┴──────────────┘           │
│                                                            │
│  Best: "Culture fit kritiek" (5.8%)                        │
│  Worst: "Generic tips" (2.1%)                              │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🏆 THIS WEEK (Gallery View)                               │
│                                                            │
│  [Card 1]          [Card 2]          [Card 3]             │
│  HR trends post    Tech data post    Blog artikel          │
│  Tier: A           Tier: B           Pending               │
│  5.8%              3.2%              -                     │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📈 TRENDS (Charts - Last 8 Weeks)                         │
│                                                            │
│  [Line Chart: Engagement Rate Over Time]                   │
│  Wouter: 📈 (improving)                                    │
│  Recruitin: → (stable)                                     │
│                                                            │
│  [Bar Chart: Performance by Angle]                         │
│  Contrarian: 5.5% ████████                                │
│  Data Story: 4.2% ██████                                  │
│  How-To: 2.8% ████                                        │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  💡 INSIGHTS & LEARNINGS                                   │
│                                                            │
│  What's Working:                                           │
│  ✅ Contrarian takes (highest engagement)                  │
│  ✅ Dinsdag morning posts (best reach)                     │
│  ✅ Text-only voor Wouter (vs with image)                 │
│  ✅ Data-driven content (triggers discussion)              │
│                                                            │
│  What's Not Working:                                       │
│  ⚠️ Generic tips (low engagement)                         │
│  ⚠️ Friday afternoon (poor timing)                        │
│  ⚠️ Too promotional (audience resists)                    │
│                                                            │
│  Recommendations Next Week:                                │
│  → Focus on contrarian takes                               │
│  → Post dinsdag/woensdag 8-9am                            │
│  → More data points in posts                               │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🔬 A/B TESTS (Active)                                     │
│                                                            │
│  Test 1: Timing (Dinsdag 8am vs Vrijdag 5pm)             │
│  Status: Running | Results: Week 3                         │
│                                                            │
│  Test 2: Length (250 chars vs 1200 chars)                 │
│  Status: Planning | Start: Week 3                          │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🏆 TOP 10 ALL-TIME (Table View)                           │
│                                                            │
│  [Linked Database: Top performers only]                    │
│  Sorted by: Engagement Rate DESC                           │
│                                                            │
│  Use: Templates for future content                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 TRACKING WORKFLOW (Wekelijks)

### Vrijdag: Bij Publicatie (5 min)

**Na content generation**:

```
Notion → Content Performance Tracker → New Entry

Fill in (bij creatie):
─────────────────────────────────────────────
Titel: "HR trends vs Technical Recruitment"
Type: LinkedIn Personal (Wouter)
Content Angle: Contrarian Take
Word Count: 298
Visual Type: Geen (text-only)
Source Artikel: https://www.salarisvanmorgen.nl/...
Bronvermelding: ✅ (in comment)
Publicatie Datum: 14-01-2026
Publicatie Tijd: 08:00-09:00
Platform: Wouter Personal Profile
Status: Scheduled → Published (after posting)

Performance (leave empty - fill Monday):
- Impressions: -
- Engagement Rate: -
- Comments: -
[etc.]
─────────────────────────────────────────────

SAVE
```

**Repeat voor**: LinkedIn Recruitin + Blog

**Tijd**: 5 minuten (3 entries)

---

### Maandag: Metrics Update (10 min)

**48h na publicatie**:

```
Voor elk post van vrijdag/weekend:

1. Open LinkedIn post
2. Click "View analytics"
3. Note cijfers:
   - Impressions: [X]
   - Engagement rate: [X]%
   - Reactions: [X]
   - Comments: [X]
   - Shares: [X]
   - Profile visits: [X]

4. Update Notion entry:
   - Fill all performance metrics
   - Status: Measured
   - Tier: Auto-berekend (A/B/C/D)

5. Repeat voor alle 3 posts
```

**Tijd**: 10 minuten

**Result**: Complete performance data in Notion

---

### Maandag: Weekly Insights (5 min)

**In Claude Code**:
```
Analyze weekly content performance:

Post 1 (Wouter - Contrarian):
- Impressions: 1,450
- Engagement: 5.8%
- Comments: 23
- Tier: A

Post 2 (Recruitin - Data Story):
- Impressions: 680
- Engagement: 3.2%
- Comments: 8
- Tier: B

Post 3 (Blog):
- Views: 340
- Time on page: 4:30
- Tier: - (different metrics)

Generate:
1. What worked this week? (3 bullets)
2. What didn't work? (2 bullets)
3. Recommendations next week (3 actions)
4. Pattern detected? (timing, angle, format)

Output: Weekly insights (save in dashboard)
```

**Tijd**: 5 minuten
**Output**: Actionable insights voor volgende week

---

## 📊 EXAMPLE DATABASE ENTRIES

### Entry 1: LinkedIn Wouter Post

```
Titel: "Culture Fit Is Giftig - Contrarian Take"
Type: LinkedIn Personal (Wouter)
Content Angle: Contrarian Take
Word Count: 298
Visual Type: Geen
Source Artikel: https://www.salarisvanmorgen.nl/2026/01/02/...
Bronvermelding: ✅
Publicatie Datum: 14-01-2026
Publicatie Tijd: 08:00-09:00
Platform: Wouter Personal
Status: Published

Performance (updated 16-01):
- Impressions: 1,450
- Engagement Rate: 5.8%
- Likes: 67
- Comments: 23
- Shares: 12
- Saves: 8
- Profile Visits: 34

Performance Tier: A (auto-calculated)
Learnings: "Contrarian + data = high engagement. Replicate!"
```

---

### Entry 2: LinkedIn Recruitin Post

```
Titel: "Technical Recruitment Data Story"
Type: LinkedIn Company (Recruitin)
Content Angle: Data Story
Word Count: 349
Visual Type: Infographic
Source Artikel: Same as above
Bronvermelding: ✅
Publicatie Datum: 13-01-2026
Publicatie Tijd: 09:00
Platform: Recruitin Company
Status: Published

Performance:
- Impressions: 680
- Engagement Rate: 3.2%
- Likes: 18
- Comments: 8
- Shares: 4
- Link Clicks: 12 (to website)

Performance Tier: B
Learnings: "Infographic helped, maar company page = lower reach"
```

---

## 📈 MONTHLY REPORTING

### Eind Van Maand (15 min)

**Generate Monthly Report** (In Claude):

```
Analyze monthly content performance:

Source: Notion Content Performance Tracker
Period: [MAAND] 2026
Total posts: 12

Data:
[Export Notion database as CSV → Paste hier]

Generate report:

1. OVERVIEW:
   - Total posts: [X]
   - Avg engagement: [X]%
   - Total impressions: [X]
   - Best performer: [Titel] ([X]%)
   - Worst performer: [Titel] ([X]%)

2. BY PLATFORM:
   - Wouter posts: [X] (avg [Y]% engagement)
   - Recruitin posts: [X] (avg [Y]% engagement)
   - Blog articles: [X] (avg [Y] views)

3. BY ANGLE:
   - Contrarian: [X]% avg (best!)
   - Data Story: [X]% avg
   - How-To: [X]% avg
   - Behind-Scenes: [X]% avg

4. BY TIMING:
   - Morning (8-9am): [X]% avg (best!)
   - Midday (12-1pm): [X]% avg
   - Evening (5-6pm): [X]% avg

5. TRENDS:
   - MoM growth: [X]% (vs vorige maand)
   - Follower growth: +[X]
   - Best week: Week [X] ([Y]% avg)

6. LEARNINGS:
   - Top 3 wins
   - Top 2 fails
   - Process improvements

7. NEXT MONTH:
   - Continue: [What works]
   - Stop: [What doesn't]
   - Experiment: [New tests]

Format: Executive summary (voor jezelf/team)
```

**Save**: `reports/monthly-performance-[MONTH].md`

---

## 🎯 SIMPLE NOTION SETUP (10 minuten)

### Stap-voor-Stap Setup

**1. Create Database** (3 min):
```
In Notion:
1. Ga naar "LinkedIn Intelligence Hub"
2. Type "/database"
3. Select "Table - Inline"
4. Naam: "Content Performance Tracker"
```

**2. Add Properties** (5 min):
```
Click "+" om properties toe te voegen:

Essential (minimum viable):
- Titel (title) - auto
- Type (select): Wouter, Recruitin, Blog
- Publicatie Datum (date)
- Impressions (number)
- Engagement Rate (number)
- Comments (number)
- Tier (select): A, B, C, D

Optional (later):
- Word Count, Visual Type, Source Artikel, etc.
```

**3. Create Views** (2 min):
```
Add view → Gallery (visual)
Add view → Table (data)
Add view → Board (grouped by tier)
```

**DONE!** Database ready.

---

## 📊 MINIMAL VIABLE TRACKING (Start Simple)

**Als je het simpel wilt houden**:

### Notion Simple Table

```
Page: "Content Tracking" (onder je hub)

Format: Gewone table (geen database)

| Datum | Post Titel | Type | Engagement | Comments | Notes |
|-------|------------|------|------------|----------|-------|
| 14-01 | Culture fit | Wouter | 5.8% | 23 | A-tier! Replicate |
| 13-01 | Tech data | Recruitin | 3.2% | 8 | B-tier, OK |
| 13-01 | HR blog | Blog | 340 views | - | Pending |
```

**Tijd**: 5 minuten per week
**Value**: Simpel overzicht, geen database complexity

**Later upgraden**: Naar full database als je meer wilt analyseren

---

## 🎯 MIJN AANBEVELING

### Week 1-4: SIMPLE TABLE

Start met simpele Notion table (zie boven)
- Track: Datum, Titel, Type, Engagement, Comments
- Learn: Wat werkt, wat niet
- Time: 5 min/week

### Week 5+: FULL DATABASE (Als Je Data Wilt)

Upgrade naar database met:
- 20 properties (complete tracking)
- Multiple views (gallery, table, dashboard)
- Charts & insights
- A/B testing framework

**Maar**: Start simple!

---

## ✅ SETUP MORGEN (Als Je Wilt)

**Optie A: Simpele Table** (5 min):
1. Notion → LinkedIn Hub → New page "Content Tracking"
2. Add table (zie format boven)
3. Add eerste 3 entries (deze week's posts)
4. KLAAR!

**Optie B: Full Database** (15 min):
1. Follow setup steps boven
2. 20 properties
3. 3 views
4. Test met dummy data

**Optie C: Niks** (0 min):
- Laat Notion, focus op content
- Metrics bijhouden in spreadsheet/hoofd
- Simpelste optie

**Jouw keuze!**

---

**Files ready**:
- ✅ COMPLETE-COMMANDS-WORKFLOWS.md (alle commands)
- ✅ CONTENT-TRACKING-DATABASE-DESIGN.md (dit document)
- ✅ Top 10 in Notion (uploaded!)

**Tot morgen!** 😴🎯
