import { Client, Project, TimeEntry, Invoice, InvoiceLineItem, DashboardMetrics } from '../types';

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_1',
    name: 'Acme Global Corp',
    email: 'billing@acmeglobal.com',
    company: 'Acme Global Inc',
    hourly_rate: 150,
    currency: 'USD',
    address: '100 Market Street, San Francisco, CA 94105',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'cli_2',
    name: 'Lumina Design Studio',
    email: 'hello@luminastudio.io',
    company: 'Lumina Creative LLC',
    hourly_rate: 135,
    currency: 'USD',
    address: '450 Broadway, Suite 400, New York, NY 10013',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'cli_3',
    name: 'HyperScale AI Lab',
    email: 'partners@hyperscale.ai',
    company: 'HyperScale Technologies Inc',
    hourly_rate: 180,
    currency: 'USD',
    address: '22 Bishopsgate, London EC2N 4BQ, United Kingdom',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj_1',
    client_id: 'cli_1',
    client_name: 'Acme Global Corp',
    name: 'Cloud Infrastructure Migration',
    description: 'Kubernetes cluster deployment, Terraform IaC, and zero-downtime database migration.',
    hourly_rate: 150,
    status: 'active',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'prj_2',
    client_id: 'cli_2',
    client_name: 'Lumina Design Studio',
    name: 'Design System & Component Library',
    description: 'Next.js + Tailwind React component library documentation and accessibility testing.',
    hourly_rate: 135,
    status: 'active',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'prj_3',
    client_id: 'cli_3',
    client_name: 'HyperScale AI Lab',
    name: 'Model Fine-Tuning Pipeline & API',
    description: 'FastAPI streaming gateway, token rate limiter, and vector search embeddings.',
    hourly_rate: 180,
    status: 'in_review',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

