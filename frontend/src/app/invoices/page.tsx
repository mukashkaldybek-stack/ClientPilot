'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Printer,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { Invoice, Project } from '../../types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);

  // Generate Form state
  const [generateData, setGenerateData] = useState({
    project_id: '',
    notes: 'Payment is due within 14 calendar days via Wire Transfer or Stripe.',
    due_days: 14,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [invList, prjList] = await Promise.all([
        api.getInvoices(),
        api.getProjects(),
      ]);
      setInvoices(invList);
      setProjects(prjList);
      if (prjList.length > 0 && !generateData.project_id) {
        setGenerateData((prev) => ({ ...prev, project_id: prjList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!generateData.project_id) {
      setFormError('Please select a project to invoice.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newInvoice = await api.generateInvoice(generateData);
      setIsGenerateModalOpen(false);
      await loadData();
      setSelectedInvoice(newInvoice);
    } catch (err) {
      setFormError((err as Error).message || 'Failed to generate invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'draft' | 'sent' | 'paid') => {
    try {
      const updated = await api.updateInvoiceStatus(id, status);
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(updated);
      }
      await loadData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            Invoicing & Billing
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Convert tracked work sessions into client-ready invoices with itemized hours.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsGenerateModalOpen(true);
          }}
          disabled={projects.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-95 shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </button>
      </div>

      {/* Invoices List */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200">No invoices yet</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Click &quot;Generate Invoice&quot; to aggregate unbilled time entries into an invoice.
            </p>
            {projects.length > 0 && (
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Generate First Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] bg-[#0d1424]/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60 text-xs">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#1a243d]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {inv.client_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {inv.project_name || 'Project'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{inv.issue_date}</td>
                    <td className="py-3.5 px-4 text-slate-400">{inv.due_date}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                      ${inv.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : inv.status === 'sent'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                      >
                        View & Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Invoice Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Generate New Invoice
              </h2>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Project *
                </label>
                <select
                  required
                  value={generateData.project_id}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, project_id: e.target.value })
                  }
                  className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="" disabled>
                    Select project...
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.client_name || 'Client'}) • ${p.hourly_rate}/h
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  All unbilled time entries logged for this project will be converted into invoice items.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Due Window (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={generateData.due_days}
                  onChange={(e) =>
                    setGenerateData({
                      ...generateData,
                      due_days: parseInt(e.target.value, 10) || 14,
                    })
                  }
                  className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Terms / Wire Instructions
                </label>
                <textarea
                  rows={3}
                  value={generateData.notes}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, notes: e.target.value })
                  }
                  className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1e293b]/60">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Calculating...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printable Preview Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            {/* Action Bar */}
            <div className="px-6 py-4 bg-[#0d1424] border-b border-[#1e293b] flex items-center justify-between print:hidden">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-white">
                  {selectedInvoice.invoice_number}
                </span>
                <select
                  value={selectedInvoice.status}
                  onChange={(e) =>
                    handleUpdateStatus(
                      selectedInvoice.id,
                      e.target.value as 'draft' | 'sent' | 'paid'
                    )
                  }
                  className="bg-[#131b2e] border border-[#1e293b] rounded px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none"
                >
                  <option value="draft">Status: Draft</option>
                  <option value="sent">Status: Sent</option>
                  <option value="paid">Status: Paid</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body (Printable) */}
            <div className="p-8 sm:p-12 space-y-8 bg-white text-slate-900 rounded-b-2xl print:m-0 print:p-0">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    CLIENTPILOT
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Independent Freelance Consulting</p>
                  <p className="text-xs text-slate-500 mt-1">tax-id: CP-US-998124</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block">
                    Invoice
                  </span>
                  <span className="text-xl font-mono font-bold text-slate-900 block mt-0.5">
                    {selectedInvoice.invoice_number}
                  </span>
                  <span
                    className={`inline-block mt-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      selectedInvoice.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedInvoice.status === 'sent'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              {/* Addresses and Dates */}
              <div className="grid grid-cols-2 gap-8 text-xs">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
                    Billed To:
                  </h4>
                  <p className="font-bold text-slate-900 text-sm">{selectedInvoice.client_name}</p>
                  {selectedInvoice.client_address && (
                    <p className="text-slate-600 mt-1 whitespace-pre-line">
                      {selectedInvoice.client_address}
                    </p>
                  )}
                  {selectedInvoice.client_email && (
                    <p className="text-slate-600 mt-1">{selectedInvoice.client_email}</p>
                  )}
                </div>

                <div className="text-right space-y-1.5">
                  <div>
                    <span className="text-slate-500">Project: </span>
                    <span className="font-semibold text-slate-800">
                      {selectedInvoice.project_name || 'Consulting'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Issue Date: </span>
                    <span className="font-mono text-slate-800">{selectedInvoice.issue_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Payment Due: </span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedInvoice.due_date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 text-center">Hours</th>
                      <th className="py-2.5 px-4 text-right">Rate</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.line_items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-3 px-4 text-slate-800 font-medium">{item.description}</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600">
                          {item.hours}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">
                          ${item.rate.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                          ${item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Hours:</span>
                    <span className="font-mono">{selectedInvoice.total_hours} hrs</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Hourly Rate:</span>
                    <span className="font-mono">${selectedInvoice.hourly_rate.toFixed(2)}/hr</span>
                  </div>
                  <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-base text-slate-900">
                    <span>Total Due ({selectedInvoice.currency}):</span>
                    <span className="font-mono text-emerald-600">
                      ${selectedInvoice.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              {selectedInvoice.notes && (
                <div className="border-t border-slate-200 pt-6 text-xs text-slate-500">
                  <h5 className="font-bold uppercase tracking-wider text-[10px] text-slate-400 mb-1">
                    Notes & Payment Terms:
                  </h5>
                  <p>{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
