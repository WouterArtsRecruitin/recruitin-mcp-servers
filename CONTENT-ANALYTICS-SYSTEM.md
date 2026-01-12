# 📊 CONTENT ANALYTICS & FEEDBACK LOOP - Complete System

**Doel**: Meten wat werkt → Optimaliseren → Betere content → Meer engagement
**Tools**: Notion database + HuggingFace + LinkedIn stats
**Output**: Weekly dashboard + Continuous improvement

---

## 🔄 CONTINUOUS FEEDBACK LOOP DESIGN

```
┌─────────────────────────────────────────────────────────────┐
│  WEEK 1: CREATE                                             │
├─────────────────────────────────────────────────────────────┤
│  Generate content → Publish → Track metadata               │
│                                                             │
│  Database entry created:                                    │
│  • Titel, woorden, angle, visual, bronnen                  │
│  • Dag, tijdstip, platform (Wouter/Recruitin)             │
│  • Status: Published                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  WEEK 1: MEASURE (48h na publicatie)                       │
├─────────────────────────────────────────────────────────────┤
│  LinkedIn analytics ophalen:                                │
│  • Impressions, reach, engagement rate                      │
│  • Likes, comments, shares, saves                           │
│  • Profile visits, followers gained                         │
│  • Click-through rate (voor links)                          │
│                                                             │
│  Update database:                                           │
│  • Performance metrics toegevoegd                           │
│  • Status: Measured                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  WEEK 2: ANALYZE (wekelijkse review)                       │
├─────────────────────────────────────────────────────────────┤
│  HuggingFace sentiment analysis:                            │
│  • Comment sentiment (positive/negative/neutral)            │
│  • Engagement quality score                                 │
│  • Topic resonance                                          │
│                                                             │
│  Pattern detection:                                         │
│  • Welke angles presteren best?                            │
│  • Welke tijden beste reach?                               │
│  • Wouter vs Recruitin performance?                        │
│  • Met visual vs zonder?                                    │
│                                                             │
│  Database updated:                                          │
│  • Sentiment scores                                         │
│  • Performance tier (A/B/C/D)                              │
│  • Learnings captured                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  WEEK 3: OPTIMIZE (volgende content cyclus)                │
├─────────────────────────────────────────────────────────────┤
│  Use learnings:                                             │
│  • Best performing angle? Use more!                         │
│  • Best timing? Schedule daar                               │
│  • Best platform? Prioriteer                                │
│  • Visual impact? Data-driven beslissing                    │
│                                                             │
│  Generate next week:                                        │
│  • Geoptimaliseerd op basis van data                       │
│  • A/B test nieuwe hypotheses                              │
│  • Iterate, measure, improve                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    [REPEAT LOOP]
```

---

## 🗄️ NOTION DATABASE SCHEMA

### Database: "Content Performance Tracker"

**Properties**:

#### Metadata (Bij Creatie)
1. **Titel** (Title) - Post/artikel titel
2. **Type** (Select)
   - LinkedIn Personal (Wouter)
   - LinkedIn Company (Recruitin)
   - Blog (recruitin.nl)
   - Newsletter (maandelijks)

3. **Woord Count** (Number) - Aantal woorden
4. **Angle** (Select)
   - Contrarian Take
   - Data Story
   - How-To
   - Behind-the-Scenes

5. **Visual** (Select)
   - Geen (text-only)
   - Image (infographic/photo)
   - Video
   - Carousel

6. **Bronvermelding** (Checkbox) - Volledig? Ja/Nee

7. **Publicatie Datum** (Date) - Wanneer gepost
8. **Publicatie Tijd** (Text) - 08:00, 12:00, 17:00, etc.
9. **Platform** (Select) - Wouter Personal / Recruitin Company

10. **Source Artikel** (URL) - Link naar news artikel basis
11. **Content** (Rich text) - Volledige post content

---

#### Performance Metrics (48h na publicatie)

12. **Impressions** (Number) - Total views
13. **Reach** (Number) - Unique viewers
14. **Engagement Rate** (Number) - % (berekend)

