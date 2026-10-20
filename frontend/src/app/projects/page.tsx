'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Play,
  User,
  Trash2,
  Edit2,
  X,
  Search,
} from 'lucide-react';
import { api } from '../../services/api';
import { Project, Client } from '../../types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    description: '',
    hourly_rate: 150,
    status: 'active' as 'active' | 'in_review' | 'completed',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [prjList, cliList] = await Promise.all([
        api.getProjects(),
        api.getClients(),
      ]);
      setProjects(prjList);
      setClients(cliList);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      client_id: clients.length > 0 ? clients[0].id : '',
      description: '',
      hourly_rate: clients.length > 0 ? clients[0].hourly_rate : 150,
      status: 'active',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prj: Project) => {
    setEditingProject(prj);
    setFormData({
      name: prj.name,
      client_id: prj.client_id,
      description: prj.description || '',
      hourly_rate: prj.hourly_rate,
      status: prj.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find((c) => c.id === clientId);
    setFormData((prev) => ({
      ...prev,
      client_id: clientId,
      hourly_rate: selectedClient ? selectedClient.hourly_rate : prev.hourly_rate,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Project name is required.');
      return;
    }
    if (!formData.client_id) {
      setFormError('Please select a client for this project.');
      return;
    }

    try {
      if (editingProject) {
        await api.updateProject(editingProject.id, formData);
      } else {
        await api.createProject(formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError((err as Error).message || 'Failed to save project');
    }
  };

  const handleStartTimer = async (projectId: string, projectName: string) => {
    try {
      await api.startTimer({
        project_id: projectId,
        description: `Working on ${projectName}`,
      });
      window.dispatchEvent(new CustomEvent('clientpilot_timer_update'));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete project "${name}"?`)) {
      try {
        await api.deleteProject(id);
        await loadData();
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-emerald-400" />
            Project Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track active deliverables, hourly rate agreements, and initiate time tracking.
          </p>
        </div>

        <button
          onClick={openAddModal}
          disabled={clients.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-95 shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#131b2e] border border-[#1e293b] rounded-xl p-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['all', 'active', 'in_review', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-[#0d1424] text-slate-400 hover:text-slate-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg pl-9 pr-3.5 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-[#131b2e] border border-dashed border-[#1e293b] rounded-xl">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No projects found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            {clients.length === 0
              ? 'You must onboard at least one client before creating a project.'
              : 'Create a new project to start tracking time.'}
          </p>
          {clients.length > 0 && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-[#131b2e] border border-[#1e293b] hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      project.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : project.status === 'in_review'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {project.status.replace('_', ' ')}
                  </span>

                  <span className="font-mono text-xs font-bold text-emerald-400">
                    ${project.hourly_rate}/h
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {project.name}
                </h3>

                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {project.client_name || 'Client on file'}
                </p>

                {project.description && (
                  <p className="text-xs text-slate-300 mt-3 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#1e293b]/60 flex items-center justify-between">
                <button
                  onClick={() => handleStartTimer(project.id, project.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-semibold text-xs transition-all border border-emerald-500/30"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Start Timer
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    title="Edit project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                    title="Delete project"
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
                {editingProject ? 'Edit Project' : 'Create New Project'}
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
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js SaaS MVP Development"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Associated Client *
                </label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="" disabled>
                    Select client...
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company || 'Individual'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hourly Billing Rate ($)
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
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'active' | 'in_review' | 'completed',
                      })
                    }
                    className="w-full bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="active">Active</option>
                    <option value="in_review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deliverable Scope / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Key milestones, deliverables, repository links..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
