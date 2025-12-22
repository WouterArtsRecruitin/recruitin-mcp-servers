# Webhook Configuration Solutions

## Problem
Your local webhook server (port 3004) is not accessible from the internet, so Pipedrive cannot reach it directly.

## Solution Options

### Option 1: Use ngrok (Recommended - Quick Setup)

1. **Install ngrok:**
   ```bash
   # Install via Homebrew
   brew install ngrok
   
   # Or download from https://ngrok.com/
   ```

2. **Start ngrok tunnel:**
   ```bash
   # In a new terminal window
   ngrok http 3004
   ```

3. **Copy the public URL** (something like `https://abc123.ngrok.io`)

4. **Update webhook URL:**
   Replace the IP address in the configuration script with your ngrok URL.

### Option 2: Configure Router Port Forwarding

1. **Access your router's admin panel** (usually http://192.168.1.1)
2. **Find Port Forwarding settings**
3. **Create new rule:**
   - External Port: 3004
   - Internal IP: Your computer's local IP (check with `ifconfig` or `ipconfig`)
   - Internal Port: 3004
   - Protocol: TCP

### Option 3: Use Cloud Deployment (Production Ready)

1. **Deploy to cloud service:**
   - Heroku
   - DigitalOcean App Platform
   - Railway
   - Render

2. **Use cloud URL** for webhook configuration

## Quick Start with ngrok

```bash
# Terminal 1: Keep webhook server running
node webhook-relay-server.cjs

# Terminal 2: Start ngrok
ngrok http 3004

# Terminal 3: Configure webhook with ngrok URL
# Update WEBHOOK_URL in configure-pipedrive-webhook.cjs
# Then run: node configure-pipedrive-webhook.cjs
```

## Testing the Setup

Once you have a public URL:

1. Update the webhook URL in the configuration
2. Run the configuration script
3. Create a test deal in Pipeline 14
4. Watch the logs to see the automation trigger

## Current Status

✅ **Local Services Running:**
- Webhook Relay Server: `localhost:3004`
- JobDigger Integration: `localhost:3001`
- All MCP servers: Active

⚠️ **Next Step:** 
Choose one of the solutions above to make your webhook publicly accessible.