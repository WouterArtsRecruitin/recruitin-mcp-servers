/**
 * Workflow Type Definitions
 * Core types for the orchestrator workflow engine
 */

export interface WorkflowStep {
  name: string;
  mcp?: string;
  tool?: string;
  params?: Record<string, any>;
  local?: 'javascript' | 'markdown';
  code?: string;
  template?: string;
  output: string;
  retry?: {
    max_attempts: number;
    delay: number;
  };
  on_error?: 'fail' | 'continue' | 'skip';
}

export interface WorkflowDefinition {
  name: string;
  description: string;
  trigger: 'manual' | 'scheduled' | 'webhook';
  schedule?: string; // cron format
  steps: WorkflowStep[];
  return: Record<string, string>;
}

export interface WorkflowContext {
  [key: string]: any;
}

export interface StepResult {
  step_name: string;
  status: 'success' | 'failed' | 'skipped';
  output?: any;
  error?: string;
  duration_ms: number;
  timestamp: string;
}

export interface WorkflowExecution {
  execution_id: string;
  workflow_name: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  current_step: number;
  total_steps: number;
  steps_completed: StepResult[];
  context: WorkflowContext;
  started_at: Date;
  completed_at?: Date;
  error?: string;
  result?: any;
}

export interface MCPToolCall {
  mcp: string;
  tool: string;
  params: Record<string, any>;
}

export interface MCPResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}