const INITIAL_TIMERS: TimeEntry[] = [
  {
    id: 'tmr_1',
    project_id: 'prj_1',
    project_name: 'Cloud Infrastructure Migration',
    description: 'Implemented automated Helm charts and ingress routing',
    start_time: new Date(Date.now() - 3 * 3600000).toISOString(),
    end_time: new Date(Date.now() - 1 * 3600000).toISOString(),
    duration_seconds: 7200,
    is_active: false,
    is_billed: false,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'tmr_2',
    project_id: 'prj_2',
    project_name: 'Design System & Component Library',
    description: 'Built accessible modal dialog and dropdown components',
    start_time: new Date(Date.now() - 6 * 3600000).toISOString(),
    end_time: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    duration_seconds: 9000,
    is_active: false,
    is_billed: false,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    invoice_number: 'INV-2026-001',
    project_id: 'prj_1',
    project_name: 'Cloud Infrastructure Migration',
    client_id: 'cli_1',
    client_name: 'Acme Global Corp',
    client_address: '100 Market Street, San Francisco, CA 94105',
    client_email: 'billing@acmeglobal.com',
    issue_date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'paid',
    total_hours: 12.5,
    hourly_rate: 150,
    total_amount: 1875.0,
    currency: 'USD',
    line_items: [
      {
        id: 'li_1',
        description: 'VPC Peering and Terraform state backend setup',
        hours: 6.5,
        rate: 150,
        amount: 975.0,
      },
      {
        id: 'li_2',
        description: 'CI/CD runner deployment in private subnet',
        hours: 6.0,
        rate: 150,
        amount: 900.0,
      },
    ],
    notes: 'Payment received via Wire Transfer. Thank you for your partnership!',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

class MockStorage {
  private clients: Client[] = [...INITIAL_CLIENTS];
  private projects: Project[] = [...INITIAL_PROJECTS];
  private timers: TimeEntry[] = [...INITIAL_TIMERS];
  private invoices: Invoice[] = [...INITIAL_INVOICES];
  private initialized = false;

  private loadFromLocalStorage() {
    if (typeof window === 'undefined' || this.initialized) return;
    try {
      const storedClients = localStorage.getItem('clientpilot_clients');
      const storedProjects = localStorage.getItem('clientpilot_projects');
      const storedTimers = localStorage.getItem('clientpilot_timers');
      const storedInvoices = localStorage.getItem('clientpilot_invoices');

      if (storedClients) this.clients = JSON.parse(storedClients);
      if (storedProjects) this.projects = JSON.parse(storedProjects);
      if (storedTimers) this.timers = JSON.parse(storedTimers);
      if (storedInvoices) this.invoices = JSON.parse(storedInvoices);
      this.initialized = true;
    } catch {
      // Fallback to in-memory
    }
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('clientpilot_clients', JSON.stringify(this.clients));
      localStorage.setItem('clientpilot_projects', JSON.stringify(this.projects));
      localStorage.setItem('clientpilot_timers', JSON.stringify(this.timers));
      localStorage.setItem('clientpilot_invoices', JSON.stringify(this.invoices));
    } catch {
      // Ignore quota errors
    }
  }

  // --- CLIENTS ---
  async getClients(): Promise<Client[]> {
    this.loadFromLocalStorage();
    return [...this.clients];
  }

  async getClient(id: string): Promise<Client | null> {
    this.loadFromLocalStorage();
    return this.clients.find((c) => c.id === id) || null;
  }

  async createClient(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    this.loadFromLocalStorage();
    const newClient: Client = {
      ...data,
      id: `cli_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.clients.unshift(newClient);
    this.saveToLocalStorage();
    return newClient;
  }

  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    this.loadFromLocalStorage();
    const index = this.clients.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Client with id ${id} not found`);
    const updated = {
      ...this.clients[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.clients[index] = updated;
    this.saveToLocalStorage();
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    this.loadFromLocalStorage();
    this.clients = this.clients.filter((c) => c.id !== id);
    this.saveToLocalStorage();
    return true;
  }

  // --- PROJECTS ---
  async getProjects(): Promise<Project[]> {
    this.loadFromLocalStorage();
    return this.projects.map((p) => {
      const client = this.clients.find((c) => c.id === p.client_id);
      return {
        ...p,
        client_name: client ? client.name : p.client_name,
      };
    });
  }

  async getProject(id: string): Promise<Project | null> {
    this.loadFromLocalStorage();
    const project = this.projects.find((p) => p.id === id);
    if (!project) return null;
    const client = this.clients.find((c) => c.id === project.client_id);
    return {
      ...project,
      client_name: client ? client.name : project.client_name,
    };
  }

  async createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    this.loadFromLocalStorage();
    const client = this.clients.find((c) => c.id === data.client_id);
    if (!client) {
      throw new Error('Invalid client_id: Client does not exist');
    }
    const newProject: Project = {
      ...data,
      id: `prj_${Date.now()}`,
      client_name: client.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.projects.unshift(newProject);
    this.saveToLocalStorage();
    return newProject;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    this.loadFromLocalStorage();
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Project with id ${id} not found`);
    const updated = {
      ...this.projects[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    if (data.client_id) {
      const client = this.clients.find((c) => c.id === data.client_id);
      if (client) updated.client_name = client.name;
    }
    this.projects[index] = updated;
    this.saveToLocalStorage();
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    this.loadFromLocalStorage();
    this.projects = this.projects.filter((p) => p.id !== id);
    this.saveToLocalStorage();
    return true;
  }

  // --- TIMERS ---
  async getTimeEntries(): Promise<TimeEntry[]> {
    this.loadFromLocalStorage();
    return this.timers.map((t) => {
      const prj = this.projects.find((p) => p.id === t.project_id);
      return {
        ...t,
        project_name: prj ? prj.name : t.project_name,
      };
    });
  }

  async getActiveTimer(): Promise<TimeEntry | null> {
    this.loadFromLocalStorage();
    const active = this.timers.find((t) => t.is_active);
    if (!active) return null;
    const prj = this.projects.find((p) => p.id === active.project_id);
    return {
      ...active,
      project_name: prj ? prj.name : active.project_name,
    };
  }

  async startTimer(payload: { project_id?: string | null; description?: string }): Promise<TimeEntry> {
    this.loadFromLocalStorage();
    if (!payload.project_id || payload.project_id.trim() === '') {
      const err = new Error('project_id is required');
      (err as unknown as { status: number }).status = 422;
      throw err;
    }

    // Stop any existing active timers first
    const now = new Date();
    for (const t of this.timers) {
      if (t.is_active) {
        t.is_active = false;
        t.end_time = now.toISOString();
        t.duration_seconds = Math.max(1, Math.round((now.getTime() - new Date(t.start_time).getTime()) / 1000));
      }
    }

    const prj = this.projects.find((p) => p.id === payload.project_id);
    const newTimer: TimeEntry = {
      id: `tmr_${Date.now()}`,
      project_id: payload.project_id,
      project_name: prj ? prj.name : 'Unknown Project',
      description: payload.description || 'Focus Work Session',
      start_time: now.toISOString(),
      end_time: null,
      duration_seconds: 0,
      is_active: true,
      is_billed: false,
      created_at: now.toISOString(),
    };

    this.timers.unshift(newTimer);
    this.saveToLocalStorage();
    return newTimer;
  }

  async stopTimer(id?: string): Promise<TimeEntry> {
    this.loadFromLocalStorage();
    const timer = id ? this.timers.find((t) => t.id === id) : this.timers.find((t) => t.is_active);
    if (!timer) {
      throw new Error('No active timer found to stop');
    }

    const now = new Date();
    timer.is_active = false;
    timer.end_time = now.toISOString();
    const diffSeconds = Math.max(1, Math.round((now.getTime() - new Date(timer.start_time).getTime()) / 1000));
    timer.duration_seconds = diffSeconds;

    this.saveToLocalStorage();
    return timer;
  }

  async deleteTimeEntry(id: string): Promise<boolean> {
    this.loadFromLocalStorage();
    this.timers = this.timers.filter((t) => t.id !== id);
    this.saveToLocalStorage();
    return true;
  }

  // --- INVOICES ---
  async getInvoices(): Promise<Invoice[]> {
    this.loadFromLocalStorage();
    return [...this.invoices];
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    this.loadFromLocalStorage();
    return this.invoices.find((i) => i.id === id) || null;
  }

  async generateInvoice(payload: {
    project_id: string;
    notes?: string;
    due_days?: number;
  }): Promise<Invoice> {
    this.loadFromLocalStorage();
    const project = this.projects.find((p) => p.id === payload.project_id);
    if (!project) throw new Error('Project not found');

    const client = this.clients.find((c) => c.id === project.client_id);
    if (!client) throw new Error('Client not found');

    // Aggregate unbilled completed time entries for this project
    const unbilledEntries = this.timers.filter(
      (t) => t.project_id === payload.project_id && !t.is_billed && !t.is_active
    );

    let totalHours = 0;
    const lineItems: InvoiceLineItem[] = [];

    if (unbilledEntries.length > 0) {
      for (const entry of unbilledEntries) {
        const hours = parseFloat((entry.duration_seconds / 3600).toFixed(2));
        const amount = parseFloat((hours * project.hourly_rate).toFixed(2));
        totalHours += hours;
        lineItems.push({
          id: `li_${entry.id}`,
          description: entry.description || 'Consulting work',
          hours: Math.max(0.1, hours),
          rate: project.hourly_rate,
          amount: Math.max(0.1 * project.hourly_rate, amount),
        });
        entry.is_billed = true;
      }
    } else {
      // If no entries, generate default line item with 1 hour
      totalHours = 1.0;
      lineItems.push({
        id: `li_default_${Date.now()}`,
        description: `${project.name} - Professional Services`,
        hours: 1.0,
        rate: project.hourly_rate,
        amount: project.hourly_rate,
      });
    }

    const totalAmount = lineItems.reduce((acc, curr) => acc + curr.amount, 0);
    const issueDate = new Date();
    const dueDays = payload.due_days || 14;
    const dueDate = new Date(Date.now() + dueDays * 86400000);

    const invoiceCount = this.invoices.length + 1;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount).padStart(3, '0')}`;

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoice_number: invoiceNumber,
      project_id: project.id,
      project_name: project.name,
      client_id: client.id,
      client_name: client.name,
      client_address: client.address || 'Address on file',
      client_email: client.email,
      issue_date: issueDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      status: 'draft',
      total_hours: parseFloat(totalHours.toFixed(2)),
      hourly_rate: project.hourly_rate,
      total_amount: parseFloat(totalAmount.toFixed(2)),
      currency: client.currency || 'USD',
      line_items: lineItems,
      notes: payload.notes || 'Payment due within 14 days of invoice receipt. Thank you!',
      created_at: issueDate.toISOString(),
    };

    this.invoices.unshift(newInvoice);
    this.saveToLocalStorage();
    return newInvoice;
  }

  async updateInvoiceStatus(id: string, status: 'draft' | 'sent' | 'paid'): Promise<Invoice> {
    this.loadFromLocalStorage();
    const invoice = this.invoices.find((i) => i.id === id);
    if (!invoice) throw new Error('Invoice not found');
    invoice.status = status;
    this.saveToLocalStorage();
    return invoice;
  }

  // --- DASHBOARD METRICS ---
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    this.loadFromLocalStorage();
    const totalHoursMonth = this.timers.reduce((acc, t) => acc + (t.duration_seconds || 0) / 3600, 0);
    
    // Unbilled revenue: unbilled entries * project rate
    let unbilledRevenue = 0;
    for (const t of this.timers) {
      if (!t.is_billed && !t.is_active) {
        const prj = this.projects.find((p) => p.id === t.project_id);
        const rate = prj?.hourly_rate || 100;
        unbilledRevenue += ((t.duration_seconds || 0) / 3600) * rate;
      }
    }

    const activeProjectsCount = this.projects.filter((p) => p.status === 'active').length;
    const outstandingInvoicesAmount = this.invoices
      .filter((i) => i.status !== 'paid')
      .reduce((acc, i) => acc + i.total_amount, 0);

    return {
      totalHoursMonth: parseFloat(totalHoursMonth.toFixed(1)),
      unbilledRevenue: parseFloat(unbilledRevenue.toFixed(2)),
      activeProjectsCount,
      outstandingInvoicesAmount: parseFloat(outstandingInvoicesAmount.toFixed(2)),
      recentEntries: this.timers.slice(0, 5),
    };
  }
}

export const mockService = new MockStorage();
