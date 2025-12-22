#!/usr/bin/env node
// Brave Search MCP Server
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

// MCP Endpoints
app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  if (name === 'search') {
    try {
      const response = await axios.get(BRAVE_API_URL, {
        headers: {
          'X-Subscription-Token': BRAVE_API_KEY,
          'Accept': 'application/json'
        },
        params: {
          q: args.query,
          count: args.count || 10
        }
      });

      res.json({
        results: response.data.web?.results || [],
        news: response.data.news?.results || []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(404).json({ error: 'Tool not found' });
  }
});

// Dashboard
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Brave Search MCP Server</title>
  <style>
    body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f4f4f4; }
    .header { background: linear-gradient(135deg, #FB542B, #6C0BC7); color: white; padding: 30px; border-radius: 12px; }
    .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .status { display: inline-block; padding: 5px 10px; background: #4CAF50; color: white; border-radius: 4px; }
    code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
    .search-box { padding: 15px; background: #f9f9f9; border-radius: 8px; margin: 20px 0; }
    input { width: 70%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    button { padding: 10px 20px; background: #FB542B; color: white; border: none; border-radius: 4px; cursor: pointer; }
    #results { margin-top: 20px; }
    .result { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Brave Search MCP Server</h1>
    <p>Real-time web search for recruitment intelligence</p>
  </div>

  <div class="card">
    <h2>Status</h2>
    <p><span class="status">🟢 Running</span></p>
    <p><strong>Port:</strong> 3009</p>
    <p><strong>API Key:</strong> ${BRAVE_API_KEY ? '✅ Configured' : '❌ Not configured'}</p>
  </div>

  <div class="card">
    <h2>Test Search</h2>
    <div class="search-box">
      <input type="text" id="searchQuery" placeholder="Enter search query..." value="recruitment trends Netherlands 2025">
      <button onclick="performSearch()">Search</button>
      <div id="results"></div>
    </div>
  </div>

  <div class="card">
    <h2>API Usage</h2>
    <p>Send POST requests to <code>/call-tool</code> with:</p>
    <pre>
{
  "name": "search",
  "arguments": {
    "query": "your search query",
    "count": 10
  }
}</pre>
  </div>

  <script>
    async function performSearch() {
      const query = document.getElementById('searchQuery').value;
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '<p>Searching...</p>';

      try {
        const response = await fetch('/call-tool', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'search',
            arguments: { query, count: 5 }
          })
        });

        const data = await response.json();

        if (data.error) {
          resultsDiv.innerHTML = '<p style="color: red;">Error: ' + data.error + '</p>';
          return;
        }

        let html = '<h3>Web Results:</h3>';
        if (data.results && data.results.length > 0) {
          data.results.forEach(result => {
            html += '<div class="result">';
            html += '<strong><a href="' + result.url + '" target="_blank">' + result.title + '</a></strong><br>';
            html += '<small>' + result.description + '</small>';
            html += '</div>';
          });
        } else {
          html += '<p>No results found</p>';
        }

        resultsDiv.innerHTML = html;
      } catch (error) {
        resultsDiv.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
      }
    }
  </script>
</body>
</html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'brave-search-mcp-server',
    port: 3009,
    timestamp: new Date().toISOString()
  });
});

const PORT = 3009;
app.listen(PORT, () => {
  console.log(`Brave Search MCP Server running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
});