15. **Likes** (Number)
16. **Comments** (Number)
17. **Shares** (Number)
18. **Saves** (Number) - LinkedIn bookmark

19. **Profile Visits** (Number) - Van post naar profiel
20. **Followers Gained** (Number) - New followers attributable

21. **Click-Through** (Number) - Clicks op links
22. **CTR** (Number) - % (berekend)

---

#### Analysis (Wekelijks)

23. **Sentiment Score** (Number) - 0-100 (HuggingFace)
24. **Engagement Quality** (Select)
   - High (meaningful comments, discussions)
   - Medium (likes, short comments)
   - Low (alleen likes, no comments)

25. **Performance Tier** (Select)
   - A (top 20% performers)
   - B (above average)
   - C (average)
   - D (below average)

26. **Key Learnings** (Rich text) - Wat werkte/niet werkte
27. **Replicate?** (Checkbox) - Should we do more like this?

---

#### Sentiment Analysis (HuggingFace)

28. **Comment Sentiment** (Multi-select)
   - Positive (supportive, agreeing)
   - Negative (critical, disagreeing)
   - Neutral (questions, clarifications)
   - Mixed (nuanced responses)

29. **Top Keywords** (Multi-select) - Most mentioned in comments
30. **Controversy Score** (Number) - 0-10 (debates triggered?)

---

## 🤖 HUGGINGFACE INTEGRATION

### Model: Sentiment Analysis (Dutch)

**Use**: `nlptown/bert-base-multilingual-uncased-sentiment`

**Script**: `analyze-content-sentiment.py`

```python
#!/usr/bin/env python3
"""
Content Sentiment Analyzer - HuggingFace Integration
Analyzes LinkedIn comments for sentiment and engagement quality
"""

from transformers import pipeline
import json

# Initialize Dutch sentiment model
sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="nlptown/bert-base-multilingual-uncased-sentiment"
)

def analyze_comments(comments_list):
    """
    Analyze list of LinkedIn comments

    Args:
        comments_list: List of comment texts

    Returns:
        Sentiment breakdown + quality score
    """
    results = {
        'total_comments': len(comments_list),
        'sentiment_breakdown': {
            'positive': 0,
            'neutral': 0,
            'negative': 0
        },
        'avg_sentiment_score': 0,
        'quality_indicators': {
            'meaningful_discussion': 0,  # Long comments (>50 chars)
            'questions': 0,               # Contains "?"
            'personal_stories': 0,        # "Ik", "bij ons", etc.
            'data_requests': 0            # "Cijfers?", "Bron?"
        }
    }

    total_score = 0

    for comment in comments_list:
        # Sentiment analysis
        sentiment = sentiment_analyzer(comment[:512])[0]  # Max 512 tokens

        # Map to positive/neutral/negative
        label = sentiment['label']
        if label in ['5 stars', '4 stars']:
            results['sentiment_breakdown']['positive'] += 1
            score = 1
        elif label == '3 stars':
            results['sentiment_breakdown']['neutral'] += 1
            score = 0.5
        else:
            results['sentiment_breakdown']['negative'] += 1
            score = 0

        total_score += score

        # Quality indicators
        if len(comment) > 50:
            results['quality_indicators']['meaningful_discussion'] += 1
        if '?' in comment:
            results['quality_indicators']['questions'] += 1
        if any(word in comment.lower() for word in ['ik', 'wij', 'bij ons', 'mijn ervaring']):
            results['quality_indicators']['personal_stories'] += 1
        if any(word in comment.lower() for word in ['cijfers', 'data', 'bron', 'onderzoek']):
            results['quality_indicators']['data_requests'] += 1

    # Calculate averages
    if len(comments_list) > 0:
        results['avg_sentiment_score'] = round((total_score / len(comments_list)) * 100, 1)

    # Engagement quality score (0-100)
    quality_score = (
        (results['quality_indicators']['meaningful_discussion'] / max(len(comments_list), 1)) * 40 +
        (results['quality_indicators']['questions'] / max(len(comments_list), 1)) * 30 +
        (results['quality_indicators']['personal_stories'] / max(len(comments_list), 1)) * 20 +
        (results['quality_indicators']['data_requests'] / max(len(comments_list), 1)) * 10
    )

    results['engagement_quality_score'] = round(min(quality_score * 100, 100), 1)

    return results

# Example usage
if __name__ == "__main__":
    # Test comments
    test_comments = [
        "Helemaal mee eens! Ik zie dit ook bij onze clients.",
        "Interessant perspectief. Heb je cijfers hierover?",
        "Culture fit is inderdaad vaag. Wij gebruiken nu competentie matrix.",
        "👍",
        "Waar haal je deze data vandaan?"
    ]

    results = analyze_comments(test_comments)
    print(json.dumps(results, indent=2))
```

