'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Square, Clock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { TimeEntry, Project } from '../types';

export function ActiveTimerBar() {
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadActiveTimerAndProjects = useCallback(async () => {
    try {
      const [timer, prjList] = await Promise.all([
        api.getActiveTimer(),
        api.getProjects(),
      ]);
      setActiveTimer(timer);
      setProjects(prjList);
      if (prjList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(prjList[0].id);
      }
      if (timer) {
        const startMs = new Date(timer.start_time).getTime();
        const nowMs = Date.now();
        setElapsedSeconds(Math.max(0, Math.floor((nowMs - startMs) / 1000)));
      }
    } catch {
      // ignore
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadActiveTimerAndProjects();
    const interval = setInterval(() => {
      loadActiveTimerAndProjects();
    }, 5000);

    const handleTimerChanged = () => loadActiveTimerAndProjects();
    window.addEventListener('clientpilot_timer_update', handleTimerChanged);

    return () => {
      clearInterval(interval);
      window.removeEventListener('clientpilot_timer_update', handleTimerChanged);
    };
  }, [loadActiveTimerAndProjects]);

  // Real-time second counter
  useEffect(() => {
    if (!activeTimer) {
      setElapsedSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      const startMs = new Date(activeTimer.start_time).getTime();
      const nowMs = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((nowMs - startMs) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTimer]);

  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleStartTimer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!selectedProjectId) {
      setErrorMsg('Please select a project to start the timer.');
      return;
    }

    setLoading(true);
    try {
      const newTimer = await api.startTimer({
        project_id: selectedProjectId,
        description: taskDescription.trim() || 'Work session',
      });
      setActiveTimer(newTimer);
      setTaskDescription('');
      window.dispatchEvent(new CustomEvent('clientpilot_timer_update'));
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Failed to start timer';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStopTimer = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.stopTimer(activeTimer?.id);
      setActiveTimer(null);
      setElapsedSeconds(0);
      window.dispatchEvent(new CustomEvent('clientpilot_timer_update'));
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to stop timer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0d1424]/90 backdrop-blur-md border-b border-[#1e293b] px-6 py-3.5 flex items-center justify-between">
      {activeTimer ? (
        // Active Running State
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeTimer.project_name || 'Active Project'}
                </span>
                <span className="text-sm font-medium text-slate-200">
                  {activeTimer.description}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 font-mono text-xl font-bold tracking-wider text-emerald-400 bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-emerald-500/30 shadow-inner">
              <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
              {formatTime(elapsedSeconds)}
            </div>

            <button
              onClick={handleStopTimer}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 font-medium text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Square className="w-4 h-4 fill-current text-red-400" />
              Stop Timer
            </button>
          </div>
        </div>
      ) : (
        // Idle Quick-Start Bar
        <form onSubmit={handleStartTimer} className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <input
              type="text"
              placeholder="What are you working on right now? (e.g. API endpoint optimization)"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="bg-[#131b2e] border border-[#1e293b] rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 flex-1"
            />

            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#131b2e] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 min-w-[200px]"
            >
              <option value="" disabled>
                Select Project...
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.hourly_rate}/h)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {errorMsg && (
              <span className="text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </span>
            )}

            <button
              type="submit"
              disabled={loading || projects.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Timer
            </button>
          </div>
        </form>
      )}
    </header>
  );
}
