import { z } from 'zod';
import { PipedriveClient } from './pipedrive-client.js';

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
    constructor(private client: PipedriveClient) {}

    async getPersons(params: z.infer<typeof GetPersonsSchema>) {
        try {
            const validated = GetPersonsSchema.parse(params);
            const response = await this.client.getPersons({
                filter_id: validated.filter_id,
                start: validated.start,
                limit: validated.limit
            });
            
            return {
                success: true,
                data: response.data,
                additional_data: response.additional_data,
                message: `Retrieved ${response.data?.length || 0} persons`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve persons'
            };
        }
    }

    async getPerson(params: z.infer<typeof GetPersonSchema>) {
        try {
            const validated = GetPersonSchema.parse(params);
            const response = await this.client.getPerson(validated.person_id);
            
            return {
                success: true,
                data: response.data,
                message: `Retrieved person: ${response.data?.name || 'Unknown'}`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve person'
            };
        }
    }

    async createPerson(params: z.infer<typeof CreatePersonSchema>) {
        try {
            const validated = CreatePersonSchema.parse(params);
            
            // Prepare data for API
            const apiData: any = {
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

            const response = await (this.client as any).request('/persons', {
                method: 'POST',
                body: apiData
            });
            
            return {
                success: true,
                data: response.data,
                message: `Created person: ${response.data?.name || 'Unknown'} (ID: ${response.data?.id})`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create person'
            };
        }
    }

    async updatePerson(params: z.infer<typeof UpdatePersonSchema>) {
        try {
            const validated = UpdatePersonSchema.parse(params);
            const { person_id, ...updateData } = validated;
            
            // Prepare data for API
            const apiData: any = {};
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

            const response = await (this.client as any).request(`/persons/${person_id}`, {
                method: 'PUT',
                body: apiData
            });
            
            return {
                success: true,
                data: response.data,
                message: `Updated person: ${response.data?.name || 'Unknown'} (ID: ${person_id})`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update person'
            };
        }
    }

    async searchPersons(params: z.infer<typeof SearchPersonsSchema>) {
        try {
            const validated = SearchPersonsSchema.parse(params);
            const response = await this.client.searchPersons(validated.term);
            
            const persons = response.data || [];
            
            return {
                success: true,
                data: persons,
                additional_data: response.additional_data,
                message: `Found ${persons.length} persons matching "${validated.term}"`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to search persons'
            };
        }
    }

    async linkPersonToOrg(params: z.infer<typeof LinkPersonToOrgSchema>) {
        try {
            const validated = LinkPersonToOrgSchema.parse(params);
            
            // Update person with org_id
            const response = await (this.client as any).request(`/persons/${validated.person_id}`, {
                method: 'PUT',
                body: { org_id: validated.org_id }
            });
            
            return {
                success: true,
                data: response.data,
                message: `Linked person (ID: ${validated.person_id}) to organization (ID: ${validated.org_id})`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to link person to organization'
            };
        }
    }

    async deletePerson(params: z.infer<typeof GetPersonSchema>) {
        try {
            const validated = GetPersonSchema.parse(params);
            const response = await (this.client as any).request(`/persons/${validated.person_id}`, {
                method: 'DELETE'
            });
            
            return {
                success: true,
                data: response.data,
                message: `Deleted person (ID: ${validated.person_id})`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete person'
            };
        }
    }

    async getPersonDeals(params: z.infer<typeof GetPersonSchema>) {
        try {
            const validated = GetPersonSchema.parse(params);
            const response = await (this.client as any).request(`/persons/${validated.person_id}/deals`);
            
            return {
                success: true,
                data: response.data,
                additional_data: response.additional_data,
                message: `Retrieved ${response.data?.length || 0} deals for person (ID: ${validated.person_id})`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve person deals'
            };
        }
    }
}