export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  hourly_rate: number;
  currency: string;
  address?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientCreateInput {
  name: string;
  email: string;
  company?: string;
  hourly_rate?: number;
  currency?: string;
  address?: string;
}

export interface ClientUpdateInput {
  name?: string;
  email?: string;
  company?: string;
  hourly_rate?: number;
  currency?: string;
  address?: string;
}

export interface Project {
  id: string;
  client_id: string;
  client_name?: string;
  name: string;
  description?: string | null;
  hourly_rate: number;
  status: 'active' | 'in_review' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateInput {
  client_id: string;
  name: string;
  description?: string;
  hourly_rate?: number;
  status?: 'active' | 'in_review' | 'completed';
}

export interface ProjectUpdateInput {
  client_id?: string;
  name?: string;
  description?: string;
  hourly_rate?: number;
  status?: 'active' | 'in_review' | 'completed';
}

export interface TimeEntry {
  id: string;
  project_id: string;
  project_name?: string;
  description: string;
  start_time: string;
  end_time?: string | null;
  duration_seconds: number;
  is_active: boolean;
  is_billed: boolean;
  created_at: string;
}

export interface TimerStartInput {
  project_id?: string | null;
  description?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  project_id: string;
  project_name?: string;
  client_id: string;
  client_name: string;
  client_address?: string | null;
  client_email?: string | null;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid';
  total_hours: number;
  hourly_rate: number;
  total_amount: number;
  currency: string;
  line_items: InvoiceLineItem[];
  notes?: string | null;
  html_preview?: string;
  created_at: string;
}

export interface InvoiceGenerateInput {
  project_id: string;
  notes?: string;
  due_days?: number;
}
