#!/bin/bash

# Deploy Pipedrive Webhook to Vercel
# Run this script to deploy the webhook system

echo "🚀 Deploying Pipedrive Webhook to Vercel"
echo "========================================"

# Set PATH for Vercel CLI
export PATH="$HOME/.npm-global/bin:$PATH"

echo "1. Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "2. Logging in to Vercel..."
vercel login

echo "3. Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your deployment URL (shown above)"
echo "2. Go to https://vercel.com/dashboard"
echo "3. Find your project and go to Settings → Environment Variables"
echo "4. Add: PIPEDRIVE_API_TOKEN = 57720aa8b264cb9060c9dd5af8ae0c096dbbebb5"
echo "5. Redeploy: vercel --prod"
echo "6. Configure webhook URL in Pipedrive"
echo ""
echo "🔗 Your webhook endpoint will be:"
echo "https://YOUR-PROJECT-URL.vercel.app/webhook/new-deal"