import { PrismaClient } from '@prisma/client';
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

export class PrismaStore implements IDataStore {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  // --- CLIENTS ---
  async getClients(businessId?: string): Promise<Client[]> {
    const list = await this.prisma.client.findMany({
      where: businessId ? { businessId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return list.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      company: c.company,
      hourly_rate: c.hourlyRate,
      currency: c.currency,
      address: c.address,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    }));
  }

  async getClient(id: string, businessId?: string): Promise<Client | null> {
    const c = await this.prisma.client.findFirst({
      where: {
        id,
        ...(businessId ? { businessId } : {}),
      },
    });
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      company: c.company,
      hourly_rate: c.hourlyRate,
      currency: c.currency,
      address: c.address,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    };
  }

  async createClient(data: ClientCreateInput, businessId?: string): Promise<Client> {
    const c = await this.prisma.client.create({
      data: {
        businessId: businessId || 'default-biz',
        name: data.name,
        email: data.email,
        company: data.company || null,
        hourlyRate: data.hourly_rate ?? 150.0,
        currency: data.currency || 'USD',
        address: data.address || null,
      },
    });
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      company: c.company,
      hourly_rate: c.hourlyRate,
      currency: c.currency,
      address: c.address,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    };
  }

  async updateClient(id: string, data: ClientUpdateInput, businessId?: string): Promise<Client | null> {
    try {
      const existing = await this.prisma.client.findFirst({
        where: { id, ...(businessId ? { businessId } : {}) },
      });
      if (!existing) return null;

      const c = await this.prisma.client.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          company: data.company,
          hourlyRate: data.hourly_rate,
          currency: data.currency,
          address: data.address,
        },
      });
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        company: c.company,
        hourly_rate: c.hourlyRate,
        currency: c.currency,
        address: c.address,
        created_at: c.createdAt.toISOString(),
        updated_at: c.updatedAt.toISOString(),
      };
    } catch {
      return null;
    }
  }

  async deleteClient(id: string, businessId?: string): Promise<boolean> {
    try {
      const existing = await this.prisma.client.findFirst({
        where: { id, ...(businessId ? { businessId } : {}) },
      });
      if (!existing) return false;

      await this.prisma.client.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // --- PROJECTS ---
  async getProjects(clientId?: string, businessId?: string): Promise<Project[]> {
    const list = await this.prisma.project.findMany({
      where: {
        ...(clientId ? { clientId } : {}),
        ...(businessId ? { businessId } : {}),
      },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((p) => ({
      id: p.id,
      client_id: p.clientId,
      client_name: p.client.name,
      name: p.name,
      description: p.description,
      hourly_rate: p.hourlyRate,
      status: p.status as 'active' | 'in_review' | 'completed',
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    }));
  }

  async getProject(id: string, businessId?: string): Promise<Project | null> {
    const p = await this.prisma.project.findFirst({
      where: {
        id,
        ...(businessId ? { businessId } : {}),
      },
      include: { client: true },
    });
    if (!p) return null;
    return {
      id: p.id,
      client_id: p.clientId,
      client_name: p.client.name,
      name: p.name,
      description: p.description,
      hourly_rate: p.hourlyRate,
      status: p.status as 'active' | 'in_review' | 'completed',
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    };
  }

  async createProject(data: ProjectCreateInput, businessId?: string): Promise<Project> {
    const client = await this.prisma.client.findFirst({
      where: {
        id: data.client_id,
        ...(businessId ? { businessId } : {}),
      },
    });
    if (!client) {
      throw new Error(`Client with id '${data.client_id}' does not exist.`);
    }

    const p = await this.prisma.project.create({
      data: {
        businessId: businessId || 'default-biz',
        clientId: data.client_id,
        name: data.name,
        description: data.description || null,
        hourlyRate: data.hourly_rate ?? client.hourlyRate,
        status: data.status || 'active',
      },
      include: { client: true },
    });

    return {
      id: p.id,
      client_id: p.clientId,
      client_name: p.client.name,
      name: p.name,
      description: p.description,
      hourly_rate: p.hourlyRate,
      status: p.status as 'active' | 'in_review' | 'completed',
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    };
  }

  async updateProject(id: string, data: ProjectUpdateInput, businessId?: string): Promise<Project | null> {
    try {
      const existing = await this.prisma.project.findFirst({
        where: { id, ...(businessId ? { businessId } : {}) },
      });
      if (!existing) return null;

      if (data.client_id) {
        const client = await this.prisma.client.findFirst({
          where: { id: data.client_id, ...(businessId ? { businessId } : {}) },
        });
        if (!client) {
          throw new Error(`Client with id '${data.client_id}' does not exist.`);
        }
      }

      const p = await this.prisma.project.update({
        where: { id },
        data: {
          clientId: data.client_id,
          name: data.name,
          description: data.description,
          hourlyRate: data.hourly_rate,
          status: data.status,
        },
        include: { client: true },
      });

      return {
        id: p.id,
        client_id: p.clientId,
        client_name: p.client.name,
        name: p.name,
        description: p.description,
        hourly_rate: p.hourlyRate,
        status: p.status as 'active' | 'in_review' | 'completed',
        created_at: p.createdAt.toISOString(),
        updated_at: p.updatedAt.toISOString(),
      };
    } catch {
      return null;
    }
  }

  async deleteProject(id: string, businessId?: string): Promise<boolean> {
    try {
      const existing = await this.prisma.project.findFirst({
        where: { id, ...(businessId ? { businessId } : {}) },
      });
      if (!existing) return false;

      await this.prisma.project.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // --- TIMERS ---
  async getTimers(projectId?: string, businessId?: string): Promise<TimeEntry[]> {
    const list = await this.prisma.timeEntry.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(businessId ? { businessId } : {}),
      },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((t) => ({
      id: t.id,
      project_id: t.projectId,
      project_name: t.project.name,
      description: t.description,
      start_time: t.startTime.toISOString(),
      end_time: t.endTime ? t.endTime.toISOString() : null,
      duration_seconds: t.durationSeconds,
      is_active: t.isActive,
      is_billed: t.isBilled,
      created_at: t.createdAt.toISOString(),
    }));
  }

  async getActiveTimer(businessId?: string): Promise<TimeEntry | null> {
    const t = await this.prisma.timeEntry.findFirst({
      where: {
        isActive: true,
        ...(businessId ? { businessId } : {}),
      },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!t) return null;
    return {
      id: t.id,
      project_id: t.projectId,
      project_name: t.project.name,
      description: t.description,
      start_time: t.startTime.toISOString(),
      end_time: t.endTime ? t.endTime.toISOString() : null,
      duration_seconds: t.durationSeconds,
      is_active: t.isActive,
      is_billed: t.isBilled,
      created_at: t.createdAt.toISOString(),
    };
  }

  async startTimer(data: TimerStartInput, businessId?: string): Promise<TimeEntry> {
    if (!data.project_id || typeof data.project_id !== 'string' || data.project_id.trim() === '') {
      const err = new Error('project_id is required to start a timer');
      (err as unknown as { status: number; field: string }).status = 422;
      (err as unknown as { status: number; field: string }).field = 'project_id';
      throw err;
    }

    const prj = await this.prisma.project.findFirst({
      where: { id: data.project_id, ...(businessId ? { businessId } : {}) },
    });
    if (!prj) {
      const err = new Error(`Project '${data.project_id}' not found`);
      (err as unknown as { status: number }).status = 404;
      throw err;
    }

    const activeTimers = await this.prisma.timeEntry.findMany({
      where: { isActive: true, ...(businessId ? { businessId } : {}) },
    });
    const now = new Date();
    for (const active of activeTimers) {
      const duration = Math.max(1, Math.round((now.getTime() - active.startTime.getTime()) / 1000));
      await this.prisma.timeEntry.update({
        where: { id: active.id },
        data: {
          isActive: false,
          endTime: now,
          durationSeconds: duration,
        },
      });
    }

    const newTimer = await this.prisma.timeEntry.create({
      data: {
        businessId: businessId || 'default-biz',
        projectId: data.project_id.trim(),
        description: data.description?.trim() || 'Focus Session',
        startTime: now,
        isActive: true,
        isBilled: false,
        durationSeconds: 0,
      },
      include: { project: true },
    });

    return {
      id: newTimer.id,
      project_id: newTimer.projectId,
      project_name: newTimer.project.name,
      description: newTimer.description,
      start_time: newTimer.startTime.toISOString(),
      end_time: null,
      duration_seconds: 0,
      is_active: true,
      is_billed: false,
      created_at: newTimer.createdAt.toISOString(),
    };
  }

  async stopTimer(id?: string, businessId?: string): Promise<TimeEntry | null> {
    const target = id
      ? await this.prisma.timeEntry.findFirst({ where: { id, ...(businessId ? { businessId } : {}) }, include: { project: true } })
      : await this.prisma.timeEntry.findFirst({
          where: { isActive: true, ...(businessId ? { businessId } : {}) },
          include: { project: true },
          orderBy: { createdAt: 'desc' },
        });

    if (!target) return null;

    const now = new Date();
    const duration = Math.max(1, Math.round((now.getTime() - target.startTime.getTime()) / 1000));

    const updated = await this.prisma.timeEntry.update({
      where: { id: target.id },
      data: {
        isActive: false,
        endTime: now,
        durationSeconds: duration,
      },
      include: { project: true },
    });

    return {
      id: updated.id,
      project_id: updated.projectId,
      project_name: updated.project.name,
      description: updated.description,
      start_time: updated.startTime.toISOString(),
      end_time: updated.endTime ? updated.endTime.toISOString() : null,
      duration_seconds: updated.durationSeconds,
      is_active: false,
      is_billed: updated.isBilled,
      created_at: updated.createdAt.toISOString(),
    };
  }

  async deleteTimer(id: string, businessId?: string): Promise<boolean> {
    try {
      const existing = await this.prisma.timeEntry.findFirst({
        where: { id, ...(businessId ? { businessId } : {}) },
      });
      if (!existing) return false;

      await this.prisma.timeEntry.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // --- INVOICES ---
  async getInvoices(businessId?: string): Promise<Invoice[]> {
    const list = await this.prisma.invoice.findMany({
      where: businessId ? { businessId } : undefined,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((i) => {
      let lineItems: InvoiceLineItem[] = [];
      try {
        lineItems = JSON.parse(i.lineItemsJson);
      } catch {
        lineItems = [];
      }

      const inv: Invoice = {
        id: i.id,
        invoice_number: i.invoiceNumber,
        project_id: i.projectId,
        project_name: i.project.name,
        client_id: i.clientId,
        client_name: i.clientName,
        client_address: i.clientAddress,
        client_email: i.clientEmail,
        issue_date: i.issueDate,
        due_date: i.dueDate,
        status: i.status as 'draft' | 'sent' | 'paid',
        total_hours: i.totalHours,
        hourly_rate: i.hourlyRate,
        total_amount: i.totalAmount,
        currency: i.currency,
        line_items: lineItems,
        notes: i.notes,
        created_at: i.createdAt.toISOString(),
      };
      inv.html_preview = renderInvoiceHtml(inv);
      return inv;
    });
  }

  async getInvoice(id: string, businessId?: string): Promise<Invoice | null> {
    const i = await this.prisma.invoice.findFirst({
      where: { id, ...(businessId ? { businessId } : {}) },
      include: { project: true },
    });
    if (!i) return null;

    let lineItems: InvoiceLineItem[] = [];
    try {
      lineItems = JSON.parse(i.lineItemsJson);
    } catch {
      lineItems = [];
    }

    const inv: Invoice = {
      id: i.id,
      invoice_number: i.invoiceNumber,
      project_id: i.projectId,
      project_name: i.project.name,
      client_id: i.clientId,
      client_name: i.clientName,
      client_address: i.clientAddress,
      client_email: i.clientEmail,
      issue_date: i.issueDate,
      due_date: i.dueDate,
      status: i.status as 'draft' | 'sent' | 'paid',
      total_hours: i.totalHours,
      hourly_rate: i.hourlyRate,
      total_amount: i.totalAmount,
      currency: i.currency,
      line_items: lineItems,
      notes: i.notes,
      created_at: i.createdAt.toISOString(),
    };
    inv.html_preview = renderInvoiceHtml(inv);
    return inv;
  }

  async generateInvoice(data: InvoiceGenerateInput, businessId?: string): Promise<Invoice> {
    if (!data.project_id) {
      const err = new Error('project_id is required');
      (err as unknown as { status: number }).status = 400;
      throw err;
    }

    const project = await this.prisma.project.findFirst({
      where: { id: data.project_id, ...(businessId ? { businessId } : {}) },
      include: { client: true },
    });
    if (!project) {
      const err = new Error(`Project '${data.project_id}' not found`);
      (err as unknown as { status: number }).status = 404;
      throw err;
    }

    const client = project.client;

    const unbilled = await this.prisma.timeEntry.findMany({
      where: {
        projectId: project.id,
        isBilled: false,
        isActive: false,
        ...(businessId ? { businessId } : {}),
      },
    });

    let totalHours = 0;
    const lineItems: InvoiceLineItem[] = [];

    if (unbilled.length > 0) {
      for (const entry of unbilled) {
        const hrs = parseFloat((entry.durationSeconds / 3600).toFixed(2));
        const lineTotal = parseFloat((hrs * project.hourlyRate).toFixed(2));
        totalHours += hrs;
        lineItems.push({
          id: `li_${entry.id}`,
          description: entry.description || 'Consulting work',
          hours: Math.max(0.1, hrs),
          rate: project.hourlyRate,
          amount: Math.max(0.1 * project.hourlyRate, lineTotal),
        });

        await this.prisma.timeEntry.update({
          where: { id: entry.id },
          data: { isBilled: true },
        });
      }
    } else {
      totalHours = 1.0;
      lineItems.push({
        id: `li_${Date.now()}`,
        description: `${project.name} - Professional Consulting`,
        hours: 1.0,
        rate: project.hourlyRate,
        amount: project.hourlyRate,
      });
    }

    const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const count = await this.prisma.invoice.count({
      where: businessId ? { businessId } : undefined,
    });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const issueDate = new Date().toISOString().split('T')[0];
    const dueDays = data.due_days || 14;
    const dueDate = new Date(Date.now() + dueDays * 86400000).toISOString().split('T')[0];

    const saved = await this.prisma.invoice.create({
      data: {
        businessId: businessId || 'default-biz',
        invoiceNumber,
        projectId: project.id,
        clientId: client.id,
        clientName: client.name,
        clientAddress: client.address,
        clientEmail: client.email,
        issueDate,
        dueDate,
        status: 'draft',
        totalHours: parseFloat(totalHours.toFixed(2)),
        hourlyRate: project.hourlyRate,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        currency: client.currency || 'USD',
        lineItemsJson: JSON.stringify(lineItems),
        notes: data.notes || 'Payment due within 14 calendar days.',
      },
      include: { project: true },
    });

    const invoice: Invoice = {
      id: saved.id,
      invoice_number: saved.invoiceNumber,
      project_id: saved.projectId,
      project_name: project.name,
      client_id: client.id,
      client_name: saved.clientName,
      client_address: saved.clientAddress,
      client_email: saved.clientEmail,
      issue_date: saved.issueDate,
      due_date: saved.dueDate,
      status: saved.status as 'draft' | 'sent' | 'paid',
      total_hours: saved.totalHours,
      hourly_rate: saved.hourlyRate,
      total_amount: saved.totalAmount,
      currency: saved.currency,
      line_items: lineItems,
      notes: saved.notes,
      created_at: saved.createdAt.toISOString(),
    };

    invoice.html_preview = renderInvoiceHtml(invoice);
    return invoice;
  }

  async updateInvoiceStatus(id: string, status: 'draft' | 'sent' | 'paid', businessId?: string): Promise<Invoice | null> {
    try {
      const existing = await this.prisma.invoice.findFirst({
        where: { id, ...(businessId ? { businessId } : {}) },
      });
      if (!existing) return null;

      const saved = await this.prisma.invoice.update({
        where: { id },
        data: { status },
        include: { project: true },
      });
      return this.getInvoice(saved.id, businessId);
    } catch {
      return null;
    }
  }
}
