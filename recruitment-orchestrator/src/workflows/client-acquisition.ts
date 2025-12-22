/**
 * Workflow 4: Client Acquisition
 * Process new client inquiries from Jotform with industry intelligence
 */

import { WorkflowDefinition } from '../types/workflows.js';

export const clientAcquisitionWorkflow: WorkflowDefinition = {
  name: 'client_acquisition',
  description: 'Process new client inquiry with industry intelligence and create sales deal',
  trigger: 'manual',

  steps: [
    {
      name: 'extract_client_data',
      local: 'javascript',
      code: `
        // Extract client data from Jotform or params
        return {
          company_name: jotform_data?.company_name || params?.company || 'Unknown Company',
          contact_name: jotform_data?.contact_name || params?.contact_name || '',
          contact_email: jotform_data?.contact_email || params?.email,
          industry: jotform_data?.industry || params?.industry || 'Technology',
          hiring_needs: jotform_data?.hiring_needs || params?.hiring_needs || 'General recruitment',
          estimated_budget: parseInt(jotform_data?.estimated_budget || params?.budget || '10000'),
          urgency: jotform_data?.urgency || params?.urgency || 'Normal',
          roles_count: parseInt(jotform_data?.roles_count || params?.roles || '1')
        }
      `,
      output: 'client_data'
    },

    {
      name: 'analyze_industry',
      mcp: 'recruitment-trends',
      tool: 'analyze_industry',
      params: {
        industry: '${client_data.industry}'
      },
      output: 'industry_insights',
      on_error: 'continue',
      retry: {
        max_attempts: 2,
        delay: 1000
      }
    },

    {
      name: 'create_sales_deal',
      mcp: 'pipedrive-automation',
      tool: 'create_deal',
      params: {
        title: '${client_data.company_name} - Client Acquisition',
        person_name: '${client_data.contact_name}',
        person_email: '${client_data.contact_email}',
        org_name: '${client_data.company_name}',
        value: '${client_data.estimated_budget}',
        source: 'Jotform Client Inquiry'
      },
      output: 'sales_deal',
      retry: {
        max_attempts: 3,
        delay: 2000
      }
    },

    {
      name: 'add_client_intelligence',
      mcp: 'pipedrive-automation',
      tool: 'add_note_to_deal',
      params: {
        deal_id: '${sales_deal.id}',
        content: `🏢 Client Acquisition Intelligence

📋 Client Details:
- Industry: \${context.client_data?.industry || 'N/A'}
- Hiring Needs: \${context.client_data?.hiring_needs || 'N/A'}
- Roles to Fill: \${context.client_data?.roles_count || 'N/A'}
- Budget: €\${context.client_data?.estimated_budget || 'N/A'}
- Urgency: \${context.client_data?.urgency || 'Normal'}

📊 Industry Insights:
\${context.industry_insights?.summary || 'Industry analysis not available'}

**Key Trends:**
\${context.industry_insights?.trends ? context.industry_insights.trends.join(', ') : 'N/A'}

**Competitive Landscape:**
\${context.industry_insights?.competition || 'N/A'}

**Recommended Approach:**
\${context.industry_insights?.recommendation || 'Standard recruitment process'}

🎯 Next Steps:
1. \${context.client_data?.urgency === 'High' ? '⚡ URGENT - Schedule call within 24 hours' : 'Schedule discovery call'}
2. Prepare industry-specific case studies
3. Review available candidates in pipeline
4. Prepare pricing proposal based on \${context.client_data?.roles_count || 1} role(s)`
      },
      output: 'intel_note',
      on_error: 'continue'
    },

    {
      name: 'track_acquisition',
      mcp: 'recruitin-components',
      tool: 'track_usage',
      params: {
        component_id: 'workflow_client_acquisition',
        project: 'jobdigger',
        success: true
      },
      output: 'tracking',
      on_error: 'continue'
    }
  ],

  return: {
    company: '${client_data.company_name}',
    contact_email: '${client_data.contact_email}',
    deal_id: '${sales_deal.id}',
    deal_url: '${sales_deal.url}',
    industry: '${client_data.industry}',
    budget: '${client_data.estimated_budget}',
    urgency: '${client_data.urgency}',
    roles_count: '${client_data.roles_count}',
    status: 'completed'
  }
};
