/**
 * Workflow 2: Apollo Bulk Import
 * Bulk import Apollo contacts with salary enrichment into Pipedrive
 */

import { WorkflowDefinition } from '../types/workflows.js';

export const apolloImportWorkflow: WorkflowDefinition = {
  name: 'apollo_bulk_import',
  description: 'Bulk import Apollo contacts with salary enrichment and create Pipedrive deals',
  trigger: 'manual',

  steps: [
    {
      name: 'validate_contacts',
      local: 'javascript',
      code: `
        // Validate and normalize contacts array
        const contacts_array = contacts || params?.contacts || [];
        if (!Array.isArray(contacts_array)) {
          throw new Error('contacts must be an array');
        }
        
        if (contacts_array.length === 0) {
          throw new Error('No contacts provided');
        }

        // Normalize contact data
        return contacts_array.map((c, idx) => ({
          first_name: c.first_name || c.firstName || '',
          last_name: c.last_name || c.lastName || '',
          email: c.email || c.Email || '',
          company: c.company || c.organization || c.Company || 'Unknown',
          title: c.title || c.jobTitle || 'Unknown',
          phone: c.phone || c.phoneNumber || '',
          source_index: idx
        })).filter(c => c.email); // Only keep contacts with email
      `,
      output: 'validated_contacts'
    },

    {
      name: 'enrich_with_salary_data',
      mcp: 'salary-benchmark',
      tool: 'bulk_benchmark',
      params: {
        contacts: '${validated_contacts}'
      },
      output: 'enriched_contacts',
      on_error: 'continue',
      retry: {
        max_attempts: 2,
        delay: 2000
      }
    },

    {
      name: 'create_deals_in_bulk',
      mcp: 'pipedrive-automation',
      tool: 'bulk_create_deals',
      params: {
        contacts: '${enriched_contacts || validated_contacts}'
      },
      output: 'bulk_result',
      retry: {
        max_attempts: 2,
        delay: 3000
      }
    },

    {
      name: 'track_import_stats',
      mcp: 'recruitin-components',
      tool: 'track_usage',
      params: {
        component_id: 'workflow_apollo_import',
        project: 'jobdigger',
        success: true,
        quality_score: '${(bulk_result.success_count / validated_contacts.length) * 100}'
      },
      output: 'tracking_result',
      on_error: 'continue'
    }
  ],

  return: {
    contacts_processed: '${validated_contacts.length}',
    deals_created: '${bulk_result.success_count || 0}',
    deals_failed: '${bulk_result.error_count || 0}',
    success_rate_percent: '${Math.round((bulk_result.success_count / validated_contacts.length) * 100)}',
    enrichment_applied: '${enriched_contacts ? "yes" : "no"}',
    processing_time_ms: '${workflow.duration}',
    status: 'completed'
  }
};
