#!/usr/bin/env node
// Airtable MCP Server - Database & CRM Management
// For recruitment tracking, candidate management, and workflow automation

const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Airtable API configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

// MCP Tools for Airtable
const AIRTABLE_TOOLS = {
  // List all bases
  listBases: async () => {
    try {
      const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      });
      return { success: true, bases: response.data.bases };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get records from a table
  getRecords: async ({ baseId, tableName, maxRecords = 100, view, filterByFormula, sort }) => {
    try {
      const params = new URLSearchParams();
      if (maxRecords) params.append('maxRecords', maxRecords);
      if (view) params.append('view', view);
      if (filterByFormula) params.append('filterByFormula', filterByFormula);
      if (sort) {
        sort.forEach(s => {
          params.append('sort[0][field]', s.field);
          params.append('sort[0][direction]', s.direction || 'asc');
        });
      }

      const response = await axios.get(
        `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent(tableName)}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`
          }
        }
      );

      return {
        success: true,
        records: response.data.records,
        offset: response.data.offset
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Create a record
  createRecord: async ({ baseId, tableName, fields }) => {
    try {
      const response = await axios.post(
        `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent(tableName)}`,
        {
          fields
        },
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, record: response.data };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Update a record
  updateRecord: async ({ baseId, tableName, recordId, fields }) => {
    try {
      const response = await axios.patch(
        `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`,
        {
          fields
        },
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, record: response.data };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Delete a record
  deleteRecord: async ({ baseId, tableName, recordId }) => {
    try {
      await axios.delete(
        `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`
          }
        }
      );

      return { success: true, deleted: recordId };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Create recruitment CRM base
  createRecruitmentCRM: async ({ baseName = 'Recruitment CRM' }) => {
    try {
      // This would typically require creating through Airtable UI
      // But we can return a template structure
      const template = {
        name: baseName,
        tables: [
          {
            name: 'Kandidaten',
            fields: [
              { name: 'Naam', type: 'singleLineText' },
              { name: 'Email', type: 'email' },
              { name: 'Telefoon', type: 'phoneNumber' },
              { name: 'CV', type: 'multipleAttachments' },
              { name: 'LinkedIn', type: 'url' },
              { name: 'Status', type: 'singleSelect', options: ['Nieuw', 'Screening', 'Interview', 'Aangeboden', 'Geplaatst', 'Afgewezen'] },
              { name: 'Vacatures', type: 'multipleRecordLinks' },
              { name: 'Notities', type: 'multilineText' },
              { name: 'Beoordeling', type: 'rating' },
              { name: 'Datum toegevoegd', type: 'dateTime' }
            ]
          },
          {
            name: 'Vacatures',
            fields: [
              { name: 'Titel', type: 'singleLineText' },
              { name: 'Bedrijf', type: 'singleLineText' },
              { name: 'Locatie', type: 'singleLineText' },
              { name: 'Salaris', type: 'currency' },
              { name: 'Type', type: 'singleSelect', options: ['Fulltime', 'Parttime', 'Contract', 'Freelance'] },
              { name: 'Status', type: 'singleSelect', options: ['Open', 'On hold', 'Gesloten'] },
              { name: 'Beschrijving', type: 'multilineText' },
              { name: 'Vereisten', type: 'multilineText' },
              { name: 'Kandidaten', type: 'multipleRecordLinks' },
              { name: 'Deadline', type: 'date' }
            ]
          },
          {
            name: 'Bedrijven',
            fields: [
              { name: 'Bedrijfsnaam', type: 'singleLineText' },
              { name: 'Contactpersoon', type: 'singleLineText' },
              { name: 'Email', type: 'email' },
              { name: 'Telefoon', type: 'phoneNumber' },
              { name: 'Website', type: 'url' },
              { name: 'Sector', type: 'singleSelect' },
              { name: 'Grootte', type: 'singleSelect', options: ['1-10', '11-50', '51-200', '200+'] },
              { name: 'Contract waarde', type: 'currency' },
              { name: 'Notities', type: 'multilineText' }
            ]
          },
          {
            name: 'Activiteiten',
            fields: [
              { name: 'Type', type: 'singleSelect', options: ['Call', 'Email', 'Meeting', 'Interview', 'Follow-up'] },
              { name: 'Onderwerp', type: 'singleLineText' },
              { name: 'Kandidaat', type: 'multipleRecordLinks' },
              { name: 'Vacature', type: 'multipleRecordLinks' },
              { name: 'Datum', type: 'dateTime' },
              { name: 'Notities', type: 'multilineText' },
              { name: 'Status', type: 'singleSelect', options: ['Gepland', 'Voltooid', 'Geannuleerd'] }
            ]
          }
        ],
        views: [
          { name: 'Actieve kandidaten', filter: 'Status != "Afgewezen"' },
          { name: 'Open vacatures', filter: 'Status = "Open"' },
          { name: 'Deze week activiteiten', filter: 'IS_SAME(Datum, TODAY(), "week")' }
        ]
      };

      return { success: true, template, note: 'Create this base structure in Airtable UI' };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Bulk import candidates
  bulkImportCandidates: async ({ baseId, tableName = 'Kandidaten', candidates }) => {
    try {
      const records = candidates.map(candidate => ({
        fields: {
          'Naam': candidate.name,
          'Email': candidate.email,
          'Telefoon': candidate.phone,
          'LinkedIn': candidate.linkedin,
          'Status': 'Nieuw',
          'Datum toegevoegd': new Date().toISOString()
        }
      }));

      // Airtable allows max 10 records per request
      const chunks = [];
      for (let i = 0; i < records.length; i += 10) {
        chunks.push(records.slice(i, i + 10));
      }

      let imported = 0;
      for (const chunk of chunks) {
        const response = await axios.post(
          `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent(tableName)}`,
          { records: chunk },
          {
            headers: {
              'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        imported += response.data.records.length;
      }

      return { success: true, imported, total: candidates.length };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Search records
  searchRecords: async ({ baseId, tableName, searchField, searchValue }) => {
    try {
      const filterFormula = `FIND(LOWER("${searchValue}"), LOWER({${searchField}}))`;

      return await AIRTABLE_TOOLS.getRecords({
        baseId,
        tableName,
        filterByFormula
      });
    } catch (error) {
      return { error: error.message };
    }
  },

  // Export table to CSV
  exportToCSV: async ({ baseId, tableName }) => {
    try {
      const result = await AIRTABLE_TOOLS.getRecords({ baseId, tableName, maxRecords: 1000 });

      if (!result.success) return result;

      let csv = '';
      if (result.records.length > 0) {
        // Get headers
        const headers = Object.keys(result.records[0].fields);
        csv = headers.join(',') + '\n';

        // Add data
        result.records.forEach(record => {
          const row = headers.map(header => {
            const value = record.fields[header];
            if (value && typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value || '';
          });
          csv += row.join(',') + '\n';
        });
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `airtable-${tableName}-${timestamp}.csv`;
      const outputPath = path.join(__dirname, 'airtable-exports', filename);

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, csv);

      return { success: true, path: outputPath, recordCount: result.records.length };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get table statistics
  getTableStats: async ({ baseId, tableName }) => {
    try {
      const result = await AIRTABLE_TOOLS.getRecords({ baseId, tableName, maxRecords: 1000 });

      if (!result.success) return result;

      const stats = {
        totalRecords: result.records.length,
        fields: {},
        statusBreakdown: {}
      };

      result.records.forEach(record => {
        Object.entries(record.fields).forEach(([field, value]) => {
          if (!stats.fields[field]) {
            stats.fields[field] = {
              filled: 0,
              empty: 0,
              uniqueValues: new Set()
            };
          }

          if (value) {
            stats.fields[field].filled++;
            if (typeof value === 'string' || typeof value === 'number') {
              stats.fields[field].uniqueValues.add(value);
            }
          } else {
            stats.fields[field].empty++;
          }

          // Track status field
          if (field === 'Status' && value) {
            stats.statusBreakdown[value] = (stats.statusBreakdown[value] || 0) + 1;
          }
        });
      });

      // Convert Sets to counts
      Object.keys(stats.fields).forEach(field => {
        stats.fields[field].uniqueCount = stats.fields[field].uniqueValues.size;
        delete stats.fields[field].uniqueValues;
      });

      return { success: true, statistics: stats };
    } catch (error) {
      return { error: error.message };
    }
  }
};

// MCP endpoints
app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  if (AIRTABLE_TOOLS[name]) {
    const result = await AIRTABLE_TOOLS[name](args);
    res.json(result);
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
  <title>Airtable MCP Server</title>
  <style>
    body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f4f4f4; }
    .header { background: linear-gradient(135deg, #FCB400, #4285F4); color: white; padding: 30px; border-radius: 12px; }
    .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .tool { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #FCB400; }
    .status { display: inline-block; padding: 5px 10px; background: #4CAF50; color: white; border-radius: 4px; }
    .feature { display: inline-block; margin: 5px; padding: 8px 12px; background: #e3f2fd; border-radius: 4px; }
    code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Airtable MCP Server</h1>
    <p>Database & CRM Management for Recruitment</p>
  </div>

  <div class="card">
    <h2>Status</h2>
    <p><span class="status">🟢 Running</span></p>
    <p><strong>Port:</strong> 3024</p>
    <p><strong>API Key:</strong> ${AIRTABLE_API_KEY ? '✅ Configured' : '❌ Not configured (set AIRTABLE_API_KEY)'}</p>
  </div>

  <div class="card">
    <h2>Available Tools</h2>

    <div class="tool">
      <h3>listBases</h3>
      <p>List all available Airtable bases</p>
      <code>POST /call-tool { name: 'listBases' }</code>
    </div>

    <div class="tool">
      <h3>getRecords</h3>
      <p>Retrieve records from a table with filtering</p>
      <code>POST /call-tool { name: 'getRecords', arguments: { baseId, tableName } }</code>
    </div>

    <div class="tool">
      <h3>createRecord</h3>
      <p>Create a new record in a table</p>
      <code>POST /call-tool { name: 'createRecord', arguments: { baseId, tableName, fields } }</code>
    </div>

    <div class="tool">
      <h3>updateRecord</h3>
      <p>Update an existing record</p>
      <code>POST /call-tool { name: 'updateRecord', arguments: { baseId, tableName, recordId, fields } }</code>
    </div>

    <div class="tool">
      <h3>searchRecords</h3>
      <p>Search records by field value</p>
      <code>POST /call-tool { name: 'searchRecords', arguments: { baseId, tableName, searchField, searchValue } }</code>
    </div>

    <div class="tool">
      <h3>createRecruitmentCRM</h3>
      <p>Generate recruitment CRM template structure</p>
      <code>POST /call-tool { name: 'createRecruitmentCRM' }</code>
    </div>

    <div class="tool">
      <h3>bulkImportCandidates</h3>
      <p>Import multiple candidates at once</p>
      <code>POST /call-tool { name: 'bulkImportCandidates', arguments: { baseId, candidates } }</code>
    </div>

    <div class="tool">
      <h3>exportToCSV</h3>
      <p>Export table data to CSV file</p>
      <code>POST /call-tool { name: 'exportToCSV', arguments: { baseId, tableName } }</code>
    </div>

    <div class="tool">
      <h3>getTableStats</h3>
      <p>Get statistics about table data</p>
      <code>POST /call-tool { name: 'getTableStats', arguments: { baseId, tableName } }</code>
    </div>
  </div>

  <div class="card">
    <h2>Features</h2>
    <span class="feature">✅ Dutch language support</span>
    <span class="feature">✅ Recruitment CRM template</span>
    <span class="feature">✅ Bulk candidate import</span>
    <span class="feature">✅ Advanced filtering</span>
    <span class="feature">✅ CSV export</span>
    <span class="feature">✅ Table statistics</span>
    <span class="feature">✅ Multi-record operations</span>
    <span class="feature">✅ Custom views</span>
  </div>

  <div class="card">
    <h2>Recruitment CRM Structure</h2>
    <p>Pre-configured tables for recruitment workflow:</p>
    <ul>
      <li><strong>Kandidaten:</strong> Candidate profiles, CV, status tracking</li>
      <li><strong>Vacatures:</strong> Job openings, requirements, deadlines</li>
      <li><strong>Bedrijven:</strong> Client companies, contacts, contracts</li>
      <li><strong>Activiteiten:</strong> Calls, meetings, interviews, follow-ups</li>
    </ul>
  </div>
</body>
</html>
  `);
});

// Start server
const PORT = 3024;
app.listen(PORT, () => {
  console.log('📊 Airtable MCP Server');
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/call-tool`);

  if (!AIRTABLE_API_KEY) {
    console.log('⚠️  Warning: AIRTABLE_API_KEY not set');
    console.log('   Get your API key from: https://airtable.com/create/tokens');
  }
});