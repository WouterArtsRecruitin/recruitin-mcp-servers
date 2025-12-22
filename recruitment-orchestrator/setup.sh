#!/bin/bash

echo "🚀 Recruitment Orchestrator - Setup Script"
echo "=========================================="
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Please install Node.js 20+ first"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be 20 or higher"
    echo "   Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Build TypeScript
echo "🔨 Building TypeScript project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Get absolute path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "=========================================="
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Add this to your Claude Desktop config:"
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    CONFIG_PATH="~/Library/Application Support/Claude/claude_desktop_config.json"
else
    CONFIG_PATH="%APPDATA%/Claude/claude_desktop_config.json"
fi

echo "   Location: $CONFIG_PATH"
echo ""
echo '   {
     "mcpServers": {
       "recruitment-orchestrator": {
         "command": "node",
         "args": ["'$SCRIPT_DIR'/dist/index.js"]
       }
     }
   }'
echo ""
echo "2. Restart Claude Desktop completely"
echo ""
echo "3. Try it out:"
echo '   "List all available workflows"'
echo '   "Run candidate intake workflow"'
echo ""
echo "🎉 Ready to automate!"