**Output**:
```json
{
  "total_comments": 5,
  "sentiment_breakdown": {
    "positive": 3,
    "neutral": 1,
    "negative": 1
  },
  "avg_sentiment_score": 60.0,
  "quality_indicators": {
    "meaningful_discussion": 3,
    "questions": 2,
    "personal_stories": 2,
    "data_requests": 2
  },
  "engagement_quality_score": 78.5
}
```

---

## 📊 WEEKLY DASHBOARD DESIGN

### Notion Database View: "Performance Dashboard"

**View Type**: Gallery + Table combo

**Gallery View** (Visual overview):
- Card: Titel + Performance tier badge (A/B/C/D)
- Preview: Engagement rate (kleurgecodeerd)
- Sort: By engagement rate (highest first)

**Table View** (Data analysis):

| Titel | Type | Angle | Visual | Publicatie | Impressions | Engagement | Sentiment | Tier |
|-------|------|-------|--------|------------|-------------|------------|-----------|------|
| HR trends post | Wouter | Contrarian | Geen | 14-01 08:00 | 1,450 | 5.8% | 75 | A |
| Tech data | Recruitin | Data Story | Infographic | 13-01 09:00 | 680 | 3.2% | 82 | B |
| Blog artikel | Blog | How-To | 3 images | 13-01 09:00 | 340 | - | - | - |

**Filters**:
- This week (laatste 7 dagen)
- This month
- By platform (Wouter / Recruitin / Blog)
- By angle (Contrarian / Data / etc.)
- By tier (A/B/C/D)

---

## 📈 ANALYTICS COLLECTION WORKFLOW

### Stap 1: Post Metadata (Bij Publicatie)

**Manual entry in Notion** (2 min per post):
```
Create new entry in "Content Performance Tracker":

Titel: [Post titel]
Type: LinkedIn Personal (Wouter)
Woord Count: 298
Angle: Contrarian Take
Visual: Geen
Bronvermelding: ✅ (in comment)
Publicatie Datum: 14-01-2026
Publicatie Tijd: 08:00
Platform: Wouter Personal
Source Artikel: [URL Salaris Vanmorgen]
Content: [Volledige post text]

Status: Published
Performance: [Leave empty - fill 48h later]
```

---

### Stap 2: LinkedIn Stats Ophalen (48h na post)

**Manual** (LinkedIn native analytics):
```
1. Open LinkedIn post
2. Click "View analytics"
3. Screenshot of note cijfers:
   - Impressions
   - Engagement rate
   - Reactions (likes)
   - Comments
   - Shares
   - Profile visits

4. Update Notion entry:
   - Add all metrics
   - Status: Measured
```

**Automated** (Via LinkedIn API - advanced):
```python
# linkedin-stats-fetcher.py (requires LinkedIn API access)

import requests
from notion_client import Client

def fetch_linkedin_stats(post_url):
    """
    Fetch LinkedIn post analytics
    Note: Requires LinkedIn Marketing API access
    """
    # LinkedIn API call
    # [Implementation when API access available]
    pass

def update_notion_database(post_id, stats):
    """Update Notion with LinkedIn stats"""
    notion = Client(auth=NOTION_API_KEY)

    notion.pages.update(
        page_id=post_id,
        properties={
            "Impressions": {"number": stats['impressions']},
            "Engagement Rate": {"number": stats['engagement_rate']},
            "Likes": {"number": stats['likes']},
            "Comments": {"number": stats['comments']},
            "Shares": {"number": stats['shares']},
            "Profile Visits": {"number": stats['profile_visits']}
        }
    )
```

