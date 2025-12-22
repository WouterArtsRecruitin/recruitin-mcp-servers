import fetch from 'node-fetch';
import type {
  PipedriveConfig,
  PipedriveAPIResponse,
  PipedriveDeal,
  PipedriveStage,
  PipedrivePipeline,
  PipedriveField,
  PipedriveActivity,
  PipedrivePerson,
  PipedriveOrganization,
  DealFilters,
  CreateDealParams,
  UpdateDealParams,
  CreateActivityParams,
} from './types.js';

export class PipedriveClient {
  private config: PipedriveConfig;
  private baseUrl = 'https://api.pipedrive.com/v1';
  private requestQueue: Array<() => Promise<any>> = [];
  private requestTimestamps: number[] = [];

  constructor(config: PipedriveConfig) {
    this.config = {
      rateLimitRequests: 100,
      rateLimitWindowMs: 10000,
      debug: false,
      ...config,
    };
  }

  private log(message: string, data?: any) {
    if (this.config.debug) {
      console.error(`[Pipedrive] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindowMs!;
    
    // Remove old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > windowStart);
    
    // If at limit, wait
    if (this.requestTimestamps.length >= this.config.rateLimitRequests!) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = oldestRequest + this.config.rateLimitWindowMs! - now;
      if (waitTime > 0) {
        this.log(`Rate limit reached, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.requestTimestamps.push(now);
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      params?: Record<string, any>;
    } = {}
  ): Promise<PipedriveAPIResponse<T>> {
    await this.rateLimit();

    const { method = 'GET', body, params = {} } = options;
    
    // Add API token to params
    const queryParams = new URLSearchParams({
      api_token: this.config.apiToken,
      ...params,
    });

    const url = `${this.baseUrl}${endpoint}?${queryParams}`;
    
    this.log(`${method} ${endpoint}`, params);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json() as PipedriveAPIResponse<T>;

      if (!response.ok) {
        this.log(`API Error ${response.status}`, data);
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          error_info: data.error_info,
        };
      }

      this.log(`Success`, { dataCount: Array.isArray(data.data) ? data.data.length : 1 });
      return data;
    } catch (error) {
      this.log(`Request failed`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // DEALS
  async getDeals(filters: DealFilters = {}): Promise<PipedriveAPIResponse<PipedriveDeal[]>> {
    return this.request<PipedriveDeal[]>('/deals', {
      params: {
        ...filters,
        status: filters.status || 'all_not_deleted',
      },
    });
  }

  async getDeal(dealId: number): Promise<PipedriveAPIResponse<PipedriveDeal>> {
    return this.request<PipedriveDeal>(`/deals/${dealId}`);
  }

  async createDeal(params: CreateDealParams): Promise<PipedriveAPIResponse<PipedriveDeal>> {
    return this.request<PipedriveDeal>('/deals', {
      method: 'POST',
      body: params,
    });
  }

  async updateDeal(dealId: number, params: UpdateDealParams): Promise<PipedriveAPIResponse<PipedriveDeal>> {
    return this.request<PipedriveDeal>(`/deals/${dealId}`, {
      method: 'PUT',
      body: params,
    });
  }

  async deleteDeal(dealId: number): Promise<PipedriveAPIResponse<{ id: number }>> {
    return this.request<{ id: number }>(`/deals/${dealId}`, {
      method: 'DELETE',
    });
  }

  async searchDeals(term: string, fields?: string[]): Promise<PipedriveAPIResponse<PipedriveDeal[]>> {
    return this.request<PipedriveDeal[]>('/deals/search', {
      params: {
        term,
        fields: fields?.join(','),
        exact_match: false,
      },
    });
  }

  // PIPELINES & STAGES
  async getPipelines(): Promise<PipedriveAPIResponse<PipedrivePipeline[]>> {
    return this.request<PipedrivePipeline[]>('/pipelines');
  }

  async getPipeline(pipelineId: number): Promise<PipedriveAPIResponse<PipedrivePipeline>> {
    return this.request<PipedrivePipeline>(`/pipelines/${pipelineId}`);
  }

  async getStages(pipelineId?: number): Promise<PipedriveAPIResponse<PipedriveStage[]>> {
    return this.request<PipedriveStage[]>('/stages', {
      params: pipelineId ? { pipeline_id: pipelineId } : {},
    });
  }

  async getStage(stageId: number): Promise<PipedriveAPIResponse<PipedriveStage>> {
    return this.request<PipedriveStage>(`/stages/${stageId}`);
  }

  // FIELDS
  async getDealFields(): Promise<PipedriveAPIResponse<PipedriveField[]>> {
    return this.request<PipedriveField[]>('/dealFields');
  }

  // ACTIVITIES
  async getActivities(params: {
    deal_id?: number;
    person_id?: number;
    org_id?: number;
    start?: number;
    limit?: number;
  } = {}): Promise<PipedriveAPIResponse<PipedriveActivity[]>> {
    return this.request<PipedriveActivity[]>('/activities', {
      params,
    });
  }

  async createActivity(params: CreateActivityParams): Promise<PipedriveAPIResponse<PipedriveActivity>> {
    return this.request<PipedriveActivity>('/activities', {
      method: 'POST',
      body: params,
    });
  }

  async updateActivity(activityId: number, params: Partial<CreateActivityParams>): Promise<PipedriveAPIResponse<PipedriveActivity>> {
    return this.request<PipedriveActivity>(`/activities/${activityId}`, {
      method: 'PUT',
      body: params,
    });
  }

  async deleteActivity(activityId: number): Promise<PipedriveAPIResponse<{ id: number }>> {
    return this.request<{ id: number }>(`/activities/${activityId}`, {
      method: 'DELETE',
    });
  }

  // PERSONS
  async getPersons(params: {
    filter_id?: number;
    start?: number;
    limit?: number;
  } = {}): Promise<PipedriveAPIResponse<PipedrivePerson[]>> {
    return this.request<PipedrivePerson[]>('/persons', { params });
  }

  async getPerson(personId: number): Promise<PipedriveAPIResponse<PipedrivePerson>> {
    return this.request<PipedrivePerson>(`/persons/${personId}`);
  }

  async searchPersons(term: string): Promise<PipedriveAPIResponse<PipedrivePerson[]>> {
    return this.request<PipedrivePerson[]>('/persons/search', {
      params: { term, exact_match: false },
    });
  }

  // ORGANIZATIONS
  async getOrganizations(params: {
    start?: number;
    limit?: number;
  } = {}): Promise<PipedriveAPIResponse<PipedriveOrganization[]>> {
    return this.request<PipedriveOrganization[]>('/organizations', { params });
  }

  async getOrganization(orgId: number): Promise<PipedriveAPIResponse<PipedriveOrganization>> {
    return this.request<PipedriveOrganization>(`/organizations/${orgId}`);
  }

  async searchOrganizations(term: string): Promise<PipedriveAPIResponse<PipedriveOrganization[]>> {
    return this.request<PipedriveOrganization[]>('/organizations/search', {
      params: { term, exact_match: false },
    });
  }

  // UTILITY
  async validateEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, reason: 'Invalid email format' };
    }

    // Extract domain
    const domain = email.split('@')[1];
    
    // Check for common typos
    const commonDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
    const typoSuggestions: Record<string, string> = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'outlok.com': 'outlook.com',
      'yahooo.com': 'yahoo.com',
      'asml.com': 'asml.com', // Correct
      'aslm.com': 'asml.com', // Typo
      'amsl.com': 'asml.com', // Typo
    };

    if (typoSuggestions[domain]) {
      return {
        valid: false,
        reason: `Did you mean ${email.replace(domain, typoSuggestions[domain])}?`,
      };
    }

    return { valid: true };
  }
}
