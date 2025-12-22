/**
 * Recruitment Orchestrator MCP Server
 * Provides workflow orchestration for recruitment automation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { WorkflowEngine } from './core/workflow-engine.js';
import { candidateIntakeWorkflow } from './workflows/candidate-intake.js';
import { apolloImportWorkflow } from './workflows/apollo-import.js';
import { dailyIntelligenceWorkflow } from './workflows/daily-intelligence.js';
import { clientAcquisitionWorkflow } from './workflows/client-acquisition.js';

// Create MCP server
const server = new Server(
  {
    name: 'recruitment-orchestrator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize workflow engine
const workflowEngine = new WorkflowEngine();

// Register all workflows
const workflows = new Map([
  ['candidate_intake', candidateIntakeWorkflow],
  ['apollo_bulk_import', apolloImportWorkflow],
  ['daily_intelligence', dailyIntelligenceWorkflow],
  ['client_acquisition', clientAcquisitionWorkflow],
]);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'run_workflow',
        description: 'Execute an automated recruitment workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflow_name: {
              type: 'string',
              enum: ['candidate_intake', 'apollo_bulk_import', 'daily_intelligence', 'client_acquisition'],
              description: 'Name of the workflow to execute'
            },
            params: {
              type: 'object',
              description: 'Workflow parameters (varies by workflow)',
              properties: {
                // Candidate intake params
                name: { type: 'string', description: 'Candidate name' },
                email: { type: 'string', description: 'Candidate email' },
                role: { type: 'string', description: 'Job role/title' },
                location: { type: 'string', description: 'Location (e.g., Amsterdam)' },
                seniority: { type: 'string', description: 'Experience level (Junior/Medior/Senior)' },
                expected_salary: { type: 'string', description: 'Expected salary' },
                skills: { type: 'string', description: 'Comma-separated skills' },
                current_company: { type: 'string', description: 'Current employer' },
                // Apollo import params
                contacts: { 
                  type: 'array',
                  description: 'Array of contact objects for bulk import',
                  items: {
                    type: 'object',
                    properties: {
                      first_name: { type: 'string' },
                      last_name: { type: 'string' },
                      email: { type: 'string' },
                      company: { type: 'string' },
                      title: { type: 'string' },
                      phone: { type: 'string' }
                    }
                  }
                },
                // Client acquisition params
                company: { type: 'string', description: 'Company name' },
                contact_name: { type: 'string', description: 'Contact person name' },
                industry: { type: 'string', description: 'Industry sector' },
                hiring_needs: { type: 'string', description: 'Hiring requirements' },
                budget: { type: 'string', description: 'Estimated budget' },
                urgency: { type: 'string', description: 'Urgency level' },
                roles: { type: 'string', description: 'Number of roles to fill' },
                // Jotform data (any workflow)
                jotform_data: { 
                  type: 'object',
                  description: 'Raw Jotform submission data'
                }
              }
            }
          },
          required: ['workflow_name']
        }
      },
      {
        name: 'list_workflows',
        description: 'List all available workflows with descriptions',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_workflow_status',
        description: 'Get the status and results of a workflow execution',
        inputSchema: {
          type: 'object',
          properties: {
            execution_id: {
              type: 'string',
              description: 'The execution ID returned from run_workflow'
            }
          },
          required: ['execution_id']
        }
      },
      {
        name: 'get_workflow_history',
        description: 'Get recent workflow execution history',
        inputSchema: {
          type: 'object',
          properties: {
            workflow_name: {
              type: 'string',
              description: 'Filter by workflow name (optional)'
            },
            limit: {
              type: 'number',
              description: 'Number of executions to return (default: 10)',
              default: 10
            }
          }
        }
      }
    ],
  };
});

// Tool execution handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'run_workflow': {
        const { workflow_name, params = {} } = args as any;
        
        const workflow = workflows.get(workflow_name);
        if (!workflow) {
          return {
            content: [{
              type: 'text',
              text: `❌ Unknown workflow: ${workflow_name}\n\nAvailable workflows: ${Array.from(workflows.keys()).join(', ')}`
            }]
          };
        }

        console.error(`\n🚀 Starting workflow: ${workflow_name}`);
        const execution = await workflowEngine.executeWorkflow(workflow, params);

        if (execution.status === 'completed') {
          const result = execution.result;
          return {
            content: [{
              type: 'text',
              text: `✅ **Workflow Completed: ${workflow_name}**\n\n` +
                    `**Execution ID:** ${execution.execution_id}\n` +
                    `**Duration:** ${execution.completed_at!.getTime() - execution.started_at.getTime()}ms\n` +
                    `**Steps:** ${execution.steps_completed.length}/${execution.total_steps}\n\n` +
                    `**Results:**\n${JSON.stringify(result, null, 2)}\n\n` +
                    `*Use get_workflow_status with execution_id for detailed step information*`
            }]
          };
        } else {
          return {
            content: [{
              type: 'text',
              text: `❌ **Workflow Failed: ${workflow_name}**\n\n` +
                    `**Execution ID:** ${execution.execution_id}\n` +
                    `**Error:** ${execution.error}\n` +
                    `**Steps Completed:** ${execution.steps_completed.length}/${execution.total_steps}\n\n` +
                    `*Use get_workflow_status for detailed error information*`
            }]
          };
        }
      }

      case 'list_workflows': {
        const workflowList = Array.from(workflows.entries()).map(([name, def]) => ({
          name,
          description: def.description,
          trigger: def.trigger,
          steps: def.steps.length
        }));

        return {
          content: [{
            type: 'text',
            text: `📋 **Available Workflows**\n\n` +
                  workflowList.map((w, i) => 
                    `**${i + 1}. ${w.name}**\n` +
                    `   Description: ${w.description}\n` +
                    `   Trigger: ${w.trigger}\n` +
                    `   Steps: ${w.steps}\n`
                  ).join('\n')
          }]
        };
      }

      case 'get_workflow_status': {
        const { execution_id } = args as any;
        const execution = workflowEngine.getExecution(execution_id);

        if (!execution) {
          return {
            content: [{
              type: 'text',
              text: `❌ Execution not found: ${execution_id}`
            }]
          };
        }

        return {
          content: [{
            type: 'text',
            text: `📊 **Workflow Execution Status**\n\n` +
                  `**ID:** ${execution.execution_id}\n` +
                  `**Workflow:** ${execution.workflow_name}\n` +
                  `**Status:** ${execution.status}\n` +
                  `**Progress:** ${execution.current_step}/${execution.total_steps} steps\n` +
                  `**Started:** ${execution.started_at.toISOString()}\n` +
                  `**Completed:** ${execution.completed_at?.toISOString() || 'Running...'}\n\n` +
                  `**Steps:**\n` +
                  execution.steps_completed.map((step, i) => 
                    `${i + 1}. ${step.step_name}: ${step.status} (${step.duration_ms}ms)` +
                    (step.error ? `\n   Error: ${step.error}` : '')
                  ).join('\n') +
                  (execution.result ? `\n\n**Result:**\n${JSON.stringify(execution.result, null, 2)}` : '') +
                  (execution.error ? `\n\n**Error:**\n${execution.error}` : '')
          }]
        };
      }

      case 'get_workflow_history': {
        const { workflow_name, limit = 10 } = args as any;
        const allExecutions = workflowEngine.getAllExecutions();
        
        let filtered = workflow_name 
          ? allExecutions.filter(e => e.workflow_name === workflow_name)
          : allExecutions;
        
        filtered = filtered
          .sort((a, b) => b.started_at.getTime() - a.started_at.getTime())
          .slice(0, limit);

        if (filtered.length === 0) {
          return {
            content: [{
              type: 'text',
              text: workflow_name 
                ? `No executions found for workflow: ${workflow_name}`
                : 'No workflow executions yet'
            }]
          };
        }

        return {
          content: [{
            type: 'text',
            text: `📜 **Workflow History** ${workflow_name ? `(${workflow_name})` : ''}\n\n` +
                  filtered.map((exec, i) => 
                    `**${i + 1}. ${exec.workflow_name}** (${exec.execution_id})\n` +
                    `   Status: ${exec.status}\n` +
                    `   Started: ${exec.started_at.toLocaleString()}\n` +
                    `   Steps: ${exec.steps_completed.length}/${exec.total_steps}\n` +
                    (exec.error ? `   Error: ${exec.error}\n` : '')
                  ).join('\n')
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{
        type: 'text',
        text: `❌ **Error:** ${errorMessage}`
      }],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Recruitment Orchestrator MCP Server started');
  console.error(`   Workflows: ${Array.from(workflows.keys()).join(', ')}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