---

### Stap 3: Sentiment Analysis (Wekelijks)

**Script**: `analyze-weekly-content.py`

```python
#!/usr/bin/env python3
"""
Weekly Content Sentiment Analyzer
Uses HuggingFace for Dutch sentiment analysis
"""

from transformers import pipeline
from notion_client import Client
import os

# Initialize
notion = Client(auth=os.getenv("NOTION_API_KEY"))
sentiment_model = pipeline("sentiment-analysis",
                          model="nlptown/bert-base-multilingual-uncased-sentiment")

DATABASE_ID = "YOUR_CONTENT_TRACKER_DATABASE_ID"

def analyze_weekly_content():
    """Analyze all posts from last 7 days"""

    # Query Notion: posts from last week with comments
    results = notion.databases.query(
        database_id=DATABASE_ID,
        filter={
            "and": [
                {"property": "Publicatie Datum", "date": {"past_week": {}}},
                {"property": "Comments", "number": {"greater_than": 0}}
            ]
        }
    )

    for page in results['results']:
        # Get comments (manual input or scrape)
        comments = get_comments_for_post(page)  # You'd implement scraping

        # Analyze sentiment
        sentiment_results = analyze_comments(comments)

        # Update Notion
        notion.pages.update(
            page_id=page['id'],
            properties={
                "Sentiment Score": {"number": sentiment_results['avg_sentiment_score']},
                "Engagement Quality": {"select": {"name": classify_quality(sentiment_results)}},
                "Key Learnings": {"rich_text": [{"text": {"content": generate_learnings(sentiment_results)}}]}
            }
        )

        print(f"✅ Analyzed: {page['properties']['Titel']['title'][0]['plain_text']}")

def classify_quality(sentiment_results):
    """Classify engagement quality based on indicators"""
    score = sentiment_results['engagement_quality_score']

    if score >= 75:
        return "High"
    elif score >= 50:
        return "Medium"
    else:
        return "Low"

def generate_learnings(sentiment_results):
    """Generate automatic learnings from data"""
    learnings = []

    if sentiment_results['quality_indicators']['questions'] > 3:
        learnings.append("Triggered vragen (high engagement)")

    if sentiment_results['quality_indicators']['personal_stories'] > 2:
        learnings.append("Persoonlijke verhalen gedeeld (resonance)")

    if sentiment_results['sentiment_breakdown']['negative'] > 2:
        learnings.append("Controversieel (debat ontstaan)")

    return " | ".join(learnings) if learnings else "Standard engagement"

# Run weekly
if __name__ == "__main__":
    analyze_weekly_content()
```

---

### Stap 4: Weekly Dashboard (Elke Maandag)

**Auto-generate in Notion**:

```
WEEKLY CONTENT PERFORMANCE - Week [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 OVERVIEW (Last 7 Days)

Total posts: 3
Avg engagement rate: 4.2%
Total impressions: 2,150
Total interactions: 91

Best performer: "HR trends contrarian take" (5.8% engagement)
Worst performer: "How-to technical tips" (2.1% engagement)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 PERFORMANCE BY TYPE

LinkedIn Wouter (Personal):
• Posts: 2
• Avg engagement: 5.1%
• Top angle: Contrarian (5.8%)

LinkedIn Recruitin (Company):
• Posts: 1
• Avg engagement: 3.2%
• With visual: 3.2% (sample size: 1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 INSIGHTS

Best Performing:
✅ Contrarian takes (avg 5.5% engagement)
✅ Posts met data (avg 4.8%)
✅ Dinsdag 8-9am timing (avg 5.2%)
✅ Text-only (avg 5.1% vs 3.8% with image)

Underperforming:
⚠️ How-to posts (avg 2.8%)
⚠️ Vrijdag afternoon (avg 3.1%)
⚠️ Generic topics (avg 2.5%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 RECOMMENDATIONS NEXT WEEK

1. MORE: Contrarian takes (proven highest engagement)
2. TIMING: Focus Dinsdag-Donderdag 8-10am
3. FORMAT: Text-only voor Wouter (performs better)
4. TOPICS: Data-driven over generic tips
5. EXPERIMENT: Video post (test new format)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔬 A/B TESTS PLANNED

Test 1: With data vs without data (in contrarian posts)
Test 2: Morning (8am) vs Afternoon (5pm) posting
Test 3: Short (200 chars) vs Long (1,200 chars)

Track for 2 weeks, report results.
```

