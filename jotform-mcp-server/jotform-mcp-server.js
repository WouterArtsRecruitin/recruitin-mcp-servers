#!/usr/bin/env node

/**
 * JotForm MCP Server
 * Provides integration with JotForm API for form management
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// JotForm API configuration
const JOTFORM_API_KEY = process.env.JOTFORM_API_KEY;
const JOTFORM_API_BASE = 'https://eu-api.jotform.com';

if (!JOTFORM_API_KEY) {
  console.error('Error: JOTFORM_API_KEY environment variable is required');
  process.exit(1);
}

class JotFormMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'jotform-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_forms',
          description: 'List all forms in your JotForm account',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of forms to retrieve (default: 20)',
                default: 20
              },
              orderBy: {
                type: 'string',
                description: 'Order by: id, title, status, created_at, updated_at',
                default: 'created_at'
              }
            }
          }
        },
        {
          name: 'get_form',
          description: 'Get detailed information about a specific form',
          inputSchema: {
            type: 'object',
            properties: {
              formId: {
                type: 'string',
                description: 'The ID of the form to retrieve'
              }
            },
            required: ['formId']
          }
        },
        {
          name: 'get_form_questions',
          description: 'Get all questions/fields from a specific form',
          inputSchema: {
            type: 'object',
            properties: {
              formId: {
                type: 'string',
                description: 'The ID of the form'
              }
            },
            required: ['formId']
          }
        },
        {
          name: 'get_form_submissions',
          description: 'Get submissions for a specific form',
          inputSchema: {
            type: 'object',
            properties: {
              formId: {
                type: 'string',
                description: 'The ID of the form'
              },
              limit: {
                type: 'number',
                description: 'Number of submissions to retrieve',
                default: 20
              },
              filter: {
                type: 'object',
                description: 'Filter submissions by status, date, etc.'
              }
            },
            required: ['formId']
          }
        },
        {
          name: 'create_form',
          description: 'Create a new form',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the new form'
              },
              questions: {
                type: 'array',
                description: 'Array of questions to add to the form',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      description: 'Question type (textbox, email, dropdown, etc.)'
                    },
                    text: {
                      type: 'string',
                      description: 'Question text'
                    },
                    required: {
                      type: 'string',
                      description: 'Is this field required? (Yes/No)'
                    },
                    options: {
                      type: 'string',
                      description: 'Options for dropdown/radio/checkbox (pipe-separated)'
                    }
                  }
                }
              }
            },
            required: ['title']
          }
        },
        {
          name: 'update_form_title',
          description: 'Update the title of an existing form',
          inputSchema: {
            type: 'object',
            properties: {
              formId: {
                type: 'string',
                description: 'The ID of the form to update'
              },
              title: {
                type: 'string',
                description: 'New title for the form'
              }
            },
            required: ['formId', 'title']
          }
        },
        {
          name: 'add_form_question',
          description: 'Add a new question to an existing form',
          inputSchema: {
            type: 'object',
            properties: {
              formId: {
                type: 'string',
                description: 'The ID of the form'
              },
              type: {
                type: 'string',
                description: 'Question type (textbox, email, dropdown, radio, checkbox, textarea, etc.)'
              },
              text: {
                type: 'string',
                description: 'Question text'
              },
              required: {
                type: 'string',
                description: 'Is this field required? (Yes/No)',
                default: 'No'
              },
              options: {
                type: 'string',
                description: 'Options for dropdown/radio/checkbox (pipe-separated, e.g. "Option 1|Option 2|Option 3")'
              }
            },
            required: ['formId', 'type', 'text']
          }
        },
        {
          name: 'get_form_reports',
          description: 'Get visual reports and analytics for a form',
          inputSchema: {
            type: 'object',
            properties: {
              formId: {
                type: 'string',
                description: 'The ID of the form'
              }
            },
            required: ['formId']
          }
        },
        {
          name: 'clone_form',
          description: 'Clone an existing form',
          inputSchema: {
            type: 'object',
            properties: {
              formId: {
                type: 'string',
                description: 'The ID of the form to clone'
              }
            },
            required: ['formId']
          }
        },
        {
          name: 'delete_submission',
          description: 'Delete a specific submission',
          inputSchema: {
            type: 'object',
            properties: {
              submissionId: {
                type: 'string',
                description: 'The ID of the submission to delete'
              }
            },
            required: ['submissionId']
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_forms':
            return await this.listForms(args);
          case 'get_form':
            return await this.getForm(args);
          case 'get_form_questions':
            return await this.getFormQuestions(args);
          case 'get_form_submissions':
            return await this.getFormSubmissions(args);
          case 'create_form':
            return await this.createForm(args);
          case 'update_form_title':
            return await this.updateFormTitle(args);
          case 'add_form_question':
            return await this.addFormQuestion(args);
          case 'get_form_reports':
            return await this.getFormReports(args);
          case 'clone_form':
            return await this.cloneForm(args);
          case 'delete_submission':
            return await this.deleteSubmission(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Tool ${name} not found`
            );
        }
      } catch (error) {
        if (error instanceof McpError) throw error;
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing ${name}: ${error.message}`
        );
      }
    });
  }

  async makeJotFormRequest(endpoint, method = 'GET', body = null) {
    const url = `${JOTFORM_API_BASE}${endpoint}?apiKey=${JOTFORM_API_KEY}`;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    if (body && method !== 'GET') {
      options.body = new URLSearchParams(body).toString();
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `JotForm API error: ${response.status}`);
    }

    return data;
  }

  async listForms(args) {
    const { limit = 20, orderBy = 'created_at' } = args;
    const data = await this.makeJotFormRequest(`/user/forms?limit=${limit}&orderby=${orderBy}`);

    const forms = data.content.map(form => ({
      id: form.id,
      title: form.title,
      status: form.status,
      created_at: form.created_at,
      updated_at: form.updated_at,
      submission_count: form.count,
      url: form.url
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${forms.length} forms:\n\n${forms.map(f =>
            `📋 ${f.title}\n   ID: ${f.id}\n   Status: ${f.status}\n   Submissions: ${f.submission_count}\n   URL: ${f.url}`
          ).join('\n\n')}`
        }
      ]
    };
  }

  async getForm(args) {
    const { formId } = args;
    const data = await this.makeJotFormRequest(`/form/${formId}`);

    return {
      content: [
        {
          type: 'text',
          text: `Form Details:\n\nTitle: ${data.content.title}\nStatus: ${data.content.status}\nCreated: ${data.content.created_at}\nLast Updated: ${data.content.updated_at}\nSubmissions: ${data.content.count}\nURL: ${data.content.url}\n\nSettings:\n- Height: ${data.content.height}\n- Theme: ${data.content.theme_id || 'Default'}`
        }
      ]
    };
  }

  async getFormQuestions(args) {
    const { formId } = args;
    const data = await this.makeJotFormRequest(`/form/${formId}/questions`);

    const questions = Object.values(data.content).map(q => ({
      id: q.qid,
      type: q.type,
      text: q.text,
      required: q.required === 'Yes',
      order: q.order
    })).sort((a, b) => a.order - b.order);

    return {
      content: [
        {
          type: 'text',
          text: `Form Questions (${questions.length} total):\n\n${questions.map(q =>
            `${q.order}. ${q.text}\n   Type: ${q.type}${q.required ? ' (Required)' : ''}\n   ID: ${q.id}`
          ).join('\n\n')}`
        }
      ]
    };
  }

  async getFormSubmissions(args) {
    const { formId, limit = 20, filter } = args;
    let endpoint = `/form/${formId}/submissions?limit=${limit}`;

    if (filter) {
      const filterString = JSON.stringify(filter);
      endpoint += `&filter=${encodeURIComponent(filterString)}`;
    }

    const data = await this.makeJotFormRequest(endpoint);

    const submissions = data.content.map(sub => {
      const answers = {};
      Object.values(sub.answers || {}).forEach(answer => {
        if (answer.text) {
          answers[answer.text] = answer.answer || answer.prettyFormat || '';
        }
      });

      return {
        id: sub.id,
        created_at: sub.created_at,
        status: sub.status,
        ip: sub.ip,
        answers
      };
    });

    return {
      content: [
        {
          type: 'text',
          text: `Found ${submissions.length} submissions:\n\n${submissions.map(s =>
            `📝 Submission #${s.id}\n   Date: ${s.created_at}\n   Status: ${s.status}\n   Answers: ${JSON.stringify(s.answers, null, 2)}`
          ).join('\n\n---\n\n')}`
        }
      ]
    };
  }

  async createForm(args) {
    const { title, questions = [] } = args;

    // Create form
    const formData = await this.makeJotFormRequest('/user/forms', 'POST', {
      'properties[title]': title
    });

    const formId = formData.content.id;

    // Add questions if provided
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await this.addFormQuestion({
        formId,
        type: q.type || 'textbox',
        text: q.text,
        required: q.required || 'No',
        options: q.options
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Form created successfully!\n\nTitle: ${title}\nForm ID: ${formId}\nURL: https://form.jotform.com/${formId}\nQuestions added: ${questions.length}`
        }
      ]
    };
  }

  async updateFormTitle(args) {
    const { formId, title } = args;

    await this.makeJotFormRequest(`/form/${formId}/properties`, 'POST', {
      'properties[title]': title
    });

    return {
      content: [
        {
          type: 'text',
          text: `✅ Form title updated successfully to: "${title}"`
        }
      ]
    };
  }

  async addFormQuestion(args) {
    const { formId, type, text, required = 'No', options } = args;

    const questionData = {
      'question[type]': type,
      'question[text]': text,
      'question[required]': required
    };

    if (options && ['dropdown', 'radio', 'checkbox'].includes(type)) {
      const optionsList = options.split('|').map((opt, idx) =>
        `question[options][${idx}]=${opt.trim()}`
      ).join('&');
      Object.assign(questionData, Object.fromEntries(
        optionsList.split('&').map(pair => pair.split('='))
      ));
    }

    const data = await this.makeJotFormRequest(`/form/${formId}/questions`, 'POST', questionData);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Question added successfully!\n\nType: ${type}\nText: ${text}\nRequired: ${required}${options ? `\nOptions: ${options}` : ''}`
        }
      ]
    };
  }

  async getFormReports(args) {
    const { formId } = args;
    const data = await this.makeJotFormRequest(`/form/${formId}/reports`);

    const reports = data.content || [];

    return {
      content: [
        {
          type: 'text',
          text: reports.length > 0
            ? `📊 Form Reports:\n\n${reports.map(r =>
                `${r.title}\n   Type: ${r.type}\n   URL: ${r.url}`
              ).join('\n\n')}`
            : 'No reports available for this form yet.'
        }
      ]
    };
  }

  async cloneForm(args) {
    const { formId } = args;
    const data = await this.makeJotFormRequest(`/form/${formId}/clone`, 'POST');

    return {
      content: [
        {
          type: 'text',
          text: `✅ Form cloned successfully!\n\nNew Form ID: ${data.content.id}\nURL: ${data.content.url}`
        }
      ]
    };
  }

  async deleteSubmission(args) {
    const { submissionId } = args;
    await this.makeJotFormRequest(`/submission/${submissionId}`, 'DELETE');

    return {
      content: [
        {
          type: 'text',
          text: `✅ Submission ${submissionId} deleted successfully!`
        }
      ]
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('JotForm MCP Server running');
  }
}

const server = new JotFormMCPServer();
server.start().catch(console.error);