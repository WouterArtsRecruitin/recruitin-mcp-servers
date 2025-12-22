# Vercel Deployment for Pipedrive Webhook Automation

## Quick Deploy to Vercel

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
# From this directory
vercel --prod
```

### Step 4: Set Environment Variables
After deployment, set the environment variable in Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add: `PIPEDRIVE_API_TOKEN` = `57720aa8b264cb9060c9dd5af8ae0c096dbbebb5`

### Step 5: Get Your Webhook URL
After deployment, you'll get a URL like:
```
https://your-project-name.vercel.app
```

Your webhook endpoint will be:
```
https://your-project-name.vercel.app/webhook/new-deal
```

### Step 6: Configure Pipedrive
Use the webhook URL in Pipedrive's webhook settings:

1. Login to Pipedrive
2. Go to Settings → Apps and integrations → Webhooks
3. Create new webhook:
   - **URL:** `https://your-project-name.vercel.app/webhook/new-deal`
   - **Event:** `deal.added`
   - **Version:** `1.0`

### Testing
- **Health Check:** `https://your-project-name.vercel.app/health`
- **Webhook Test:** Create a new deal in Pipeline 14

### What It Does
1. **Receives** Pipedrive webhook when new deal is created
2. **Filters** for Pipeline 14 (Corporate Recruiter) only
3. **Moves** deal to "Email Sequence Ready" stage
4. **Adds** automation note to deal
5. **Triggers** Pipedrive's email automation sequence

### Local Development
```bash
# Install dependencies
npm install

# Start local development server
vercel dev

# Test locally
curl -X POST http://localhost:3000/webhook/new-deal \
  -H "Content-Type: application/json" \
  -d '{"current":{"id":123,"title":"Test","pipeline_id":14}}'
```

## File Structure
```
/
├── api/
│   ├── webhook/
│   │   └── new-deal.js     # Main webhook handler
│   └── health.js           # Health check endpoint
├── vercel.json             # Vercel configuration
├── package.json            # Dependencies
└── README-VERCEL.md        # This file
```

## Deployment URL
After deployment, your webhook will be publicly accessible and ready for Pipedrive integration!