import { Client, Project, TimeEntry, Invoice, DashboardMetrics } from '../types';
import { mockService } from './mockService';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === 'true';

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: res.statusText }));
    const err = new Error(errorBody.message || errorBody.error || `HTTP ${res.status}`);
    (err as unknown as { status: number; body: unknown }).status = res.status;
    (err as unknown as { status: number; body: unknown }).body = errorBody;
    throw err;
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Clients
  async getClients(): Promise<Client[]> {
    if (USE_BACKEND) {
      try {
        return await fetchJson<Client[]>('/api/clients');
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.getClients();
  },

  async createClient(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    if (USE_BACKEND) {
      try {
        return await fetchJson<Client>('/api/clients', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.createClient(data);
  },

  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    if (USE_BACKEND) {
      try {
        return await fetchJson<Client>(`/api/clients/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.updateClient(id, data);
  },

  async deleteClient(id: string): Promise<boolean> {
    if (USE_BACKEND) {
      try {
        await fetchJson<{ success: boolean }>(`/api/clients/${id}`, { method: 'DELETE' });
        return true;
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.deleteClient(id);
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    if (USE_BACKEND) {
      try {
        return await fetchJson<Project[]>('/api/projects');
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.getProjects();
  },

  async createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    if (USE_BACKEND) {
      try {
        return await fetchJson<Project>('/api/projects', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.createProject(data);
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    if (USE_BACKEND) {
      try {
        return await fetchJson<Project>(`/api/projects/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.updateProject(id, data);
  },

  async deleteProject(id: string): Promise<boolean> {
    if (USE_BACKEND) {
      try {
        await fetchJson<{ success: boolean }>(`/api/projects/${id}`, { method: 'DELETE' });
        return true;
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.deleteProject(id);
  },

  // Timers
  async getTimeEntries(): Promise<TimeEntry[]> {
    if (USE_BACKEND) {
      try {
        return await fetchJson<TimeEntry[]>('/api/timers');
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.getTimeEntries();
  },

  async getActiveTimer(): Promise<TimeEntry | null> {
    if (USE_BACKEND) {
      try {
        const timers = await fetchJson<TimeEntry[]>('/api/timers');
        return timers.find((t) => t.is_active) || null;
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.getActiveTimer();
  },

  async startTimer(payload: { project_id?: string | null; description?: string }): Promise<TimeEntry> {
    if (USE_BACKEND) {
      return await fetchJson<TimeEntry>('/api/timers/start', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return mockService.startTimer(payload);
  },

  async stopTimer(id?: string): Promise<TimeEntry> {
    if (USE_BACKEND) {
      return await fetchJson<TimeEntry>('/api/timers/stop', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
    }
    return mockService.stopTimer(id);
  },

  async deleteTimeEntry(id: string): Promise<boolean> {
    if (USE_BACKEND) {
      try {
        await fetchJson<{ success: boolean }>(`/api/timers/${id}`, { method: 'DELETE' });
        return true;
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.deleteTimeEntry(id);
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    if (USE_BACKEND) {
      try {
        return await fetchJson<Invoice[]>('/api/invoices');
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.getInvoices();
  },

  async generateInvoice(payload: {
    project_id: string;
    notes?: string;
    due_days?: number;
  }): Promise<Invoice> {
    if (USE_BACKEND) {
      return await fetchJson<Invoice>('/api/invoices/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return mockService.generateInvoice(payload);
  },

  async updateInvoiceStatus(id: string, status: 'draft' | 'sent' | 'paid'): Promise<Invoice> {
    if (USE_BACKEND) {
      try {
        return await fetchJson<Invoice>(`/api/invoices/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        });
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.updateInvoiceStatus(id, status);
  },

  // Dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    if (USE_BACKEND) {
      try {
        // Can aggregate from live endpoints
        const [projects, timers, invoices] = await Promise.all([
          fetchJson<Project[]>('/api/projects'),
          fetchJson<TimeEntry[]>('/api/timers'),
          fetchJson<Invoice[]>('/api/invoices'),
        ]);

        const totalHoursMonth = timers.reduce((acc, t) => acc + (t.duration_seconds || 0) / 3600, 0);
        let unbilledRevenue = 0;
        for (const t of timers) {
          if (!t.is_billed && !t.is_active) {
            const prj = projects.find((p) => p.id === t.project_id);
            const rate = prj?.hourly_rate || 100;
            unbilledRevenue += ((t.duration_seconds || 0) / 3600) * rate;
          }
        }
        const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
        const outstandingInvoicesAmount = invoices
          .filter((i) => i.status !== 'paid')
          .reduce((acc, i) => acc + i.total_amount, 0);

        return {
          totalHoursMonth: parseFloat(totalHoursMonth.toFixed(1)),
          unbilledRevenue: parseFloat(unbilledRevenue.toFixed(2)),
          activeProjectsCount,
          outstandingInvoicesAmount: parseFloat(outstandingInvoicesAmount.toFixed(2)),
          recentEntries: timers.slice(0, 5),
        };
      } catch (e) {
        console.warn('Backend unavailable, falling back to mockService', e);
      }
    }
    return mockService.getDashboardMetrics();
  },
};
