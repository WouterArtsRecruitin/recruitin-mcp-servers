import { z } from 'zod';

// Zod schemas for Organizations
export const GetOrganizationsSchema = z.object({
    start: z.number().optional(),
    limit: z.number().optional(),
    filter_id: z.number().optional(),
    sort: z.string().optional(),
});

export const GetOrganizationSchema = z.object({
    org_id: z.number(),
});

export const CreateOrganizationSchema = z.object({
    name: z.string(),
    owner_id: z.number().optional(),
    visible_to: z.enum(['1', '3', '5', '7']).optional(), // 1=Owner, 3=Owner&followers, 5=Owner&followers&everyone, 7=Everyone
    address: z.string().optional(),
    custom_fields: z.record(z.any()).optional(),
});

export const UpdateOrganizationSchema = z.object({
    org_id: z.number(),
    name: z.string().optional(),
    owner_id: z.number().optional(),
    visible_to: z.enum(['1', '3', '5', '7']).optional(),
    address: z.string().optional(),
    custom_fields: z.record(z.any()).optional(),
});

export const SearchOrganizationsSchema = z.object({
    term: z.string(),
    fields: z.string().optional().default('name'),
    exact_match: z.boolean().optional().default(false),
    start: z.number().optional().default(0),
    limit: z.number().optional().default(100),
});

export class OrganizationsTools {
    constructor(client) {
        this.client = client;
    }

    async getOrganizations(params) {
        try {
            const validated = GetOrganizationsSchema.parse(params);
            const response = await this.client.request('GET', 'organizations', validated);
            
            return {
                success: true,
                data: response.data,
                additional_data: response.additional_data,
                message: `Retrieved ${response.data?.length || 0} organizations`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve organizations'
            };
        }
    }

    async getOrganization(params) {
        try {
            const validated = GetOrganizationSchema.parse(params);
            const response = await this.client.request('GET', `organizations/${validated.org_id}`);
            
            return {
                success: true,
                data: response.data,
                message: `Retrieved organization: ${response.data?.name || 'Unknown'}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve organization'
            };
        }
    }

    async createOrganization(params) {
        try {
            const validated = CreateOrganizationSchema.parse(params);
            
            // Prepare data for API
            const apiData = {
                name: validated.name,
                owner_id: validated.owner_id,
                visible_to: validated.visible_to,
                address: validated.address,
            };

            // Add custom fields
            if (validated.custom_fields) {
                Object.assign(apiData, validated.custom_fields);
            }

            const response = await this.client.request('POST', 'organizations', apiData);
            
            return {
                success: true,
                data: response.data,
                message: `Created organization: ${response.data?.name || 'Unknown'} (ID: ${response.data?.id})`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create organization'
            };
        }
    }

    async updateOrganization(params) {
        try {
            const validated = UpdateOrganizationSchema.parse(params);
            const { org_id, ...updateData } = validated;
            
            // Prepare data for API
            const apiData = {};
            if (updateData.name) apiData.name = updateData.name;
            if (updateData.owner_id) apiData.owner_id = updateData.owner_id;
            if (updateData.visible_to) apiData.visible_to = updateData.visible_to;
            if (updateData.address) apiData.address = updateData.address;

            // Add custom fields
            if (updateData.custom_fields) {
                Object.assign(apiData, updateData.custom_fields);
            }

            const response = await this.client.request('PUT', `organizations/${org_id}`, apiData);
            
            return {
                success: true,
                data: response.data,
                message: `Updated organization: ${response.data?.name || 'Unknown'} (ID: ${org_id})`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update organization'
            };
        }
    }

    async searchOrganizations(params) {
        try {
            const validated = SearchOrganizationsSchema.parse(params);
            const response = await this.client.request('GET', 'organizations/search', validated);
            
            const items = response.data?.items || [];
            const organizations = items.map(item => item.item);
            
            return {
                success: true,
                data: organizations,
                additional_data: response.additional_data,
                message: `Found ${organizations.length} organizations matching "${validated.term}"`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to search organizations'
            };
        }
    }

    async deleteOrganization(params) {
        try {
            const validated = GetOrganizationSchema.parse(params);
            const response = await this.client.request('DELETE', `organizations/${validated.org_id}`);
            
            return {
                success: true,
                data: response.data,
                message: `Deleted organization (ID: ${validated.org_id})`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete organization'
            };
        }
    }
}