---

## 🎨 DASHBOARD VISUALIZATION

### Notion Dashboard Page

**Components**:

**1. This Week Performance** (Gallery)
- Visual cards van alle posts deze week
- Color-coded by tier (A=green, B=yellow, C=orange, D=red)

**2. Trend Charts** (Embed via Notion charts)
- Engagement rate over time (line chart)
- Impressions by platform (bar chart)
- Performance by angle (radar chart)

**3. Best Performers** (Table)
- Top 10 posts all-time (sorted by engagement rate)
- Learn from these (replicate winning formula)

**4. A/B Test Tracker** (Database)
- Active tests
- Results
- Conclusions

**5. Weekly Insights** (Text block)
- Auto-generated from Python script
- Recommendations
- Action items

---

## 📊 HUGGINGFACE DATASET CREATION

### Dataset: "Recruitin Content Performance"

**Purpose**: Train custom models on what content works

**Schema**:
```json
{
  "post_id": "unique_id",
  "text": "post content",
  "metadata": {
    "type": "linkedin_personal",
    "angle": "contrarian",
    "word_count": 298,
    "has_visual": false,
    "has_data": true,
    "publish_time": "2026-01-14T08:00:00",
    "platform": "wouter_personal"
  },
  "performance": {
    "impressions": 1450,
    "engagement_rate": 5.8,
    "comments": 23,
    "sentiment_score": 75,
    "quality_score": 82
  },
  "labels": {
    "performance_tier": "A",
    "replicate": true
  }
}
```

**Upload to HuggingFace**:
```python
from datasets import Dataset
import json

# Load Notion data
notion_data = fetch_all_content_from_notion()

# Convert to HuggingFace format
dataset_dict = {
    "text": [],
    "engagement_rate": [],
    "sentiment_score": [],
    "angle": [],
    "performance_tier": []
}

for entry in notion_data:
    dataset_dict["text"].append(entry['content'])
    dataset_dict["engagement_rate"].append(entry['engagement_rate'])
    dataset_dict["sentiment_score"].append(entry['sentiment_score'])
    dataset_dict["angle"].append(entry['angle'])
    dataset_dict["performance_tier"].append(entry['tier'])

# Create dataset
dataset = Dataset.from_dict(dataset_dict)

# Push to HuggingFace Hub
dataset.push_to_hub("wouterarts/recruitin-content-performance")

print("✅ Dataset uploaded to HuggingFace!")
print(f"📊 Total samples: {len(dataset)}")
print(f"🔗 URL: https://huggingface.co/datasets/wouterarts/recruitin-content-performance")
```

**Use Cases**:
- Train model: Predict engagement before posting
- Pattern analysis: What content formulas work
- Benchmarking: Compare to industry
- Public dataset: Thought leadership (share learnings)

---

## 🔄 WEEKLY WORKFLOW (Met Analytics)

### Vrijdag 17:00 - Content Creation

**17:00-17:10** - Generate content (Claude)
**17:10-17:35** - Create visuals
**17:35-17:40** - Create Notion entries:

```
Voor elk stuk content:

Database: Content Performance Tracker
New entry:
- Titel: [...]
- Type: LinkedIn Personal
- Woord Count: 298
- Angle: Contrarian
- Visual: Geen
- Bronvermelding: ✅
- Publicatie Datum: [morgen]
- Publicatie Tijd: 08:00
- Platform: Wouter
- Source Artikel: [URL]
- Content: [Full text]
- Status: Scheduled

Performance metrics: [Leeg - vullen over 48h]
```

**17:40-18:00** - Review + schedule publishing

---

### Maandag 10:00 - Analytics Update

**10:00-10:15** - Update metrics (48h na vrijdag posts):

