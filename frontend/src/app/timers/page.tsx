'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Square,
  Trash2,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { TimeEntry, Project } from '../../types';

export default function TimersPage() {
  const [timers, setTimers] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [tList, pList, active] = await Promise.all([
        api.getTimeEntries(),
        api.getProjects(),
        api.getActiveTimer(),
      ]);
      setTimers(tList);
      setProjects(pList);
      setActiveTimer(active);
      if (pList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(pList[0].id);
      }
    } catch (err) {
      console.error('Failed to load timers', err);
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

  const handleStartTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedProjectId) {
      setErrorMsg('Please select a project before starting a timer.');
      return;
    }

    try {
      const newTimer = await api.startTimer({
        project_id: selectedProjectId,
        description: taskDescription.trim() || 'Work session',
      });
      setActiveTimer(newTimer);
      setTaskDescription('');
      window.dispatchEvent(new CustomEvent('clientpilot_timer_update'));
      await loadData();
    } catch (err) {
      setErrorMsg((err as Error).message || 'Failed to start timer');
    }
  };

  const handleStopTimer = async (id?: string) => {
    try {
      await api.stopTimer(id || activeTimer?.id);
      setActiveTimer(null);
      window.dispatchEvent(new CustomEvent('clientpilot_timer_update'));
      await loadData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this time entry?')) {
      try {
        await api.deleteTimeEntry(id);
        window.dispatchEvent(new CustomEvent('clientpilot_timer_update'));
        await loadData();
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  const formatDuration = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const filteredTimers = timers.filter((t) => {
    if (projectFilter === 'all') return true;
    return t.project_id === projectFilter;
  });

  const totalFilteredHours = (
    filteredTimers.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0) / 3600
  ).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Clock className="w-6 h-6 text-emerald-400" />
          Time Tracker
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Record focused work intervals and maintain precision time records for billing.
        </p>
      </div>

      {/* Manual Quick Action Banner */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-6 shadow-lg">
        <h2 className="text-sm font-bold text-white mb-3">Launch Work Session</h2>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleStartTimer} className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="What feature or task are you working on?"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="w-full md:flex-1 bg-[#0d1424] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
          />

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full md:w-64 bg-[#0d1424] border border-[#1e293b] rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="" disabled>
              Select Project...
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {activeTimer ? (
            <button
              type="button"
              onClick={() => handleStopTimer()}
              className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Square className="w-4 h-4 fill-current text-red-400" />
              Stop Active Timer
            </button>
          ) : (
            <button
              type="submit"
              disabled={projects.length === 0}
              className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Timer
            </button>
          )}
        </form>
      </div>

      {/* Filter & Summary Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#131b2e] border border-[#1e293b] rounded-xl p-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-[#0d1424] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-300 font-medium">
          Logged Duration:{' '}
          <span className="font-mono text-emerald-400 font-bold text-sm">
            {totalFilteredHours} hrs
          </span>{' '}
          ({filteredTimers.length} entries)
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading time entries...</div>
        ) : filteredTimers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No time entries recorded for this view. Start a timer to log billable hours.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] bg-[#0d1424]/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Task Description</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60 text-xs">
                {filteredTimers.map((timer) => (
                  <tr key={timer.id} className="hover:bg-[#1a243d]/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs truncate">
                      {timer.description || 'Focus Work'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {timer.project_name || 'Project'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(timer.start_time).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                      {timer.is_active ? (
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                          Running...
                        </span>
                      ) : (
                        formatDuration(timer.duration_seconds)
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          timer.is_billed
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {timer.is_billed ? 'Invoiced' : 'Unbilled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {timer.is_active ? (
                        <button
                          onClick={() => handleStopTimer(timer.id)}
                          className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold"
                        >
                          Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(timer.id)}
                          className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
