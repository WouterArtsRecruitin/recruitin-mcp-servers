#!/bin/bash
# COMPLETE UPLOAD WORKFLOW
# Run after database access granted
# ================================

set -e  # Exit on any error

cd /Users/wouterarts/recruitin-mcp-servers

echo "═══════════════════════════════════════════════════════════════════"
echo "📊 RECRUITIN NOTION UPLOAD WORKFLOW"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Step 1: Verify database access
echo "📋 Step 1: Verifying Notion database access..."
echo "   Database: Weekly Top 10 News"
echo "   ID: 2e62252cbb15812697a9eb7166e6b3b8"
echo ""

node find-notion-databases.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Database access verification failed!"
    echo "   See UNBLOCK-INSTRUCTIONS.md for setup steps"
    exit 1
fi

echo ""
echo "─────────────────────────────────────────────────────────────────"
echo ""

# Step 2: Upload articles
echo "📤 Step 2: Uploading top 10 articles to Notion..."
echo "   Source: reports/top-articles-2026-01-15.json"
echo "   Week: Week 3 - 15 januari 2026"
echo ""

node upload-to-correct-notion.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Upload failed! Check error messages above."
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ WORKFLOW COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Check results at:"
echo "   https://www.notion.so/Weekly-Top-10-News-2e62252cbb15812697a9eb7166e6b3b8"
echo ""
