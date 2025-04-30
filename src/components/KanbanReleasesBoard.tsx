import React, { useMemo, useState } from 'react';
import { storage } from '../lib/storage';
import { CertificationRequest, CertificationStage } from '../types';

const STAGE_LABELS: { [key in CertificationStage]: string } = {
  FORECAST: 'Forecast',
  PLANNING: 'Planning',
  SUBMITTED: 'Submitted',
  SUBMISSION_REVIEW: 'Submission Review',
  DEVICE_ENTRY: 'Device Entry',
  DEVICE_TESTING: 'Device Testing',
  TAQ_REVIEW: 'TAQ Review',
  TA_COMPLETE: 'TA Complete',
  CLOSED: 'Closed',
};

const STAGE_ORDER: CertificationStage[] = [
  'FORECAST',
  'PLANNING',
  'SUBMITTED',
  'SUBMISSION_REVIEW',
  'DEVICE_ENTRY',
  'DEVICE_TESTING',
  'TAQ_REVIEW',
  'TA_COMPLETE',
  'CLOSED',
];

export const KanbanReleasesBoard: React.FC = () => {
  // Retrieve releases from localStorage using storage lib
  const releases = useMemo<CertificationRequest[]>(() => storage.getCertifications(), []);

  // Quick filter state
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'MINE' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [timeLimit, setTimeLimit] = useState<'ALL' | '7' | '30' | '90'>('ALL');

  // Filtering logic
  const filteredReleases = useMemo(() => {
    let filtered = [...releases];
    if (quickFilter === 'MINE') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      filtered = filtered.filter(r => r.assignee && user?.name && r.assignee.includes(user.name));
    } else if (quickFilter === 'UPCOMING') {
      filtered = filtered.filter(r => {
        if (!r.targetDate) return false;
        const due = new Date(r.targetDate);
        return due > new Date();
      });
    } else if (quickFilter === 'COMPLETED') {
      filtered = filtered.filter(r => r.status === 'CLOSED');
    }
    if (timeLimit !== 'ALL') {
      const now = new Date();
      filtered = filtered.filter(r => {
        if (!r.targetDate) return false;
        const due = new Date(r.targetDate);
        const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= parseInt(timeLimit);
      });
    }
    return filtered;
  }, [releases, quickFilter, timeLimit]);

  // Group filtered releases by stage
  const grouped = useMemo(() => {
    const result: { [key in CertificationStage]: CertificationRequest[] } = {
      FORECAST: [],
      PLANNING: [],
      SUBMITTED: [],
      SUBMISSION_REVIEW: [],
      DEVICE_ENTRY: [],
      DEVICE_TESTING: [],
      TAQ_REVIEW: [],
      TA_COMPLETE: [],
      CLOSED: [],
    };
    filteredReleases.forEach(rel => {
      result[rel.status].push(rel);
    });
    return result;
  }, [filteredReleases]);

  return (
    <div className="p-8 bg-gradient-to-tr from-blue-50 to-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-blue-900 drop-shadow">Releases</h1>
      {/* Quick Filters and Time Limit */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex gap-2">
          {[
            { key: 'ALL', label: 'All' },
            { key: 'MINE', label: 'My Releases' },
            { key: 'UPCOMING', label: 'Upcoming' },
            { key: 'COMPLETED', label: 'Completed' },
          ].map(f => (
            <button
              key={f.key}
              className={`px-4 py-1 rounded-full border text-xs font-semibold shadow-sm transition-all duration-150 ${quickFilter === f.key ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
              onClick={() => setQuickFilter(f.key as any)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-blue-900 font-medium">Time Limit:</label>
          <select
            value={timeLimit}
            onChange={e => setTimeLimit(e.target.value as any)}
            className="px-2 py-1 rounded border border-blue-300 text-xs bg-white text-blue-900 focus:ring-blue-400 focus:border-blue-400"
          >
            <option value="ALL">Any Time</option>
            <option value="7">Next 7 days</option>
            <option value="30">Next 30 days</option>
            <option value="90">Next 90 days</option>
          </select>
        </div>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4" style={{ height: '70vh' }}>
        {STAGE_ORDER.map(stage => (
          <div
            key={stage}
            className="flex-1 min-w-[300px] max-w-xs bg-white rounded-2xl shadow-lg border-t-4 border-blue-200 hover:border-blue-400 transition-all duration-300 p-4 flex flex-col"
          >
            <div className="font-bold text-lg mb-3 text-blue-700 tracking-wide flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
              {STAGE_LABELS[stage]}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto min-h-[40px]">
              {grouped[stage].length === 0 && (
                <div className="text-gray-300 text-xs text-center py-8 italic">No releases</div>
              )}
              {grouped[stage].map(release => (
                <div
                  key={release.id}
                  className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow border border-blue-100 hover:shadow-xl hover:scale-[1.03] transition cursor-pointer p-4 group"
                  title={release.projectName}
                >
                  <div className="font-bold text-blue-900 truncate text-base group-hover:text-blue-700 transition">
                    {release.projectName}
                  </div>
                  <div className="flex items-center justify-between mt-2 mb-1">
                    <span className="text-xs text-blue-500 font-semibold bg-blue-100 rounded px-2 py-0.5">
                      {release.type}
                    </span>
                    <span className="text-xs text-gray-500">{release.targetDate}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                      {release.assignee ? release.assignee[0] : '?'}
                    </span>
                    <span className="text-xs text-gray-600 truncate max-w-[120px]">
                      {release.assignee || 'Unassigned'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanReleasesBoard;