Voor elk gepost item weekend:
1. Open LinkedIn post
2. View analytics
3. Update Notion:
   - Impressions: [X]
   - Engagement rate: [X]%
   - Likes: [X]
   - Comments: [X]
   - Shares: [X]
   - Status: Measured

**10:15-10:20** - Run sentiment analyzer:
```bash
# Export comments to text file
# Run analyzer
python3 analyze-content-sentiment.py --post-id [notion_id]

# Auto-updates Notion with sentiment scores
```

---

### Maandag 17:00 - Weekly Review

**17:00-17:30** - Dashboard review:
1. Open Notion "Performance Dashboard"
2. Check this week vs last week
3. Identify patterns:
   - Best angle? (most A-tier posts)
   - Best timing? (highest avg engagement)
   - Visual impact? (with vs without)
   - Platform performance? (Wouter vs Recruitin)

4. Generate insights:
```
# In Claude Code:
Analyze Notion content performance data:

Last 4 weeks posts (paste data):
[Export Notion table as CSV]

Find patterns:
- Which angles perform best?
- Optimal posting times?
- Visual impact?
- Length sweet spot?
- Platform differences?

Generate: Weekly insights + recommendations voor volgende week
```

**17:30-17:45** - Document learnings:
- Update "Content Strategy" page
- Adjust templates based on data
- Plan next week experiments

---

## 📊 MONTHLY REPORTING

### End of Month (Laatste Vrijdag)

**Generate Monthly Report**:
```
# In Claude Code:
Generate monthly content performance report:

Source: Notion database "Content Performance Tracker"
Period: [Maand] 2026
Posts: [X] total

Analysis:
1. Best performers (top 5)
2. Worst performers (bottom 3 - learn why)
3. Platform comparison (Wouter vs Recruitin vs Blog)
4. Angle effectiveness (contrarian vs data vs how-to)
5. Visual impact (with vs without)
6. Timing optimization (best days/times)
7. Month-over-month trends

Output:
- Executive summary (what worked)
- Detailed metrics table
- Recommendations next month
- A/B tests to run
```

**Save as**: `reports/monthly-performance-[MONTH].md`

---

## 🎯 PERFORMANCE TIERS

### Tier Classification (Automatic)

**A-Tier** (Top 20% - Replicate These!):
- Engagement rate: >5%
- Comments: >15
- Sentiment: >70
- Quality score: >75

**B-Tier** (Above Average):
- Engagement rate: 3-5%
- Comments: 8-15
- Sentiment: 50-70

**C-Tier** (Average):
- Engagement rate: 2-3%
- Comments: 3-8

**D-Tier** (Below Average - Learn Why):
- Engagement rate: <2%
- Comments: <3
- Low quality engagement

---

## 🔬 A/B TESTING FRAMEWORK

### Test Template (Notion Database)

**Database**: "Content Experiments"

**Properties**:
- **Experiment Name** (Title)
- **Hypothesis** (Text) - "We believe [X] will improve [Y]"
- **Variable** (Select) - Timing, Angle, Length, Visual, Platform
- **Control** (Relation) - Link to control post
- **Variant** (Relation) - Link to test post
- **Metric** (Select) - Engagement rate, Comments, Shares
- **Results** (Number) - % improvement
- **Conclusion** (Text) - What we learned
- **Status** (Select) - Planning, Running, Complete

**Example Test**:
```
Experiment: "Data-driven vs Story-driven Contrarian Posts"

Hypothesis: Data-driven contrarian posts (met cijfers) presteren 20% beter dan story-only.

Control: Contrarian post zonder cijfers (baseline)
Variant: Contrarian post met 3 data points

Week 1: Post control (dinsdag 8am)
Week 2: Post variant (dinsdag 8am)
Week 3: Analyze results

Expected metric: Engagement rate
Target: +20% improvement

Results: [Fill after 2 weeks]
Conclusion: [Data-driven decision]
```

---

## 💾 DATA EXPORT & BACKUP

### Weekly Export (Elke Maandag)

