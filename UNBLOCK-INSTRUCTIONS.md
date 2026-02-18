# Unblock Notion Upload Workflow

## Current Status

✅ **Deduplication fixed** - Set-based URL deduplication prevents duplicate articles
✅ **Upload script rewritten** - Now uses pages API instead of blocks API
✅ **Data source verified** - `reports/top-articles-2026-01-15.json` exists (6,426 bytes)
✅ **Workflow automation ready** - `complete-upload-workflow.sh` created
❌ **Database access blocked** - 9 consecutive 404 errors from Notion API

## The Problem

The integration cannot access the Notion database because it hasn't been granted permissions. Notion requires explicit permission grants through the UI.

**Database:** Articles Database (created 2026-01-15)
**Database ID:** `949d73d7816f4b35b2c806654ad0a3c4`
**URL:** https://www.notion.so/949d73d7816f4b35b2c806654ad0a3c4

**Note:** The database was successfully created inside the "Weekly Top 10 News" page, but needs permission grant.

## Required Action: Grant Database Access

Follow these steps to grant the integration access to your database:

### Step 1: Open the Database

Navigate to: https://www.notion.so/949d73d7816f4b35b2c806654ad0a3c4

Or open "Weekly Top 10 News" page and scroll to the "Articles Database" section.

### Step 2: Access Connection Settings

1. Click the **"..."** menu button (top right corner of the page)
2. Hover over or click **"Connections"**
3. You'll see a list of integrations

### Step 3: Add the Integration

1. Click **"Add connection"** or **"Connect to"**
2. Search for your Notion integration
3. Select the integration from the list
4. Grant **"Edit"** permissions (required for creating pages)

### Step 4: Confirm Access

After granting access, verify it worked:

```bash
cd ~/recruitin-mcp-servers
node find-notion-databases.js
```

**Expected output:**
```
✅ Found database: Articles Database
   ID: 949d73d7-816f-4b35-b2c8-06654ad0a3c4
   Properties: Titel, URL, Score, Rank, Week, Content Angle, Platform, Gebruikt, Status
```

## Run the Complete Workflow

Once access is granted and verified, run the complete upload workflow:

```bash
cd ~/recruitin-mcp-servers
bash complete-upload-workflow.sh
```

This script will:
1. **Verify database access** - Checks the integration can reach the database
2. **Upload 10 articles** - Creates pages in the database from `reports/top-articles-2026-01-15.json`

## Verification Checklist

After running the workflow, verify the results:

- [ ] Script completed without errors
- [ ] 10 new pages created in Notion database
- [ ] Each page has: Titel, URL, Score, Rank, Week properties filled
- [ ] Top article (rank 1) marked as "Gebruikt" (checkbox = true)
- [ ] View results at: https://www.notion.so/Weekly-Top-10-News-2e62252cbb15812697a9eb7166e6b3b8

## Troubleshooting

### Still getting 404 errors?

1. **Check integration name** - Make sure you selected the correct integration
2. **Check permissions** - Integration needs "Edit" access, not just "Read"
3. **Refresh the page** - Sometimes Notion UI needs a refresh after granting access
4. **Wait 30 seconds** - Notion's API may take a moment to propagate permissions

### Property validation errors?

If you see property validation errors, the database schema might have different property names. Run:

```bash
node find-notion-databases.js
```

Compare the actual property names with what's in `upload-to-correct-notion.js` lines 27-69.

### Wrong database?

If you accidentally granted access to the wrong database, revoke it and start over:
1. Go to the correct database
2. Click "..." → "Connections" → "Add connection"
3. Select the integration again

## Files Involved

- `complete-upload-workflow.sh` - Main workflow script
- `find-notion-databases.js` - Database access verification
- `upload-to-correct-notion.js` - Article upload logic
- `reports/top-articles-2026-01-15.json` - Source data (10 articles)

## Weekly Content Calendar

After successful upload, follow the weekly content schedule in:
`~/recruitin-content-intelligence-system/content-schedule.ics`

**Key events:**
- **Friday 17:00-18:00** - Weekly content creation (includes this upload workflow)
- **Monday 10:00-10:20** - Content metrics & insights
- **Tuesday/Wednesday/Thursday 10:00** - LinkedIn engagement checks

Import this calendar file to your calendar app for automatic reminders.

## Next Steps After Unblocking

1. ✅ Grant database access (follow steps above)
2. ✅ Run `bash complete-upload-workflow.sh`
3. ✅ Verify 10 articles appear in Notion
4. Create content from top 3 articles (see `reports/top-articles-2026-01-15.json` for recommendations)
5. Follow weekly calendar schedule for ongoing content creation

---

**Last Updated:** 2026-01-15
**Status:** Waiting for database access grant
