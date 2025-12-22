import { z } from 'zod';
import type { PipedriveClient } from './pipedrive-client.js';
import type { MCPToolResult } from './types.js';

// Zod schemas for input validation
export const GetDealsSchema = z.object({
  pipeline_id: z.number().optional(),
  stage_id: z.number().optional(),
  status: z.enum(['open', 'won', 'lost', 'deleted', 'all_not_deleted']).optional(),
  user_id: z.number().optional(),
  start: z.number().optional(),
  limit: z.number().optional(),
});

export const GetDealSchema = z.object({
  deal_id: z.number(),
});

export const CreateDealSchema = z.object({
  title: z.string(),
  person_id: z.number().optional(),
  org_id: z.number().optional(),
  stage_id: z.number().optional(),
  value: z.number().optional(),
  currency: z.string().optional(),
  custom_fields: z.record(z.any()).optional(),
});

export const UpdateDealSchema = z.object({
  deal_id: z.number(),
  title: z.string().optional(),
  value: z.number().optional(),
  person_id: z.number().optional(),
  org_id: z.number().optional(),
  stage_id: z.number().optional(),
  status: z.enum(['open', 'won', 'lost', 'deleted']).optional(),
  lost_reason: z.string().optional(),
  custom_fields: z.record(z.any()).optional(),
});

export const MoveDealSchema = z.object({
  deal_id: z.number(),
  stage_id: z.number(),
});

export const SearchDealsSchema = z.object({
  term: z.string(),
  fields: z.array(z.string()).optional(),
});

export const GetPipelineStagesSchema = z.object({
  pipeline_id: z.number().optional(),
});

export const CreateActivitySchema = z.object({
  deal_id: z.number().optional(),
  person_id: z.number().optional(),
  org_id: z.number().optional(),
  subject: z.string(),
  type: z.string(),
  due_date: z.string().optional(), // YYYY-MM-DD
  due_time: z.string().optional(), // HH:MM
  duration: z.string().optional(), // HH:MM
  note: z.string().optional(),
  done: z.boolean().optional(),
});

export const GetDealActivitiesSchema = z.object({
  deal_id: z.number(),
});

export const ValidateEmailSchema = z.object({
  email: z.string().email(),
});

export const BulkUpdateDealsSchema = z.object({
  deal_ids: z.array(z.number()),
  updates: z.record(z.any()),
});

export const FindStaleDealsSchema = z.object({
  days_inactive: z.number().min(1),
  pipeline_id: z.number().optional(),
});

// Tool implementations
export class PipedriveTools {
  constructor(private client: PipedriveClient) {}

  async getDeals(args: z.infer<typeof GetDealsSchema>): Promise<MCPToolResult> {
    try {
      const response = await this.client.getDeals(args);
      
      if (!response.success) {
        return {
          success: false,
          error: {
            message: response.error || 'Failed to get deals',
            code: 'PIPEDRIVE_API_ERROR',
            retry: true,
          },
        };
      }

      return {
        success: true,
        data: {
          deals: response.data,
          count: Array.isArray(response.data) ? response.data.length : 0,
          pagination: response.additional_data?.pagination,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          retry: false,
        },
      };
    }
  }

  async getDeal(args: z.infer<typeof GetDealSchema>): Promise<MCPToolResult> {
    try {
      const response = await this.client.getDeal(args.deal_id);
      
      if (!response.success) {
        return {
          success: false,
          error: {
            message: response.error || 'Failed to get deal',
            code: 'PIPEDRIVE_API_ERROR',
            retry: true,
          },
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          retry: false,
        },
      };
    }
  }

  async createDeal(args: z.infer<typeof CreateDealSchema>): Promise<MCPToolResult> {
    try {
      const { custom_fields, ...dealParams } = args;
      const params = { ...dealParams, ...custom_fields };
      
      const response = await this.client.createDeal(params);
      
      if (!response.success) {
        return {
          success: false,
          error: {
            message: response.error || 'Failed to create deal',
            code: 'PIPEDRIVE_API_ERROR',
            retry: true,
          },
        };
      }

      return {
        success: true,
        data: {
          deal: response.data,
          message: `Deal created successfully: ${response.data?.title} (ID: ${response.data?.id})`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          retry: false,
        },
      };
    }
  }

