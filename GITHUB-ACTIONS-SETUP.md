# GitHub Actions Automation Setup

## Overview

This guide helps you activate the automated content generation workflows. Once configured, the system runs automatically:
- **Daily at 7:00**: News scraping
- **Friday at 17:00**: Content generation + Notion upload + GitHub issue creation

## Step 1: Add GitHub Secrets (5 min)

Navigate to your repository settings:
```
https://github.com/WouterArtsRecruitin/recruitin-mcp-servers/settings/secrets/actions
```

Or manually:
1. Go to your GitHub repository
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

### Required Secrets

Add these 3 secrets:

#### 1. BRAVE_API_KEY
- **Name**: `BRAVE_API_KEY`
- **Value**: `BSARdxCQWTc2qwf41D9nweSyzfBzf6B`
- **Used by**: Daily scraping + weekly article selection

#### 2. ANTHROPIC_API_KEY
- **Name**: `ANTHROPIC_API_KEY`
- **Value**: Your Anthropic API key (starts with `sk-ant-api03-`)
- **Used by**: Weekly content generation via Claude
- **Get it**: https://console.anthropic.com/settings/keys

#### 3. NOTION_API_KEY
- **Name**: `NOTION_API_KEY`
- **Value**: `ntn_n921362306174F3yoW5yeNwFGnruLy9JiB0YV2GANOAe3c`
- **Used by**: Weekly Notion database upload

### Verification

After adding all 3 secrets, you should see:
```
✅ BRAVE_API_KEY
✅ ANTHROPIC_API_KEY
✅ NOTION_API_KEY
```

## Step 2: Enable Workflows (2 min)

The workflows are already committed to your repository. GitHub Actions should be enabled by default.

### Verify Workflows Are Active

1. Navigate to Actions tab:
   ```
   https://github.com/WouterArtsRecruitin/recruitin-mcp-servers/actions
   ```

2. You should see 2 workflows:
   - ✅ Daily News Scraper
   - ✅ Weekly Content Generator

3. If you see a yellow banner saying "Workflows aren't being run on this repository":
   - Click **"I understand my workflows, go ahead and enable them"**

## Step 3: Test Manual Trigger (5 min)

Before waiting for the cron schedule, test the workflows manually:

### Test Daily News Scraper

1. Go to: https://github.com/WouterArtsRecruitin/recruitin-mcp-servers/actions/workflows/daily-news-scraper.yml
2. Click **"Run workflow"** (right side)
3. Click **"Run workflow"** (green button)
4. Wait 1-2 minutes for completion
5. ✅ Success: Check `reports/recruitment-news-YYYY-MM-DD.html` exists

### Test Weekly Content Generator

**IMPORTANT**: Only run this after daily scraping has created a fresh report!

1. Go to: https://github.com/WouterArtsRecruitin/recruitin-mcp-servers/actions/workflows/weekly-content-gen.yml
2. Click **"Run workflow"**
3. Click **"Run workflow"** (green button)
4. Wait 2-3 minutes for completion
5. ✅ Success indicators:
   - New file: `weekly-content/content-YYYY-MM-DD.json`
   - New file: `reports/top-articles-YYYY-MM-DD.json`
   - New GitHub Issue created with content preview
   - 10 articles uploaded to Notion database

## Step 4: Verify Automated Schedule (2 min)

### Check Cron Schedules

The workflows run automatically on these schedules:

**Daily News Scraper**:
- **Schedule**: Every day at 6:00 UTC (7:00 Amsterdam winter / 8:00 summer)
- **Next run**: Check the Actions tab for "Next scheduled run"

**Weekly Content Generator**:
- **Schedule**: Every Friday at 16:00 UTC (17:00 Amsterdam winter / 18:00 summer)
- **Next run**: Check the Actions tab for "Next scheduled run"

### First Automated Run

You don't need to do anything! The workflows will run automatically:
- **Tomorrow morning 7:00**: Daily scraper runs
- **This Friday 17:00**: Content generator runs

### Monitor Workflow Runs

1. Go to Actions tab: https://github.com/WouterArtsRecruitin/recruitin-mcp-servers/actions
2. Click on a workflow name to see run history
3. Click on a specific run to see:
   - ✅ Green checkmarks = success
   - ❌ Red X = failure (click to see error logs)
   - 🟡 Yellow circle = running
   - ⚪ Gray = queued

## Weekly Content Workflow Details

When the **Weekly Content Generator** runs on Friday at 17:00, it:

1. **Selects top 10 articles** from the week's scraped news
2. **Uploads to Notion** database (949d73d7816f4b35b2c806654ad0a3c4)
3. **Generates content** via Claude API:
   - LinkedIn Wouter post (250-300 chars, personal take)
   - LinkedIn Recruitin post (350-400 chars, data story)
   - Blog article (1000-1200 words, full analysis)
4. **Creates GitHub Issue** with content preview for review
5. **Commits files**:
   - `weekly-content/content-YYYY-MM-DD.json`
   - `reports/top-articles-YYYY-MM-DD.json`

