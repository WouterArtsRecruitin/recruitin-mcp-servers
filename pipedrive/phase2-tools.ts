import { z } from 'zod';
import { PipedriveClient } from './pipedrive-client.js';

// =====================================
// PHASE 2: BULK OPERATIONS
// =====================================

export const BulkCreateOrganizationsSchema = z.object({
    organizations: z.array(z.object({
        name: z.string(),
        owner_id: z.number().optional(),
        visible_to: z.enum(['1', '3', '5', '7']).optional(),
        address: z.string().optional(),
        custom_fields: z.record(z.any()).optional(),
    })).min(1).max(100), // Limit batch size for performance
});

export const BulkUpdateOrganizationsSchema = z.object({
    updates: z.array(z.object({
        org_id: z.number(),
        name: z.string().optional(),
        owner_id: z.number().optional(),
        visible_to: z.enum(['1', '3', '5', '7']).optional(),
        address: z.string().optional(),
        custom_fields: z.record(z.any()).optional(),
    })).min(1).max(100),
});

export const BulkCreatePersonsSchema = z.object({
    persons: z.array(z.object({
        name: z.string(),
        owner_id: z.number().optional(),
        org_id: z.number().optional(),
        email: z.array(z.string()).optional(),
        phone: z.array(z.string()).optional(),
        visible_to: z.enum(['1', '3', '5', '7']).optional(),
        custom_fields: z.record(z.any()).optional(),
    })).min(1).max(100),
});

export const BulkUpdatePersonsSchema = z.object({
    updates: z.array(z.object({
        person_id: z.number(),
        name: z.string().optional(),
        owner_id: z.number().optional(),
        org_id: z.number().optional(),
        email: z.array(z.string()).optional(),
        phone: z.array(z.string()).optional(),
        visible_to: z.enum(['1', '3', '5', '7']).optional(),
        custom_fields: z.record(z.any()).optional(),
    })).min(1).max(100),
});

// =====================================
// PHASE 2: AUTOMATION MONITORING
// =====================================

export const DetectAutomationLoopsSchema = z.object({
    pipeline_id: z.number().optional(),
    days_back: z.number().optional().default(7),
    min_frequency: z.number().optional().default(5), // Minimum occurrences to flag as loop
});

export const GetAutomationStatsSchema = z.object({
    pipeline_id: z.number().optional(),
    date_from: z.string().optional(), // YYYY-MM-DD
    date_to: z.string().optional(),   // YYYY-MM-DD
    group_by: z.enum(['day', 'week', 'month']).optional().default('day'),
});

export const CreateAutomationRuleSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    trigger_type: z.enum(['stage_change', 'field_update', 'activity_created']),
    trigger_conditions: z.record(z.any()),
    action_type: z.enum(['send_email', 'create_activity', 'update_field', 'move_stage']),
    action_params: z.record(z.any()),
    enabled: z.boolean().optional().default(true),
    loop_prevention: z.boolean().optional().default(true),
});

// =====================================
// PHASE 2: ADVANCED SEARCH & FILTERING
// =====================================

export const AdvancedSearchSchema = z.object({
    entity_type: z.enum(['deals', 'organizations', 'persons']),
    search_criteria: z.array(z.object({
        field: z.string(),
        operator: z.enum(['equals', 'contains', 'starts_with', 'greater_than', 'less_than', 'is_empty', 'is_not_empty']),
        value: z.any(),
        logic: z.enum(['AND', 'OR']).optional().default('AND'),
    })).min(1),
    sort_by: z.string().optional(),
    sort_direction: z.enum(['asc', 'desc']).optional().default('asc'),
    limit: z.number().max(500).optional().default(100),
    start: z.number().optional().default(0),
});

export const CreateSmartFilterSchema = z.object({
    name: z.string(),
    entity_type: z.enum(['deals', 'organizations', 'persons']),
    filter_criteria: z.array(z.object({
        field: z.string(),
        operator: z.enum(['equals', 'contains', 'starts_with', 'greater_than', 'less_than']),
        value: z.any(),
    })),
    shared: z.boolean().optional().default(false),
});

