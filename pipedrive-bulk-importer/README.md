# Google Sheets → Pipedrive Import Tool

Complete automation tool to import JobDigger data from Google Sheets into Pipedrive with proper Organizations, Persons, and Deals.

---

## 🎯 Features

✅ **Organizations**: Auto-create with deduplication  
✅ **Persons**: Auto-create with email deduplication  
✅ **Deals**: Create with all custom fields  
✅ **Smart linking**: Org ↔ Person ↔ Deal  
✅ **Rate limiting**: Respects Pipedrive API limits  
✅ **Error handling**: Detailed logging + retry logic  
✅ **Batch processing**: Test with 5 rows or import all 1000+  

---

## 📁 Files

```
pipedrive_import.py    # Core import logic + Pipedrive API client
run_import.py          # Integration with Google Sheets
direct_import.py       # Direct CLI tool (easiest to use)
README.md              # This file
```

---

## 🚀 Quick Start

### Step 1: Setup

```bash
# Set your Pipedrive API key
export PIPEDRIVE_API_KEY='your_api_key_here'

# Get your API key from:
# https://recruitin-b-v.pipedrive.com/settings/api
```

### Step 2: Prepare Data

**Option A: Export CSV from Google Sheets**
1. Open: https://docs.google.com/spreadsheets/d/1K1nbB0bjs9iplIs33Zz_CyOlcWyEvYk9_zK1TTI6xAw/
2. File → Download → CSV (.csv)
3. Save as `sheet_data.csv`

**Option B: Use Zapier JSON export**
1. Call Zapier Google Sheets MCP
2. Save output to `sheet_data.json`

**Option C: Use test data (5 rows built-in)**
- No file needed, script has test data

### Step 3: Run Import

```bash
# Interactive mode (recommended)
python3 direct_import.py

# Follow the prompts:
# 1. Choose data source (CSV/JSON/Test)
# 2. Choose batch size (5/20/50/all)
# 3. Confirm
# 4. Watch the magic happen! ✨
```

---

## 📊 Import Process

```
┌─────────────────────┐
│  Google Sheets      │
│  Voor_Pipedrive     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  1. Parse Rows      │
│  Check "GO" flag    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Organizations   │
│  Dedupe by name     │
│  Create or find     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. Persons         │
│  Dedupe by email    │
│  Link to org        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. Deals           │
│  Pipeline: 14       │
│  Stage: 95 (lead)   │
│  Custom fields      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ✅ Pipedrive       │
│  All linked!        │
└─────────────────────┘
```

---

## 🔧 Configuration

Edit `pipedrive_import.py` to customize:

```python
# Pipeline & Stage
DEFAULT_PIPELINE_ID = 14  # Corporate Recruiter Outreach
DEFAULT_STAGE_ID = 95     # lead

# Custom Fields (already mapped)
CUSTOM_FIELDS = {
    'vacature_titel': '4fe89b5e450089a5dd5168e92fe69bb98463f4f6',
    'locatie': '185eed88f971fcf8d8016ae96f38704fe4328f4f',
    'functie': '295172995802031aa3a8205f715b24b4cbf072ad',
    'externe_bemiddelaar': '644b2c458633fc986cb1562ac0fee7cb9f123772',
}

# Rate Limiting
RATE_LIMIT_DELAY = 0.2  # 200ms between API calls (5 per second)
```

---

## 📋 Data Mapping

### Google Sheets → Pipedrive

**Organization:**
- `bedrijfsnaam` → Organization `name`
- `stad` + `provincie` + `postcode` → `address`

**Person:**
- `voornaam` + `achternaam` → Person `name`
- `email` → `email` (used for deduplication)
- `telefoon` → `phone`
- `functie_contact` → Custom field `Functie`
- Auto-linked to organization

**Deal:**
- `deal_titel` → Deal `title`
- `functietitel` → Custom field `Vacature Titel`
- `stad` → Custom field `Locatie`
- Pipeline: 14 (Corporate Recruiter Outreach)
- Stage: 95 (lead)
- Auto-linked to org + person

---

## 🧪 Testing

### Test with 5 rows (recommended first run)

```bash
python3 direct_import.py
# Choose option 3 (Manual test data)
# Choose option 1 (Test import - 5 rows)
```

