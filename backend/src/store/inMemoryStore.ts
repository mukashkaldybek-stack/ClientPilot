import { IDataStore } from './interface.js';
import {
  Client,
  ClientCreateInput,
  ClientUpdateInput,
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
  TimeEntry,
  TimerStartInput,
  Invoice,
  InvoiceGenerateInput,
  InvoiceLineItem,
} from '../types.js';
import { renderInvoiceHtml } from '../utils/sanitize.js';

export class InMemoryStore implements IDataStore {
  private clients: Client[] = [
    {
      id: 'cli_1',
      name: 'Acme Global Corp',
      email: 'billing@acmeglobal.com',
      company: 'Acme Global Inc',
      hourly_rate: 150,
      currency: 'USD',
      address: '100 Market St, San Francisco, CA',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cli_2',
      name: 'Lumina Design Studio',
      email: 'hello@luminastudio.io',
      company: 'Lumina Creative LLC',
      hourly_rate: 135,
      currency: 'USD',
      address: '450 Broadway, Suite 400, New York, NY',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  private projects: Project[] = [
    {
      id: 'prj_1',
      client_id: 'cli_1',
      client_name: 'Acme Global Corp',
      name: 'Cloud Infrastructure Migration',
      description: 'Terraform IaC and Kubernetes cluster deployment.',
      hourly_rate: 150,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prj_2',
      client_id: 'cli_2',
      client_name: 'Lumina Design Studio',
      name: 'Design System & Component Library',
      description: 'Next.js + Tailwind React component library.',
      hourly_rate: 135,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  private timers: TimeEntry[] = [
    {
      id: 'tmr_1',
      project_id: 'prj_1',
      project_name: 'Cloud Infrastructure Migration',
      description: 'Initial cloud architecture setup',
      start_time: new Date(Date.now() - 3600000 * 2).toISOString(),
      end_time: new Date(Date.now() - 3600000).toISOString(),
      duration_seconds: 3600,
      is_active: false,
      is_billed: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  private invoices: Invoice[] = [];

  // --- CLIENTS ---
  async getClients(): Promise<Client[]> {
    return [...this.clients];
  }

  async getClient(id: string): Promise<Client | null> {
    return this.clients.find((c) => c.id === id) || null;
  }

  async createClient(data: ClientCreateInput): Promise<Client> {
    const newClient: Client = {
      id: `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      email: data.email,
      company: data.company || null,
      hourly_rate: data.hourly_rate ?? 150,
      currency: data.currency || 'USD',
      address: data.address || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.clients.unshift(newClient);
    return newClient;
  }

  async updateClient(id: string, data: ClientUpdateInput): Promise<Client | null> {
    const index = this.clients.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const current = this.clients[index];
    const updated: Client = {
      ...current,
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.company !== undefined ? { company: data.company } : {}),
      ...(data.hourly_rate !== undefined ? { hourly_rate: data.hourly_rate } : {}),
      ...(data.currency !== undefined ? { currency: data.currency } : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
      updated_at: new Date().toISOString(),
    };
    this.clients[index] = updated;
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    const initialLen = this.clients.length;
    this.clients = this.clients.filter((c) => c.id !== id);
    return this.clients.length < initialLen;
  }

  // --- PROJECTS ---
  async getProjects(clientId?: string): Promise<Project[]> {
    let list = this.projects;
    if (clientId) {
      list = list.filter((p) => p.client_id === clientId);
    }
    return list.map((p) => {
      const c = this.clients.find((cli) => cli.id === p.client_id);
      return {
        ...p,
        client_name: c ? c.name : p.client_name,
      };
    });
  }

  async getProject(id: string): Promise<Project | null> {
    const prj = this.projects.find((p) => p.id === id);
    if (!prj) return null;
    const c = this.clients.find((cli) => cli.id === prj.client_id);
    return {
      ...prj,
      client_name: c ? c.name : prj.client_name,
    };
  }

  async createProject(data: ProjectCreateInput): Promise<Project> {
    const client = this.clients.find((c) => c.id === data.client_id);
    if (!client) {
      throw new Error(`Client with id '${data.client_id}' does not exist.`);
    }

    const newPrj: Project = {
      id: `prj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      client_id: data.client_id,
      client_name: client.name,
      name: data.name,
      description: data.description || null,
      hourly_rate: data.hourly_rate ?? client.hourly_rate,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.projects.unshift(newPrj);
    return newPrj;
  }

  async updateProject(id: string, data: ProjectUpdateInput): Promise<Project | null> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const current = this.projects[index];

    if (data.client_id && data.client_id !== current.client_id) {
      const client = this.clients.find((c) => c.id === data.client_id);
      if (!client) {
        throw new Error(`Client with id '${data.client_id}' does not exist.`);
      }
    }

    const updated: Project = {
      ...current,
      ...(data.client_id !== undefined ? { client_id: data.client_id } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.hourly_rate !== undefined ? { hourly_rate: data.hourly_rate } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      updated_at: new Date().toISOString(),
    };
    const c = this.clients.find((cli) => cli.id === updated.client_id);
    updated.client_name = c ? c.name : updated.client_name;
    this.projects[index] = updated;
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const initialLen = this.projects.length;
    this.projects = this.projects.filter((p) => p.id !== id);
    return this.projects.length < initialLen;
  }

  // --- TIMERS ---
  async getTimers(projectId?: string): Promise<TimeEntry[]> {
    let list = this.timers;
    if (projectId) {
      list = list.filter((t) => t.project_id === projectId);
    }
    return list.map((t) => {
      const p = this.projects.find((prj) => prj.id === t.project_id);
      return {
        ...t,
        project_name: p ? p.name : t.project_name,
      };
    });
  }

  async getActiveTimer(): Promise<TimeEntry | null> {
    const active = this.timers.find((t) => t.is_active);
    if (!active) return null;
    const p = this.projects.find((prj) => prj.id === active.project_id);
    return {
      ...active,
      project_name: p ? p.name : active.project_name,
    };
  }

  async startTimer(data: TimerStartInput): Promise<TimeEntry> {
    if (!data.project_id || typeof data.project_id !== 'string' || data.project_id.trim() === '') {
      const err = new Error('project_id is required to start a timer');
      (err as unknown as { status: number; field: string }).status = 422;
      (err as unknown as { status: number; field: string }).field = 'project_id';
      throw err;
    }

    // Stop any existing active timers
    const now = new Date();
    for (const t of this.timers) {
      if (t.is_active) {
        t.is_active = false;
        t.end_time = now.toISOString();
        t.duration_seconds = Math.max(1, Math.round((now.getTime() - new Date(t.start_time).getTime()) / 1000));
      }
    }

    const prj = this.projects.find((p) => p.id === data.project_id);
    const newTimer: TimeEntry = {
      id: `tmr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: data.project_id,
      project_name: prj ? prj.name : 'Project',
      description: data.description?.trim() || 'Focus Session',
      start_time: now.toISOString(),
      end_time: null,
      duration_seconds: 0,
      is_active: true,
      is_billed: false,
      created_at: now.toISOString(),
    };
    this.timers.unshift(newTimer);
    return newTimer;
  }

  async stopTimer(id?: string): Promise<TimeEntry | null> {
    const timer = id ? this.timers.find((t) => t.id === id) : this.timers.find((t) => t.is_active);
    if (!timer) return null;

    const now = new Date();
    timer.is_active = false;
    timer.end_time = now.toISOString();
    timer.duration_seconds = Math.max(
      1,
      Math.round((now.getTime() - new Date(timer.start_time).getTime()) / 1000)
    );
    return timer;
  }

  async deleteTimer(id: string): Promise<boolean> {
    const initialLen = this.timers.length;
    this.timers = this.timers.filter((t) => t.id !== id);
    return this.timers.length < initialLen;
  }

  // --- INVOICES ---
  async getInvoices(): Promise<Invoice[]> {
    return [...this.invoices];
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    return this.invoices.find((i) => i.id === id) || null;
  }

  async generateInvoice(data: InvoiceGenerateInput): Promise<Invoice> {
    if (!data.project_id) {
      const err = new Error('project_id is required');
      (err as unknown as { status: number }).status = 400;
      throw err;
    }

    const project = this.projects.find((p) => p.id === data.project_id);
    if (!project) {
      const err = new Error(`Project '${data.project_id}' not found`);
      (err as unknown as { status: number }).status = 404;
      throw err;
    }

    const client = this.clients.find((c) => c.id === project.client_id);
    if (!client) {
      const err = new Error(`Client '${project.client_id}' not found`);
      (err as unknown as { status: number }).status = 404;
      throw err;
    }

    // Unbilled time entries
    const unbilled = this.timers.filter(
      (t) => t.project_id === data.project_id && !t.is_billed && !t.is_active
    );

    let totalHours = 0;
    const lineItems: InvoiceLineItem[] = [];

    if (unbilled.length > 0) {
      for (const entry of unbilled) {
        const hrs = parseFloat((entry.duration_seconds / 3600).toFixed(2));
        const lineTotal = parseFloat((hrs * project.hourly_rate).toFixed(2));
        totalHours += hrs;
        lineItems.push({
          id: `li_${entry.id}`,
          description: entry.description || 'Consulting work',
          hours: Math.max(0.1, hrs),
          rate: project.hourly_rate,
          amount: Math.max(0.1 * project.hourly_rate, lineTotal),
        });
        entry.is_billed = true;
      }
    } else {
      totalHours = 1.0;
      lineItems.push({
        id: `li_${Date.now()}`,
        description: `${project.name} - Professional Consulting`,
        hours: 1.0,
        rate: project.hourly_rate,
        amount: project.hourly_rate,
      });
    }

    const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const issueDate = new Date().toISOString().split('T')[0];
    const dueDays = data.due_days || 14;
    const dueDate = new Date(Date.now() + dueDays * 86400000).toISOString().split('T')[0];

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(this.invoices.length + 1).padStart(3, '0')}`;

    const invoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invoice_number: invoiceNumber,
      project_id: project.id,
      project_name: project.name,
      client_id: client.id,
      client_name: client.name,
      client_address: client.address,
      client_email: client.email,
      issue_date: issueDate,
      due_date: dueDate,
      status: 'draft',
      total_hours: parseFloat(totalHours.toFixed(2)),
      hourly_rate: project.hourly_rate,
      total_amount: parseFloat(totalAmount.toFixed(2)),
      currency: client.currency || 'USD',
      line_items: lineItems,
      notes: data.notes || 'Payment due within 14 calendar days.',
      created_at: new Date().toISOString(),
    };

    invoice.html_preview = renderInvoiceHtml(invoice);
    this.invoices.unshift(invoice);
    return invoice;
  }

  async updateInvoiceStatus(id: string, status: 'draft' | 'sent' | 'paid'): Promise<Invoice | null> {
    const inv = this.invoices.find((i) => i.id === id);
    if (!inv) return null;
    inv.status = status;
    return inv;
  }
}
