# 🚀 Deploy Webhook to Vercel - Complete Instructions

## Step-by-Step Deployment

### 1. Login to Vercel
```bash
export PATH="$HOME/.npm-global/bin:$PATH"
vercel login
```
**Follow the login prompts in your browser**

### 2. Deploy to Production
```bash
vercel --prod
```
**Answer the prompts:**
- Set up and deploy? → `Y`
- Which scope? → Choose your account
- Link to existing project? → `N` 
- Project name → `recruitin-webhook-relay` (or any name)
- In which directory is your code? → `.` (current directory)

### 3. Set Environment Variable
After deployment:
1. Go to https://vercel.com/dashboard
2. Find your project: `recruitin-webhook-relay`
3. Go to Settings → Environment Variables
4. Add variable:
   - **Name:** `PIPEDRIVE_API_TOKEN`
   - **Value:** `57720aa8b264cb9060c9dd5af8ae0c096dbbebb5`
   - **Environment:** Production
5. Click "Save"

### 4. Redeploy (to apply environment variable)
```bash
vercel --prod
```

### 5. Get Your Webhook URL
You'll receive a URL like:
```
https://recruitin-webhook-relay-abc123.vercel.app
```

Your webhook endpoint will be:
```
https://recruitin-webhook-relay-abc123.vercel.app/webhook/new-deal
```

## 6. Configure Pipedrive Webhook

### Option A: Use the Auto-Configuration Script
1. **Update the script with your Vercel URL:**
   ```bash
   # Edit configure-pipedrive-webhook.cjs
   # Change WEBHOOK_URL to your Vercel URL
   const WEBHOOK_URL = 'https://YOUR-VERCEL-URL.vercel.app/webhook/new-deal';
   ```

2. **Run the script:**
   ```bash
   node configure-pipedrive-webhook.cjs
   ```

### Option B: Manual Configuration in Pipedrive
1. Login to https://recruitinbv.pipedrive.com
2. Go to Settings (⚙️) → Apps and integrations → Webhooks
3. Click "Add webhook"
4. Fill in:
   - **URL:** `https://YOUR-VERCEL-URL.vercel.app/webhook/new-deal`
   - **Event action:** `added`
   - **Event object:** `deal`
   - **Version:** `1.0`
5. Save

## 7. Test the Setup

### Test Health Check
```bash
curl https://YOUR-VERCEL-URL.vercel.app/health
```

### Test Webhook
```bash
curl -X POST https://YOUR-VERCEL-URL.vercel.app/webhook/new-deal \
  -H "Content-Type: application/json" \
  -d '{
    "current": {
      "id": 12345,
      "title": "Test Email Automation",
      "pipeline_id": 14,
      "org_name": "Test Company",
      "person_name": "Test Contact",
      "person_email": "test@example.com"
    }
  }'
```

### Create Test Deal in Pipedrive
1. Go to Pipedrive
2. Create new deal in **Pipeline 14** (Corporate Recruiter)
3. Watch for automatic stage movement to "Email Sequence Ready"
4. Check deal notes for automation confirmation

## 🎉 What Happens When It Works

1. **New Deal Created** → Pipeline 14 → Webhook triggers
2. **Vercel Function** → Processes webhook → Moves deal to stage 105
3. **Pipedrive Automation** → Detects stage change → Starts email sequence
4. **6 Emails Sent** → Automatic follow-up over 49 days

## Troubleshooting

### If deployment fails:
- Make sure you're in the correct directory
- Check that all files are present (api/, vercel.json, package.json)

### If webhook doesn't trigger:
- Check Vercel function logs in dashboard
- Verify environment variable is set
- Test health endpoint first

### If Pipedrive doesn't move stage:
- Verify API token has permissions
- Check that stage ID 105 exists in your pipeline

## Current Files Ready for Deployment:
✅ `api/webhook/new-deal.js` - Main webhook handler
✅ `api/health.js` - Health check
✅ `vercel.json` - Vercel configuration  
✅ `package.json` - Dependencies

**Ready to deploy! Run the commands above.** 🚀