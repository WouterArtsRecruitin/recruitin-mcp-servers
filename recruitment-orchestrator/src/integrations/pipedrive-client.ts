// src/integrations/pipedrive-client.ts
const PIPEDRIVE_DOMAIN = process.env.PIPEDRIVE_DOMAIN || 'recruitinbv.pipedrive.com';
const PIPEDRIVE_API_URL = `https://${PIPEDRIVE_DOMAIN}/api/v1`;
const API_TOKEN = process.env.PIPEDRIVE_API_TOKEN || 'e0399bd15286fe59ba280309854efcf6bd18424f';

export class PipedriveClient {
  private async request(endpoint: string, options: any = {}) {
    const url = `${PIPEDRIVE_API_URL}${endpoint}?api_token=${API_TOKEN}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pipedrive API error: ${response.statusText} - ${error}`);
    }

    return response.json();
  }

  // Create person
  async createPerson(data: {
    name: string;
    email?: string;
    phone?: string;
    org_id?: number;
  }) {
    return this.request('/persons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Create deal
  async createDeal(data: {
    title: string;
    person_id?: number;
    org_id?: number;
    value?: number;
    stage_id?: number;
  }) {
    return this.request('/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Create organization
  async createOrganization(data: {
    name: string;
    address?: string;
  }) {
    return this.request('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Create activity
  async createActivity(data: {
    subject: string;
    deal_id?: number;
    person_id?: number;
    type?: string;
    due_date?: string;
    note?: string;
  }) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Search persons (check duplicates)
  async searchPersons(params: { term?: string; email?: string }) {
    const query = params.email
      ? `email=${encodeURIComponent(params.email)}`
      : `term=${encodeURIComponent(params.term || '')}`;
    return this.request(`/persons/search?${query}`);
  }

  // Get deals
  async getDeals(params: {
    status?: string;
    stage_id?: number | number[];
    filter_id?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.filter_id) queryParams.append('filter_id', params.filter_id.toString());
    
    return this.request(`/deals?${queryParams.toString()}`);
  }

  // Get activities
  async getActivities(params: {
    due_date?: string;
    done?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.due_date) queryParams.append('due_date', params.due_date);
    if (params.done !== undefined) queryParams.append('done', params.done.toString());
    
    return this.request(`/activities?${queryParams.toString()}`);
  }

  // Add note
  async addNote(data: {
    content: string;
    deal_id?: number;
    person_id?: number;
    org_id?: number;
  }) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Test connection
  async testConnection() {
    return this.request('/users/me');
  }
}

export const pipedriveClient = new PipedriveClient();