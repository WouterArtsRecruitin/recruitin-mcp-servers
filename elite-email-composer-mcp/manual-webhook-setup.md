# Manual Pipedrive Webhook Setup

## Alternative Solution: Manual Configuration

Since ngrok requires authentication, here's how to configure the webhook manually in Pipedrive:

### Step 1: Prepare Webhook Information

**Webhook URL:** We'll configure this manually in Pipedrive UI
**Event:** Deal added
**Purpose:** Trigger email sequence automation for Pipeline 14

### Step 2: Manual Configuration in Pipedrive

1. **Login to Pipedrive:**
   - Go to: https://recruitinbv.pipedrive.com
   - Login with your credentials

2. **Navigate to Webhook Settings:**
   - Go to Settings (gear icon)
   - Click on "Apps and integrations"
   - Select "Webhooks" or "API"

3. **Create New Webhook:**
   - Click "Add webhook"
   - **Event:** `deal.added`
   - **URL:** `http://83.82.140.185:3004/webhook/new-deal`
   - **Version:** `1.0`
   - **Authentication:** None

4. **Save and Test**

### Step 3: Test with Local Tunnel (Alternative)

If you prefer to use a tunnel service:

1. **Using localtunnel (free alternative to ngrok):**
   ```bash
   npm install -g localtunnel
   lt --port 3004
   ```

2. **Using Cloudflare Tunnel:**
   ```bash
   # Install cloudflared
   brew install cloudflare/cloudflare/cloudflared
   
   # Start tunnel
   cloudflared tunnel --url localhost:3004
   ```

### Step 4: Verify Setup

Once configured, the webhook will:

1. **Receive:** New deal notifications from Pipedrive
2. **Filter:** Only process Pipeline 14 (Corporate Recruiter) deals
3. **Generate:** 6-email sequence automatically
4. **Move:** Deal to "Email Sequence Ready" stage
5. **Trigger:** Pipedrive automation to send emails

### Current Webhook Relay Server Status

✅ **Running:** localhost:3004
✅ **Health Check:** http://localhost:3004/health
✅ **Dashboard:** http://localhost:3004

### Test the Integration

After webhook setup, create a test deal in Pipeline 14:

1. **Deal Title:** "Test Email Automation"
2. **Pipeline:** 14 (Corporate Recruiter)
3. **Contact:** Add contact info

Watch the webhook relay server logs to see it receive and process the webhook.

### Alternative: Local Testing Only

For testing without public webhooks:

```bash
# Test webhook locally
curl -X POST http://localhost:3004/webhook/new-deal \
  -H "Content-Type: application/json" \
  -d '{
    "current": {
      "id": 12345,
      "title": "Test Deal",
      "pipeline_id": 14,
      "org_name": "Test Company",
      "person_name": "Test Contact",
      "person_email": "test@example.com"
    }
  }'
```

This will simulate a Pipedrive webhook and test your automation locally.