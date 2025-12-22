#!/usr/bin/env node
// Typeform MCP Server - Survey & Assessment Management
// For recruitment assessments, candidate feedback, and skills evaluation

const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Typeform API configuration
const TYPEFORM_API_KEY = process.env.TYPEFORM_API_KEY || '';
const TYPEFORM_BASE_URL = 'https://api.typeform.com';

// MCP Tools for Typeform
const TYPEFORM_TOOLS = {
  // Create a new form
  createForm: async ({ title, fields, settings = {} }) => {
    try {
      const formData = {
        title,
        type: 'quiz',
        fields: fields || [
          {
            title: 'Wat is je naam?',
            type: 'short_text',
            required: true,
            properties: {}
          },
          {
            title: 'Wat is je ervaring met recruitment?',
            type: 'multiple_choice',
            required: true,
            properties: {
              choices: [
                { label: '0-2 jaar' },
                { label: '2-5 jaar' },
                { label: '5-10 jaar' },
                { label: '10+ jaar' }
              ]
            }
          },
          {
            title: 'Beschrijf je ideale werkplek',
            type: 'long_text',
            required: false,
            properties: {}
          },
          {
            title: 'Beoordeel je vaardigheden',
            type: 'rating',
            required: true,
            properties: {
              steps: 10,
              labels: {
                left: 'Beginner',
                right: 'Expert'
              }
            }
          }
        ],
        settings: {
          language: 'nl',
          is_public: true,
          show_progress_bar: true,
          show_typeform_branding: false,
          ...settings
        }
      };

      const response = await axios.post(
        `${TYPEFORM_BASE_URL}/forms`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${TYPEFORM_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        formId: response.data.id,
        formUrl: response.data._links.display,
        data: response.data
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get form responses
  getResponses: async ({ formId, since, until, pageSize = 25 }) => {
    try {
      const params = new URLSearchParams();
      if (since) params.append('since', since);
      if (until) params.append('until', until);
      params.append('page_size', pageSize);

      const response = await axios.get(
        `${TYPEFORM_BASE_URL}/forms/${formId}/responses?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${TYPEFORM_API_KEY}`
          }
        }
      );

      // Process responses for easier use
      const processedResponses = response.data.items.map(item => ({
        responseId: item.response_id,
        submittedAt: item.submitted_at,
        answers: item.answers.map(answer => ({
          field: answer.field.title,
          type: answer.type,
          value: answer[answer.type] // Gets the actual answer value
        })),
        score: item.calculated?.score,
        metadata: item.metadata
      }));

      return {
        success: true,
        totalResponses: response.data.total_items,
        responses: processedResponses,
        pageCount: response.data.page_count
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Create recruitment assessment template
  createRecruitmentAssessment: async ({ jobTitle, skills = [], customQuestions = [] }) => {
    try {
      const assessmentFields = [
        // Personal info
        {
          title: 'Persoonlijke Informatie',
          type: 'group',
          properties: {
            fields: [
              {
                title: 'Volledige naam',
                type: 'short_text',
                required: true
              },
              {
                title: 'Email',
                type: 'email',
                required: true
              },
              {
                title: 'Telefoonnummer',
                type: 'phone_number',
                required: true
              }
            ]
          }
        },
        // Experience
        {
          title: `Hoeveel jaar ervaring heeft u als ${jobTitle}?`,
          type: 'number',
          required: true,
          properties: {
            min: 0,
            max: 50
          }
        },
        // Skills assessment
        ...skills.map(skill => ({
          title: `Beoordeel uw vaardigheid in ${skill}`,
          type: 'opinion_scale',
          required: true,
          properties: {
            steps: 5,
            labels: {
              left: 'Beginner',
              center: 'Competent',
              right: 'Expert'
            }
          }
        })),
        // Availability
        {
          title: 'Wanneer kunt u beginnen?',
          type: 'date',
          required: true
        },
        // Salary expectation
        {
          title: 'Wat is uw salarisverwachting? (€ per jaar)',
          type: 'number',
          required: false,
          properties: {
            min: 20000,
            max: 200000
          }
        },
        // Custom questions
        ...customQuestions,
        // File upload for CV
        {
          title: 'Upload uw CV',
          type: 'file_upload',
          required: true,
          properties: {
            allow_multiple_files: false
          }
        }
      ];

      return await TYPEFORM_TOOLS.createForm({
        title: `Assessment - ${jobTitle}`,
        fields: assessmentFields,
        settings: {
          language: 'nl',
          is_public: true,
          show_progress_bar: true,
          redirect_after_submit_url: 'https://recruitin.nl/bedankt'
        }
      });
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get form statistics
  getFormStatistics: async ({ formId }) => {
    try {
      const responses = await TYPEFORM_TOOLS.getResponses({ formId, pageSize: 1000 });

      if (!responses.success) return responses;

      const stats = {
        totalResponses: responses.totalResponses,
        completionRate: 0,
        averageTime: 0,
        fieldAnalysis: {},
        dropOffPoints: []
      };

      // Analyze responses
      responses.responses.forEach(response => {
        response.answers.forEach(answer => {
          if (!stats.fieldAnalysis[answer.field]) {
            stats.fieldAnalysis[answer.field] = {
              answered: 0,
              skipped: 0,
              values: []
            };
          }

          if (answer.value !== null && answer.value !== undefined) {
            stats.fieldAnalysis[answer.field].answered++;
            stats.fieldAnalysis[answer.field].values.push(answer.value);
          } else {
            stats.fieldAnalysis[answer.field].skipped++;
          }
        });
      });

      return { success: true, statistics: stats };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Create webhook for form responses
  createWebhook: async ({ formId, url, enabled = true }) => {
    try {
      const response = await axios.put(
        `${TYPEFORM_BASE_URL}/forms/${formId}/webhooks/${formId}`,
        {
          url,
          enabled,
          verify_ssl: true
        },
        {
          headers: {
            'Authorization': `Bearer ${TYPEFORM_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, webhook: response.data };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Export responses to CSV
  exportResponses: async ({ formId, format = 'csv' }) => {
    try {
      const responses = await TYPEFORM_TOOLS.getResponses({ formId, pageSize: 1000 });

      if (!responses.success) return responses;

      let content = '';
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `typeform-${formId}-${timestamp}.${format}`;

      if (format === 'csv') {
        // Create CSV header
        const headers = new Set();
        responses.responses.forEach(r => {
          r.answers.forEach(a => headers.add(a.field));
        });

        content = ['Response ID', 'Submitted At', ...Array.from(headers)].join(',') + '\n';

        // Add data rows
        responses.responses.forEach(response => {
          const row = [response.responseId, response.submittedAt];

          Array.from(headers).forEach(header => {
            const answer = response.answers.find(a => a.field === header);
            row.push(answer ? `"${answer.value}"` : '');
          });

          content += row.join(',') + '\n';
        });
      } else if (format === 'json') {
        content = JSON.stringify(responses.responses, null, 2);
      }

      const outputPath = path.join(__dirname, 'typeform-exports', filename);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, content);

      return { success: true, path: outputPath, recordCount: responses.totalResponses };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Generate insights from responses
  generateInsights: async ({ formId }) => {
    try {
      const stats = await TYPEFORM_TOOLS.getFormStatistics({ formId });

      if (!stats.success) return stats;

      const insights = {
        summary: {
          totalResponses: stats.statistics.totalResponses,
          mostSkippedQuestions: [],
          commonAnswers: {}
        },
        recommendations: []
      };

      // Find most skipped questions
      Object.entries(stats.statistics.fieldAnalysis).forEach(([field, data]) => {
        const skipRate = data.skipped / (data.answered + data.skipped);
        if (skipRate > 0.3) {
          insights.summary.mostSkippedQuestions.push({
            field,
            skipRate: `${(skipRate * 100).toFixed(1)}%`
          });
          insights.recommendations.push(`Consider making "${field}" optional or rephrasing it`);
        }

        // Find common answers
        if (data.values.length > 0) {
          const frequency = {};
          data.values.forEach(v => {
            frequency[v] = (frequency[v] || 0) + 1;
          });

          const mostCommon = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

          if (mostCommon.length > 0) {
            insights.summary.commonAnswers[field] = mostCommon;
          }
        }
      });

      return { success: true, insights };
    } catch (error) {
      return { error: error.message };
    }
  }
};

// MCP endpoints
app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  if (TYPEFORM_TOOLS[name]) {
    const result = await TYPEFORM_TOOLS[name](args);
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
  <title>Typeform MCP Server</title>
  <style>
    body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f4f4f4; }
    .header { background: linear-gradient(135deg, #262627, #3B3B3D); color: white; padding: 30px; border-radius: 12px; }
    .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .tool { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #262627; }
    .status { display: inline-block; padding: 5px 10px; background: #4CAF50; color: white; border-radius: 4px; }
    code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Typeform MCP Server</h1>
    <p>Survey & Assessment Management for Recruitment</p>
  </div>

  <div class="card">
    <h2>Status</h2>
    <p><span class="status">🟢 Running</span></p>
    <p><strong>Port:</strong> 3023</p>
    <p><strong>API Key:</strong> ${TYPEFORM_API_KEY ? '✅ Configured' : '❌ Not configured (set TYPEFORM_API_KEY)'}</p>
  </div>

  <div class="card">
    <h2>Available Tools</h2>

    <div class="tool">
      <h3>createForm</h3>
      <p>Create custom forms and surveys</p>
      <code>POST /call-tool { name: 'createForm', arguments: { title, fields, settings } }</code>
    </div>

    <div class="tool">
      <h3>createRecruitmentAssessment</h3>
      <p>Generate recruitment assessment for specific job roles</p>
      <code>POST /call-tool { name: 'createRecruitmentAssessment', arguments: { jobTitle, skills } }</code>
    </div>

    <div class="tool">
      <h3>getResponses</h3>
      <p>Retrieve form responses with filtering</p>
      <code>POST /call-tool { name: 'getResponses', arguments: { formId } }</code>
    </div>

    <div class="tool">
      <h3>getFormStatistics</h3>
      <p>Get detailed statistics about form performance</p>
      <code>POST /call-tool { name: 'getFormStatistics', arguments: { formId } }</code>
    </div>

    <div class="tool">
      <h3>generateInsights</h3>
      <p>AI-powered insights from response data</p>
      <code>POST /call-tool { name: 'generateInsights', arguments: { formId } }</code>
    </div>

    <div class="tool">
      <h3>exportResponses</h3>
      <p>Export responses to CSV or JSON</p>
      <code>POST /call-tool { name: 'exportResponses', arguments: { formId, format } }</code>
    </div>

    <div class="tool">
      <h3>createWebhook</h3>
      <p>Setup webhook for real-time response notifications</p>
      <code>POST /call-tool { name: 'createWebhook', arguments: { formId, url } }</code>
    </div>
  </div>

  <div class="card">
    <h2>Features</h2>
    <ul>
      <li>✅ Dutch language support</li>
      <li>✅ Recruitment-specific templates</li>
      <li>✅ Skills assessment automation</li>
      <li>✅ Response analytics</li>
      <li>✅ CSV/JSON export</li>
      <li>✅ Webhook integration</li>
      <li>✅ Multi-step forms</li>
      <li>✅ File upload support</li>
    </ul>
  </div>
</body>
</html>
  `);
});

// Start server
const PORT = 3023;
app.listen(PORT, () => {
  console.log('📋 Typeform MCP Server');
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/call-tool`);

  if (!TYPEFORM_API_KEY) {
    console.log('⚠️  Warning: TYPEFORM_API_KEY not set');
    console.log('   Get your API key from: https://admin.typeform.com/account#/personal-tokens');
  }
});