'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  DollarSign,
  Briefcase,
  FileCheck2,
  Plus,
  Play,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardMetrics, Project, TimeEntry } from '../types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const [m, prj] = await Promise.all([
        api.getDashboardMetrics(),
        api.getProjects(),
      ]);
      setMetrics(m);
      setProjects(prj);
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleTimerChanged = () => loadData();
    window.addEventListener('clientpilot_timer_update', handleTimerChanged);
    return () => window.removeEventListener('clientpilot_timer_update', handleTimerChanged);
  }, []);

  const handleStartProjectTimer = async (projectId: string, projectName: string) => {
    try {
      await api.startTimer({
        project_id: projectId,
        description: `Deep work on ${projectName}`,
      });
      window.dispatchEvent(new CustomEvent('clientpilot_timer_update'));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = (seconds / 3600).toFixed(1);
    return `${hrs} hrs`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400">Loading ClientPilot Command Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Freelance Operations Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time tracking of unbilled work, active client retainers, and time logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#131b2e] hover:bg-[#1a243d] border border-[#1e293b] text-xs font-semibold text-slate-200 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            New Client
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#131b2e] hover:bg-[#1a243d] border border-[#1e293b] text-xs font-semibold text-slate-200 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            New Project
          </Link>
          <Link
            href="/invoices"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Generate Invoice
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Hours Logged */}
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Hours (Month)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics?.totalHoursMonth ?? 0} <span className="text-sm font-normal text-slate-400">hrs</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active billable focus</span>
          </div>
        </div>

        {/* Unbilled Revenue */}
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Unbilled Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${metrics?.unbilledRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span>Ready to convert into invoices</span>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Active Projects
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics?.activeProjectsCount ?? 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span>Ongoing deliverables</span>
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Pending Invoices
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            ${metrics?.outstandingInvoicesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span>Awaiting client payment</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Work Log (2 Cols) */}
        <div className="lg:col-span-2 bg-[#131b2e] border border-[#1e293b] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Recent Work Sessions</h2>
              <p className="text-xs text-slate-400">Tracked time entries across all active projects</p>
            </div>
            <Link
              href="/timers"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              View All Logs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#1e293b]/60">
            {metrics?.recentEntries && metrics.recentEntries.length > 0 ? (
              metrics.recentEntries.map((entry: TimeEntry) => (
                <div key={entry.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {entry.description || 'Focus Work Session'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {entry.project_name || 'Project'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(entry.start_time).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-semibold text-emerald-400">
                      {formatDuration(entry.duration_seconds)}
                    </span>
                    <span
                      className={`block text-[10px] uppercase font-bold mt-0.5 ${
                        entry.is_billed ? 'text-slate-400' : 'text-amber-400'
                      }`}
                    >
                      {entry.is_billed ? 'Billed' : 'Unbilled'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No time entries yet. Start the timer in the top bar to record work!
              </p>
            )}
          </div>
        </div>

        {/* Active Projects (1 Col) */}
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">Active Projects</h2>
                <p className="text-xs text-slate-400">Quick start timers directly</p>
              </div>
              <Link
                href="/projects"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-lg bg-[#0d1424] border border-[#1e293b] hover:border-emerald-500/30 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-slate-200 truncate group-hover:text-emerald-300 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">
                      {p.client_name || 'Client'} • ${p.hourly_rate}/h
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartProjectTimer(p.id, p.name)}
                    title="Start Timer for this project"
                    className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 flex items-center justify-center transition-all shrink-0 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1e293b]/60">
            <Link
              href="/projects"
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Create New Project
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
