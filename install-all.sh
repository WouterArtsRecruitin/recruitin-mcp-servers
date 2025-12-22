#!/bin/bash

echo "🚀 Installing all MCP servers dependencies..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Install Node.js dependencies
echo -e "${YELLOW}Installing Node.js MCP servers...${NC}"

for dir in */; do
  if [ -f "$dir/package.json" ]; then
    echo -e "${GREEN}Installing $dir${NC}"
    cd "$dir"
    npm install
    cd ..
  fi
done

# Install Python dependencies
echo -e "${YELLOW}Installing Python MCP servers...${NC}"

for dir in */; do
  if [ -f "$dir/requirements.txt" ]; then
    echo -e "${GREEN}Installing $dir${NC}"
    cd "$dir"
    pip3 install -r requirements.txt
    cd ..
  fi
done

# Special cases
echo -e "${YELLOW}Installing special dependencies...${NC}"

# HuggingFace MCP
if [ -d "huggingface-mcp-server" ]; then
  cd huggingface-mcp-server
  pip3 install -e .
  cd ..
fi

echo -e "${GREEN}✅ All dependencies installed!${NC}"
echo ""
echo "Next steps:"
echo "1. Copy claude-desktop-config.example.json to ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "2. Add your API keys to the config file"
echo "3. Restart Claude Desktop"