#!/usr/bin/env node
/**
 * Pipedrive MCP Server for Recruitment Automation
 * Direct integration with Pipedrive CRM for deal management
 */

const fs = require('fs').promises;
const path = require('path');

class PipedriveMCPServer {
  constructor() {
    this.apiToken = process.env.PIPEDRIVE_API_TOKEN || '816d7466f832185d38d350176c88115567e610dd';
    this.domain = process.env.PIPEDRIVE_DOMAIN || 'recruitinbv';
    this.baseUrl = `https://${this.domain}.pipedrive.com/api/v1`;
    
    console.error('Pipedrive MCP Server initialized');
    console.error(`Domain: ${this.domain}`);
  }

  async handleRequest(request) {
    const { id, method, params } = request;
    
    try {
      let result;
      
      switch (method) {
        case 'tools/list':
          result = {
            tools: [
              {
                name: 'create_deal',
                description: 'Create a new deal in Pipedrive',
                inputSchema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'Deal title' },
                    value: { type: 'number', description: 'Deal value in euros' },
                    currency: { type: 'string', default: 'EUR', description: 'Currency code' },
                    person_name: { type: 'string', description: 'Contact person name' },
                    person_email: { type: 'string', description: 'Contact person email' },
                    org_name: { type: 'string', description: 'Organization name' },
                    pipeline_id: { type: 'number', description: 'Pipeline ID (optional)' },
                    stage_id: { type: 'number', description: 'Stage ID (optional)' },
                    source: { type: 'string', default: 'Apollo Outbound', description: 'Lead source' }
                  },
                  required: ['title', 'person_email', 'org_name']
                }
              },
              {
                name: 'search_deals',
                description: 'Search for deals in Pipedrive',
                inputSchema: {
                  type: 'object',
                  properties: {
                    term: { type: 'string', description: 'Search term' },
                    limit: { type: 'number', default: 10, description: 'Number of results' }
                  },
                  required: ['term']
                }
              },
              {
                name: 'update_deal',
                description: 'Update an existing deal',
                inputSchema: {
                  type: 'object',
                  properties: {
                    deal_id: { type: 'number', description: 'Deal ID to update' },
                    stage_id: { type: 'number', description: 'New stage ID' },
                    value: { type: 'number', description: 'New deal value' },
                    status: { type: 'string', enum: ['open', 'won', 'lost'], description: 'Deal status' }
                  },
                  required: ['deal_id']
                }
              },
              {
                name: 'get_pipeline_stages',
                description: 'Get all pipeline stages',
                inputSchema: {
                  type: 'object',
                  properties: {
                    pipeline_id: { type: 'number', description: 'Specific pipeline ID (optional)' }
                  }
                }
              },
              {
                name: 'add_note_to_deal',
                description: 'Add a note to a deal',
                inputSchema: {
                  type: 'object',
                  properties: {
                    deal_id: { type: 'number', description: 'Deal ID' },
                    content: { type: 'string', description: 'Note content' }
                  },
                  required: ['deal_id', 'content']
                }
              },
              {
                name: 'bulk_create_deals',
                description: 'Create multiple deals from Apollo contacts',
                inputSchema: {
                  type: 'object',
                  properties: {
                    contacts: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          first_name: { type: 'string' },
                          last_name: { type: 'string' },
                          email: { type: 'string' },
                          company: { type: 'string' },
                          title: { type: 'string' },
                          phone: { type: 'string' }
                        },
                        required: ['email', 'company']
                      }
                    }
                  },
                  required: ['contacts']
                }
              }
            ]
          };
          break;

        case 'tools/call':
          const { name, arguments: args } = params;
          
          switch (name) {
            case 'create_deal':
              result = await this.createDeal(args);
              break;
            case 'search_deals':
              result = await this.searchDeals(args);
              break;
            case 'update_deal':
              result = await this.updateDeal(args);
              break;
            case 'get_pipeline_stages':
              result = await this.getPipelineStages(args);
              break;
            case 'add_note_to_deal':
              result = await this.addNoteToDeal(args);
              break;
            case 'bulk_create_deals':
              result = await this.bulkCreateDeals(args);
              break;
            default:
              throw new Error(`Unknown tool: ${name}`);
          }
          break;

        case 'resources/list':
          result = {
            resources: [
              {
                uri: 'pipedrive://deals/recent',
                name: 'Recent Deals',
                description: 'Latest deals from Pipedrive',
                mimeType: 'application/json'
              }
            ]
          };
          break;

        default:
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: 'Method not found' }
          };
      }

      return { jsonrpc: '2.0', id, result };
    } catch (error) {
      console.error('Error:', error);
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: error.message }
      };
    }
  }

  async makeApiRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}/${endpoint}?api_token=${this.apiToken}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Pipedrive API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async findOrCreatePerson(name, email, orgId) {
    // Search for existing person
    const searchResult = await this.makeApiRequest(`persons/search?term=${encodeURIComponent(email)}&search_by_email=1`);
    
    if (searchResult.success && searchResult.data && searchResult.data.items.length > 0) {
      return searchResult.data.items[0].item.id;
    }

    // Create new person
    const personData = {
      name: name,
      email: [{ value: email, primary: true }],
      org_id: orgId
    };

    const createResult = await this.makeApiRequest('persons', 'POST', personData);
    
    if (createResult.success) {
      return createResult.data.id;
    }
    
    throw new Error('Failed to create person');
  }

  async findOrCreateOrganization(name) {
    // Search for existing organization
    const searchResult = await this.makeApiRequest(`organizations/search?term=${encodeURIComponent(name)}`);
    
    if (searchResult.success && searchResult.data && searchResult.data.items.length > 0) {
      return searchResult.data.items[0].item.id;
    }

    // Create new organization
    const orgData = { name: name };
    const createResult = await this.makeApiRequest('organizations', 'POST', orgData);
    
    if (createResult.success) {
      return createResult.data.id;
    }
    
    throw new Error('Failed to create organization');
  }

  async createDeal(args) {
    const { title, value = 5000, currency = 'EUR', person_name, person_email, org_name, source = 'Apollo Outbound' } = args;
    
    try {
      // 1. Find or create organization
      const orgId = await this.findOrCreateOrganization(org_name);
      
      // 2. Find or create person
      const personId = await this.findOrCreatePerson(person_name || person_email.split('@')[0], person_email, orgId);
      
      // 3. Create deal
      const dealData = {
        title: title,
        value: value,
        currency: currency,
        person_id: personId,
        org_id: orgId,
        '9c7377e4441034de93661f1700f4b66a96a63fe6': source // Custom field for Source
      };

      const dealResult = await this.makeApiRequest('deals', 'POST', dealData);
      
      if (dealResult.success) {
        return {
          content: [{
            type: 'text',
            text: `✅ **Deal Created Successfully**\n\n` +
                  `**Deal:** ${title}\n` +
                  `**Value:** €${value.toLocaleString()}\n` +
                  `**Organization:** ${org_name}\n` +
                  `**Contact:** ${person_name || person_email}\n` +
                  `**Source:** ${source}\n\n` +
                  `**Deal ID:** ${dealResult.data.id}\n` +
                  `**Pipedrive URL:** https://${this.domain}.pipedrive.com/deal/${dealResult.data.id}`
          }]
        };
      }
      
      throw new Error('Failed to create deal');
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error Creating Deal**\n\n${error.message}`
        }]
      };
    }
  }

  async searchDeals(args) {
    const { term, limit = 10 } = args;
    
    try {
      const result = await this.makeApiRequest(`deals/search?term=${encodeURIComponent(term)}&limit=${limit}`);
      
      if (result.success && result.data && result.data.items) {
        const deals = result.data.items.map(item => ({
          id: item.item.id,
          title: item.item.title,
          value: item.item.value,
          currency: item.item.currency,
          stage: item.item.stage_name,
          person: item.item.person_name,
          organization: item.item.organization_name
        }));

        return {
          content: [{
            type: 'text',
            text: `🔍 **Found ${deals.length} deals for "${term}"**\n\n` +
                  deals.map((deal, i) => 
                    `**${i + 1}. ${deal.title}**\n` +
                    `- Value: €${deal.value?.toLocaleString() || 0}\n` +
                    `- Stage: ${deal.stage}\n` +
                    `- Contact: ${deal.person}\n` +
                    `- Company: ${deal.organization}\n`
                  ).join('\n')
          }]
        };
      }
      
      return {
        content: [{
          type: 'text',
          text: `🔍 No deals found for "${term}"`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Search Error**\n\n${error.message}`
        }]
      };
    }
  }

  async getPipelineStages() {
    try {
      const result = await this.makeApiRequest('stages');
      
      if (result.success && result.data) {
        const stages = result.data.map(stage => ({
          id: stage.id,
          name: stage.name,
          pipeline_id: stage.pipeline_id,
          order_nr: stage.order_nr,
          deal_probability: stage.deal_probability
        }));

        return {
          content: [{
            type: 'text',
            text: `📋 **Pipeline Stages**\n\n` +
                  stages.map(stage => 
                    `**${stage.name}** (ID: ${stage.id})\n` +
                    `- Probability: ${stage.deal_probability}%\n` +
                    `- Order: ${stage.order_nr}\n`
                  ).join('\n')
          }]
        };
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Error fetching stages**\n\n${error.message}`
        }]
      };
    }
  }

  async bulkCreateDeals(args) {
    const { contacts } = args;
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const contact of contacts) {
      try {
        const title = `${contact.company} - ${contact.first_name || contact.email.split('@')[0]} ${contact.last_name || ''}`.trim();
        const personName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email.split('@')[0];
        
        const result = await this.createDeal({
          title,
          person_name: personName,
          person_email: contact.email,
          org_name: contact.company,
          value: 5000,
          source: 'Apollo Outbound'
        });
        
        results.push({ contact: contact.email, status: 'success' });
        successCount++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        results.push({ contact: contact.email, status: 'error', error: error.message });
        errorCount++;
      }
    }
    
    return {
      content: [{
        type: 'text',
        text: `📊 **Bulk Deal Creation Complete**\n\n` +
              `✅ **Successful:** ${successCount} deals created\n` +
              `❌ **Errors:** ${errorCount} failed\n\n` +
              `**Total Processed:** ${contacts.length} contacts\n\n` +
              `All deals created in "Nieuwe lead" stage and ready for follow-up!`
      }]
    };
  }

  async updateDeal(args) {
    const { deal_id, ...updateData } = args;
    
    try {
      const result = await this.makeApiRequest(`deals/${deal_id}`, 'PUT', updateData);
      
      if (result.success) {
        return {
          content: [{
            type: 'text',
            text: `✅ **Deal Updated Successfully**\n\nDeal ID: ${deal_id}\nUpdated fields: ${Object.keys(updateData).join(', ')}`
          }]
        };
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Update Error**\n\n${error.message}`
        }]
      };
    }
  }

  async addNoteToDeal(args) {
    const { deal_id, content } = args;
    
    try {
      const noteData = {
        content: content,
        deal_id: deal_id
      };
      
      const result = await this.makeApiRequest('notes', 'POST', noteData);
      
      if (result.success) {
        return {
          content: [{
            type: 'text',
            text: `✅ **Note Added**\n\nNote added to deal ID: ${deal_id}`
          }]
        };
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Note Error**\n\n${error.message}`
        }]
      };
    }
  }

  start() {
    process.stdin.setEncoding('utf8');
    
    let buffer = '';
    process.stdin.on('data', async (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const request = JSON.parse(line);
            const response = await this.handleRequest(request);
            console.log(JSON.stringify(response));
          } catch (error) {
            console.log(JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: { code: -32700, message: 'Parse error' }
            }));
          }
        }
      }
    });

    process.stdin.on('end', () => {
      process.exit(0);
    });
    
    console.error('Pipedrive MCP Server started and ready!');
  }
}

if (require.main === module) {
  const server = new PipedriveMCPServer();
  server.start();
}

module.exports = PipedriveMCPServer;