### Review Content

Every Friday at ~17:05, check your GitHub Issues:
```
https://github.com/WouterArtsRecruitin/recruitin-mcp-servers/issues
```

Look for issue titled: **📝 Weekly Content - Week XX - YYYY-MM-DD**

The issue contains:
- ✅ LinkedIn Wouter post (ready to copy/paste)
- ✅ LinkedIn Recruitin post (ready to copy/paste)
- ✅ Links to full content files
- ✅ Link to Notion database
- ✅ Next steps checklist

## Troubleshooting

### Workflow Failed - "Secret not found"

**Problem**: Missing or incorrectly named secret

**Solution**:
1. Go to Settings → Secrets → Actions
2. Verify secret names match exactly:
   - `BRAVE_API_KEY` (not `BRAVE_KEY` or `BRAVE_API`)
   - `ANTHROPIC_API_KEY` (not `CLAUDE_API_KEY`)
   - `NOTION_API_KEY` (not `NOTION_TOKEN`)
3. Re-add the secret if name was wrong

### Workflow Failed - "object_not_found" (Notion)

**Problem**: Notion integration doesn't have database access

**Solution**:
1. Go to: https://www.notion.so/949d73d7816f4b35b2c806654ad0a3c4
2. Click **"..."** → **"Connections"** → **"Add connection"**
3. Select your integration
4. Grant **"Edit"** permissions

### Workflow Failed - "Rate limit exceeded"

**Problem**: Anthropic API rate limit hit

**Solution**:
- Wait 60 minutes, then manually trigger workflow again
- Or wait until next Friday for automatic retry

### No GitHub Issue Created

**Problem**: Content generation failed or jq parsing error

**Solution**:
1. Check workflow logs in Actions tab
2. Look for the "Create GitHub Issue" step
3. Check if `weekly-content/content-YYYY-MM-DD.json` exists
4. Verify JSON structure matches expected format

### Articles Not Appearing in Notion

**Problem**: Database properties mismatch or permission issues

**Solution**:
1. Run verification script:
   ```bash
   cd ~/recruitin-mcp-servers
   node find-notion-databases.js
   ```
2. Check database properties match:
   - Titel, URL, Score, Rank, Week, Content Angle, Platform, Gebruikt, Status
3. If properties are different, update `upload-to-correct-notion.js` lines 27-69

## Success Checklist

After setup, verify:

- [ ] All 3 GitHub Secrets added
- [ ] Workflows visible in Actions tab
- [ ] Manual test of daily scraper succeeded
- [ ] Manual test of weekly generator succeeded
- [ ] New GitHub Issue created with content
- [ ] 10 articles visible in Notion database
- [ ] Files committed to repository:
  - [ ] `reports/recruitment-news-YYYY-MM-DD.html`
  - [ ] `reports/top-articles-YYYY-MM-DD.json`
  - [ ] `weekly-content/content-YYYY-MM-DD.json`

## What Happens Next?

### Automated Weekly Cycle

**Monday-Thursday (Daily 7:00)**:
- Scraper runs automatically
- Commits news reports to `reports/` directory
- No action needed from you

**Friday (17:00)**:
- Content generator runs automatically
- Creates GitHub Issue for review
- Uploads to Notion
- **Your action**: Check GitHub Issue, review content, create visuals, schedule posts

**Weekend**:
- No automated tasks

### Weekly Content Calendar

After automation runs, follow your manual schedule:

1. **Friday 17:00-18:00**: Review generated content in GitHub Issue
2. **Friday 18:00**: Post LinkedIn Wouter content
3. **Saturday/Sunday**: Create visuals in Canva if needed
4. **Monday 9:00**: Schedule LinkedIn Recruitin + Blog posts

Import calendar: `~/recruitin-content-intelligence-system/content-schedule.ics`

## Files Reference

- **Workflows**:
  - `.github/workflows/daily-news-scraper.yml`
  - `.github/workflows/weekly-content-gen.yml`
- **Scripts**:
  - `generate-news-report-now.js` (daily scraping)
  - `select-top-articles.js` (article scoring)
  - `upload-to-correct-notion.js` (Notion upload)
- **Documentation**:
  - `CONTENT-INTELLIGENCE-README.md` (overview)
  - `COMPLETE-COMMANDS-WORKFLOWS.md` (manual commands)
  - `WEEKLY-CONTENT-SCHEDULE.md` (detailed schedule)
  - `UNBLOCK-INSTRUCTIONS.md` (Notion troubleshooting)

## Support

If workflows fail after setup:
1. Check Actions tab for error logs
2. Review troubleshooting section above
3. Check Notion database access
4. Verify API keys are still valid

**Notion Database URL**: https://www.notion.so/Weekly-Top-10-News-2e62252cbb15812697a9eb7166e6b3b8

---

**Last Updated**: 2026-01-15
**Status**: Ready for activation
