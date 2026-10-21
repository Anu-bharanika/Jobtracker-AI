import React, { useState } from 'react';
import {
  Search,
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
  Plus,
  Table as TableIcon
} from 'lucide-react';
import { JobApplication, ApplicationStatus, WorkMode } from '../types/job';

interface KanbanBoardProps {
  applications: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onUpdateStatus: (jobId: string, newStatus: ApplicationStatus) => void;
  onOpenTailorModal: (job: JobApplication) => void;
  onOpenNewJobModal: () => void;
}

interface ColumnConfig {
  id: ApplicationStatus;
  label: string;
  description: string;
  topAccent: string;
  badgeBg: string;
  colBg: string;
  dotColor: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'saved',
    label: 'Saved & Target',
    description: 'Bookmarked roles & pre-application research',
    topAccent: 'border-t-4 border-t-cyan-500',
    badgeBg: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-2xs',
    colBg: 'bg-gradient-to-b from-cyan-50/50 via-slate-50/60 to-white',
    dotColor: 'bg-cyan-500'
  },
  {
    id: 'applied',
    label: 'Applied',
    description: 'Submitted, awaiting recruiter response',
    topAccent: 'border-t-4 border-t-amber-500',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs',
    colBg: 'bg-gradient-to-b from-amber-50/50 via-slate-50/60 to-white',
    dotColor: 'bg-amber-500'
  },
  {
    id: 'interviewing',
    label: 'Interviewing',
    description: 'Screens, take-homes, and technical rounds',
    topAccent: 'border-t-4 border-t-purple-600',
    badgeBg: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-2xs',
    colBg: 'bg-gradient-to-b from-purple-50/50 via-slate-50/60 to-white',
    dotColor: 'bg-purple-600'
  },
  {
    id: 'offered',
    label: 'Offer Received',
    description: 'Formal offers under evaluation',
    topAccent: 'border-t-4 border-t-emerald-500',
    badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-2xs',
    colBg: 'bg-gradient-to-b from-emerald-50/50 via-slate-50/60 to-white',
    dotColor: 'bg-emerald-500'
  },
  {
    id: 'rejected',
    label: 'Archived',
    description: 'Closed loops or declined opportunities',
    topAccent: 'border-t-4 border-t-rose-400',
    badgeBg: 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-2xs',
    colBg: 'bg-gradient-to-b from-rose-50/40 via-slate-50/60 to-white',
    dotColor: 'bg-rose-400'
  }
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
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesScore = app.matchScore >= minScoreFilter;
    const matchesWorkMode = workModeFilter === 'all' || app.workMode === workModeFilter;

    return matchesSearch && matchesScore && matchesWorkMode;
  });

  const getStatusNextStage = (current: ApplicationStatus): ApplicationStatus | null => {
    switch (current) {
      case 'saved':
        return 'applied';
      case 'applied':
        return 'interviewing';
      case 'interviewing':
        return 'offered';
      default:
        return null;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs shadow-emerald-500/25';
    if (score >= 75) return 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs shadow-indigo-500/25';
    return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs shadow-amber-500/25';
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Filter Toolbar - Strict DOM hierarchy matching selectors */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 sm:p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-sm">
        {/* Child 1: The flex container for search and selects */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 w-full flex-1 min-w-0 flex-nowrap">
          {/* div:nth-of-type(1) - Widened Search Box */}
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
            <input
              type="text"
              placeholder="Search by role, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-9 pr-2.5 sm:pr-4 py-1.5 sm:py-2 text-[11px] sm:text-xs bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* div:nth-of-type(2) - Compact Selects Wrapper */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* select:nth-of-type(1) - All Match Scores (Made smaller) */}
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              aria-label="Filter by Match Score"
              className="shrink-0 px-1.5 sm:px-2.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer w-auto max-w-[95px] sm:max-w-[130px] truncate"
            >
              <option value="0">All Scores</option>
              <option value="90">90%+ Match</option>
              <option value="75">75%+ Match</option>
              <option value="60">60%+ Base</option>
            </select>

            {/* select:nth-of-type(2) - All Locations (Made smaller) */}
            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              aria-label="Filter by Work Mode"
              className="shrink-0 px-1.5 sm:px-2.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer w-auto max-w-[85px] sm:max-w-[120px] truncate"
            >
              <option value="all">Locations</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
        </div>

        {/* View toggle & metrics */}
        <div className="flex items-center gap-3 justify-between lg:justify-end shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 font-mono tabular-nums">
            <span className="text-indigo-600 font-bold">{filteredApps.length}</span> / {applications.length} roles
          </span>

          <div className="flex items-center p-1 bg-gradient-to-r from-slate-100 to-indigo-50/50 rounded-xl border border-indigo-100/60">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs shadow-indigo-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs shadow-indigo-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Fresh Pipeline Guidance Banner if empty */}
      {applications.length === 0 && (
        <div className="p-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-base font-extrabold tracking-tight font-display">
              Ready to Kickstart Your Dream Career Pipeline!
            </h3>
            <p className="text-xs text-indigo-100 mt-1 max-w-xl leading-relaxed">
              Track your first job opportunity with automatic NLP resume match scoring, recruiter follow-ups, and skill-gap bridging.
            </p>
          </div>
          <button
            onClick={onOpenNewJobModal}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-indigo-900 bg-white hover:bg-indigo-50 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Track Your First Job</span>
          </button>
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colApps = filteredApps.filter((app) => app.status === col.id);

            return (
              <div
                key={col.id}
                className={`flex flex-col ${col.colBg} ${col.topAccent} rounded-2xl p-3.5 border border-slate-200/90 shadow-sm min-h-[580px] transition-all`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <h2 className="text-xs font-extrabold text-slate-800 tracking-tight font-display">
                      {col.label}
                    </h2>
                  </div>
                  <span
                    className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold rounded-full ${col.badgeBg} font-mono tabular-nums`}
                  >
                    {colApps.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex flex-col gap-3 flex-1">
                  {colApps.map((job) => {
                    const nextStage = getStatusNextStage(job.status);

                    return (
                      <div
                        key={job.id}
                        onClick={() => onSelectJob(job)}
                        className="group relative flex flex-col p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-500/10 transition-all cursor-pointer text-left"
                      >
                        {/* Header: Company & Match Score */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {job.company}
                            </h3>
                            <p className="text-xs text-slate-600 line-clamp-1 font-medium mt-0.5">
                              {job.title}
                            </p>
                          </div>

                          <div
                            className={`shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono tabular-nums ${getMatchScoreColor(
                              job.matchScore
                            )}`}
                            title={`Semantic match score: ${job.matchScore}%`}
                          >
                            {job.matchScore}%
                          </div>
                        </div>

                        {/* Metadata row: location, work mode, salary */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2.5">
                          <span className="capitalize font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                            {job.workMode}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="truncate max-w-[110px]">{job.location}</span>
                          {job.salaryRange && (
                            <>
                              <span aria-hidden="true" className="text-slate-300">·</span>
                              <span className="font-mono text-emerald-700 font-semibold text-[10px]">
                                {job.salaryRange.split(' ')[0]}
                              </span>
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
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold'
                                    : 'bg-rose-50 text-rose-600 border border-rose-200/70'
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
                          <div className="mb-2.5 p-2 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-purple-200/70 text-[11px] text-purple-900 flex items-start gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                            <div className="truncate">
                              <span className="font-semibold">
                                {job.interviewRounds.find((r) => !r.completed)?.roundName || 'All rounds complete'}
                              </span>
                            </div>
                          </div>
                        )}

                        {job.status === 'applied' && job.nextFollowUpDate && (
                          <div className="mb-2.5 p-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200/70 text-[11px] text-amber-900 flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate font-mono">Follow-up: {job.nextFollowUpDate}</span>
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
                              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold text-[11px] cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-pink-500" />
                              <span>Tailor</span>
                            </button>
                          )}

                          {nextStage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(job.id, nextStage);
                              }}
                              title={`Advance to ${nextStage}`}
                              className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-700 hover:text-white bg-slate-100 hover:bg-gradient-to-r hover:from-violet-600 hover:to-indigo-600 rounded-md transition-all cursor-pointer"
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
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-center flex-1 min-h-[140px]">
                      <p className="text-xs text-slate-400 font-medium">No roles in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-gradient-to-r from-slate-50 to-indigo-50/40 border-b border-indigo-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Match</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Key Skills</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900">{job.company}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{job.title}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${getMatchScoreColor(
                          job.matchScore
                        )}`}
                      >
                        {job.matchScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{job.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {job.matchedSkills.slice(0, 2).map((s, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectJob(job);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                      >
                        View
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
