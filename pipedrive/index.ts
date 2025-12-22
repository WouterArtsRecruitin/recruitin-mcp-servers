#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { PipedriveClient } from './pipedrive-client.js';
import {
  PipedriveTools,
  GetDealsSchema,
  GetDealSchema,
  CreateDealSchema,
  UpdateDealSchema,
  MoveDealSchema,
  SearchDealsSchema,
  GetPipelineStagesSchema,
  CreateActivitySchema,
  GetDealActivitiesSchema,
  ValidateEmailSchema,
} from './tools.js';
import {
  AdvancedPipedriveTools,
  BulkUpdateDealsSchema,
  FindStaleDealsSchema,
  AutoPopulateFieldsSchema,
  GetPipelineStatsSchema,
} from './advanced-tools.js';
import {
  OrganizationsTools,
  GetOrganizationsSchema,
  GetOrganizationSchema,
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  SearchOrganizationsSchema,
} from './organizations-tools.js';
import {
  PersonsTools,
  GetPersonsSchema,
  GetPersonSchema,
  CreatePersonSchema,
  UpdatePersonSchema,
  SearchPersonsSchema,
  LinkPersonToOrgSchema,
} from './persons-tools.js';
import {
  EmailTools,
  SendEmailSchema,
  GetEmailTemplatesSchema,
  CreateEmailTemplateSchema,
  GetEmailPerformanceSchema,
  TrackEmailSchema,
} from './email-tools.js';
import {
  Phase2Tools,
  BulkCreateOrganizationsSchema,
  BulkUpdateOrganizationsSchema,
  BulkCreatePersonsSchema,
  BulkUpdatePersonsSchema,
  DetectAutomationLoopsSchema,
  GetAutomationStatsSchema,
  AdvancedSearchSchema,
  GetDataInsightsSchema,
} from './phase2-tools.js';

// Get config from environment
const config = {
  apiToken: process.env.PIPEDRIVE_API_TOKEN || '',
  domain: process.env.PIPEDRIVE_DOMAIN || '',
  rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '10000'),
  debug: process.env.DEBUG === 'true',
};

