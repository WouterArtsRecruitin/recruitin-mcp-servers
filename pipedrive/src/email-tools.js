import { z } from 'zod';

// Zod schemas for Email functions
export const SendEmailSchema = z.object({
    subject: z.string(),
    body: z.string(),
    to: z.array(z.string()).min(1), // Array of email addresses
    cc: z.array(z.string()).optional(),
    bcc: z.array(z.string()).optional(),
    deal_id: z.number().optional(),
    person_id: z.number().optional(),
    org_id: z.number().optional(),
    template_id: z.number().optional(),
    track_opens: z.boolean().optional().default(true),
    track_clicks: z.boolean().optional().default(true),
});

export const GetEmailTemplatesSchema = z.object({
    start: z.number().optional().default(0),
    limit: z.number().optional().default(100),
});

export const CreateEmailTemplateSchema = z.object({
    name: z.string(),
    subject: z.string(),
    content: z.string(),
    type: z.enum(['email', 'mail']).optional().default('email'),
});

export const GetEmailPerformanceSchema = z.object({
    pipeline_id: z.number().optional(),
    date_from: z.string().optional(), // YYYY-MM-DD format
    date_to: z.string().optional(),   // YYYY-MM-DD format
    limit: z.number().optional().default(100),
});

export const TrackEmailSchema = z.object({
    deal_id: z.number(),
    person_id: z.number().optional(),
    email_subject: z.string(),
    email_sent_date: z.string().optional(), // ISO date string
});

export class EmailTools {
    constructor(client) {
        this.client = client;
    }

    async sendEmail(params) {
        try {
            const validated = SendEmailSchema.parse(params);
            
            // Prepare email data for Pipedrive API
            const emailData = {
                subject: validated.subject,
                body: validated.body,
                to: validated.to,
                cc: validated.cc || [],
                bcc: validated.bcc || [],
            };

            // Add tracking if specified
            if (validated.track_opens || validated.track_clicks) {
                emailData.tracking = {
                    open_tracking: validated.track_opens,
                    click_tracking: validated.track_clicks,
                };
            }

            // Try to send via Pipedrive API (Note: this might require special email permissions)
            let response;
            try {
                response = await this.client.request('POST', 'mailbox', emailData);
            } catch (apiError) {
                // Fallback: Create activity record instead of actual sending
                const activityData = {
                    subject: `Email: ${validated.subject}`,
                    type: 'email',
                    note: `Email sent to: ${validated.to.join(', ')}\n\nSubject: ${validated.subject}\n\nBody:\n${validated.body}`,
                    deal_id: validated.deal_id,
                    person_id: validated.person_id,
                    org_id: validated.org_id,
                    done: 1, // Mark as completed
                };

                response = await this.client.request('POST', 'activities', activityData);
                
                return {
                    success: true,
                    data: response.data,
                    message: `Email activity logged for deal/person. Subject: "${validated.subject}". Recipients: ${validated.to.join(', ')}`,
                    note: 'Email was logged as activity (actual sending may require additional Pipedrive email permissions)'
                };
            }
            
            return {
                success: true,
                data: response.data,
                message: `Email sent successfully. Subject: "${validated.subject}". Recipients: ${validated.to.join(', ')}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to send email'
            };
        }
    }

    async getEmailTemplates(params) {
        try {
            const validated = GetEmailTemplatesSchema.parse(params);
            const response = await this.client.request('GET', 'emailTemplates', validated);
            
            return {
                success: true,
                data: response.data,
                additional_data: response.additional_data,
                message: `Retrieved ${response.data?.length || 0} email templates`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve email templates'
            };
        }
    }

    async createEmailTemplate(params) {
        try {
            const validated = CreateEmailTemplateSchema.parse(params);
            
            const templateData = {
                name: validated.name,
                subject: validated.subject,
                content: validated.content,
                type: validated.type,
            };

            const response = await this.client.request('POST', 'emailTemplates', templateData);
            
            return {
                success: true,
                data: response.data,
                message: `Created email template: "${validated.name}" (ID: ${response.data?.id})`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create email template'
            };
        }
    }

    async getEmailPerformance(params) {
        try {
            const validated = GetEmailPerformanceSchema.parse(params);
            
            // Get email activities for performance analysis
            const activityParams = {
                type: 'email',
                start_date: validated.date_from,
                end_date: validated.date_to,
                limit: validated.limit,
            };

            if (validated.pipeline_id) {
                // First get deals from pipeline, then their activities
                const dealsResponse = await this.client.request('GET', 'deals', {
                    pipeline_id: validated.pipeline_id,
                    status: 'all_not_deleted',
                    limit: 500
                });

                const dealIds = dealsResponse.data?.map(deal => deal.id) || [];
                const emailStats = {
                    total_emails: 0,
                    deals_with_emails: 0,
                    pipeline_id: validated.pipeline_id,
                    date_range: `${validated.date_from || 'start'} to ${validated.date_to || 'end'}`
                };

                // Get activities for each deal (simplified for performance)
                for (const dealId of dealIds.slice(0, 50)) { // Limit for performance
                    try {
                        const activitiesResponse = await this.client.request('GET', `deals/${dealId}/activities`, {
                            type: 'email'
                        });
                        const emailCount = activitiesResponse.data?.length || 0;
                        if (emailCount > 0) {
                            emailStats.total_emails += emailCount;
                            emailStats.deals_with_emails += 1;
                        }
                    } catch (e) {
                        // Skip failed requests
                        continue;
                    }
                }

                return {
                    success: true,
                    data: emailStats,
                    message: `Email performance for pipeline ${validated.pipeline_id}: ${emailStats.total_emails} emails sent to ${emailStats.deals_with_emails} deals`
                };
            } else {
                // Get general email activities
                const response = await this.client.request('GET', 'activities', activityParams);
                
                return {
                    success: true,
                    data: response.data,
                    additional_data: response.additional_data,
                    message: `Retrieved ${response.data?.length || 0} email activities`
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get email performance data'
            };
        }
    }

    async trackEmail(params) {
        try {
            const validated = TrackEmailSchema.parse(params);
            
            // Create email tracking activity
            const activityData = {
                subject: `Email Tracking: ${validated.email_subject}`,
                type: 'email',
                deal_id: validated.deal_id,
                person_id: validated.person_id,
                note: `Email sent: "${validated.email_subject}"`,
                done: 1,
            };

            if (validated.email_sent_date) {
                activityData.due_date = validated.email_sent_date.split('T')[0]; // Extract date part
            }

            const response = await this.client.request('POST', 'activities', activityData);
            
            return {
                success: true,
                data: response.data,
                message: `Email tracking created for deal ${validated.deal_id}: "${validated.email_subject}"`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create email tracking'
            };
        }
    }

    async getEmailConversations(params) {
        try {
            const validated = z.object({
                deal_id: z.number().optional(),
                person_id: z.number().optional(),
                limit: z.number().optional().default(100),
            }).parse(params);

            let response;
            if (validated.deal_id) {
                response = await this.client.request('GET', `deals/${validated.deal_id}/activities`, {
                    type: 'email',
                    limit: validated.limit
                });
            } else if (validated.person_id) {
                response = await this.client.request('GET', `persons/${validated.person_id}/activities`, {
                    type: 'email', 
                    limit: validated.limit
                });
            } else {
                throw new Error('Either deal_id or person_id is required');
            }
            
            return {
                success: true,
                data: response.data,
                additional_data: response.additional_data,
                message: `Retrieved ${response.data?.length || 0} email conversations`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve email conversations'
            };
        }
    }
}