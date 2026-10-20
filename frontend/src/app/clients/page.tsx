'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Mail,
  Building,
  MapPin,
  Trash2,
  Edit2,
  X,
  Search,
} from 'lucide-react';
import { api } from '../../services/api';
import { Client } from '../../types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    hourly_rate: 150,
    currency: 'USD',
    address: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const loadClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      company: '',
      hourly_rate: 150,
      currency: 'USD',
      address: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      company: client.company || '',
      hourly_rate: client.hourly_rate,
      currency: client.currency,
      address: client.address || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Client name and email are required.');
      return;
    }

    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, formData);
      } else {
        await api.createClient(formData);
      }
      setIsModalOpen(false);
      await loadClients();
    } catch (err) {
      setFormError((err as Error).message || 'Failed to save client');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove client "${name}"?`)) {
      try {
        await api.deleteClient(id);
        await loadClients();
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            Client Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Maintain your roster of active clients, corporate billing entities, and default rates.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#131b2e] border border-[#1e293b] rounded-xl p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-emerald-400 font-bold">{filteredClients.length}</span> of{' '}
          {clients.length} total clients
        </div>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading clients...</div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-16 bg-[#131b2e] border border-dashed border-[#1e293b] rounded-xl">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No clients found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Get started by onboarding your first freelance client.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Create First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-[#131b2e] border border-[#1e293b] hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {client.name}
                    </h3>
                    {client.company && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {client.company}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ${client.hourly_rate}/h
                  </span>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-[#1e293b]/60 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-300 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.address && (
                    <div className="flex items-start gap-2 text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1e293b]/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Added {new Date(client.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(client)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Edit client"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id, client.name)}
                    className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingClient ? 'Edit Client Record' : 'Onboard New Client'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Client / Contact Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. René & Sons Global"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Billing Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="billing@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company / Entity
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Global Inc"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Default Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.hourly_rate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Billing Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                    className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Billing Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Street, City, Postal Code, Country"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1e293b]/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  {editingClient ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
