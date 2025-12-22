import { z } from 'zod';
import type { PipedriveClient } from './pipedrive-client.js';
import type { MCPToolResult, PipedriveDeal } from './types.js';

export const BulkUpdateDealsSchema = z.object({
  deal_ids: z.array(z.number()),
  updates: z.record(z.any()),
});

export const FindStaleDealsSchema = z.object({
  days_inactive: z.number().min(1),
  pipeline_id: z.number().optional(),
  stage_id: z.number().optional(),
});

export const AutoPopulateFieldsSchema = z.object({
  deal_id: z.number(),
  job_title: z.string().optional(),
  location: z.string().optional(),
  market_data: z.object({
    salary_min: z.number().optional(),
    salary_max: z.number().optional(),
    salary_avg: z.number().optional(),
    demand_level: z.string().optional(),
    workforce_available: z.number().optional(),
  }).optional(),
});

export const GetPipelineStatsSchema = z.object({
  pipeline_id: z.number(),
});

export class AdvancedPipedriveTools {
  constructor(private client: PipedriveClient) {}

  async bulkUpdateDeals(args: z.infer<typeof BulkUpdateDealsSchema>): Promise<MCPToolResult> {
    try {
      const results = [];
      const errors = [];

      for (const dealId of args.deal_ids) {
        try {
          const response = await this.client.updateDeal(dealId, args.updates);
          if (response.success) {
            results.push({ dealId, success: true, title: response.data?.title });
          } else {
            errors.push({ dealId, error: response.error });
          }
        } catch (error) {
          errors.push({
            dealId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return {
        success: true,
        data: {
          updated: results.length,
          failed: errors.length,
          total: args.deal_ids.length,
          results,
          errors: errors.length > 0 ? errors : undefined,
          message: `Bulk update completed: ${results.length} succeeded, ${errors.length} failed`,
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

  async findStaleDeals(args: z.infer<typeof FindStaleDealsSchema>): Promise<MCPToolResult> {
    try {
      // Get all deals in pipeline
      const response = await this.client.getDeals({
        pipeline_id: args.pipeline_id,
        stage_id: args.stage_id,
        status: 'open',
      });

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

      const deals = response.data || [];
      const staleDeals: Array<PipedriveDeal & { days_inactive: number }> = [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - args.days_inactive);

      for (const deal of deals) {
        // Get activities for this deal
        const activitiesResponse = await this.client.getActivities({ deal_id: deal.id });
        const activities = activitiesResponse.data || [];

        // Find most recent activity
        const lastActivityDate = activities.length > 0
          ? new Date(Math.max(...activities.map(a => new Date(a.add_time).getTime())))
          : new Date(deal.add_time);

        // Check if stale
        if (lastActivityDate < cutoffDate) {
          const daysInactive = Math.floor(
            (new Date().getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          staleDeals.push({
            ...deal,
            days_inactive: daysInactive,
          });
        }
      }

      // Sort by days inactive (most stale first)
      staleDeals.sort((a, b) => b.days_inactive - a.days_inactive);

      return {
        success: true,
        data: {
          stale_deals: staleDeals,
          count: staleDeals.length,
          criteria: {
            days_inactive: args.days_inactive,
            pipeline_id: args.pipeline_id,
            stage_id: args.stage_id,
          },
          message: `Found ${staleDeals.length} deals with no activity for ${args.days_inactive}+ days`,
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

  async autoPopulateFields(args: z.infer<typeof AutoPopulateFieldsSchema>): Promise<MCPToolResult> {
    try {
      const updates: Record<string, any> = {};

      // Auto-populate from market data if provided
      if (args.market_data) {
        if (args.market_data.salary_min) updates['salary_min'] = args.market_data.salary_min;
        if (args.market_data.salary_max) updates['salary_max'] = args.market_data.salary_max;
        if (args.market_data.salary_avg) updates['salary_avg'] = args.market_data.salary_avg;
        if (args.market_data.demand_level) updates['demand_level'] = args.market_data.demand_level;
        if (args.market_data.workforce_available) {
          updates['workforce_available'] = args.market_data.workforce_available;
        }
      }

      // Auto-populate job title if provided
      if (args.job_title) {
        updates['job_title'] = args.job_title;
      }

      // Auto-populate location if provided
      if (args.location) {
        updates['location'] = args.location;
      }

      // Update the deal
      const response = await this.client.updateDeal(args.deal_id, updates);

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
          populated_fields: Object.keys(updates),
          message: `Auto-populated ${Object.keys(updates).length} fields for deal ${args.deal_id}`,
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

  async getPipelineStats(args: z.infer<typeof GetPipelineStatsSchema>): Promise<MCPToolResult> {
    try {
      // Get all deals in pipeline
      const dealsResponse = await this.client.getDeals({
        pipeline_id: args.pipeline_id,
        status: 'all_not_deleted',
      });

      if (!dealsResponse.success) {
        return {
          success: false,
          error: {
            message: dealsResponse.error || 'Failed to get deals',
            code: 'PIPEDRIVE_API_ERROR',
            retry: true,
          },
        };
      }

      const deals = dealsResponse.data || [];

      // Get stages
      const stagesResponse = await this.client.getStages(args.pipeline_id);
      const stages = stagesResponse.data || [];

      // Calculate stats
      const stats = {
        total_deals: deals.length,
        open_deals: deals.filter(d => d.status === 'open').length,
        won_deals: deals.filter(d => d.status === 'won').length,
        lost_deals: deals.filter(d => d.status === 'lost').length,
        total_value: deals.reduce((sum, d) => sum + (d.value || 0), 0),
        won_value: deals.filter(d => d.status === 'won').reduce((sum, d) => sum + (d.value || 0), 0),
        avg_deal_value: deals.length > 0 ? deals.reduce((sum, d) => sum + (d.value || 0), 0) / deals.length : 0,
        conversion_rate: deals.length > 0 ? (deals.filter(d => d.status === 'won').length / deals.length) * 100 : 0,
        by_stage: stages.map(stage => {
          const stageDeals = deals.filter(d => d.stage_id === stage.id);
          return {
            stage_id: stage.id,
            stage_name: stage.name,
            deal_count: stageDeals.length,
            total_value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0),
            avg_value: stageDeals.length > 0
              ? stageDeals.reduce((sum, d) => sum + (d.value || 0), 0) / stageDeals.length
              : 0,
          };
        }),
      };

      return {
        success: true,
        data: {
          pipeline_id: args.pipeline_id,
          stats,
          message: `Pipeline stats: ${stats.open_deals} open, ${stats.won_deals} won, ${stats.lost_deals} lost`,
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
