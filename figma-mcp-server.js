#!/usr/bin/env node
// Figma MCP Server - Design System & Component Management
// Provides tools for working with Figma API and design tokens

const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Figma API configuration
const FIGMA_API_KEY = process.env.FIGMA_API_KEY || '';
const FIGMA_BASE_URL = 'https://api.figma.com/v1';

// MCP Tools for Figma
const FIGMA_TOOLS = {
  // Get Figma file data
  getFile: async ({ fileKey }) => {
    try {
      const response = await axios.get(`${FIGMA_BASE_URL}/files/${fileKey}`, {
        headers: { 'X-Figma-Token': FIGMA_API_KEY }
      });
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get components from a Figma file
  getComponents: async ({ fileKey }) => {
    try {
      const response = await axios.get(`${FIGMA_BASE_URL}/files/${fileKey}/components`, {
        headers: { 'X-Figma-Token': FIGMA_API_KEY }
      });
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get styles from a Figma file
  getStyles: async ({ fileKey }) => {
    try {
      const response = await axios.get(`${FIGMA_BASE_URL}/files/${fileKey}/styles`, {
        headers: { 'X-Figma-Token': FIGMA_API_KEY }
      });
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  },

  // Export design tokens
  exportTokens: async ({ fileKey, format = 'json' }) => {
    try {
      const styles = await FIGMA_TOOLS.getStyles({ fileKey });

      // Process styles into design tokens
      const tokens = {
        colors: {},
        typography: {},
        spacing: {},
        shadows: {},
        borderRadius: {}
      };

      // Transform Figma styles to design tokens
      if (styles.meta && styles.meta.styles) {
        styles.meta.styles.forEach(style => {
          if (style.style_type === 'FILL') {
            tokens.colors[style.name] = style;
          } else if (style.style_type === 'TEXT') {
            tokens.typography[style.name] = style;
          } else if (style.style_type === 'EFFECT') {
            tokens.shadows[style.name] = style;
          }
        });
      }

      // Save tokens to file
      const outputPath = path.join(__dirname, 'design-tokens', `tokens-${Date.now()}.${format}`);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      if (format === 'json') {
        await fs.writeFile(outputPath, JSON.stringify(tokens, null, 2));
      } else if (format === 'css') {
        const cssTokens = generateCSSTokens(tokens);
        await fs.writeFile(outputPath, cssTokens);
      }

      return { success: true, path: outputPath, tokens };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Generate component documentation
  generateDocs: async ({ fileKey }) => {
    try {
      const components = await FIGMA_TOOLS.getComponents({ fileKey });
      const docs = [];

      if (components.meta && components.meta.components) {
        for (const [id, component] of Object.entries(components.meta.components)) {
          docs.push({
            id,
            name: component.name,
            description: component.description || 'No description',
            containing_frame: component.containing_frame
          });
        }
      }

      const outputPath = path.join(__dirname, 'figma-docs', `components-${Date.now()}.md`);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      const markdown = generateComponentDocs(docs);
      await fs.writeFile(outputPath, markdown);

      return { success: true, path: outputPath, componentCount: docs.length };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Sync Figma variables to code
  syncVariables: async ({ fileKey, outputDir = './src/design-system' }) => {
    try {
      const response = await axios.get(`${FIGMA_BASE_URL}/files/${fileKey}/variables/local`, {
        headers: { 'X-Figma-Token': FIGMA_API_KEY }
      });

      const variables = response.data.meta?.variables || {};

      // Generate TypeScript/JavaScript variables
      const jsContent = generateJSVariables(variables);
      const tsContent = generateTSVariables(variables);

      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(path.join(outputDir, 'variables.js'), jsContent);
      await fs.writeFile(path.join(outputDir, 'variables.d.ts'), tsContent);

      return { success: true, variableCount: Object.keys(variables).length };
    } catch (error) {
      return { error: error.message };
    }
  }
};

// Helper functions
function generateCSSTokens(tokens) {
  let css = ':root {\n';

  // Colors
  Object.entries(tokens.colors).forEach(([name, value]) => {
    const varName = `--${name.toLowerCase().replace(/\s+/g, '-')}`;
    css += `  ${varName}: ${value.color || '#000'};\n`;
  });

  css += '}\n';
  return css;
}

function generateComponentDocs(components) {
  let md = '# Figma Components Documentation\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;

  components.forEach(comp => {
    md += `## ${comp.name}\n\n`;
    md += `- **ID**: ${comp.id}\n`;
    md += `- **Description**: ${comp.description}\n`;
    md += `- **Frame**: ${comp.containing_frame?.name || 'N/A'}\n\n`;
  });

  return md;
}

function generateJSVariables(variables) {
  return `// Auto-generated Figma variables
export const figmaVariables = ${JSON.stringify(variables, null, 2)};
`;
}

function generateTSVariables(variables) {
  return `// Auto-generated Figma variables types
export interface FigmaVariables {
  [key: string]: any;
}

export declare const figmaVariables: FigmaVariables;
`;
}

// MCP endpoints
app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  if (FIGMA_TOOLS[name]) {
    const result = await FIGMA_TOOLS[name](args);
    res.json(result);
  } else {
    res.status(404).json({ error: 'Tool not found' });
  }
});

// List available tools
app.get('/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'getFile',
        description: 'Get Figma file data',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: { type: 'string', description: 'Figma file key' }
          },
          required: ['fileKey']
        }
      },
      {
        name: 'getComponents',
        description: 'Get components from a Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: { type: 'string', description: 'Figma file key' }
          },
          required: ['fileKey']
        }
      },
      {
        name: 'getStyles',
        description: 'Get styles from a Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: { type: 'string', description: 'Figma file key' }
          },
          required: ['fileKey']
        }
      },
      {
        name: 'exportTokens',
        description: 'Export design tokens from Figma',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: { type: 'string', description: 'Figma file key' },
            format: { type: 'string', enum: ['json', 'css'], default: 'json' }
          },
          required: ['fileKey']
        }
      },
      {
        name: 'generateDocs',
        description: 'Generate component documentation',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: { type: 'string', description: 'Figma file key' }
          },
          required: ['fileKey']
        }
      },
      {
        name: 'syncVariables',
        description: 'Sync Figma variables to code',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: { type: 'string', description: 'Figma file key' },
            outputDir: { type: 'string', default: './src/design-system' }
          },
          required: ['fileKey']
        }
      }
    ]
  });
});

