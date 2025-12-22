#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { EmailComposer } from './email-composer.js';
import { TemplateManager } from './template-manager.js';
import { EmailAnalyzer } from './email-analyzer.js';
import { PipedriveIntegrator } from './pipedrive-integrator.js';
import { JobDiggerIntegrator } from './jobdigger-integrator.js';
import { IntelligentDocumentProcessor } from './intelligent-document-processor.js';
import { EmailSender } from './email-sender.js';
import { PipedriveEmailTemplates } from './pipedrive-email-templates.js';
import {
  ComposeEmailSchema,
  CreateTemplateSchema,
  FormatEmailSchema,
  AnalyzeEmailSchema,
  TranslateEmailSchema,
  GetTemplateSchema,
  EmailPerformanceSchema,
} from './schemas.js';

// Initialize services
const emailComposer = new EmailComposer();
const templateManager = new TemplateManager();
const emailAnalyzer = new EmailAnalyzer();
const pipedriveIntegrator = new PipedriveIntegrator();
const jobDiggerIntegrator = new JobDiggerIntegrator();
const intelligentProcessor = new IntelligentDocumentProcessor();
const emailSender = new EmailSender();
const pipedriveEmailTemplates = new PipedriveEmailTemplates();

// Create MCP server
const server = new Server(
  {
    name: 'elite-email-composer',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define all tools
const toolDefinitions: Tool[] = [
  {
    name: 'compose_email',
    description: 'Generate a professional email with advanced copywriting frameworks and sector intelligence',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Email subject line' },
        recipient: { type: 'string', description: 'Recipient name or email' },
        context: { type: 'string', description: 'Context or purpose of the email' },
        tone: {
          type: 'string',
          enum: ['professional', 'friendly', 'formal', 'casual', 'urgent'],
          description: 'Desired tone of the email',
        },
        language: { type: 'string', description: 'Language for the email (e.g., en, nl, de)', default: 'en' },
        length: {
          type: 'string',
          enum: ['short', 'medium', 'long'],
          description: 'Desired length of the email',
          default: 'medium',
        },
        sector: { type: 'string', description: 'Target company sector (e.g., manufacturing, technology)' },
        framework: {
          type: 'string',
          enum: ['PAS', 'AIDA', 'Problem-Solution', 'Value-First'],
          description: 'Copywriting framework to use (auto-detected if not specified)',
        },
        company: { type: 'string', description: 'Target company name for personalization' },
        goal: { type: 'string', description: 'Specific goal (e.g., meeting request, product demo)' },
      },
      required: ['subject', 'context'],
    },
  },
  {
    name: 'create_template',
    description: 'Create and save a reusable email template',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Template name' },
        subject: { type: 'string', description: 'Template subject line' },
        content: { type: 'string', description: 'Template content with placeholders' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for categorizing the template',
        },
        variables: {
          type: 'array',
          items: { type: 'string' },
          description: 'Variables that can be replaced in the template',
        },
      },
      required: ['name', 'subject', 'content'],
    },
  },
  {
    name: 'format_email',
    description: 'Auto-format email content with proper structure and styling',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Raw email content to format' },
        style: {
          type: 'string',
          enum: ['business', 'modern', 'minimal', 'newsletter'],
          description: 'Formatting style to apply',
          default: 'business',
        },
        include_signature: { type: 'boolean', description: 'Whether to include a signature placeholder', default: true },
      },
      required: ['content'],
    },
  },
  {
    name: 'analyze_email',
    description: 'Analyze email content for tone, effectiveness, and improvements',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Email content to analyze' },
        metrics: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['tone', 'clarity', 'professionalism', 'engagement', 'length'],
          },
          description: 'Specific metrics to analyze',
          default: ['tone', 'clarity', 'professionalism'],
        },
      },
      required: ['content'],
    },
  },
  {
    name: 'translate_email',
    description: 'Translate email content to different languages',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Email content to translate' },
        target_language: { type: 'string', description: 'Target language code (e.g., nl, de, fr, es)' },
        preserve_formatting: { type: 'boolean', description: 'Whether to preserve HTML formatting', default: true },
      },
      required: ['content', 'target_language'],
    },
  },
  {
    name: 'list_templates',
    description: 'List all available email templates',
    inputSchema: {
      type: 'object',
      properties: {
        tag: { type: 'string', description: 'Filter templates by tag' },
        search: { type: 'string', description: 'Search templates by name or content' },
      },
    },
  },
  {
    name: 'get_template',
    description: 'Retrieve a specific email template',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Template name' },
        variables: {
          type: 'object',
          description: 'Variables to replace in the template',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'email_performance',
    description: 'Get email analytics and performance metrics',
    inputSchema: {
      type: 'object',
      properties: {
        email_id: { type: 'string', description: 'Email ID to analyze' },
        timeframe: {
          type: 'string',
          enum: ['24h', '7d', '30d', '90d'],
          description: 'Timeframe for analytics',
          default: '7d',
        },
      },
    },
  },
  {
    name: 'generate_email_variants',
    description: 'Generate A/B/C test variants using different copywriting frameworks',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Email subject line' },
        recipient: { type: 'string', description: 'Recipient name or email' },
        context: { type: 'string', description: 'Context or purpose of the email' },
        tone: {
          type: 'string',
          enum: ['professional', 'friendly', 'formal', 'casual', 'urgent'],
          description: 'Desired tone of the email',
        },
        language: { type: 'string', description: 'Language for the email (e.g., en, nl, de)', default: 'en' },
        sector: { type: 'string', description: 'Target company sector (e.g., manufacturing, technology)' },
        company: { type: 'string', description: 'Target company name for personalization' },
        goal: { type: 'string', description: 'Specific goal (e.g., meeting request, product demo)' },
      },
      required: ['subject', 'context'],
    },
  },
  {
    name: 'use_recruitment_template',
    description: 'Use a specialized recruitment template (vacancy_response, cold_outreach, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        template_id: { 
          type: 'string', 
          description: 'Template ID (e.g., vacancy_response_rpo_focus, vacancy_response_corporate_recruiter)'
        },
        variables: {
          type: 'object',
          description: 'Variables to replace in template',
          properties: {
            contact_name: { type: 'string', description: 'Name of the contact person' },
            company_name: { type: 'string', description: 'Company name' },
            calendly_link: { type: 'string', description: 'Calendly scheduling link' },
            phone: { type: 'string', description: 'Phone number' },
            website: { type: 'string', description: 'Website URL' },
          },
        },
      },
      required: ['template_id'],
    },
  },
  {
    name: 'process_csv_outreach',
    description: 'Process CSV file to generate bulk vacancy response emails',
    inputSchema: {
      type: 'object',
      properties: {
        csv_content: { 
          type: 'string', 
          description: 'CSV content with columns: company_name,contact_name,email,vacancy_title,sector'
        },
        template_rules: {
          type: 'object',
          description: 'Template selection rules based on vacancy keywords',
          properties: {
            default_template: { type: 'string', default: 'vacancy_response_rpo_focus' },
            recruiter_template: { type: 'string', default: 'vacancy_response_rpo_focus' },
            hr_template: { type: 'string', default: 'vacancy_response_corporate_recruiter' },
          }
        },
        global_variables: {
          type: 'object',
          description: 'Variables to use for all emails',
          properties: {
            calendly_link: { type: 'string', default: 'https://calendly.com/recruitin/30min' },
            phone: { type: 'string', default: '06-12345678' },
            website: { type: 'string', default: 'recruitin.nl' },
          }
        },
        limit: { type: 'number', description: 'Maximum number of emails to generate (default: 5)' }
      },
      required: ['csv_content'],
    },
  },
  {
    name: 'generate_pipedrive_email_sequence',
    description: 'Generate personalized 6-email sequence and update Pipedrive deal with dynamic content based on company data',
    inputSchema: {
      type: 'object',
      properties: {
        deal_id: { 
          type: 'string', 
          description: 'Pipedrive deal ID to update with personalized email sequence' 
        },
        company_name: { 
          type: 'string', 
          description: 'Company name for personalization' 
        },
        contact_name: { 
          type: 'string', 
          description: 'Contact person name' 
        },
        contact_email: { 
          type: 'string', 
          description: 'Contact email address' 
        },
        vacancy_title: { 
          type: 'string', 
          description: 'Job vacancy title (e.g., Corporate Recruiter, HR Manager)' 
        },
        sector: { 
          type: 'string', 
          description: 'Company sector (technology, manufacturing, engineering, etc.)' 
        },
        company_size: { 
          type: 'string', 
          description: 'Company size (startup, scale-up, enterprise)' 
        },
        location: { 
          type: 'string', 
          description: 'Company location/region' 
        },
        urgency_level: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Urgency level based on vacancy posting date',
          default: 'medium'
        },
        api_token: {
          type: 'string',
          description: 'Pipedrive API token for updating deal fields'
        }
      },
      required: ['deal_id', 'company_name', 'contact_name', 'vacancy_title', 'api_token']
    }
  },
  {
    name: 'send_email_sequence_direct',
    description: 'Generate personalized email sequence and send directly (bypass Zapier) with scheduling',
    inputSchema: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Company name for personalization' },
        contact_name: { type: 'string', description: 'Contact person name' },
        contact_email: { type: 'string', description: 'Contact email address' },
        vacancy_title: { type: 'string', description: 'Job vacancy title' },
        sector: { type: 'string', description: 'Company sector' },
        company_size: { type: 'string', description: 'Company size' },
        location: { type: 'string', description: 'Company location' },
        urgency_level: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
        send_first_immediately: { type: 'boolean', description: 'Send first email now, schedule rest', default: true },
        sender_name: { type: 'string', description: 'Sender name', default: 'Wouter van der Linden' },
        sender_email: { type: 'string', description: 'Sender email address' },
        deal_id: { type: 'string', description: 'Optional Pipedrive deal ID to update' },
        api_token: { type: 'string', description: 'Optional Pipedrive API token' }
      },
      required: ['company_name', 'contact_name', 'contact_email', 'vacancy_title']
    }
  },
  {
    name: 'send_single_email',
    description: 'Send a single personalized email immediately',
    inputSchema: {
      type: 'object',
      properties: {
        to_email: { type: 'string', description: 'Recipient email address' },
        to_name: { type: 'string', description: 'Recipient name' },
        subject: { type: 'string', description: 'Email subject' },
        context: { type: 'string', description: 'Email context/purpose' },
        company: { type: 'string', description: 'Target company name' },
        sector: { type: 'string', description: 'Company sector' },
        tone: { type: 'string', enum: ['professional', 'friendly', 'formal', 'urgent'], default: 'professional' },
        framework: { type: 'string', enum: ['PAS', 'AIDA', 'Problem-Solution', 'Value-First'] },
        sender_name: { type: 'string', description: 'Sender name', default: 'Wouter van der Linden' },
        sender_email: { type: 'string', description: 'Sender email address' }
      },
      required: ['to_email', 'to_name', 'subject', 'context']
    }
  },
  {
    name: 'generate_jobdigger_email_sequence',
    description: 'Generate personalized 6-email sequence for technical vacatures and update JobDigger deal',
    inputSchema: {
      type: 'object',
      properties: {
        deal_id: { type: 'string', description: 'JobDigger deal ID' },
        company_name: { type: 'string', description: 'Company name' },
        contact_name: { type: 'string', description: 'Contact person name' },
        contact_email: { type: 'string', description: 'Contact email' },
        vacancy_title: { type: 'string', description: 'Technical vacancy title (e.g., Senior Developer, DevOps Engineer)' },
        tech_stack: { type: 'string', description: 'Required tech stack (e.g., React, Python, AWS)' },
        company_size: { type: 'string', description: 'Company size (startup, scale-up, enterprise)' },
        location: { type: 'string', description: 'Job location' },
        urgency_level: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
        api_token: { type: 'string', description: 'Pipedrive API token' }
      },
      required: ['deal_id', 'company_name', 'contact_name', 'vacancy_title', 'api_token']
    }
  },
  {
    name: 'process_intelligent_document_analysis',
    description: 'AI-powered analysis of Pipedrive deals - auto-detects APK reports, vacature analyse, or general analysis',
    inputSchema: {
      type: 'object',
      properties: {
        deal_id: { type: 'string', description: 'Pipedrive deal ID to analyze' },
        analysis_type: { 
          type: 'string', 
          enum: ['auto-detect', 'apk', 'vacature', 'general'],
          description: 'Type of analysis (auto-detect recommended)',
          default: 'auto-detect'
        },
        api_token: { type: 'string', description: 'Pipedrive API token' },
        send_email: { type: 'boolean', description: 'Send email with results', default: true }
      },
      required: ['deal_id', 'api_token']
    }
  },
  {
    name: 'setup_pipedrive_native_automation',
    description: 'Setup Pipedrive native email templates and automation workflow using custom fields',
    inputSchema: {
      type: 'object',
      properties: {
        api_token: { type: 'string', description: 'Pipedrive API token' },
        pipeline_id: { type: 'number', description: 'Pipeline ID for automation', default: 14 },
        create_templates: { type: 'boolean', description: 'Create email templates', default: true },
        setup_workflow: { type: 'boolean', description: 'Setup automation workflow structure', default: true }
      },
      required: ['api_token']
    }
  },
];

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolDefinitions,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'compose_email': {
        const parsed = ComposeEmailSchema.parse(args);
        const result = await emailComposer.composeEmail(parsed);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'create_template': {
        const parsed = CreateTemplateSchema.parse(args);
        const result = await templateManager.createTemplate(parsed);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'format_email': {
        const parsed = FormatEmailSchema.parse(args);
        const result = await emailComposer.formatEmail(parsed);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'analyze_email': {
        const parsed = AnalyzeEmailSchema.parse(args);
        const result = await emailAnalyzer.analyzeEmail(parsed);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'translate_email': {
        const parsed = TranslateEmailSchema.parse(args);
        const result = await emailComposer.translateEmail(parsed);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'list_templates': {
        const result = await templateManager.listTemplates(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'get_template': {
        const parsed = GetTemplateSchema.parse(args);
        const result = await templateManager.getTemplate(parsed);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'email_performance': {
        const parsed = EmailPerformanceSchema.parse(args);
        const result = await emailAnalyzer.getPerformanceMetrics(parsed);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'generate_email_variants': {
        const parsed = ComposeEmailSchema.parse(args);
        const result = await emailComposer.generateEmailVariants(parsed);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'use_recruitment_template': {
        const { template_id, variables } = args as { template_id: string; variables?: Record<string, string> };
        const result = await templateManager.composeWithExternalTemplate(template_id, variables);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'process_csv_outreach': {
        const { csv_content, template_rules, global_variables, limit } = args as {
          csv_content: string;
          template_rules?: any;
          global_variables?: any;
          limit?: number;
        };

        try {
          // Parse CSV
          const lines = csv_content.trim().split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          const rows = lines.slice(1, (limit || 5) + 1);

          const results = [];
          
          for (let i = 0; i < rows.length; i++) {
            const values = rows[i].split(',').map(v => v.trim());
            const rowData: any = {};
            
            headers.forEach((header, index) => {
              rowData[header] = values[index] || '';
            });

            // Determine template based on vacancy title
            let templateId = template_rules?.default_template || 'vacancy_response_rpo_focus';
            const vacancyLower = (rowData.vacancy_title || '').toLowerCase();
            
            if (vacancyLower.includes('recruiter')) {
              templateId = template_rules?.recruiter_template || 'vacancy_response_rpo_focus';
            } else if (vacancyLower.includes('hr') || vacancyLower.includes('human resources')) {
              templateId = template_rules?.hr_template || 'vacancy_response_corporate_recruiter';
            }

            // Prepare variables
            const emailVariables = {
              contact_name: rowData.contact_name || 'HR Manager',
              company_name: rowData.company_name || 'Company',
              calendly_link: global_variables?.calendly_link || 'https://calendly.com/recruitin/30min',
              phone: global_variables?.phone || '06-12345678',
              website: global_variables?.website || 'recruitin.nl',
            };

            // Generate email
            const emailResult = await templateManager.composeWithExternalTemplate(templateId, emailVariables);
            
            results.push({
              row: i + 1,
              company: rowData.company_name,
              contact: rowData.contact_name,
              email: rowData.email,
              template_used: templateId,
              result: emailResult.success ? emailResult.data : { error: emailResult.error },
              ready_to_send: emailResult.success && emailResult.data?.is_complete
            });
          }

          const summary = {
            total_processed: results.length,
            successful: results.filter(r => r.ready_to_send).length,
            failed: results.filter(r => !r.ready_to_send).length,
          };

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                summary,
                emails: results
              }, null, 2)
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
                message: 'Failed to process CSV outreach'
              }, null, 2)
            }]
          };
        }
      }

      case 'generate_pipedrive_email_sequence': {
        const { 
          deal_id, 
          company_name, 
          contact_name, 
          contact_email, 
          vacancy_title, 
          sector, 
          company_size, 
          location, 
          urgency_level,
          api_token 
        } = args as {
          deal_id: string;
          company_name: string;
          contact_name: string;
          contact_email?: string;
          vacancy_title: string;
          sector?: string;
          company_size?: string;
          location?: string;
          urgency_level?: string;
          api_token: string;
        };

        try {
          // Generate 6 personalized emails using the current template strategy
          const emailSequence = [];
          
          // Define sequence strategy based on vacancy type and company data
          const sequenceStrategy = pipedriveIntegrator.determineSequenceStrategy(vacancy_title, sector, company_size, urgency_level);
          
          for (let i = 1; i <= 6; i++) {
            const emailData = await pipedriveIntegrator.generatePersonalizedEmail(i, {
              company_name,
              contact_name,
              vacancy_title,
              sector: sector || 'technology',
              company_size: company_size || 'scale-up',
              location: location || 'Nederland',
              urgency_level: urgency_level || 'medium'
            }, sequenceStrategy);
            
            emailSequence.push(emailData);
          }

          // Update Pipedrive deal with the generated email sequence
          const pipedriveUpdate = await pipedriveIntegrator.updatePipedriveDeal(deal_id, emailSequence, api_token);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                deal_id,
                company_name,
                emails_generated: emailSequence.length,
                pipedrive_updated: pipedriveUpdate.success,
                sequence_preview: emailSequence.map((email, idx) => ({
                  email_number: idx + 1,
                  subject: email.subject.substring(0, 50) + '...',
                  body_length: email.body.length,
                  framework: email.framework
                })),
                pipedrive_fields_updated: pipedriveUpdate.fields_updated || []
              }, null, 2)
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
                message: 'Failed to generate Pipedrive email sequence'
              }, null, 2)
            }]
          };
        }
      }

      case 'send_email_sequence_direct': {
        const { 
          company_name,
          contact_name,
          contact_email,
          vacancy_title,
          sector,
          company_size,
          location,
          urgency_level,
          send_first_immediately,
          sender_name,
          sender_email,
          deal_id,
          api_token
        } = args as {
          company_name: string;
          contact_name: string;
          contact_email: string;
          vacancy_title: string;
          sector?: string;
          company_size?: string;
          location?: string;
          urgency_level?: string;
          send_first_immediately?: boolean;
          sender_name?: string;
          sender_email?: string;
          deal_id?: string;
          api_token?: string;
        };

        try {
          // Test email connection first
          const connectionTest = await emailSender.testConnection();
          if (!connectionTest.success) {
            throw new Error(`Email connection failed: ${connectionTest.error}`);
          }

          // Generate personalized email sequence
          const strategy = pipedriveIntegrator.determineSequenceStrategy(
            vacancy_title,
            sector,
            company_size,
            urgency_level
          );

          const emailSequence = [];
          for (let i = 1; i <= 6; i++) {
            const emailData = await pipedriveIntegrator.generatePersonalizedEmail(i, {
              company_name,
              contact_name,
              vacancy_title,
              sector: sector || 'general',
              company_size: company_size || 'medium',
              location: location || 'Nederland',
              urgency_level: urgency_level || 'medium'
            }, strategy);
            
            emailSequence.push(emailData);
          }

          // Send email sequence
          const sendResult = await emailSender.sendEmailSequence(
            deal_id || 'direct',
            emailSequence,
            { 
              email: contact_email, 
              name: contact_name, 
              company: company_name 
            },
            { 
              name: sender_name || 'Wouter van der Linden',
              email: sender_email || process.env.EMAIL_USER || ''
            },
            send_first_immediately !== false
          );

          // Optionally update Pipedrive deal
          let pipedriveUpdate = null;
          if (deal_id && api_token) {
            pipedriveUpdate = await pipedriveIntegrator.updatePipedriveDeal(deal_id, emailSequence, api_token);
          }

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: sendResult.success,
                company_name,
                contact_email,
                emails_in_sequence: emailSequence.length,
                sending_results: {
                  success_count: sendResult.results.filter(r => r.success).length,
                  failed_count: sendResult.results.filter(r => !r.success).length,
                  immediately_sent: sendResult.results.filter(r => r.success && !r.scheduled).length,
                  scheduled: sendResult.results.filter(r => r.scheduled).length
                },
                pipedrive_updated: pipedriveUpdate?.success || false,
                errors: sendResult.errors
              }, null, 2)
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
                message: 'Failed to send email sequence directly'
              }, null, 2)
            }]
          };
        }
      }

      case 'send_single_email': {
        const { 
          to_email,
          to_name,
          subject,
          context,
          company,
          sector,
          tone,
          framework,
          sender_name,
          sender_email
        } = args as {
          to_email: string;
          to_name: string;
          subject: string;
          context: string;
          company?: string;
          sector?: string;
          tone?: string;
          framework?: string;
          sender_name?: string;
          sender_email?: string;
        };

        try {
          // Test email connection
          const connectionTest = await emailSender.testConnection();
          if (!connectionTest.success) {
            throw new Error(`Email connection failed: ${connectionTest.error}`);
          }

          // Generate the email content
          const emailResult = await emailComposer.composeEmail({
            subject,
            recipient: to_name,
            context,
            tone: tone as any || 'professional',
            language: 'nl',
            length: 'medium',
            sector: sector || 'general',
            framework: framework as any,
            company,
            goal: 'engagement'
          });

          if (!emailResult.success || !emailResult.data) {
            throw new Error(`Email generation failed: ${emailResult.error}`);
          }

          // Send the email
          const sendResult = await emailSender.sendEmail({
            to_email,
            to_name,
            from_name: sender_name || 'Wouter van der Linden',
            from_email: sender_email || process.env.EMAIL_USER || '',
            subject: emailResult.data.primary_subject,
            body: emailResult.data.content
          });

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: sendResult.success,
                to_email,
                to_name,
                subject_sent: emailResult.data.primary_subject,
                framework_used: emailResult.data.framework_used,
                effectiveness_score: emailResult.data.effectiveness_score,
                message_id: sendResult.message_id,
                delivery_time: sendResult.delivery_time,
                error: sendResult.error
              }, null, 2)
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
                message: 'Failed to send single email'
              }, null, 2)
            }]
          };
        }
      }

      case 'generate_jobdigger_email_sequence': {
        const { 
          deal_id, 
          company_name, 
          contact_name, 
          contact_email,
          vacancy_title, 
          tech_stack,
          company_size, 
          location, 
          urgency_level, 
          api_token 
        } = args as any;

        try {
          // Generate JobDigger email sequence using tech-focused strategy
          const jobDiggerSequence = jobDiggerIntegrator.determineJobDiggerSequence(
            vacancy_title, 
            company_size, 
            tech_stack, 
            urgency_level
          );
          
          const emailSequence = [];
          
          for (let i = 1; i <= 6; i++) {
            const emailData = await jobDiggerIntegrator.generateJobDiggerEmail(i, {
              company_name,
              contact_name,
              vacancy_title,
              tech_stack,
              company_size: company_size || 'scale-up',
              location: location || 'Nederland',
              urgency_level: urgency_level || 'medium'
            }, jobDiggerSequence);
            
            emailSequence.push(emailData);
          }

          // Update JobDigger deal with generated emails
          const jobDiggerUpdate = await jobDiggerIntegrator.updateJobDiggerDeal(
            deal_id, 
            emailSequence, 
            api_token
          );

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                system: 'JobDigger Tech Recruitment',
                pipeline_id: 12, // JobDigger Automation pipeline
                deal_id,
                company_name,
                vacancy_title,
                tech_stack: tech_stack || 'Not specified',
                emails_generated: emailSequence.length,
                jobdigger_updated: jobDiggerUpdate.success,
                sequence_preview: emailSequence.map((email, idx) => ({
                  email_number: idx + 1,
                  subject: email.subject.substring(0, 50) + '...',
                  body_length: email.body.length,
                  framework: email.framework,
                  effectiveness_score: email.effectiveness_score
                })),
                jobdigger_fields_updated: jobDiggerUpdate.fields_updated || []
              }, null, 2)
            }]
          };

        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
                message: 'Failed to generate JobDigger email sequence'
              }, null, 2)
            }]
          };
        }
      }

      case 'process_intelligent_document_analysis': {
        const { deal_id, analysis_type, api_token, send_email } = args as any;

        try {
          console.log(`🧠 Starting intelligent analysis for deal ${deal_id}...`);
          
          // Process the deal with AI-powered analysis
          const analysisResult = await intelligentProcessor.processPipedriveDeal(
            deal_id,
            api_token,
            analysis_type || 'auto-detect'
          );

          // Send email if requested
          let emailSent = false;
          if (send_email !== false && analysisResult.email_body) {
            console.log(`📧 Sending ${analysisResult.analysis_type} email...`);
            
            // Extract recipient info from the analysis
            const dealResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${deal_id}?api_token=${api_token}`);
            const dealData = await dealResponse.json();
            
            if (dealData.success && dealData.data.person_id) {
              const personResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/persons/${dealData.data.person_id}?api_token=${api_token}`);
              const personData = await personResponse.json();
              
              if (personData.success && personData.data.email?.length > 0) {
                try {
                  const emailResult = await emailSender.sendEmail({
                    to_email: personData.data.email[0].value,
                    to_name: personData.data.name,
                    from_name: 'Wouter van der Linden',
                    from_email: process.env.EMAIL_USER || 'wouter@recruitin.nl',
                    subject: analysisResult.email_subject,
                    body: analysisResult.email_body
                  });
                  emailSent = emailResult.success;
                  console.log(emailSent ? '✅ Email sent successfully' : '❌ Email sending failed');
                } catch (emailError: any) {
                  console.log(`⚠️ Email sending failed: ${emailError.message}`);
                }
              }
            }
          }

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                deal_id,
                analysis_type: analysisResult.analysis_type,
                confidence: analysisResult.confidence,
                email_sent: emailSent,
                content_preview: analysisResult.content.substring(0, 200) + '...',
                scores: analysisResult.scores,
                recommendations: analysisResult.recommendations,
                system: 'Intelligent Document Processor',
                processing_time: new Date().toISOString()
              }, null, 2)
            }]
          };

        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
                message: 'Failed to process intelligent document analysis'
              }, null, 2)
            }]
          };
        }
      }

      case 'setup_pipedrive_native_automation': {
        const { 
          api_token,
          pipeline_id,
          create_templates,
          setup_workflow
        } = args as {
          api_token: string;
          pipeline_id?: number;
          create_templates?: boolean;
          setup_workflow?: boolean;
        };

        try {
          const result = await pipedriveEmailTemplates.setupNativeEmailAutomation(api_token);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: result.success,
                pipeline_id: pipeline_id || 14,
                automation_type: "Pipedrive Native (vs Zapier)",
                summary: result.summary,
                templates_created: result.templates.length,
                templates: result.templates,
                workflow_structure: result.workflow,
                setup_instructions: result.setup_instructions,
                advantages: [
                  "Native Pipedrive integration",
                  "Custom field variables in templates", 
                  "Built-in email tracking",
                  "Conditional logic based on replies",
                  "No external dependencies"
                ]
              }, null, 2)
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
                message: 'Failed to setup Pipedrive native automation'
              }, null, 2)
            }]
          };
        }
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: {
                    message: `Unknown tool: ${name}`,
                    code: 'UNKNOWN_TOOL',
                    retry: false,
                  },
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                code: 'TOOL_EXECUTION_ERROR',
                retry: false,
              },
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Elite Email Composer MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});