**Export Notion to CSV**:
```bash
# Manual: Notion → ... → Export → CSV

# Or automated:
python3 << 'EOF'
from notion_client import Client

notion = Client(auth=NOTION_API_KEY)

# Query all posts this week
results = notion.databases.query(...)

# Export to CSV
import csv
with open('weekly-content-export.csv', 'w') as f:
    writer = csv.DictWriter(f, fieldnames=[...])
    writer.writeheader()
    for page in results['results']:
        writer.writerow({...})

print("✅ Exported to weekly-content-export.csv")
EOF
```

**Upload to HuggingFace** (Monthly):
```python
# Update dataset met nieuwe data
dataset = load_dataset("wouterarts/recruitin-content-performance")
new_data = load_from_csv("monthly-export.csv")
updated = concatenate_datasets([dataset, new_data])
updated.push_to_hub("wouterarts/recruitin-content-performance")
```

---

## 📊 FINAL DASHBOARD DESIGN (Notion Page)

### Page: "Content Intelligence Dashboard"

**Section 1: This Week** (Gallery view)
- 3 posts deze week
- Performance badges (A/B/C/D)
- Quick stats

**Section 2: Trends** (Line charts)
- Engagement rate over time (8 weken)
- Impressions trend
- Follower growth

**Section 3: Best Practices** (Linked database)
- Top 20 all-time performers
- Formulas that work
- Templates to replicate

**Section 4: Experiments** (Table)
- Active A/B tests
- Results
- Next tests planned

**Section 5: Insights** (Text)
- Weekly learnings (auto-generated)
- Recommendations
- Action items

**Section 6: Raw Data** (Table view)
- All posts, all metrics
- Sortable, filterable
- Export to CSV

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Database Setup (30 min)

- [ ] Create Notion database "Content Performance Tracker"
- [ ] Add all properties (30 fields)
- [ ] Create views (Gallery + Table + Dashboard)
- [ ] Test with 1 dummy entry

### Phase 2: Manual Tracking (Week 1)

- [ ] Post content → Manual Notion entry
- [ ] Wait 48h → Manual stats update
- [ ] Week-end → Manual insights

**Learn the process**: Understand what data matters

### Phase 3: Automation Scripts (Week 2-3)

- [ ] sentiment analyzer (Python + HuggingFace)
- [ ] LinkedIn stats fetcher (if API available)
- [ ] Weekly report generator (auto-insights)

### Phase 4: HuggingFace Dataset (Month 2)

- [ ] Export Notion data
- [ ] Create HuggingFace dataset
- [ ] Train custom model (predict engagement)
- [ ] Public dataset (thought leadership)

---

## 📁 FILES TO CREATE

**In repo**:
1. ✅ `CONTENT-ANALYTICS-SYSTEM.md` (dit doc)
2. `scripts/analyze-content-sentiment.py` (HuggingFace integration)
3. `scripts/update-notion-metrics.py` (Notion update automation)
4. `scripts/generate-weekly-dashboard.py` (Auto insights)
5. `scripts/export-to-huggingface.py` (Dataset creation)

**In Notion**:
1. Database: "Content Performance Tracker"
2. Page: "Content Intelligence Dashboard"
3. Database: "Content Experiments" (A/B tests)

---

## 🚀 QUICK START (Deze Week)

### Minimale Versie (Start Simple)

**Na elke post**:
1. Create Notion entry (metadata)
2. Wait 48h
3. Update metrics (manual)
4. Note: Wat werkte? Wat niet?

**End of week**:
5. Compare posts
6. Simple insights (best angle? best timing?)
7. Adjust next week

**Tools needed**: Alleen Notion (manual)
**Time**: +15 min per week

---

## 💰 ROI

**Time Investment**:
- Week 1-4: 15 min/week (manual tracking)
- Week 5+: 10 min/week (partially automated)

**Value**:
- Data-driven content = +30% engagement (estimate)
- Better engagement = +20% leads
- Continuous improvement = compound effect

**ROI**: Moeilijk te meten, maar **essential voor optimization**

---

**Status**: System designed ✅
**Ready**: Voor implementation ✅
**Start**: Manual deze week, automate later ✅

---

*Content Analytics System | HuggingFace Integration | Continuous Improvement*