  async updateDeal(args: z.infer<typeof UpdateDealSchema>): Promise<MCPToolResult> {
    try {
      const { deal_id, custom_fields, ...updateParams } = args;
      const params = { ...updateParams, ...custom_fields };
      
      const response = await this.client.updateDeal(deal_id, params);
      
      if (!response.success) {
        return {
          success: false,
          error: {
            message: response.error || 'Failed to update deal',
            code: 'PIPEDRIVE_API_ERROR',
            retry: true,
          },
        };
      }

      return {
        success: true,
        data: {
          deal: response.data,
          message: `Deal updated successfully: ${response.data?.title}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          retry: false,
        },
      };
    }
  }

  async moveDeal(args: z.infer<typeof MoveDealSchema>): Promise<MCPToolResult> {
    try {
      const response = await this.client.updateDeal(args.deal_id, {
        stage_id: args.stage_id,
      });
      
      if (!response.success) {
        return {
          success: false,
          error: {
            message: response.error || 'Failed to move deal',
            code: 'PIPEDRIVE_API_ERROR',
            retry: true,
          },
        };
      }

      return {
        success: true,
        data: {
          deal: response.data,
          message: `Deal moved to stage ${args.stage_id}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          retry: false,
        },
      };
    }
  }

  async searchDeals(args: z.infer<typeof SearchDealsSchema>): Promise<MCPToolResult> {
    try {
      const response = await this.client.searchDeals(args.term, args.fields);
      
      if (!response.success) {
        return {
          success: false,
          error: {
            message: response.error || 'Failed to search deals',
            code: 'PIPEDRIVE_API_ERROR',
            retry: true,
          },
        };
      }

      return {
        success: true,
        data: {
          deals: response.data,
          count: Array.isArray(response.data) ? response.data.length : 0,
          search_term: args.term,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          retry: false,
        },
      };
    }
  }

  async getPipelineStages(args: z.infer<typeof GetPipelineStagesSchema>): Promise<MCPToolResult> {
    try {
      const response = await this.client.getStages(args.pipeline_id);
      
      if (!response.success) {
        return {
          success: false,
          error: {
            message: response.error || 'Failed to get pipeline stages',
            code: 'PIPEDRIVE_API_ERROR',
            retry: true,
          },
        };
      }

      return {
        success: true,
        data: {
          stages: response.data,
          count: Array.isArray(response.data) ? response.data.length : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          retry: false,
        },
      };
    }
  }

  async getCustomFields(): Promise<MCPToolResult> {
    try {
      const response = await this.client.getDealFields();
      
      if (!response.success) {
        return {
          success: false,
          error: {
            message: response.error || 'Failed to get custom fields',
            code: 'PIPEDRIVE_API_ERROR',
            retry: true,
          },
        };
      }

      return {
        success: true,
        data: {
          fields: response.data,
          count: Array.isArray(response.data) ? response.data.length : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          retry: false,
        },
      };
    }
  }

  async createActivity(args: z.infer<typeof CreateActivitySchema>): Promise<MCPToolResult> {
    try {
      const response = await this.client.createActivity(args);
      
      if (!response.success) {
        return {
          success: false,
          error: {
            message: response.error || 'Failed to create activity',
            code: 'PIPEDRIVE_API_ERROR',
            retry: true,
          },
        };
      }

      return {
        success: true,
        data: {
          activity: response.data,
          message: `Activity created: ${response.data?.subject}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          retry: false,
        },
      };
    }
  }

  async getDealActivities(args: z.infer<typeof GetDealActivitiesSchema>): Promise<MCPToolResult> {
    try {
      const response = await this.client.getActivities({ deal_id: args.deal_id });
      
      if (!response.success) {
        return {
          success: false,
          error: {
            message: response.error || 'Failed to get deal activities',
            code: 'PIPEDRIVE_API_ERROR',
            retry: true,
          },
        };
      }

      return {
        success: true,
        data: {
          activities: response.data,
          count: Array.isArray(response.data) ? response.data.length : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          retry: false,
        },
      };
    }
  }

  async validateEmail(args: z.infer<typeof ValidateEmailSchema>): Promise<MCPToolResult> {
    try {
      const result = await this.client.validateEmail(args.email);
      
      return {
        success: true,
        data: {
          email: args.email,
          valid: result.valid,
          reason: result.reason,
          suggestion: result.reason?.includes('Did you mean') ? result.reason.split('Did you mean ')[1]?.replace('?', '') : undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          retry: false,
        },
      };
    }
  }
}
