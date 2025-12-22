# 🚀 Render Deployment Guide
Labour Market Intelligence MCP Server

## 📋 Stap-voor-Stap Deployment

### **1. Render Account Setup (2 minuten)**
1. Ga naar: https://render.com
2. **Sign Up with GitHub** (recommended)
3. Authorize Render toegang tot je GitHub repositories

### **2. Create Web Service (5 minuten)**

**In Render Dashboard:**
1. Click **New +** → **Web Service**
2. **Connect Repository:**
   - Search: `labour-market-intelligence-mcp`
   - Click **Connect**

**Service Configuration:**
```
Name: lmi-webhook-server
Environment: Node
Region: Frankfurt (Europe)
Branch: main
Root Directory: (leave blank)
Build Command: npm install && npm run build
Start Command: npm run start:http
```

### **3. Environment Variables Setup (3 minuten)**

**In Render Dashboard → Environment:**

**REQUIRED Variables:**
```
CLAUDE_API_KEY = sk-ant-xxxxx (your Anthropic API key)
NODE_ENV = production
PORT = 3000
```

**OPTIONAL Variables:**
```
NOTION_TOKEN = secret_xxxxx (if using Notion integration)
NOTION_DATABASE_ID = xxxxx (your database ID)
LOG_LEVEL = info
```

### **4. Deploy & Test (2 minuten)**

1. Click **Create Web Service**
2. Wait for automatic deployment (3-5 minutes)
3. Your app URL: `https://lmi-webhook-server.onrender.com`

**Test Endpoints:**
- `GET /health` - Health check
- `POST /webhook/jotform` - Jotform webhook
- `POST /analyze-enhanced` - Manual analysis API

### **5. Jotform Integration Setup**

**In je Jotform (https://form.jotform.com/252881347421054):**
1. Settings → Integrations → Webhooks
2. **Webhook URL:** `https://your-app.onrender.com/webhook/jotform`
3. **Method:** POST
4. **When:** Form Submission

## 🔧 **Troubleshooting**

### **Common Issues:**

**Build Fails:**
- Check `package.json` scripts
- Verify Node.js version compatibility
- Check TypeScript compilation errors

**Runtime Errors:**
- Verify environment variables are set
- Check CLAUDE_API_KEY is valid
- Review logs in Render dashboard

**Webhook Issues:**
- Test with `/health` endpoint first
- Verify Jotform webhook URL is correct
- Check CORS settings if needed

## 📊 **Monitoring**

**Render Dashboard provides:**
- Real-time logs
- Performance metrics  
- Deployment history
- Environment variables management

## 🚀 **Production Ready Features**

✅ **Security:**
- Environment variables protected
- .gitignore excludes secrets
- HTTPS by default

✅ **Reliability:**
- 85% data reliability standard
- Automatic health checks
- Error handling & validation

✅ **Performance:**
- TypeScript compiled to JavaScript
- Node.js optimized
- EU region deployment (low latency)

✅ **Integration:**
- Jotform webhook ready
- Notion database support
- MCP tools accessible

## 🌐 **Your Deployed URLs**

After deployment, you'll get URLs like:
- **Webhook Server:** `https://lmi-webhook-server.onrender.com`
- **Health Check:** `https://lmi-webhook-server.onrender.com/health`
- **Jotform Webhook:** `https://lmi-webhook-server.onrender.com/webhook/jotform`

---

**Need help?** Check the Render logs or contact support!