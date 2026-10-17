import React, { useState } from 'react';
import {
  GitBranch,
  Star,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Users,
  MessageSquare,
  Link as LinkIcon,
  ShieldCheck,
  Check
} from 'lucide-react';
import { GitHubRepoSync, LinkedInContact, JobApplication } from '../types/job';

interface SyncIntegrationsModalProps {
  linkedInContacts: LinkedInContact[];
  gitHubRepos: GitHubRepoSync[];
  applications: JobApplication[];
  onAddContact: (contact: LinkedInContact) => void;
  onUpdateContactStatus: (contactId: string, status: LinkedInContact['outreachStatus']) => void;
  onLinkRepoToJob: (jobId: string, repoUrl: string) => void;
}

export const SyncIntegrationsModal: React.FC<SyncIntegrationsModalProps> = ({
  linkedInContacts,
  gitHubRepos,
  applications,
  onAddContact,
  onUpdateContactStatus,
  onLinkRepoToJob
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'linkedin'>('github');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactCompany, setNewContactCompany] = useState('');
  const [newContactTitle, setNewContactTitle] = useState('');
  const [newContactUrl, setNewContactUrl] = useState('');
  const [selectedRepoForJob, setSelectedRepoForJob] = useState<{ [jobId: string]: string }>({});

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleAddLinkedInContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactCompany.trim()) return;

    const newContact: LinkedInContact = {
      id: `li-${Date.now()}`,
      name: newContactName.trim(),
      company: newContactCompany.trim(),
      title: newContactTitle.trim() || 'Technical Recruiter',
      profileUrl: newContactUrl.trim() || `https://linkedin.com/in/${newContactName.toLowerCase().replace(/\s+/g, '')}`,
      outreachStatus: 'connected',
      lastInteractionDate: new Date().toISOString().split('T')[0]
    };

    onAddContact(newContact);
    setNewContactName('');
    setNewContactCompany('');
    setNewContactTitle('');
    setNewContactUrl('');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Professional Network & Code Repository Sync
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sync technical portfolios with GitHub to audit project readiness and organize LinkedIn recruiter relationships.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Sync Status</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg self-start">
        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === 'github'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-slate-900" />
          <span>GitHub Portfolio Sync ({gitHubRepos.length} Repos)</span>
        </button>

        <button
          onClick={() => setActiveTab('linkedin')}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === 'linkedin'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>LinkedIn Network & Recruiters ({linkedInContacts.length})</span>
        </button>
      </div>

      {activeTab === 'github' && (
        <div className="flex flex-col gap-6">
          {/* GitHub Repos List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gitHubRepos.map((repo) => (
              <div
                key={repo.name}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-sm text-slate-900 hover:text-blue-600 flex items-center gap-1.5 group"
                    >
                      <GitBranch className="w-4 h-4 text-slate-700" />
                      <span className="truncate">{repo.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                    </a>

                    <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{repo.stars}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {repo.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {repo.topics.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Interview Readiness:</span>
                    <span className="font-bold text-emerald-700 font-mono tabular-nums">
                      {repo.readinessScore}% Ready
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${repo.readinessScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Link Repos to Applications Section */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider mb-2">
              Attach GitHub Projects as Evidence to Active Roles
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Directly associate your public repositories with specific company interview loops
            </p>

            <div className="divide-y divide-slate-100">
              {applications.slice(0, 5).map((job) => (
                <div key={job.id} className="py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{job.company}</span>
                    <span className="text-slate-500 ml-1.5 font-medium">{job.title}</span>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                      value={job.linkedGitHubRepo || ''}
                      onChange={(e) => onLinkRepoToJob(job.id, e.target.value)}
                      className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Project Linked</option>
                      {gitHubRepos.map(repo => (
                        <option key={repo.url} value={repo.url}>
                          {repo.name} ({repo.stars} stars)
                        </option>
                      ))}
                    </select>

                    {job.linkedGitHubRepo && (
                      <span className="text-emerald-700 font-medium flex items-center gap-1 font-mono text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Attached</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'linkedin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Contacts List (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Recruiter & Referral Tracker ({linkedInContacts.length})
              </h3>
            </div>

            <div className="flex flex-col gap-2.5">
              {linkedInContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <a
                        href={contact.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1"
                      >
                        <span>{contact.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-semibold text-blue-600">{contact.company}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{contact.title}</p>
                    {contact.notes && (
                      <p className="text-slate-600 text-[11px] italic mt-1">"{contact.notes}"</p>
                    )}
                  </div>

                  {/* Outreach status changer */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={contact.outreachStatus}
                      onChange={(e) => onUpdateContactStatus(contact.id, e.target.value as any)}
                      className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg capitalize font-medium text-slate-700"
                    >
                      <option value="not_contacted">Not Contacted</option>
                      <option value="connected">Connected</option>
                      <option value="inmail_sent">InMail Sent</option>
                      <option value="replied">Replied</option>
                      <option value="referral_agreed">Referral Secured</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Add new contact card (4 cols) */}
          <div className="lg:col-span-4">
            <form onSubmit={handleAddLinkedInContact} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3 text-xs">
              <h3 className="font-bold text-slate-900 uppercase font-mono tracking-wider">
                Add Recruiter / Connection
              </h3>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Company *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anthropic, Stripe"
                  value={newContactCompany}
                  onChange={(e) => setNewContactCompany(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Role / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior ML Recruiter"
                  value={newContactTitle}
                  onChange={(e) => setNewContactTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={newContactUrl}
                  onChange={(e) => setNewContactUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Contact</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
