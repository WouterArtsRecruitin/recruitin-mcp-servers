// Pipedrive API Type Definitions

export interface PipedriveConfig {
  apiToken: string;
  domain: string;
  rateLimitRequests?: number;
  rateLimitWindowMs?: number;
  debug?: boolean;
}

export interface PipedriveDeal {
  id: number;
  title: string;
  value: number;
  currency: string;
  status: string;
  stage_id: number;
  pipeline_id: number;
  person_id?: number;
  org_id?: number;
  user_id?: number;
  won_time?: string;
  lost_time?: string;
  close_time?: string;
  add_time: string;
  update_time: string;
  stage_change_time?: string;
  active: boolean;
  deleted: boolean;
  [key: string]: any; // For custom fields
}

export interface PipedriveStage {
  id: number;
  name: string;
  pipeline_id: number;
  order_nr: number;
  deal_probability: number;
  rotten_flag: boolean;
  rotten_days?: number;
  add_time: string;
  update_time: string;
  active_flag: boolean;
}

export interface PipedrivePipeline {
  id: number;
  name: string;
  order_nr: number;
  active: boolean;
  deal_probability: boolean;
  add_time: string;
  update_time: string;
  selected: boolean;
}

export interface PipedriveField {
  id: number;
  key: string;
  name: string;
  field_type: string;
  options?: Array<{ id: number; label: string }>;
  add_visible_flag: boolean;
  edit_flag: boolean;
  details_visible_flag: boolean;
  important_flag: boolean;
  bulk_edit_allowed: boolean;
  mandatory_flag: boolean;
}

export interface PipedriveActivity {
  id: number;
  type: string;
  subject: string;
  deal_id?: number;
  person_id?: number;
  org_id?: number;
  due_date?: string;
  due_time?: string;
  duration?: string;
  note?: string;
  done: boolean;
  add_time: string;
  update_time: string;
  marked_as_done_time?: string;
}

export interface PipedrivePerson {
  id: number;
  name: string;
  email?: Array<{ value: string; primary: boolean }>;
  phone?: Array<{ value: string; primary: boolean }>;
  org_id?: number;
  add_time: string;
  update_time: string;
}

export interface PipedriveOrganization {
  id: number;
  name: string;
  address?: string;
  cc_email?: string;
  add_time: string;
  update_time: string;
}

export interface PipedriveAPIResponse<T> {
  success: boolean;
  data?: T;
  additional_data?: {
    pagination?: {
      start: number;
      limit: number;
      more_items_in_collection: boolean;
      next_start?: number;
    };
  };
  error?: string;
  error_info?: string;
}

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code: string;
    retry: boolean;
  };
}

export interface DealFilters {
  pipeline_id?: number;
  stage_id?: number;
  status?: 'open' | 'won' | 'lost' | 'deleted' | 'all_not_deleted';
  user_id?: number;
  start?: number;
  limit?: number;
}

export interface CreateDealParams {
  title: string;
  person_id?: number;
  org_id?: number;
  stage_id?: number;
  value?: number;
  currency?: string;
  user_id?: number;
  visible_to?: '1' | '3' | '5' | '7'; // 1=Owner, 3=Owner+Followers, 5=Everyone, 7=Entire company
  [key: string]: any; // For custom fields
}

export interface UpdateDealParams {
  title?: string;
  value?: number;
  currency?: string;
  person_id?: number;
  org_id?: number;
  stage_id?: number;
  status?: 'open' | 'won' | 'lost' | 'deleted';
  probability?: number;
  lost_reason?: string;
  visible_to?: '1' | '3' | '5' | '7';
  [key: string]: any; // For custom fields
}

export interface CreateActivityParams {
  subject: string;
  type: string;
  deal_id?: number;
  person_id?: number;
  org_id?: number;
  due_date?: string; // YYYY-MM-DD
  due_time?: string; // HH:MM
  duration?: string; // HH:MM
  note?: string;
  done?: boolean;
  participants?: Array<{ person_id: number; primary_flag: boolean }>;
}