This creates:
- 5 organizations
- 5 persons
- 5 deals
- All properly linked

**Check in Pipedrive:**
- https://recruitin-b-v.pipedrive.com/
- Pipeline: Corporate Recruiter Outreach
- Stage: lead

---

## 🔥 Production Import

### Import all 1000+ rows

```bash
# Export your Google Sheet as CSV
# Then:

python3 direct_import.py
# Choose option 2 (From CSV file)
# Enter: sheet_data.csv
# Choose option 4 (FULL IMPORT)
# Type: yes
# Confirm

# Grab coffee ☕ (takes ~5-10 minutes for 1000 rows)
```

**Estimated time:**
- 5 rows: ~5 seconds
- 50 rows: ~1 minute
- 500 rows: ~10 minutes
- 1000 rows: ~20 minutes

---

## ⚠️ Important Notes

### Deduplication
- **Organizations**: Matched by exact name (case-insensitive)
- **Persons**: Matched by email address
- Existing items are reused, not duplicated

### Rate Limiting
- Script respects Pipedrive API limits (5 calls/second)
- Safe to run multiple times

### Error Handling
- If a row fails, script continues with next row
- Detailed error logging per row
- Final summary shows success/error counts

### Zapier Trigger Field
- Only rows with `zapier_trigger = "GO"` are imported
- Other rows are skipped automatically

---

## 🐛 Troubleshooting

### "Organization not found" error
**Cause:** Zapier tool can't find newly created org by ID  
**Solution:** Use direct API import (this script fixes that)

### "Person creation failed"
**Cause:** Email format invalid or missing  
**Solution:** Check email column in sheet, must be valid format

### "API key invalid"
**Cause:** Wrong or missing API key  
**Solution:** Check key at https://recruitin-b-v.pipedrive.com/settings/api

### "Too many API calls"
**Cause:** Rate limit hit  
**Solution:** Script auto-waits 200ms between calls (built-in)

---

## 📈 Performance Tips

### For large imports (500+ rows):

1. **Start small**: Test with 20 rows first
2. **Check duplicates**: Review deduplication logic
3. **Monitor**: Watch first 50 rows, check Pipedrive
4. **Batch import**: Split into chunks of 200-300 rows
5. **Off-peak hours**: Run during night for fastest API response

### Memory usage:
- 1000 rows ≈ 10MB RAM
- Safe to run on any modern machine

---

## 🔄 Integration with Zapier

### Option 1: Manual trigger
1. Export Google Sheets data via Zapier
2. Save to JSON file
3. Run this script

### Option 2: Webhook trigger
```python
# In Zapier:
# Trigger: New/Updated Row in Google Sheets
# Action: Webhook POST to your server
# Payload: Row data

# Then run:
from pipedrive_import import PipedriveClient, import_from_sheet

client = PipedriveClient(os.getenv('PIPEDRIVE_API_KEY'))
import_from_sheet([row_data], client, max_rows=1)
```

### Option 3: Scheduled batch
```bash
# Cron job (every night at 2 AM):
0 2 * * * /usr/bin/python3 /path/to/direct_import.py --auto --max-rows=100
```

---

## 📞 Support

**Issues?**
1. Check Pipedrive API key is valid
2. Verify Google Sheets format matches expected columns
3. Test with 5 rows first
4. Check error logs in terminal output

**Questions?**
- Pipedrive API docs: https://developers.pipedrive.com/
- Your Pipedrive: https://recruitin-b-v.pipedrive.com/

---

## ✅ Next Steps

After successful import:

1. **Verify data** in Pipedrive
2. **Test email sequences** (if using automation)
3. **Update Google Sheet** with Pipedrive IDs (optional)
4. **Set up Zapier automation** for real-time sync (optional)
5. **Create dashboard** to track pipeline metrics

---

## 🎯 Success Checklist

- [ ] API key configured
- [ ] Test import (5 rows) successful
- [ ] Data verified in Pipedrive
- [ ] Organizations properly linked
- [ ] Persons properly linked
- [ ] Deals in correct pipeline/stage
- [ ] Custom fields populated
- [ ] Ready for full import

---

**Ready to import? Let's go! 🚀**

```bash
python3 direct_import.py
```
