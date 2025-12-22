import type { CreateTemplateParams, GetTemplateParams, ListTemplatesParams } from './schemas.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  tags: string[];
  variables: string[];
  created_at: string;
  updated_at: string;
  usage_count: number;
}

export class TemplateManager {
  private templates: EmailTemplate[] = [];
  private externalTemplates: any[] = [];

  constructor() {
    this.loadBuiltInTemplates();
    this.loadExternalTemplates();
  }

  private loadBuiltInTemplates() {
    this.templates = [
    {
      id: '1',
      name: 'follow-up',
      subject: 'Following up on our conversation',
      content: `Dear {recipient},

I hope this email finds you well. I wanted to follow up on our recent conversation regarding {topic}.

{additional_details}

Please let me know if you have any questions or if there's anything else I can help with.

Best regards,
{sender}`,
      tags: ['follow-up', 'professional'],
      variables: ['recipient', 'topic', 'additional_details', 'sender'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0,
    },
    {
      id: '2',
      name: 'meeting-request',
      subject: 'Meeting Request - {meeting_topic}',
      content: `Dear {recipient},

I hope you're doing well. I would like to schedule a meeting to discuss {meeting_topic}.

Proposed details:
- Date: {proposed_date}
- Time: {proposed_time}
- Duration: {duration}
- Location: {location}

Please let me know if this works for you, or if you'd prefer a different time.

Looking forward to our discussion.

Best regards,
{sender}`,
      tags: ['meeting', 'schedule', 'professional'],
      variables: ['recipient', 'meeting_topic', 'proposed_date', 'proposed_time', 'duration', 'location', 'sender'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0,
    },
    {
      id: '3',
      name: 'thank-you',
      subject: 'Thank you for {reason}',
      content: `Dear {recipient},

I wanted to take a moment to thank you for {reason}. Your {specific_contribution} was greatly appreciated and made a significant difference.

{additional_gratitude}

I look forward to {future_collaboration}.

With appreciation,
{sender}`,
      tags: ['thank-you', 'appreciation', 'professional'],
      variables: ['recipient', 'reason', 'specific_contribution', 'additional_gratitude', 'future_collaboration', 'sender'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0,
    },
    {
      id: '4',
      name: 'project-update',
      subject: 'Project Update - {project_name}',
      content: `Dear {recipient},

I wanted to provide you with an update on the {project_name} project.

Current Status:
- Progress: {progress_percentage}% complete
- Milestones achieved: {completed_milestones}
- Next steps: {next_steps}

Timeline:
- Expected completion: {completion_date}
- Upcoming deadlines: {upcoming_deadlines}

{additional_notes}

Please let me know if you have any questions or concerns.

Best regards,
{sender}`,
      tags: ['project', 'update', 'status', 'professional'],
      variables: ['recipient', 'project_name', 'progress_percentage', 'completed_milestones', 'next_steps', 'completion_date', 'upcoming_deadlines', 'additional_notes', 'sender'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0,
    },
    {
      id: '5',
      name: 'introduction',
      subject: 'Introduction - {your_name}',
      content: `Dear {recipient},

I hope this email finds you well. My name is {your_name}, and I am {your_role} at {your_company}.

{introduction_context}

I would love the opportunity to {desired_outcome}. Would you be available for a brief conversation in the coming days?

Please let me know a time that works best for you.

Best regards,
{your_name}
{your_title}
{your_company}
{contact_information}`,
      tags: ['introduction', 'networking', 'professional'],
      variables: ['recipient', 'your_name', 'your_role', 'your_company', 'introduction_context', 'desired_outcome', 'your_title', 'contact_information'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0,
    },
  ];
  }

  async createTemplate(params: CreateTemplateParams) {
    try {
      const { name, subject, content, tags, variables } = params;

      // Check if template with same name already exists
      const existingTemplate = this.templates.find(t => t.name.toLowerCase() === name.toLowerCase());
      if (existingTemplate) {
        return {
          success: false,
          error: 'Template with this name already exists',
          message: 'Failed to create template - name already exists',
        };
      }

      // Extract variables from content if not provided
      const extractedVariables = variables || this.extractVariables(content);

      // Create new template
      const newTemplate: EmailTemplate = {
        id: (this.templates.length + 1).toString(),
        name: name,
        subject: subject,
        content: content,
        tags: tags || [],
        variables: extractedVariables,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0,
      };

      this.templates.push(newTemplate);

      return {
        success: true,
        data: {
          template: newTemplate,
          variables_detected: extractedVariables.length,
        },
        message: `Template "${name}" created successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create template',
      };
    }
  }

  async listTemplates(params: ListTemplatesParams = {}) {
    try {
      const { tag, search } = params;

      let filteredTemplates = [...this.templates];

      // Filter by tag if provided
      if (tag) {
        filteredTemplates = filteredTemplates.filter(template =>
          template.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
        );
      }

      // Filter by search term if provided
      if (search) {
        const searchLower = search.toLowerCase();
        filteredTemplates = filteredTemplates.filter(template =>
          template.name.toLowerCase().includes(searchLower) ||
          template.subject.toLowerCase().includes(searchLower) ||
          template.content.toLowerCase().includes(searchLower)
        );
      }

      // Sort by usage count (most used first) and then by name
      filteredTemplates.sort((a, b) => {
        if (b.usage_count !== a.usage_count) {
          return b.usage_count - a.usage_count;
        }
        return a.name.localeCompare(b.name);
      });

      return {
        success: true,
        data: {
          templates: filteredTemplates.map(template => ({
            id: template.id,
            name: template.name,
            subject: template.subject,
            tags: template.tags,
            variables: template.variables,
            usage_count: template.usage_count,
            created_at: template.created_at,
            updated_at: template.updated_at,
          })),
          total_count: filteredTemplates.length,
          filters_applied: {
            tag: tag,
            search: search,
          },
        },
        message: `Found ${filteredTemplates.length} templates`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to list templates',
      };
    }
  }

  async getTemplate(params: GetTemplateParams) {
    try {
      const { name, variables } = params;

      // Find template by name (case insensitive)
      const template = this.templates.find(t => 
        t.name.toLowerCase() === name.toLowerCase()
      );

      if (!template) {
        return {
          success: false,
          error: 'Template not found',
          message: `Template "${name}" not found`,
        };
      }

      // Increment usage count
      template.usage_count++;
      template.updated_at = new Date().toISOString();

      // Replace variables in content and subject if provided
      let processedSubject = template.subject;
      let processedContent = template.content;

      if (variables) {
        for (const [key, value] of Object.entries(variables)) {
          const placeholder = `{${key}}`;
          processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
          processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
        }
      }

      // Identify missing variables
      const missingVariables = template.variables.filter(variable => {
        const placeholder = `{${variable}}`;
        return processedContent.includes(placeholder) || processedSubject.includes(placeholder);
      });

      return {
        success: true,
        data: {
          template: {
            id: template.id,
            name: template.name,
            original_subject: template.subject,
            original_content: template.content,
            processed_subject: processedSubject,
            processed_content: processedContent,
            tags: template.tags,
            variables: template.variables,
            usage_count: template.usage_count,
          },
          variables_provided: variables ? Object.keys(variables) : [],
          missing_variables: missingVariables,
          is_complete: missingVariables.length === 0,
        },
        message: missingVariables.length === 0 
          ? `Template "${name}" retrieved and processed successfully` 
          : `Template "${name}" retrieved but has ${missingVariables.length} missing variables`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve template',
      };
    }
  }

  private extractVariables(content: string): string[] {
    const variableRegex = /{([^}]+)}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables.sort();
  }

  private loadExternalTemplates() {
    try {
      const templatesDir = path.join(__dirname, '..', 'templates', 'recruitment');
      
      if (fs.existsSync(templatesDir)) {
        const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.json'));
        
        for (const file of files) {
          try {
            const filePath = path.join(templatesDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const template = JSON.parse(content);
            
            // Convert external template format to internal format
            const internalTemplate: EmailTemplate = {
              id: template.template_id || file.replace('.json', ''),
              name: template.name || template.template_id,
              subject: template.subject_lines?.[0] || 'No subject',
              content: template.body || 'No content',
              tags: template.tags || [template.category, template.subcategory].filter(Boolean),
              variables: [...(template.required_variables || []), ...(template.optional_variables || [])],
              created_at: template.last_updated || new Date().toISOString(),
              updated_at: template.last_updated || new Date().toISOString(),
              usage_count: 0,
            };
            
            this.templates.push(internalTemplate);
            this.externalTemplates.push(template);
          } catch (error) {
            console.error(`Error loading template ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading external templates:', error);
    }
  }

  async composeWithExternalTemplate(templateId: string, variables: Record<string, string> = {}) {
    try {
      const template = this.externalTemplates.find(t => t.template_id === templateId);
      
      if (!template) {
        return {
          success: false,
          error: 'Template not found',
          message: `Template "${templateId}" not found`,
        };
      }

      // Process template body with variables
      let processedContent = template.body;
      let processedSubject = template.subject_lines[0];

      // Replace variables in {{variable}} format
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processedContent = processedContent.replace(regex, value);
        processedSubject = processedSubject.replace(regex, value);
      }

      // Find missing required variables
      const missingVariables = template.required_variables?.filter((variable: string) => {
        const placeholder = `{{${variable}}}`;
        return processedContent.includes(placeholder) || processedSubject.includes(placeholder);
      }) || [];

      return {
        success: true,
        data: {
          template_id: template.template_id,
          name: template.name,
          category: template.category,
          subject: processedSubject,
          content: processedContent,
          language: template.language,
          tone: template.tone,
          use_case: template.use_case,
          performance: template.performance,
          missing_variables: missingVariables,
          is_complete: missingVariables.length === 0,
          all_subject_options: template.subject_lines,
        },
        message: missingVariables.length === 0 
          ? `Template "${templateId}" processed successfully` 
          : `Template "${templateId}" processed but has ${missingVariables.length} missing required variables`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to process external template',
      };
    }
  }
}