// Dashboard
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Figma MCP Server</title>
  <style>
    body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #F24E1E, #A259FF); color: white; padding: 30px; border-radius: 12px; }
    .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .tool { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 6px; }
    code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎨 Figma MCP Server</h1>
    <p>Design System & Component Management</p>
  </div>

  <div class="card">
    <h2>Available Tools</h2>
    <div class="tool">
      <h3>getFile</h3>
      <p>Get complete Figma file data</p>
      <code>POST /call-tool { name: 'getFile', arguments: { fileKey: 'xxx' } }</code>
    </div>
    <div class="tool">
      <h3>getComponents</h3>
      <p>List all components in a Figma file</p>
      <code>POST /call-tool { name: 'getComponents', arguments: { fileKey: 'xxx' } }</code>
    </div>
    <div class="tool">
      <h3>getStyles</h3>
      <p>Get all styles from a Figma file</p>
      <code>POST /call-tool { name: 'getStyles', arguments: { fileKey: 'xxx' } }</code>
    </div>
    <div class="tool">
      <h3>exportTokens</h3>
      <p>Export design tokens as JSON or CSS</p>
      <code>POST /call-tool { name: 'exportTokens', arguments: { fileKey: 'xxx', format: 'json' } }</code>
    </div>
    <div class="tool">
      <h3>generateDocs</h3>
      <p>Generate component documentation</p>
      <code>POST /call-tool { name: 'generateDocs', arguments: { fileKey: 'xxx' } }</code>
    </div>
    <div class="tool">
      <h3>syncVariables</h3>
      <p>Sync Figma variables to your codebase</p>
      <code>POST /call-tool { name: 'syncVariables', arguments: { fileKey: 'xxx', outputDir: './src' } }</code>
    </div>
  </div>

  <div class="card">
    <h2>Configuration</h2>
    <p><strong>API Key:</strong> ${FIGMA_API_KEY ? '✅ Configured' : '❌ Not configured (set FIGMA_API_KEY)'}</p>
    <p><strong>Port:</strong> 3020</p>
    <p><strong>Status:</strong> 🟢 Running</p>
  </div>
</body>
</html>
  `);
});

// Start server
const PORT = 3020;
app.listen(PORT, () => {
  console.log('🎨 Figma MCP Server');
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/call-tool`);
  console.log(`📝 Tools list: http://localhost:${PORT}/tools`);

  if (!FIGMA_API_KEY) {
    console.log('⚠️  Warning: FIGMA_API_KEY not set. Please set environment variable.');
    console.log('   Get your API key from: https://www.figma.com/developers/api#access-tokens');
  }
});