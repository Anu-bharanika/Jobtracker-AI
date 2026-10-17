import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ExternalLink,
  Calendar,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  Sparkles,
  ChevronRight,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';
import { JobApplication, ApplicationStatus, WorkMode } from '../types/job';

interface KanbanBoardProps {
  applications: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onUpdateStatus: (jobId: string, newStatus: ApplicationStatus) => void;
  onOpenTailorModal: (job: JobApplication) => void;
  onOpenNewJobModal: () => void;
}

const COLUMNS: { id: ApplicationStatus; label: string; description: string }[] = [
  { id: 'saved', label: 'Saved / Wishlist', description: 'Bookmarked roles & pre-application research' },
  { id: 'applied', label: 'Applied', description: 'Submitted, awaiting recruiter response' },
  { id: 'interviewing', label: 'Interviewing', description: 'Screens, take-homes, and technical rounds' },
  { id: 'offered', label: 'Offered', description: 'Formal offers under review' },
  { id: 'rejected', label: 'Archived', description: 'Closed loops or declined opportunities' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onSelectJob,
  onUpdateStatus,
  onOpenTailorModal,
  onOpenNewJobModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [workModeFilter, setWorkModeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesScore = app.matchScore >= minScoreFilter;
    const matchesWorkMode = workModeFilter === 'all' || app.workMode === workModeFilter;

    return matchesSearch && matchesScore && matchesWorkMode;
  });

  const getStatusNextStage = (current: ApplicationStatus): ApplicationStatus | null => {
    switch (current) {
      case 'saved': return 'applied';
      case 'applied': return 'interviewing';
      case 'interviewing': return 'offered';
      default: return null;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company, role, or technical skill (e.g. PyTorch)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              aria-label="Filter by Match Score"
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">All Match Scores</option>
              <option value="90">90%+ Strong Match</option>
              <option value="75">75%+ Good Match</option>
              <option value="60">60%+ Baseline</option>
            </select>

            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              aria-label="Filter by Work Mode"
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
        </div>

        {/* View toggle & metrics */}
        <div className="flex items-center gap-3 justify-between lg:justify-end">
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Showing {filteredApps.length} of {applications.length} applications
          </span>

          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Fresh Pipeline Guidance Banner */}
      {applications.length === 0 && (
        <div className="p-5 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-blue-900 font-display">
              Your Application Pipeline is Ready
            </h3>
            <p className="text-xs text-blue-700 mt-0.5 max-w-xl">
              Track your first job opportunity by pasting a job URL or description. The NLP engine will parse key details and compute your semantic resume match score.
            </p>
          </div>
          <button
            onClick={onOpenNewJobModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Track Your First Job</span>
          </button>
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colApps = filteredApps.filter(app => app.status === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col bg-slate-100/70 rounded-xl p-3 border border-slate-200/80 min-h-[560px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold text-slate-800 tracking-tight">
                      {col.label}
                    </h2>
                    <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full bg-white text-slate-700 border border-slate-200 font-mono tabular-nums">
                      {colApps.length}
                    </span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="flex flex-col gap-3 flex-1">
                  {colApps.map((job) => {
                    const nextStage = getStatusNextStage(job.status);

                    return (
                      <div
                        key={job.id}
                        onClick={() => onSelectJob(job)}
                        className="group relative flex flex-col p-3.5 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer text-left"
                      >
                        {/* Header: Company & Match Score */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {job.company}
                            </h3>
                            <p className="text-xs text-slate-600 line-clamp-1 font-medium">
                              {job.title}
                            </p>
                          </div>

                          <div
                            className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-bold border font-mono tabular-nums ${getMatchScoreColor(
                              job.matchScore
                            )}`}
                            title={`Semantic match score: ${job.matchScore}%`}
                          >
                            {job.matchScore}% match
                          </div>
                        </div>

                        {/* Metadata row: location, work mode, salary */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2.5">
                          <span className="capitalize">{job.workMode}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[130px]">{job.location}</span>
                          {job.salaryRange && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-slate-600">{job.salaryRange.split(' ')[0]}</span>
                            </>
                          )}
                        </div>

                        {/* Top matched technical skills */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.requiredSkills.slice(0, 3).map((skill, idx) => {
                            const isMatched = job.matchedSkills.includes(skill);
                            return (
                              <span
                                key={idx}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  isMatched
                                    ? 'bg-slate-100 text-slate-700 font-medium'
                                    : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                                }`}
                              >
                                {skill}
                              </span>
                            );
                          })}
                          {job.requiredSkills.length > 3 && (
                            <span className="text-[10px] text-slate-400 px-1 py-0.5 font-mono">
                              +{job.requiredSkills.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Active Alerts / Interview Notes */}
                        {job.status === 'interviewing' && job.interviewRounds.length > 0 && (
                          <div className="mb-2.5 p-2 bg-blue-50/70 rounded border border-blue-100 text-[11px] text-blue-900 flex items-start gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="truncate">
                              <span className="font-semibold">
                                {job.interviewRounds.find(r => !r.completed)?.roundName || 'All rounds complete'}
                              </span>
                            </div>
                          </div>
                        )}

                        {job.status === 'applied' && job.nextFollowUpDate && (
                          <div className="mb-2.5 p-1.5 bg-amber-50/70 rounded border border-amber-200/60 text-[11px] text-amber-900 flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate font-mono">Follow-up due: {job.nextFollowUpDate}</span>
                          </div>
                        )}

                        {/* Card footer: Linked GitHub project & Stage progress button */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          {job.linkedGitHubRepo ? (
                            <span className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-mono text-[10px]">
                              <GitBranch className="w-3 h-3 text-emerald-600" />
                              <span className="truncate max-w-[90px]">
                                {job.linkedGitHubRepo.split('/').pop()}
                              </span>
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenTailorModal(job);
                              }}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Tailor Bullets</span>
                            </button>
                          )}

                          {nextStage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(job.id, nextStage);
                              }}
                              title={`Advance to ${nextStage}`}
                              className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-slate-700 bg-slate-100 hover:bg-blue-600 hover:text-white rounded transition-colors cursor-pointer"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colApps.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      <p className="text-xs">No applications</p>
                      {col.id === 'saved' && (
                        <button
                          onClick={onOpenNewJobModal}
                          className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          + Add a role
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Tabular View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Company & Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Match Score</th>
                  <th className="px-4 py-3 font-semibold">Work Mode</th>
                  <th className="px-4 py-3 font-semibold">Missing Skills</th>
                  <th className="px-4 py-3 font-semibold">Linked Project</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {filteredApps.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600">
                        {job.company}
                      </div>
                      <div className="text-slate-500 text-[11px]">{job.title}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="capitalize font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                        {job.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${getMatchScoreColor(
                          job.matchScore
                        )}`}
                      >
                        {job.matchScore}%
                      </span>
                    </td>

                    <td className="px-4 py-3 capitalize text-slate-600">
                      {job.workMode} · {job.location}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {job.missingSkills.length === 0 ? (
                          <span className="text-emerald-700 font-medium">Full Match</span>
                        ) : (
                          job.missingSkills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-mono"
                            >
                              {skill}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-600">
                      {job.linkedGitHubRepo ? (
                        <span className="text-blue-600">{job.linkedGitHubRepo.split('/').pop()}</span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTailorModal(job);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      >
                        Tailor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