if (!config.apiToken) {
  console.error('ERROR: PIPEDRIVE_API_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize clients
const client = new PipedriveClient(config);
const tools = new PipedriveTools(client);
const advancedTools = new AdvancedPipedriveTools(client);
const organizationsTools = new OrganizationsTools(client);
const personsTools = new PersonsTools(client);
const emailTools = new EmailTools(client);
const phase2Tools = new Phase2Tools(client);

// Create MCP server
const server = new Server(
  {
    name: 'pipedrive-mcp-server',
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
    name: 'get_deals',
    description: 'Get deals from Pipedrive with optional filters (pipeline, stage, status, user)',
    inputSchema: {
      type: 'object',
      properties: {
        pipeline_id: { type: 'number', description: 'Filter by pipeline ID' },
        stage_id: { type: 'number', description: 'Filter by stage ID' },
        status: {
          type: 'string',
          enum: ['open', 'won', 'lost', 'deleted', 'all_not_deleted'],
          description: 'Filter by status (default: all_not_deleted)',
        },
        user_id: { type: 'number', description: 'Filter by user ID' },
        start: { type: 'number', description: 'Pagination start' },
        limit: { type: 'number', description: 'Pagination limit' },
      },
    },
  },
  {
    name: 'get_deal',
    description: 'Get a specific deal by ID with all details',
    inputSchema: {
      type: 'object',
      properties: {
        deal_id: { type: 'number', description: 'Deal ID' },
      },
      required: ['deal_id'],
    },
  },
  {
    name: 'create_deal',
    description: 'Create a new deal in Pipedrive with optional custom fields',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Deal title' },
        person_id: { type: 'number', description: 'Associated person ID' },
        org_id: { type: 'number', description: 'Associated organization ID' },
        stage_id: { type: 'number', description: 'Pipeline stage ID' },
        value: { type: 'number', description: 'Deal value' },
        currency: { type: 'string', description: 'Currency code (e.g., EUR, USD)' },
        custom_fields: { type: 'object', description: 'Custom field values (key-value pairs)' },
      },
      required: ['title'],
    },
  },
  {
    name: 'update_deal',
    description: 'Update an existing deal with new values',
    inputSchema: {
      type: 'object',
      properties: {
        deal_id: { type: 'number', description: 'Deal ID to update' },
        title: { type: 'string', description: 'New deal title' },
        value: { type: 'number', description: 'New deal value' },
        person_id: { type: 'number', description: 'New person ID' },
        org_id: { type: 'number', description: 'New organization ID' },
        stage_id: { type: 'number', description: 'New stage ID' },
        status: {
          type: 'string',
          enum: ['open', 'won', 'lost', 'deleted'],
          description: 'New status',
        },
        lost_reason: { type: 'string', description: 'Reason for lost status' },
        custom_fields: { type: 'object', description: 'Custom field values to update' },
      },
      required: ['deal_id'],
    },
  },
  {
    name: 'move_deal',
    description: 'Move a deal to a different stage in the pipeline',
    inputSchema: {
      type: 'object',
      properties: {
        deal_id: { type: 'number', description: 'Deal ID to move' },
        stage_id: { type: 'number', description: 'Target stage ID' },
      },
      required: ['deal_id', 'stage_id'],
    },
  },
  {
    name: 'search_deals',
    description: 'Search for deals using a text query',
    inputSchema: {
      type: 'object',
      properties: {
        term: { type: 'string', description: 'Search term' },
        fields: {
          type: 'array',
          items: { type: 'string' },
          description: 'Fields to search in (optional)',
        },
      },
      required: ['term'],
    },
  },
  {
    name: 'get_pipeline_stages',
    description: 'Get all stages for a pipeline (or all stages if no pipeline specified)',
    inputSchema: {
      type: 'object',
      properties: {
        pipeline_id: { type: 'number', description: 'Pipeline ID (optional)' },
      },
    },
  },
  {
    name: 'get_custom_fields',
    description: 'Get all custom fields available for deals',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_activity',
    description: 'Create an activity (call, email, meeting, etc.) for a deal, person, or organization',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Activity subject/title' },
        type: { type: 'string', description: 'Activity type (call, email, meeting, task, deadline, lunch)' },
        deal_id: { type: 'number', description: 'Associated deal ID' },
        person_id: { type: 'number', description: 'Associated person ID' },
        org_id: { type: 'number', description: 'Associated organization ID' },
        due_date: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
        due_time: { type: 'string', description: 'Due time (HH:MM)' },
        duration: { type: 'string', description: 'Duration (HH:MM)' },
        note: { type: 'string', description: 'Activity notes' },
        done: { type: 'boolean', description: 'Mark as done (default: false)' },
      },
      required: ['subject', 'type'],
    },
  },
  {
    name: 'get_deal_activities',
    description: 'Get all activities associated with a deal',
    inputSchema: {
      type: 'object',
      properties: {
        deal_id: { type: 'number', description: 'Deal ID' },
      },
      required: ['deal_id'],
    },
  },
  {
    name: 'validate_email',
    description: 'Validate an email address and check for common typos (e.g., aslm.com → asml.com)',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email address to validate' },
      },
      required: ['email'],
    },
  },
  {
    name: 'bulk_update_deals',
    description: 'Update multiple deals at once with the same field values',
    inputSchema: {
      type: 'object',
      properties: {
        deal_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of deal IDs to update',
        },
        updates: { type: 'object', description: 'Field values to update (key-value pairs)' },
      },
      required: ['deal_ids', 'updates'],
    },
  },
  {
    name: 'find_stale_deals',
    description: 'Find deals with no activity for a specified number of days',
    inputSchema: {
      type: 'object',
      properties: {
        days_inactive: {
          type: 'number',
          description: 'Minimum days of inactivity',
          minimum: 1,
        },
        pipeline_id: { type: 'number', description: 'Filter by pipeline ID (optional)' },
        stage_id: { type: 'number', description: 'Filter by stage ID (optional)' },
      },
      required: ['days_inactive'],
    },
  },
  {
    name: 'auto_populate_fields',
    description: 'Auto-populate deal fields with market data (salary ranges, demand, workforce availability)',
    inputSchema: {
      type: 'object',
      properties: {
        deal_id: { type: 'number', description: 'Deal ID to update' },
        job_title: { type: 'string', description: 'Job title' },
        location: { type: 'string', description: 'Location' },
        market_data: {
          type: 'object',
          description: 'Market intelligence data',
          properties: {
            salary_min: { type: 'number' },
            salary_max: { type: 'number' },
            salary_avg: { type: 'number' },
            demand_level: { type: 'string' },
            workforce_available: { type: 'number' },
          },
        },
      },
      required: ['deal_id'],
    },
  },
  {
    name: 'get_pipeline_stats',
    description: 'Get comprehensive statistics for a pipeline (conversion rates, deal counts by stage, total values)',
    inputSchema: {
      type: 'object',
      properties: {
        pipeline_id: { type: 'number', description: 'Pipeline ID' },
      },
      required: ['pipeline_id'],
    },
  },
  // Phase 1: Organizations Tools
  {
    name: 'get_organizations',
    description: 'Get organizations from Pipedrive with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        start: { type: 'number', description: 'Pagination start' },
        limit: { type: 'number', description: 'Pagination limit' },
        filter_id: { type: 'number', description: 'Filter ID' },
        sort: { type: 'string', description: 'Sort field' },
      },
    },
  },
  {
    name: 'get_organization',
    description: 'Get a specific organization by ID',
    inputSchema: {
      type: 'object',
      properties: {
        org_id: { type: 'number', description: 'Organization ID' },
      },
      required: ['org_id'],
    },
  },
  {
    name: 'create_organization',
    description: 'Create a new organization in Pipedrive',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Organization name' },
        owner_id: { type: 'number', description: 'Owner user ID' },
        visible_to: { type: 'string', enum: ['1', '3', '5', '7'], description: 'Visibility setting' },
        address: { type: 'string', description: 'Organization address' },
        custom_fields: { type: 'object', description: 'Custom field values' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_organization',
    description: 'Update an existing organization',
    inputSchema: {
      type: 'object',
      properties: {
        org_id: { type: 'number', description: 'Organization ID' },
        name: { type: 'string', description: 'Organization name' },
        owner_id: { type: 'number', description: 'Owner user ID' },
        visible_to: { type: 'string', enum: ['1', '3', '5', '7'], description: 'Visibility setting' },
        address: { type: 'string', description: 'Organization address' },
        custom_fields: { type: 'object', description: 'Custom field values' },
      },
      required: ['org_id'],
    },
  },
  {
    name: 'search_organizations',
    description: 'Search for organizations using a text query',
    inputSchema: {
      type: 'object',
      properties: {
        term: { type: 'string', description: 'Search term' },
        fields: { type: 'string', description: 'Fields to search in' },
        exact_match: { type: 'boolean', description: 'Exact match search' },
        start: { type: 'number', description: 'Pagination start' },
        limit: { type: 'number', description: 'Pagination limit' },
      },
      required: ['term'],
    },
  },
  {
    name: 'delete_organization',
    description: 'Delete an organization from Pipedrive',
    inputSchema: {
      type: 'object',
      properties: {
        org_id: { type: 'number', description: 'Organization ID' },
      },
      required: ['org_id'],
    },
  },
  // Phase 1: Persons Tools
  {
    name: 'get_persons',
    description: 'Get persons from Pipedrive with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        start: { type: 'number', description: 'Pagination start' },
        limit: { type: 'number', description: 'Pagination limit' },
        filter_id: { type: 'number', description: 'Filter ID' },
        sort: { type: 'string', description: 'Sort field' },
        user_id: { type: 'number', description: 'Filter by user ID' },
      },
    },
  },
  {
    name: 'get_person',
    description: 'Get a specific person by ID',
    inputSchema: {
      type: 'object',
      properties: {
        person_id: { type: 'number', description: 'Person ID' },
      },
      required: ['person_id'],
    },
  },
  {
    name: 'create_person',
    description: 'Create a new person in Pipedrive',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Person name' },
        owner_id: { type: 'number', description: 'Owner user ID' },
        org_id: { type: 'number', description: 'Organization ID' },
        email: { type: 'array', items: { type: 'string' }, description: 'Email addresses' },
        phone: { type: 'array', items: { type: 'string' }, description: 'Phone numbers' },
        visible_to: { type: 'string', enum: ['1', '3', '5', '7'], description: 'Visibility setting' },
        custom_fields: { type: 'object', description: 'Custom field values' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_person',
    description: 'Update an existing person',
    inputSchema: {
      type: 'object',
      properties: {
        person_id: { type: 'number', description: 'Person ID' },
        name: { type: 'string', description: 'Person name' },
        owner_id: { type: 'number', description: 'Owner user ID' },
        org_id: { type: 'number', description: 'Organization ID' },
        email: { type: 'array', items: { type: 'string' }, description: 'Email addresses' },
        phone: { type: 'array', items: { type: 'string' }, description: 'Phone numbers' },
        visible_to: { type: 'string', enum: ['1', '3', '5', '7'], description: 'Visibility setting' },
        custom_fields: { type: 'object', description: 'Custom field values' },
      },
      required: ['person_id'],
    },
  },
  {
    name: 'search_persons',
    description: 'Search for persons using a text query',
    inputSchema: {
      type: 'object',
      properties: {
        term: { type: 'string', description: 'Search term' },
        fields: { type: 'string', description: 'Fields to search in' },
        exact_match: { type: 'boolean', description: 'Exact match search' },
        org_id: { type: 'number', description: 'Filter by organization ID' },
        start: { type: 'number', description: 'Pagination start' },
        limit: { type: 'number', description: 'Pagination limit' },
      },
      required: ['term'],
    },
  },
  {
    name: 'link_person_to_org',
    description: 'Link a person to an organization',
    inputSchema: {
      type: 'object',
      properties: {
        person_id: { type: 'number', description: 'Person ID' },
        org_id: { type: 'number', description: 'Organization ID' },
      },
      required: ['person_id', 'org_id'],
    },
  },
  {
    name: 'delete_person',
    description: 'Delete a person from Pipedrive',
    inputSchema: {
      type: 'object',
      properties: {
        person_id: { type: 'number', description: 'Person ID' },
      },
      required: ['person_id'],
    },
  },
  {
    name: 'get_person_deals',
    description: 'Get all deals associated with a person',
    inputSchema: {
      type: 'object',
      properties: {
        person_id: { type: 'number', description: 'Person ID' },
      },
      required: ['person_id'],
    },
  },
  // Phase 1: Email Tools
  {
    name: 'send_email',
    description: 'Send email via Pipedrive (or log as activity)',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Email subject' },
        body: { type: 'string', description: 'Email body' },
        to: { type: 'array', items: { type: 'string' }, description: 'Recipient emails' },
        cc: { type: 'array', items: { type: 'string' }, description: 'CC emails' },
        bcc: { type: 'array', items: { type: 'string' }, description: 'BCC emails' },
        deal_id: { type: 'number', description: 'Associated deal ID' },
        person_id: { type: 'number', description: 'Associated person ID' },
        org_id: { type: 'number', description: 'Associated organization ID' },
        template_id: { type: 'number', description: 'Email template ID' },
        track_opens: { type: 'boolean', description: 'Track email opens' },
        track_clicks: { type: 'boolean', description: 'Track email clicks' },
      },
      required: ['subject', 'body', 'to'],
    },
  },
  {
    name: 'get_email_templates',
    description: 'Get all email templates from Pipedrive',
    inputSchema: {
      type: 'object',
      properties: {
        start: { type: 'number', description: 'Pagination start' },
        limit: { type: 'number', description: 'Pagination limit' },
      },
    },
  },
  {
    name: 'create_email_template',
    description: 'Create a new email template in Pipedrive',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Template name' },
        subject: { type: 'string', description: 'Template subject' },
        content: { type: 'string', description: 'Template content' },
        type: { type: 'string', enum: ['email', 'mail'], description: 'Template type' },
      },
      required: ['name', 'subject', 'content'],
    },
  },
  {
    name: 'get_email_performance',
    description: 'Get email performance statistics for a pipeline or date range',
    inputSchema: {
      type: 'object',
      properties: {
        pipeline_id: { type: 'number', description: 'Pipeline ID' },
        date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        limit: { type: 'number', description: 'Result limit' },
      },
    },
  },
  {
    name: 'track_email',
    description: 'Create email tracking activity for a deal',
    inputSchema: {
      type: 'object',
      properties: {
        deal_id: { type: 'number', description: 'Deal ID' },
        person_id: { type: 'number', description: 'Person ID' },
        email_subject: { type: 'string', description: 'Email subject' },
        email_sent_date: { type: 'string', description: 'Email sent date (ISO)' },
      },
      required: ['deal_id', 'email_subject'],
    },
  },
  {
    name: 'get_email_conversations',
    description: 'Get email conversations for a deal or person',
    inputSchema: {
      type: 'object',
      properties: {
        deal_id: { type: 'number', description: 'Deal ID' },
        person_id: { type: 'number', description: 'Person ID' },
        limit: { type: 'number', description: 'Result limit' },
      },
    },
  },
  
  // =====================================
  // PHASE 2: BULK OPERATIONS
  // =====================================
  {
    name: 'bulk_create_organizations',
    description: 'Create multiple organizations at once (max 100)',
    inputSchema: {
      type: 'object',
      properties: {
        organizations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Organization name' },
              owner_id: { type: 'number', description: 'Owner user ID' },
              visible_to: { type: 'string', enum: ['1', '3', '5', '7'], description: 'Visibility setting' },
              address: { type: 'string', description: 'Organization address' },
              custom_fields: { type: 'object', description: 'Custom field values' },
            },
            required: ['name'],
          },
          minItems: 1,
          maxItems: 100,
        },
      },
      required: ['organizations'],
    },
  },
  {
    name: 'bulk_update_organizations',
    description: 'Update multiple organizations at once (max 100)',
    inputSchema: {
      type: 'object',
      properties: {
        updates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              org_id: { type: 'number', description: 'Organization ID' },
              name: { type: 'string', description: 'Organization name' },
              owner_id: { type: 'number', description: 'Owner user ID' },
              visible_to: { type: 'string', enum: ['1', '3', '5', '7'], description: 'Visibility setting' },
              address: { type: 'string', description: 'Organization address' },
              custom_fields: { type: 'object', description: 'Custom field values' },
            },
            required: ['org_id'],
          },
          minItems: 1,
          maxItems: 100,
        },
      },
      required: ['updates'],
    },
  },
  {
    name: 'bulk_create_persons',
    description: 'Create multiple persons at once (max 100)',
    inputSchema: {
      type: 'object',
      properties: {
        persons: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Person name' },
              owner_id: { type: 'number', description: 'Owner user ID' },
              org_id: { type: 'number', description: 'Organization ID' },
              email: { type: 'array', items: { type: 'string' }, description: 'Email addresses' },
              phone: { type: 'array', items: { type: 'string' }, description: 'Phone numbers' },
              visible_to: { type: 'string', enum: ['1', '3', '5', '7'], description: 'Visibility setting' },
              custom_fields: { type: 'object', description: 'Custom field values' },
            },
            required: ['name'],
          },
          minItems: 1,
          maxItems: 100,
        },
      },
      required: ['persons'],
    },
  },
  {
    name: 'bulk_update_persons',
    description: 'Update multiple persons at once (max 100)',
    inputSchema: {
      type: 'object',
      properties: {
        updates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              person_id: { type: 'number', description: 'Person ID' },
              name: { type: 'string', description: 'Person name' },
              owner_id: { type: 'number', description: 'Owner user ID' },
              org_id: { type: 'number', description: 'Organization ID' },
              email: { type: 'array', items: { type: 'string' }, description: 'Email addresses' },
              phone: { type: 'array', items: { type: 'string' }, description: 'Phone numbers' },
              visible_to: { type: 'string', enum: ['1', '3', '5', '7'], description: 'Visibility setting' },
              custom_fields: { type: 'object', description: 'Custom field values' },
            },
            required: ['person_id'],
          },
          minItems: 1,
          maxItems: 100,
        },
      },
      required: ['updates'],
    },
  },
  
  // =====================================
  // PHASE 2: AUTOMATION MONITORING
  // =====================================
  {
    name: 'detect_automation_loops',
    description: 'Detect potential automation loops by analyzing activity patterns',
    inputSchema: {
      type: 'object',
      properties: {
        pipeline_id: { type: 'number', description: 'Pipeline ID to analyze (optional)' },
        days_back: { type: 'number', description: 'Days back to analyze (default: 7)', minimum: 1, maximum: 30 },
        min_frequency: { type: 'number', description: 'Minimum frequency to flag as suspicious (default: 5)' },
      },
    },
  },
  {
    name: 'get_automation_stats',
    description: 'Get comprehensive automation statistics and activity patterns',
    inputSchema: {
      type: 'object',
      properties: {
        pipeline_id: { type: 'number', description: 'Pipeline ID to analyze (optional)' },
        date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        group_by: { type: 'string', enum: ['day', 'week', 'month'], description: 'Grouping interval' },
      },
    },
  },
  
  // =====================================
  // PHASE 2: ADVANCED SEARCH & ANALYTICS
  // =====================================
  {
    name: 'advanced_search',
    description: 'Perform advanced search with multiple criteria and operators',
    inputSchema: {
      type: 'object',
      properties: {
        entity_type: { type: 'string', enum: ['deals', 'organizations', 'persons'], description: 'Entity type to search' },
        search_criteria: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', description: 'Field name to search' },
              operator: { type: 'string', enum: ['equals', 'contains', 'starts_with', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'], description: 'Search operator' },
              value: { description: 'Value to search for' },
              logic: { type: 'string', enum: ['AND', 'OR'], description: 'Logic operator (default: AND)' },
            },
            required: ['field', 'operator', 'value'],
          },
          minItems: 1,
        },
        sort_by: { type: 'string', description: 'Field to sort by' },
        sort_direction: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        limit: { type: 'number', description: 'Result limit (max 500)', maximum: 500 },
        start: { type: 'number', description: 'Pagination start' },
      },
      required: ['entity_type', 'search_criteria'],
    },
  },
  {
    name: 'get_data_insights',
    description: 'Generate comprehensive data insights and analytics',
    inputSchema: {
      type: 'object',
      properties: {
        entity_type: { type: 'string', enum: ['deals', 'organizations', 'persons'], description: 'Entity type to analyze' },
        metrics: {
          type: 'array',
          items: { type: 'string', enum: ['count', 'avg_value', 'total_value', 'conversion_rate', 'time_in_stage'] },
          description: 'Metrics to calculate',
          minItems: 1,
        },
        group_by: { type: 'string', description: 'Field to group results by' },
        date_range: {
          type: 'object',
          properties: {
            from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
            to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
          },
          required: ['from', 'to'],
        },
        filters: { type: 'object', description: 'Additional filters to apply' },
      },
      required: ['entity_type', 'metrics'],
    },
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
      case 'get_deals': {
        const parsed = GetDealsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await tools.getDeals(parsed), null, 2) }] };
      }
      case 'get_deal': {
        const parsed = GetDealSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await tools.getDeal(parsed), null, 2) }] };
      }
      case 'create_deal': {
        const parsed = CreateDealSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await tools.createDeal(parsed), null, 2) }] };
      }
      case 'update_deal': {
        const parsed = UpdateDealSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await tools.updateDeal(parsed), null, 2) }] };
      }
      case 'move_deal': {
        const parsed = MoveDealSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await tools.moveDeal(parsed), null, 2) }] };
      }
      case 'search_deals': {
        const parsed = SearchDealsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await tools.searchDeals(parsed), null, 2) }] };
      }
      case 'get_pipeline_stages': {
        const parsed = GetPipelineStagesSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await tools.getPipelineStages(parsed), null, 2) }] };
      }
      case 'get_custom_fields': {
        return { content: [{ type: 'text', text: JSON.stringify(await tools.getCustomFields(), null, 2) }] };
      }
      case 'create_activity': {
        const parsed = CreateActivitySchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await tools.createActivity(parsed), null, 2) }] };
      }
      case 'get_deal_activities': {
        const parsed = GetDealActivitiesSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await tools.getDealActivities(parsed), null, 2) }] };
      }
      case 'validate_email': {
        const parsed = ValidateEmailSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await tools.validateEmail(parsed), null, 2) }] };
      }
      case 'bulk_update_deals': {
        const parsed = BulkUpdateDealsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await advancedTools.bulkUpdateDeals(parsed), null, 2) }] };
      }
      case 'find_stale_deals': {
        const parsed = FindStaleDealsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await advancedTools.findStaleDeals(parsed), null, 2) }] };
      }
      case 'auto_populate_fields': {
        const parsed = AutoPopulateFieldsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await advancedTools.autoPopulateFields(parsed), null, 2) }] };
      }
      case 'get_pipeline_stats': {
        const parsed = GetPipelineStatsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await advancedTools.getPipelineStats(parsed), null, 2) }] };
      }

      // Phase 1: Organizations handlers
      case 'get_organizations': {
        const parsed = GetOrganizationsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await organizationsTools.getOrganizations(parsed), null, 2) }] };
      }
      case 'get_organization': {
        const parsed = GetOrganizationSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await organizationsTools.getOrganization(parsed), null, 2) }] };
      }
      case 'create_organization': {
        const parsed = CreateOrganizationSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await organizationsTools.createOrganization(parsed), null, 2) }] };
      }
      case 'update_organization': {
        const parsed = UpdateOrganizationSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await organizationsTools.updateOrganization(parsed), null, 2) }] };
      }
      case 'search_organizations': {
        const parsed = SearchOrganizationsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await organizationsTools.searchOrganizations(parsed), null, 2) }] };
      }
      case 'delete_organization': {
        const parsed = GetOrganizationSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await organizationsTools.deleteOrganization(parsed), null, 2) }] };
      }

      // Phase 1: Persons handlers
      case 'get_persons': {
        const parsed = GetPersonsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await personsTools.getPersons(parsed), null, 2) }] };
      }
      case 'get_person': {
        const parsed = GetPersonSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await personsTools.getPerson(parsed), null, 2) }] };
      }
      case 'create_person': {
        const parsed = CreatePersonSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await personsTools.createPerson(parsed), null, 2) }] };
      }
      case 'update_person': {
        const parsed = UpdatePersonSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await personsTools.updatePerson(parsed), null, 2) }] };
      }
      case 'search_persons': {
        const parsed = SearchPersonsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await personsTools.searchPersons(parsed), null, 2) }] };
      }
      case 'link_person_to_org': {
        const parsed = LinkPersonToOrgSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await personsTools.linkPersonToOrg(parsed), null, 2) }] };
      }
      case 'delete_person': {
        const parsed = GetPersonSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await personsTools.deletePerson(parsed), null, 2) }] };
      }
      case 'get_person_deals': {
        const parsed = GetPersonSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await personsTools.getPersonDeals(parsed), null, 2) }] };
      }

      // Phase 1: Email handlers
      case 'send_email': {
        const parsed = SendEmailSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await emailTools.sendEmail(parsed), null, 2) }] };
      }
      case 'get_email_templates': {
        const parsed = GetEmailTemplatesSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await emailTools.getEmailTemplates(parsed), null, 2) }] };
      }
      case 'create_email_template': {
        const parsed = CreateEmailTemplateSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await emailTools.createEmailTemplate(parsed), null, 2) }] };
      }
      case 'get_email_performance': {
        const parsed = GetEmailPerformanceSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await emailTools.getEmailPerformance(parsed), null, 2) }] };
      }
      case 'track_email': {
        const parsed = TrackEmailSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await emailTools.trackEmail(parsed), null, 2) }] };
      }
      case 'get_email_conversations': {
        return { content: [{ type: 'text', text: JSON.stringify(await emailTools.getEmailConversations(args), null, 2) }] };
      }

      // =====================================
      // PHASE 2: BULK OPERATIONS HANDLERS
      // =====================================
      case 'bulk_create_organizations': {
        const parsed = BulkCreateOrganizationsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await phase2Tools.bulkCreateOrganizations(parsed), null, 2) }] };
      }
      case 'bulk_update_organizations': {
        const parsed = BulkUpdateOrganizationsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await phase2Tools.bulkUpdateOrganizations(parsed), null, 2) }] };
      }
      case 'bulk_create_persons': {
        const parsed = BulkCreatePersonsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await phase2Tools.bulkCreatePersons(parsed), null, 2) }] };
      }
      case 'bulk_update_persons': {
        const parsed = BulkUpdatePersonsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await phase2Tools.bulkUpdatePersons(parsed), null, 2) }] };
      }

      // =====================================
      // PHASE 2: AUTOMATION MONITORING HANDLERS
      // =====================================
      case 'detect_automation_loops': {
        const parsed = DetectAutomationLoopsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await phase2Tools.detectAutomationLoops(parsed), null, 2) }] };
      }
      case 'get_automation_stats': {
        const parsed = GetAutomationStatsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await phase2Tools.getAutomationStats(parsed), null, 2) }] };
      }

      // =====================================
      // PHASE 2: ADVANCED SEARCH & ANALYTICS HANDLERS
      // =====================================
      case 'advanced_search': {
        const parsed = AdvancedSearchSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await phase2Tools.advancedSearch(parsed), null, 2) }] };
      }
      case 'get_data_insights': {
        const parsed = GetDataInsightsSchema.parse(args);
        return { content: [{ type: 'text', text: JSON.stringify(await phase2Tools.getDataInsights(parsed), null, 2) }] };
      }

      default:
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: false, error: { message: `Unknown tool: ${name}`, code: 'UNKNOWN_TOOL', retry: false } }, null, 2) }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            code: 'TOOL_EXECUTION_ERROR',
            retry: false,
          },
        }, null, 2),
      }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Pipedrive MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
