#!/bin/bash

# Migration script for all MCP servers from recruitin-automation-hub to new repository
SOURCE_DIR="/Users/wouterarts/projects/recruitin-automation-hub/mcp-servers"
DEST_DIR="/Users/wouterarts/projects/recruitin-mcp-servers"

echo "🚀 Starting MCP Servers Migration..."

# JavaScript MCP Servers (.js files)
JS_SERVERS=(
    "airtable-mcp-server.js"
    "arnhem-direct-jobs-agent.js"
    "brave-search-mcp-server.js"
    "company-insights-agent.js"
    "competitor-monitoring-agent.js"
    "d3js-mcp-server.js"
    "daily-recruitment-news-agent.js"
    "dutch-news-agent-final.js"
    "dutch-news-local-storage.js"
    "dutch-recruitment-news-notion.js"
    "dutch-rss-news-notion.js"
    "email-mcp-server.js"
    "figma-mcp-server.js"
    "google-ai-mcp.js"
    "jobboard-monitoring-agent.js"
    "jobdigger-zapier-integration.js"
    "jotform-mcp-server.js"
    "leonardo-ai-mcp-server.js"
    "leonardo-sdk-mcp-server.js"
    "linkedin-mcp-server.js"
    "memory-mcp-server.js"
    "notion-mcp-server.js"
    "pipedrive-mcp-server.js"
    "prospect-intelligence-agent.js"
    "real-company-insights.js"
    "real-salary-benchmark.js"
    "salary-benchmark-agent.js"
    "simple-prospect-search.js"
    "slack-mcp-server.js"
    "typeform-mcp-server.js"
    "vanilla-js-mcp-server.js"
    "whatsapp-business-mcp-server.js"
)

# Copy JavaScript servers
echo "📋 Copying JavaScript MCP Servers..."
for server in "${JS_SERVERS[@]}"; do
    server_name="${server%.js}"
    echo "  - $server_name"
    mkdir -p "$DEST_DIR/$server_name"
    cp "$SOURCE_DIR/$server" "$DEST_DIR/$server_name/" 2>/dev/null || echo "    ⚠️  Failed to copy $server"
done

# Python MCP Servers (directories)
PYTHON_SERVERS=(
    "cv-parser"
    "cv-vacancy-matcher"
    "pipedrive-bulk-importer"
)

# Copy Python servers
echo -e "\n🐍 Copying Python MCP Servers..."
for server in "${PYTHON_SERVERS[@]}"; do
    echo "  - $server"
    if [ -d "$SOURCE_DIR/$server" ]; then
        cp -r "$SOURCE_DIR/$server" "$DEST_DIR/" 2>/dev/null || echo "    ⚠️  Failed to copy $server"
    fi
done

# TypeScript MCP Servers (directories)
TS_SERVERS=(
    "elite-email-composer-mcp"
    "huggingface-mcp-server"
    "labour-market-intelligence"
    "pipedrive"
    "recruitment-orchestrator"
    "salary-benchmark-nl"
    "recruitin-sales-mcp"
    "resend-mcp-server"
)

# Copy TypeScript servers
echo -e "\n📦 Copying TypeScript MCP Servers..."
for server in "${TS_SERVERS[@]}"; do
    echo "  - $server"
    if [ -d "$SOURCE_DIR/$server" ]; then
        cp -r "$SOURCE_DIR/$server" "$DEST_DIR/" 2>/dev/null || echo "    ⚠️  Failed to copy $server"
    fi
done

# Copy official MCP servers examples
echo -e "\n📚 Copying Official MCP Examples..."
if [ -d "$SOURCE_DIR/mcp-servers-official" ]; then
    cp -r "$SOURCE_DIR/mcp-servers-official" "$DEST_DIR/"
fi

# Copy supporting files
echo -e "\n📄 Copying Supporting Files..."
SUPPORT_FILES=(
    "AVAILABLE_MCP_SERVERS.md"
    "COMPREHENSIVE_MCP_DOCUMENTATION.md"
    "claude-desktop-config-example.json"
)

for file in "${SUPPORT_FILES[@]}"; do
    echo "  - $file"
    cp "$SOURCE_DIR/$file" "$DEST_DIR/" 2>/dev/null || echo "    ⚠️  Failed to copy $file"
done

echo -e "\n✅ Migration completed!"
echo "📍 Destination: $DEST_DIR"
echo -e "\n🔥 Next steps:"
echo "1. cd $DEST_DIR"
echo "2. git add ."
echo "3. git commit -m 'Add all MCP servers from recruitin-automation-hub'"
echo "4. git push origin main"