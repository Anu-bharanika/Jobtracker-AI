import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GitBranch,
  Building,
  UserCheck,
  ChevronRight,
  Plus,
  Trash2,
  FileEdit
} from 'lucide-react';
import { JobApplication, ApplicationStatus, CandidateProfile, InterviewRound } from '../types/job';
import { performMatchAnalysis } from '../utils/embeddingEngine';

interface JobDetailModalProps {
  job: JobApplication | null;
  onClose: () => void;
  candidateProfile: CandidateProfile;
  onUpdateJob: (updatedJob: JobApplication) => void;
  onOpenTailorModal: (job: JobApplication) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  candidateProfile,
  onUpdateJob,
  onOpenTailorModal
}) => {
  if (!job) return null;

  const [activeTab, setActiveTab] = useState<'match' | 'rounds' | 'notes' | 'history'>('match');
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundDate, setNewRoundDate] = useState('');
  const [editingNotes, setEditingNotes] = useState(job.notes);

  // Re-run match analysis against active resume
  const matchAnalysis = performMatchAnalysis(candidateProfile.rawResumeText, job.description);

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    if (newStatus === job.status) return;

    const updated: JobApplication = {
      ...job,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      history: [
        ...job.history,
        {
          id: `h-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          fromStatus: job.status,
          toStatus: newStatus,
          note: `Stage updated to ${newStatus}`
        }
      ]
    };
    onUpdateJob(updated);
  };

  const handleToggleRound = (roundId: string) => {
    const updatedRounds = job.interviewRounds.map(r =>
      r.id === roundId ? { ...r, completed: !r.completed } : r
    );
    onUpdateJob({
      ...job,
      interviewRounds: updatedRounds,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoundName.trim()) return;

    const newRound: InterviewRound = {
      id: `round-${Date.now()}`,
      roundName: newRoundName.trim(),
      scheduledAt: newRoundDate ? new Date(newRoundDate).toISOString() : undefined,
      completed: false
    };

    onUpdateJob({
      ...job,
      interviewRounds: [...job.interviewRounds, newRound],
      updatedAt: new Date().toISOString()
    });
    setNewRoundName('');
    setNewRoundDate('');
  };

  const handleSaveNotes = () => {
    onUpdateJob({
      ...job,
      notes: editingNotes,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-600 capitalize font-mono">
                {job.source} source
              </span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="text-xs text-slate-500 capitalize">{job.workMode}</span>
              {job.salaryRange && (
                <>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="text-xs font-mono font-medium text-slate-700">{job.salaryRange}</span>
                </>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {job.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
              <span className="font-semibold text-slate-800">{job.company}</span>
              <span aria-hidden="true">·</span>
              <span>{job.location}</span>
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline ml-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Job Posting</span>
                </a>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Status Selector Ribbon */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs">
          <span className="font-semibold text-slate-700">Pipeline Stage:</span>
          <div className="flex items-center gap-1">
            {(['saved', 'applied', 'interviewing', 'offered', 'rejected'] as ApplicationStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                  job.status === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 px-6 pt-3 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('match')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'match'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Semantic Match & Gap Analysis
          </button>
          <button
            onClick={() => setActiveTab('rounds')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rounds'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Interview Rounds</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] font-mono">
              {job.interviewRounds.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Job Description & Notes
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Activity Audit Timeline
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800">
          {activeTab === 'match' && (
            <div className="flex flex-col gap-6">
              {/* Scorecard row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-500 font-medium block mb-1">
                    Composite Match Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-blue-600 font-mono tabular-nums">
                      {matchAnalysis.matchScore}%
                    </span>
                    <span className="text-xs text-slate-500">out of 100</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Weighted blend of NLP keyword coverage and sentence embedding cosine similarity.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-500 font-medium block mb-1">
                    Embedding Cosine Similarity
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-800 font-mono tabular-nums">
                      {matchAnalysis.cosineSimilarity}
                    </span>
                    <span className="text-xs text-slate-500">cos(&theta;)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    High dimensional vector alignment between your resume and this job posting.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block mb-1">
                      Matched Skills
                    </span>
                    <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
                      {matchAnalysis.matchedSkills.length} / {matchAnalysis.allJobSkills.length}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenTailorModal(job)}
                    className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bridge Gaps with AI</span>
                  </button>
                </div>
              </div>

              {/* Dimensional Category breakdown */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider mb-3">
                  Domain Competency Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matchAnalysis.dimensionScores.map((dim, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-slate-800">{dim.name}</span>
                        <span className="font-mono text-slate-600 tabular-nums">
                          {dim.matchedCount}/{dim.totalCount} ({dim.score}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Skills on Your Resume ({matchAnalysis.matchedSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchAnalysis.matchedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs font-mono bg-white border border-emerald-300 text-emerald-800 rounded font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-rose-50/50 border border-rose-200/80 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Missing Keywords / Skill Gaps ({matchAnalysis.missingSkills.length})</span>
                  </div>
                  {matchAnalysis.missingSkills.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Zero gaps! Your resume covers all extracted competencies.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {matchAnalysis.missingSkills.map((skill, idx) => (
                        <button
                          key={idx}
                          onClick={() => onOpenTailorModal(job)}
                          className="px-2 py-0.5 text-xs font-mono bg-white border border-rose-300 text-rose-800 rounded hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Click to generate authentic bullet point for this keyword"
                        >
                          <span>{skill}</span>
                          <Sparkles className="w-3 h-3 text-rose-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rounds' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Interview Loop Checklist
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track rounds, scheduled times, and interview notes
                  </p>
                </div>
              </div>

              {/* Rounds List */}
              <div className="flex flex-col gap-2.5">
                {job.interviewRounds.map((round) => (
                  <div
                    key={round.id}
                    className={`flex items-start justify-between p-3.5 rounded-lg border transition-colors ${
                      round.completed
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : 'bg-white border-blue-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleRound(round.id)}
                        className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            round.completed ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        />
                      </button>
                      <div>
                        <span
                          className={`text-xs font-semibold block ${
                            round.completed ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {round.roundName}
                        </span>
                        {round.scheduledAt && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="font-mono">
                              {new Date(round.scheduledAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                        {round.notes && (
                          <p className="text-[11px] text-slate-600 mt-1 italic">
                            "{round.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const updated = job.interviewRounds.filter(r => r.id !== round.id);
                        onUpdateJob({ ...job, interviewRounds: updated });
                      }}
                      className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {job.interviewRounds.length === 0 && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center">
                    No interview rounds added yet. Add a screen or coding challenge below!
                  </div>
                )}
              </div>

              {/* Add New Round Form */}
              <form onSubmit={handleAddRound} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-700">Add Interview Stage / Round</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technical Coding, System Design..."
                    value={newRoundName}
                    onChange={(e) => setNewRoundName(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="datetime-local"
                    value={newRoundDate}
                    onChange={(e) => setNewRoundDate(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="self-end flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Round</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Private Candidate Notes & Strategy
                </label>
                <textarea
                  rows={4}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <FileEdit className="w-3.5 h-3.5 text-blue-600" />
                  <span>Save Notes</span>
                </button>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-2">
                  Full Extracted Job Description
                </h3>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {job.description}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Status History & Ingestion Log
              </h3>
              <div className="flex flex-col divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                {job.history.map((hist) => (
                  <div key={hist.id} className="p-3 text-xs flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 capitalize">
                        {hist.toStatus}
                      </span>
                      <p className="text-slate-600 text-[11px] mt-0.5">{hist.note}</p>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px] tabular-nums shrink-0">
                      {hist.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
