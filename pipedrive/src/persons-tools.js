import { z } from 'zod';

// Zod schemas for Persons
export const GetPersonsSchema = z.object({
    start: z.number().optional(),
    limit: z.number().optional(),
    filter_id: z.number().optional(),
    sort: z.string().optional(),
    user_id: z.number().optional(),
});

export const GetPersonSchema = z.object({
    person_id: z.number(),
});

export const CreatePersonSchema = z.object({
    name: z.string(),
    owner_id: z.number().optional(),
    org_id: z.number().optional(),
    email: z.array(z.string()).optional(),
    phone: z.array(z.string()).optional(),
    visible_to: z.enum(['1', '3', '5', '7']).optional(),
    custom_fields: z.record(z.any()).optional(),
});

export const UpdatePersonSchema = z.object({
    person_id: z.number(),
    name: z.string().optional(),
    owner_id: z.number().optional(),
    org_id: z.number().optional(),
    email: z.array(z.string()).optional(),
    phone: z.array(z.string()).optional(),
    visible_to: z.enum(['1', '3', '5', '7']).optional(),
    custom_fields: z.record(z.any()).optional(),
});

export const SearchPersonsSchema = z.object({
    term: z.string(),
    fields: z.string().optional().default('name,email'),
    exact_match: z.boolean().optional().default(false),
    org_id: z.number().optional(),
    start: z.number().optional().default(0),
    limit: z.number().optional().default(100),
});

export const LinkPersonToOrgSchema = z.object({
    person_id: z.number(),
    org_id: z.number(),
});

export class PersonsTools {
    constructor(client) {
        this.client = client;
    }

    async getPersons(params) {
        try {
            const validated = GetPersonsSchema.parse(params);
            const response = await this.client.request('GET', 'persons', validated);
            
            return {
                success: true,
                data: response.data,
                additional_data: response.additional_data,
                message: `Retrieved ${response.data?.length || 0} persons`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve persons'
            };
        }
    }

    async getPerson(params) {
        try {
            const validated = GetPersonSchema.parse(params);
            const response = await this.client.request('GET', `persons/${validated.person_id}`);
            
            return {
                success: true,
                data: response.data,
                message: `Retrieved person: ${response.data?.name || 'Unknown'}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve person'
            };
        }
    }

    async createPerson(params) {
        try {
            const validated = CreatePersonSchema.parse(params);
            
            // Prepare data for API
            const apiData = {
                name: validated.name,
                owner_id: validated.owner_id,
                org_id: validated.org_id,
                visible_to: validated.visible_to,
            };

            // Handle email array
            if (validated.email && validated.email.length > 0) {
                apiData.email = validated.email;
            }

            // Handle phone array  
            if (validated.phone && validated.phone.length > 0) {
                apiData.phone = validated.phone;
            }

            // Add custom fields
            if (validated.custom_fields) {
                Object.assign(apiData, validated.custom_fields);
            }

            const response = await this.client.request('POST', 'persons', apiData);
            
            return {
                success: true,
                data: response.data,
                message: `Created person: ${response.data?.name || 'Unknown'} (ID: ${response.data?.id})`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create person'
            };
        }
    }

    async updatePerson(params) {
        try {
            const validated = UpdatePersonSchema.parse(params);
            const { person_id, ...updateData } = validated;
            
            // Prepare data for API
            const apiData = {};
            if (updateData.name) apiData.name = updateData.name;
            if (updateData.owner_id) apiData.owner_id = updateData.owner_id;
            if (updateData.org_id) apiData.org_id = updateData.org_id;
            if (updateData.visible_to) apiData.visible_to = updateData.visible_to;

            // Handle arrays
            if (updateData.email) apiData.email = updateData.email;
            if (updateData.phone) apiData.phone = updateData.phone;

            // Add custom fields
            if (updateData.custom_fields) {
                Object.assign(apiData, updateData.custom_fields);
            }

            const response = await this.client.request('PUT', `persons/${person_id}`, apiData);
            
            return {
                success: true,
                data: response.data,
                message: `Updated person: ${response.data?.name || 'Unknown'} (ID: ${person_id})`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update person'
            };
        }
    }

    async searchPersons(params) {
        try {
            const validated = SearchPersonsSchema.parse(params);
            const response = await this.client.request('GET', 'persons/search', validated);
            
            const items = response.data?.items || [];
            const persons = items.map(item => item.item);
            
            return {
                success: true,
                data: persons,
                additional_data: response.additional_data,
                message: `Found ${persons.length} persons matching "${validated.term}"`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to search persons'
            };
        }
    }

    async linkPersonToOrg(params) {
        try {
            const validated = LinkPersonToOrgSchema.parse(params);
            
            // Update person with org_id
            const response = await this.client.request('PUT', `persons/${validated.person_id}`, {
                org_id: validated.org_id
            });
            
            return {
                success: true,
                data: response.data,
                message: `Linked person (ID: ${validated.person_id}) to organization (ID: ${validated.org_id})`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to link person to organization'
            };
        }
    }

    async deletePerson(params) {
        try {
            const validated = GetPersonSchema.parse(params);
            const response = await this.client.request('DELETE', `persons/${validated.person_id}`);
            
            return {
                success: true,
                data: response.data,
                message: `Deleted person (ID: ${validated.person_id})`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete person'
            };
        }
    }

    async getPersonDeals(params) {
        try {
            const validated = GetPersonSchema.parse(params);
            const response = await this.client.request('GET', `persons/${validated.person_id}/deals`);
            
            return {
                success: true,
                data: response.data,
                additional_data: response.additional_data,
                message: `Retrieved ${response.data?.length || 0} deals for person (ID: ${validated.person_id})`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve person deals'
            };
        }
    }
}