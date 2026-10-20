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
} from '../types.js';

export interface IDataStore {
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | null>;
  createClient(data: ClientCreateInput): Promise<Client>;
  updateClient(id: string, data: ClientUpdateInput): Promise<Client | null>;
  deleteClient(id: string): Promise<boolean>;

  // Projects
  getProjects(clientId?: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(data: ProjectCreateInput): Promise<Project>;
  updateProject(id: string, data: ProjectUpdateInput): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;

  // Timers
  getTimers(projectId?: string): Promise<TimeEntry[]>;
  getActiveTimer(): Promise<TimeEntry | null>;
  startTimer(data: TimerStartInput): Promise<TimeEntry>;
  stopTimer(id?: string): Promise<TimeEntry | null>;
  deleteTimer(id: string): Promise<boolean>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | null>;
  generateInvoice(data: InvoiceGenerateInput): Promise<Invoice>;
  updateInvoiceStatus(id: string, status: 'draft' | 'sent' | 'paid'): Promise<Invoice | null>;
}
