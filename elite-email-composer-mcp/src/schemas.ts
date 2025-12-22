import { z } from 'zod';

// Email Composition Schemas
export const ComposeEmailSchema = z.object({
  subject: z.string(),
  recipient: z.string().optional(),
  context: z.string(),
  tone: z.enum(['professional', 'friendly', 'formal', 'casual', 'urgent']).optional().default('professional'),
  language: z.string().optional().default('en'),
  length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
  sector: z.string().optional(),
  framework: z.enum(['PAS', 'AIDA', 'Problem-Solution', 'Value-First']).optional(),
  company: z.string().optional(),
  goal: z.string().optional(),
});

export const FormatEmailSchema = z.object({
  content: z.string(),
  style: z.enum(['business', 'modern', 'minimal', 'newsletter']).optional().default('business'),
  include_signature: z.boolean().optional().default(true),
});

export const TranslateEmailSchema = z.object({
  content: z.string(),
  target_language: z.string(),
  preserve_formatting: z.boolean().optional().default(true),
});

// Template Management Schemas
export const CreateTemplateSchema = z.object({
  name: z.string(),
  subject: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional().default([]),
  variables: z.array(z.string()).optional().default([]),
});

export const GetTemplateSchema = z.object({
  name: z.string(),
  variables: z.record(z.string()).optional(),
});

export const ListTemplatesSchema = z.object({
  tag: z.string().optional(),
  search: z.string().optional(),
});

// Email Analysis Schemas
export const AnalyzeEmailSchema = z.object({
  content: z.string(),
  metrics: z.array(z.enum(['tone', 'clarity', 'professionalism', 'engagement', 'length']))
    .optional()
    .default(['tone', 'clarity', 'professionalism']),
});

export const EmailPerformanceSchema = z.object({
  email_id: z.string().optional(),
  timeframe: z.enum(['24h', '7d', '30d', '90d']).optional().default('7d'),
});

// Type definitions
export type ComposeEmailParams = z.infer<typeof ComposeEmailSchema>;
export type FormatEmailParams = z.infer<typeof FormatEmailSchema>;
export type TranslateEmailParams = z.infer<typeof TranslateEmailSchema>;
export type CreateTemplateParams = z.infer<typeof CreateTemplateSchema>;
export type GetTemplateParams = z.infer<typeof GetTemplateSchema>;
export type ListTemplatesParams = z.infer<typeof ListTemplatesSchema>;
export type AnalyzeEmailParams = z.infer<typeof AnalyzeEmailSchema>;
export type EmailPerformanceParams = z.infer<typeof EmailPerformanceSchema>;