export const GetDataInsightsSchema = z.object({
    entity_type: z.enum(['deals', 'organizations', 'persons']),
    metrics: z.array(z.enum(['count', 'avg_value', 'total_value', 'conversion_rate', 'time_in_stage'])),
    group_by: z.string().optional(),
    date_range: z.object({
        from: z.string(), // YYYY-MM-DD
        to: z.string(),   // YYYY-MM-DD
    }).optional(),
    filters: z.record(z.any()).optional(),
});

export class Phase2Tools {
    constructor(private client: PipedriveClient) {}

    // =====================================
    // BULK OPERATIONS
    // =====================================

    async bulkCreateOrganizations(params: z.infer<typeof BulkCreateOrganizationsSchema>) {
        try {
            const validated = BulkCreateOrganizationsSchema.parse(params);
            const results = [];
            const errors = [];

            for (let i = 0; i < validated.organizations.length; i++) {
                const org = validated.organizations[i];
                try {
                    const apiData: any = {
                        name: org.name,
                        owner_id: org.owner_id,
                        visible_to: org.visible_to,
                        address: org.address,
                        ...org.custom_fields
                    };

                    const response = await (this.client as any).request('/organizations', {
                        method: 'POST',
                        body: apiData
                    });

                    if (response.success) {
                        results.push({
                            index: i,
                            success: true,
                            data: response.data,
                            name: org.name
                        });
                    } else {
                        errors.push({
                            index: i,
                            name: org.name,
                            error: response.error || 'Unknown error'
                        });
                    }

                    // Rate limiting - small delay between requests
                    if (i < validated.organizations.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } catch (error: any) {
                    errors.push({
                        index: i,
                        name: org.name,
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                data: {
                    created: results,
                    errors: errors,
                    summary: {
                        total: validated.organizations.length,
                        successful: results.length,
                        failed: errors.length
                    }
                },
                message: `Bulk create complete: ${results.length}/${validated.organizations.length} organizations created successfully`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to bulk create organizations'
            };
        }
    }

    async bulkUpdateOrganizations(params: z.infer<typeof BulkUpdateOrganizationsSchema>) {
        try {
            const validated = BulkUpdateOrganizationsSchema.parse(params);
            const results = [];
            const errors = [];

            for (let i = 0; i < validated.updates.length; i++) {
                const update = validated.updates[i];
                const { org_id, ...updateData } = update;
                
                try {
                    const apiData: any = {};
                    if (updateData.name) apiData.name = updateData.name;
                    if (updateData.owner_id) apiData.owner_id = updateData.owner_id;
                    if (updateData.visible_to) apiData.visible_to = updateData.visible_to;
                    if (updateData.address) apiData.address = updateData.address;
                    if (updateData.custom_fields) Object.assign(apiData, updateData.custom_fields);

                    const response = await (this.client as any).request(`/organizations/${org_id}`, {
                        method: 'PUT',
                        body: apiData
                    });

                    if (response.success) {
                        results.push({
                            index: i,
                            success: true,
                            data: response.data,
                            org_id: org_id
                        });
                    } else {
                        errors.push({
                            index: i,
                            org_id: org_id,
                            error: response.error || 'Unknown error'
                        });
                    }

                    if (i < validated.updates.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } catch (error: any) {
                    errors.push({
                        index: i,
                        org_id: org_id,
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                data: {
                    updated: results,
                    errors: errors,
                    summary: {
                        total: validated.updates.length,
                        successful: results.length,
                        failed: errors.length
                    }
                },
                message: `Bulk update complete: ${results.length}/${validated.updates.length} organizations updated successfully`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to bulk update organizations'
            };
        }
    }

    async bulkCreatePersons(params: z.infer<typeof BulkCreatePersonsSchema>) {
        try {
            const validated = BulkCreatePersonsSchema.parse(params);
            const results = [];
            const errors = [];

            for (let i = 0; i < validated.persons.length; i++) {
                const person = validated.persons[i];
                try {
                    const apiData: any = {
                        name: person.name,
                        owner_id: person.owner_id,
                        org_id: person.org_id,
                        visible_to: person.visible_to,
                    };

                    if (person.email?.length) apiData.email = person.email;
                    if (person.phone?.length) apiData.phone = person.phone;
                    if (person.custom_fields) Object.assign(apiData, person.custom_fields);

                    const response = await (this.client as any).request('/persons', {
                        method: 'POST',
                        body: apiData
                    });

                    if (response.success) {
                        results.push({
                            index: i,
                            success: true,
                            data: response.data,
                            name: person.name
                        });
                    } else {
                        errors.push({
                            index: i,
                            name: person.name,
                            error: response.error || 'Unknown error'
                        });
                    }

                    if (i < validated.persons.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } catch (error: any) {
                    errors.push({
                        index: i,
                        name: person.name,
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                data: {
                    created: results,
                    errors: errors,
                    summary: {
                        total: validated.persons.length,
                        successful: results.length,
                        failed: errors.length
                    }
                },
                message: `Bulk create complete: ${results.length}/${validated.persons.length} persons created successfully`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to bulk create persons'
            };
        }
    }

    async bulkUpdatePersons(params: z.infer<typeof BulkUpdatePersonsSchema>) {
        try {
            const validated = BulkUpdatePersonsSchema.parse(params);
            const results = [];
            const errors = [];

            for (let i = 0; i < validated.updates.length; i++) {
                const update = validated.updates[i];
                const { person_id, ...updateData } = update;
                
                try {
                    const apiData: any = {};
                    if (updateData.name) apiData.name = updateData.name;
                    if (updateData.owner_id) apiData.owner_id = updateData.owner_id;
                    if (updateData.org_id) apiData.org_id = updateData.org_id;
                    if (updateData.visible_to) apiData.visible_to = updateData.visible_to;
                    if (updateData.email) apiData.email = updateData.email;
                    if (updateData.phone) apiData.phone = updateData.phone;
                    if (updateData.custom_fields) Object.assign(apiData, updateData.custom_fields);

                    const response = await (this.client as any).request(`/persons/${person_id}`, {
                        method: 'PUT',
                        body: apiData
                    });

                    if (response.success) {
                        results.push({
                            index: i,
                            success: true,
                            data: response.data,
                            person_id: person_id
                        });
                    } else {
                        errors.push({
                            index: i,
                            person_id: person_id,
                            error: response.error || 'Unknown error'
                        });
                    }

                    if (i < validated.updates.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } catch (error: any) {
                    errors.push({
                        index: i,
                        person_id: person_id,
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                data: {
                    updated: results,
                    errors: errors,
                    summary: {
                        total: validated.updates.length,
                        successful: results.length,
                        failed: errors.length
                    }
                },
                message: `Bulk update complete: ${results.length}/${validated.updates.length} persons updated successfully`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to bulk update persons'
            };
        }
    }

    // =====================================
    // AUTOMATION MONITORING
    // =====================================

    async detectAutomationLoops(params: z.infer<typeof DetectAutomationLoopsSchema>) {
        try {
            const validated = DetectAutomationLoopsSchema.parse(params);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - validated.days_back);

            // Get recent activities to analyze patterns
            const activities = await this.client.getActivities({
                start: 0,
                limit: 1000
            });

            if (!activities.success || !activities.data) {
                return {
                    success: false,
                    error: 'Failed to retrieve activities for analysis',
                    message: 'Could not detect automation loops'
                };
            }

            // Analyze activity patterns for potential loops
            const activityPatterns: Record<string, any[]> = {};
            const suspiciousPatterns: any[] = [];

            activities.data.forEach((activity: any) => {
                if (new Date(activity.add_time) < cutoffDate) return;

                const key = `${activity.type}-${activity.deal_id || 'no-deal'}`;
                if (!activityPatterns[key]) {
                    activityPatterns[key] = [];
                }
                activityPatterns[key].push({
                    id: activity.id,
                    subject: activity.subject,
                    time: activity.add_time,
                    deal_id: activity.deal_id,
                    person_id: activity.person_id
                });
            });

            // Identify patterns that occur too frequently
            Object.entries(activityPatterns).forEach(([pattern, acts]) => {
                if (acts.length >= validated.min_frequency) {
                    // Check if activities are happening too close together
                    const times = acts.map(a => new Date(a.time).getTime()).sort();
                    const intervals = [];
                    for (let i = 1; i < times.length; i++) {
                        intervals.push(times[i] - times[i - 1]);
                    }
                    
                    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                    const minInterval = Math.min(...intervals);
                    
                    // Flag as suspicious if average interval < 1 hour or min interval < 5 minutes
                    if (avgInterval < 3600000 || minInterval < 300000) {
                        suspiciousPatterns.push({
                            pattern: pattern,
                            frequency: acts.length,
                            avg_interval_minutes: Math.round(avgInterval / 60000),
                            min_interval_minutes: Math.round(minInterval / 60000),
                            activities: acts.slice(0, 5), // Show first 5 as examples
                            risk_level: minInterval < 60000 ? 'HIGH' : avgInterval < 1800000 ? 'MEDIUM' : 'LOW'
                        });
                    }
                }
            });

            return {
                success: true,
                data: {
                    analysis_period_days: validated.days_back,
                    total_activities_analyzed: activities.data.length,
                    suspicious_patterns_found: suspiciousPatterns.length,
                    patterns: suspiciousPatterns,
                    recommendations: suspiciousPatterns.length > 0 ? [
                        'Review automation rules for the flagged patterns',
                        'Add delays between automated actions',
                        'Implement loop prevention checks',
                        'Consider activity frequency limits'
                    ] : ['No automation loops detected']
                },
                message: `Analyzed ${activities.data.length} activities, found ${suspiciousPatterns.length} suspicious automation patterns`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to detect automation loops'
            };
        }
    }

    async getAutomationStats(params: z.infer<typeof GetAutomationStatsSchema>) {
        try {
            const validated = GetAutomationStatsSchema.parse(params);
            
            // Get activities for the specified date range
            const activities = await this.client.getActivities({
                start: 0,
                limit: 2000
            });

            if (!activities.success || !activities.data) {
                return {
                    success: false,
                    error: 'Failed to retrieve activities',
                    message: 'Could not generate automation statistics'
                };
            }

            const stats = {
                total_activities: activities.data.length,
                by_type: {} as Record<string, number>,
                by_date: {} as Record<string, number>,
                automated_activities: 0,
                manual_activities: 0,
                pipeline_breakdown: {} as Record<string, number>
            };

            // Process activities
            activities.data.forEach((activity: any) => {
                const actDate = activity.add_time.split('T')[0]; // Get date part
                
                // Count by type
                stats.by_type[activity.type] = (stats.by_type[activity.type] || 0) + 1;
                
                // Count by date
                stats.by_date[actDate] = (stats.by_date[actDate] || 0) + 1;
                
                // Detect if likely automated (very short intervals, system-generated subjects)
                if (activity.subject && (
                    activity.subject.includes('automated') ||
                    activity.subject.includes('system') ||
                    activity.subject.includes('trigger')
                )) {
                    stats.automated_activities++;
                } else {
                    stats.manual_activities++;
                }
            });

            return {
                success: true,
                data: stats,
                message: `Generated automation statistics for ${activities.data.length} activities`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to generate automation statistics'
            };
        }
    }

    // =====================================
    // ADVANCED SEARCH & FILTERING
    // =====================================

    async advancedSearch(params: z.infer<typeof AdvancedSearchSchema>) {
        try {
            const validated = AdvancedSearchSchema.parse(params);
            let results: any[] = [];

            // Build search query based on criteria
            const searchTerms = validated.search_criteria
                .filter((criteria: any) => criteria.operator === 'contains' || criteria.operator === 'starts_with')
                .map((criteria: any) => criteria.value)
                .join(' ');

            // Perform search based on entity type
            switch (validated.entity_type) {
                case 'deals':
                    if (searchTerms) {
                        const searchResponse = await this.client.searchDeals(searchTerms);
                        results = searchResponse.data || [];
                    } else {
                        const dealsResponse = await this.client.getDeals({
                            start: validated.start as number,
                            limit: validated.limit as number
                        });
                        results = dealsResponse.data || [];
                    }
                    break;

                case 'organizations':
                    if (searchTerms) {
                        const searchResponse = await this.client.searchOrganizations(searchTerms);
                        results = searchResponse.data || [];
                    } else {
                        const orgsResponse = await this.client.getOrganizations({
                            start: validated.start as number,
                            limit: validated.limit as number
                        });
                        results = orgsResponse.data || [];
                    }
                    break;

                case 'persons':
                    if (searchTerms) {
                        const searchResponse = await this.client.searchPersons(searchTerms);
                        results = searchResponse.data || [];
                    } else {
                        const personsResponse = await this.client.getPersons({
                            start: validated.start as number,
                            limit: validated.limit as number
                        });
                        results = personsResponse.data || [];
                    }
                    break;
            }

            // Apply additional filtering criteria
            const filteredResults = results.filter((item: any) => {
                return validated.search_criteria.every((criteria: any) => {
                    const fieldValue = item[criteria.field];
                    
                    switch (criteria.operator) {
                        case 'equals':
                            return fieldValue == criteria.value;
                        case 'contains':
                            return String(fieldValue || '').toLowerCase().includes(String(criteria.value).toLowerCase());
                        case 'starts_with':
                            return String(fieldValue || '').toLowerCase().startsWith(String(criteria.value).toLowerCase());
                        case 'greater_than':
                            return Number(fieldValue) > Number(criteria.value);
                        case 'less_than':
                            return Number(fieldValue) < Number(criteria.value);
                        case 'is_empty':
                            return !fieldValue || fieldValue === '';
                        case 'is_not_empty':
                            return fieldValue && fieldValue !== '';
                        default:
                            return true;
                    }
                });
            });

            // Sort results if requested
            if (validated.sort_by) {
                filteredResults.sort((a, b) => {
                    const aVal = (a as any)[validated.sort_by!];
                    const bVal = (b as any)[validated.sort_by!];
                    
                    if (validated.sort_direction === 'desc') {
                        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
                    } else {
                        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                    }
                });
            }

            return {
                success: true,
                data: {
                    results: filteredResults,
                    total_found: filteredResults.length,
                    criteria_applied: validated.search_criteria.length,
                    entity_type: validated.entity_type
                },
                message: `Advanced search found ${filteredResults.length} ${validated.entity_type} matching criteria`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to perform advanced search'
            };
        }
    }

    async getDataInsights(params: z.infer<typeof GetDataInsightsSchema>) {
        try {
            const validated = GetDataInsightsSchema.parse(params);
            const insights: any = {
                entity_type: validated.entity_type,
                metrics: {},
                period: validated.date_range
            };

            // Get data based on entity type
            let data: any[] = [];
            switch (validated.entity_type) {
                case 'deals':
                    const dealsResponse = await this.client.getDeals({
                        start: 0,
                        limit: 1000,
                        status: 'all_not_deleted'
                    });
                    data = dealsResponse.data || [];
                    break;
                    
                case 'organizations':
                    const orgsResponse = await this.client.getOrganizations({
                        start: 0,
                        limit: 1000
                    });
                    data = orgsResponse.data || [];
                    break;
                    
                case 'persons':
                    const personsResponse = await this.client.getPersons({
                        start: 0,
                        limit: 1000
                    });
                    data = personsResponse.data || [];
                    break;
            }

            // Calculate requested metrics
            validated.metrics.forEach((metric: any) => {
                switch (metric) {
                    case 'count':
                        insights.metrics.count = data.length;
                        break;
                        
                    case 'total_value':
                        if (validated.entity_type === 'deals') {
                            insights.metrics.total_value = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
                        }
                        break;
                        
                    case 'avg_value':
                        if (validated.entity_type === 'deals') {
                            const totalValue = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
                            insights.metrics.avg_value = data.length > 0 ? totalValue / data.length : 0;
                        }
                        break;
                        
                    case 'conversion_rate':
                        if (validated.entity_type === 'deals') {
                            const wonDeals = data.filter(deal => deal.status === 'won').length;
                            insights.metrics.conversion_rate = data.length > 0 ? (wonDeals / data.length * 100) : 0;
                        }
                        break;
                }
            });

            // Group by field if requested
            if (validated.group_by) {
                const grouped = data.reduce((acc, item) => {
                    const key = item[validated.group_by!] || 'Unknown';
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                
                insights.grouped_data = grouped;
            }

            return {
                success: true,
                data: insights,
                message: `Generated data insights for ${data.length} ${validated.entity_type}`
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to generate data insights'
            };
        }
    }
}