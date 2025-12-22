#!/usr/bin/env node
// Memory MCP Server - Persistent memory for Claude
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const MEMORY_FILE = path.join(__dirname, 'claude-memory.json');

// Load or initialize memory
let memory = {};
(async () => {
  try {
    const data = await fs.readFile(MEMORY_FILE, 'utf8');
    memory = JSON.parse(data);
  } catch {
    memory = { contexts: {}, facts: [], preferences: {} };
  }
})();

// Save memory
async function saveMemory() {
  await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

// MCP Endpoints
app.post('/list-resources', (req, res) => {
  res.json({
    resources: [
      { uri: 'memory://contexts', name: 'Saved Contexts' },
      { uri: 'memory://facts', name: 'Remembered Facts' },
      { uri: 'memory://preferences', name: 'User Preferences' }
    ]
  });
});

app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  switch(name) {
    case 'remember':
      if (!memory.facts) memory.facts = [];
      memory.facts.push({
        fact: args.fact,
        timestamp: new Date().toISOString(),
        category: args.category || 'general'
      });
      await saveMemory();
      res.json({ success: true });
      break;

    case 'recall':
      const results = memory.facts?.filter(f =>
        f.fact.toLowerCase().includes(args.query.toLowerCase()) ||
        f.category === args.category
      ) || [];
      res.json({ results });
      break;

    case 'set_context':
      if (!memory.contexts) memory.contexts = {};
      memory.contexts[args.key] = args.value;
      await saveMemory();
      res.json({ success: true });
      break;

    case 'get_context':
      res.json({ value: memory.contexts?.[args.key] || null });
      break;

    default:
      res.status(404).json({ error: 'Tool not found' });
  }
});

const PORT = 3013;
app.listen(PORT, () => {
  console.log(`Memory MCP Server running on port ${PORT}`);
});
