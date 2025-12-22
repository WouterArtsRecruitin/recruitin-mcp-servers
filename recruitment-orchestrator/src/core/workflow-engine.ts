/**
 * Workflow Engine
 * Executes workflows step by step with state management and error handling
 */

import { randomUUID } from 'crypto';
import { MCPClient } from './mcp-client.js';
import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowContext,
  StepResult,
  WorkflowStep
} from '../types/workflows.js';

export class WorkflowEngine {
  private mcpClient: MCPClient;
  private executions: Map<string, WorkflowExecution> = new Map();

  constructor() {
    this.mcpClient = new MCPClient();
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: WorkflowDefinition,
    initialParams: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      execution_id: randomUUID(),
      workflow_name: workflow.name,
      status: 'running',
      current_step: 0,
      total_steps: workflow.steps.length,
      steps_completed: [],
      context: { ...initialParams },
      started_at: new Date()
    };

    this.executions.set(execution.execution_id, execution);

    console.error(`\n🚀 [Workflow] Starting: ${workflow.name} (${execution.execution_id})`);
    console.error(`   Steps: ${workflow.steps.length}`);
    console.error(`   Initial params: ${JSON.stringify(initialParams)}\n`);

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        execution.current_step = i + 1;

        console.error(`⚙️  [Step ${i + 1}/${workflow.steps.length}] ${step.name}`);

        const result = await this.executeStep(step, execution.context);
        execution.steps_completed.push(result);

        if (result.status === 'failed') {
          if (step.on_error === 'continue') {
            console.error(`   ⚠️  Step failed but continuing (on_error=continue)`);
            continue;
          } else if (step.on_error === 'skip') {
            console.error(`   ⏭️  Skipping failed step`);
            continue;
          } else {
            // Default: fail the workflow
            throw new Error(`Step "${step.name}" failed: ${result.error}`);
          }
        }

        console.error(`   ✅ Completed in ${result.duration_ms}ms`);
      }

      execution.status = 'completed';
      execution.completed_at = new Date();
      execution.result = this.buildResult(workflow, execution.context);

      const duration = execution.completed_at.getTime() - execution.started_at.getTime();
      console.error(`\n✅ [Workflow] Completed: ${workflow.name}`);
      console.error(`   Duration: ${duration}ms`);
      console.error(`   Steps: ${execution.steps_completed.length}/${workflow.steps.length}\n`);

      return execution;

    } catch (error) {
      execution.status = 'failed';
      execution.completed_at = new Date();
      execution.error = error instanceof Error ? error.message : String(error);

      console.error(`\n❌ [Workflow] Failed: ${workflow.name}`);
      console.error(`   Error: ${execution.error}\n`);

      return execution;
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<StepResult> {
    const startTime = Date.now();
    const result: StepResult = {
      step_name: step.name,
      status: 'success',
      duration_ms: 0,
      timestamp: new Date().toISOString()
    };

    try {
      let output: any;

      if (step.mcp && step.tool) {
        // MCP tool call
        const params = this.resolveParams(step.params || {}, context);
        output = await this.mcpClient.call(step.mcp, step.tool, params);
      } else if (step.local === 'javascript') {
        // Local JavaScript execution
        output = this.executeLocalCode(step.code || '', context);
      } else if (step.local === 'markdown') {
        // Template rendering
        output = this.renderTemplate(step.template || '', context);
      } else {
        throw new Error(`Invalid step configuration: must have mcp/tool or local`);
      }

      // Store output in context
      context[step.output] = output;
      result.output = output;

    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : String(error);

      // Retry logic
      if (step.retry) {
        console.error(`   🔄 Retrying (${step.retry.max_attempts} attempts)`);
        for (let attempt = 1; attempt <= step.retry.max_attempts; attempt++) {
          await this.sleep(step.retry.delay);
          try {
            const params = this.resolveParams(step.params || {}, context);
            const output = await this.mcpClient.call(step.mcp!, step.tool!, params);
            context[step.output] = output;
            result.output = output;
            result.status = 'success';
            result.error = undefined;
            console.error(`   ✅ Retry ${attempt} succeeded`);
            break;
          } catch (retryError) {
            if (attempt === step.retry.max_attempts) {
              result.error = retryError instanceof Error ? retryError.message : String(retryError);
            }
          }
        }
      }
    }

    result.duration_ms = Date.now() - startTime;
    return result;
  }

  /**
   * Resolve parameters with context variable substitution
   */
  private resolveParams(
    params: Record<string, any>,
    context: WorkflowContext
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      resolved[key] = this.resolveValue(value, context);
    }

    return resolved;
  }

  /**
   * Resolve a single value with variable substitution
   */
  private resolveValue(value: any, context: WorkflowContext): any {
    if (typeof value === 'string') {
      // Handle ${variable} syntax
      return value.replace(/\$\{([^}]+)\}/g, (match, path) => {
        const result = this.getNestedValue(context, path);
        return result !== undefined ? result : match;
      });
    } else if (Array.isArray(value)) {
      return value.map(item => this.resolveValue(item, context));
    } else if (typeof value === 'object' && value !== null) {
      const resolved: any = {};
      for (const [k, v] of Object.entries(value)) {
        resolved[k] = this.resolveValue(v, context);
      }
      return resolved;
    }
    return value;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Execute local JavaScript code
   */
  private executeLocalCode(code: string, context: WorkflowContext): any {
    // Create a function with context variables
    const func = new Function(...Object.keys(context), `return (${code})`);
    return func(...Object.values(context));
  }

  /**
   * Render a template with context variables
   */
  private renderTemplate(template: string, context: WorkflowContext): string {
    return template.replace(/\$\{([^}]+)\}/g, (match, path) => {
      const value = this.getNestedValue(context, path);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Build the final workflow result
   */
  private buildResult(workflow: WorkflowDefinition, context: WorkflowContext): any {
    const result: any = {};

    for (const [key, path] of Object.entries(workflow.return)) {
      result[key] = this.resolveValue(path, context);
    }

    return result;
  }

  /**
   * Get execution status
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get all executions
   */
  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup
   */
  async close(): Promise<void> {
    await this.mcpClient.close();
  }
}
