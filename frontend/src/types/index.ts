export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  hourly_rate: number;
  currency: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  client_name?: string;
  name: string;
  description?: string;
  hourly_rate: number;
  status: 'active' | 'in_review' | 'completed';
  created_at: string;
  updated_at: string;
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
  client_address?: string;
  client_email?: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid';
  total_hours: number;
  hourly_rate: number;
  total_amount: number;
  currency: string;
  line_items: InvoiceLineItem[];
  notes?: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalHoursMonth: number;
  unbilledRevenue: number;
  activeProjectsCount: number;
  outstandingInvoicesAmount: number;
  recentEntries: TimeEntry[];
}
