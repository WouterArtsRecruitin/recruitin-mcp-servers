/**
 * MCP Client
 * Handles communication with other MCP servers
 */

import { spawn, ChildProcess } from 'child_process';
import { MCPToolCall, MCPResponse } from '../types/workflows.js';

interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export class MCPClient {
  private servers: Map<string, MCPServerConfig> = new Map();
  private processes: Map<string, ChildProcess> = new Map();
  private requestId = 1;

  constructor() {
    // Define MCP server configurations
    // These match your Claude Desktop config
    this.servers.set('pipedrive-automation', {
      command: 'node',
      args: ['/Users/wouterarts/mcp-servers/pipedrive-mcp-server.js'],
      env: {
        PIPEDRIVE_API_TOKEN: process.env.PIPEDRIVE_API_TOKEN || '816d7466f832185d38d350176c88115567e610dd',
        PIPEDRIVE_DOMAIN: process.env.PIPEDRIVE_DOMAIN || 'recruitinbv'
      }
    });

    this.servers.set('recruitin-components', {
      command: 'python3',
      args: ['/Users/wouterarts/recruitin-components-mcp/recruitin_mcp_server.py']
    });

    this.servers.set('recruitment-trends', {
      command: 'node',
      args: ['/Users/wouterarts/Downloads/local-mcp-apps/recruitment-trends/daily-trends-mcp.cjs']
    });

    this.servers.set('salary-benchmark', {
      command: 'node',
      args: ['/Users/wouterarts/Downloads/local-mcp-apps/salary-benchmark/mcp-server.cjs']
    });
  }

  /**
   * Call a tool on an MCP server
   */
  async call(mcpName: string, toolName: string, params: Record<string, any>): Promise<any> {
    console.error(`[MCP Client] Calling ${mcpName}.${toolName}`);

    const config = this.servers.get(mcpName);
    if (!config) {
      throw new Error(`Unknown MCP server: ${mcpName}`);
    }

    try {
      // For now, we'll use a simplified approach
      // In production, this would maintain persistent connections
      const response = await this.executeToolCall(config, toolName, params);
      return response;
    } catch (error) {
      console.error(`[MCP Client] Error calling ${mcpName}.${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Execute a single tool call
   */
  private async executeToolCall(
    config: MCPServerConfig,
    toolName: string,
    params: Record<string, any>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(config.command, config.args, {
        env: { ...process.env, ...config.env },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      childProcess.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      childProcess.on('close', (code: number | null) => {
        if (code !== 0 && code !== null) {
          reject(new Error(`Process exited with code ${code}\nStderr: ${stderr}`));
          return;
        }

        try {
          // Parse the last JSON line from stdout
          const lines = stdout.trim().split('\n').filter(l => l.trim());
          const lastLine = lines[lines.length - 1];
          const response = JSON.parse(lastLine);

          if (response.error) {
            reject(new Error(response.error.message || 'MCP tool call failed'));
          } else {
            resolve(response.result);
          }
        } catch (error) {
          reject(new Error(`Failed to parse MCP response: ${error}`));
        }
      });

      // Send the tool call request
      const request = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params
        }
      };

      childProcess.stdin?.write(JSON.stringify(request) + '\n');
      childProcess.stdin?.end();

      // Timeout after 30 seconds
      setTimeout(() => {
        childProcess.kill();
        reject(new Error('Tool call timed out after 30 seconds'));
      }, 30000);
    });
  }

  /**
   * Call Zapier webhook (special case)
   */
  async callZapierWebhook(endpoint: string, data: any): Promise<any> {
    // This would make HTTP requests to Zapier webhooks
    // For now, return mock data
    console.error(`[MCP Client] Calling Zapier webhook: ${endpoint}`);
    return {
      success: true,
      timestamp: new Date().toISOString(),
      data
    };
  }

  /**
   * Close all MCP connections
   */
  async close(): Promise<void> {
    for (const [name, process] of this.processes.entries()) {
      console.error(`[MCP Client] Closing connection to ${name}`);
      process.kill();
    }
    this.processes.clear();
  }
}
