import React, { useState } from 'react';
import {
  Mail,
  Inbox,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Send,
  Building,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { IngestedEmail, JobApplication, ApplicationStatus } from '../types/job';
import { parseRawEmailIntoIngestedEmail } from '../utils/emailClassifier';

interface EmailIngestionCenterProps {
  emails: IngestedEmail[];
  applications: JobApplication[];
  onApplyEmailUpdates: (emails: IngestedEmail[]) => void;
  onAddIngestedEmail: (email: IngestedEmail) => void;
}

export const EmailIngestionCenter: React.FC<EmailIngestionCenterProps> = ({
  emails,
  applications,
  onApplyEmailUpdates,
  onAddIngestedEmail
}) => {
  // Inbound Email input state
  const [senderInput, setSenderInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  const handleIngestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectInput.trim() || !bodyInput.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const newEmail = parseRawEmailIntoIngestedEmail(
        subjectInput,
        bodyInput,
        senderInput,
        applications.length
      );

      // Check if matches an existing application
      const matchedApp = applications.find(
        app => app.company.toLowerCase() === newEmail.detectedCompany.toLowerCase()
      );
      if (matchedApp) {
        newEmail.linkedApplicationId = matchedApp.id;
      }

      onAddIngestedEmail(newEmail);
      setIsProcessing(false);
      setSenderInput('');
      setSubjectInput('');
      setBodyInput('');
      setSyncStatusMessage(`Successfully ingested & classified email for ${newEmail.detectedCompany} (${newEmail.detectedStatus})`);
      setTimeout(() => setSyncStatusMessage(null), 4000);
    }, 400);
  };

  const handleApplyAllUnprocessed = () => {
    onApplyEmailUpdates(emails);
    setSyncStatusMessage('Applied all pending status updates to your applications board.');
    setTimeout(() => setSyncStatusMessage(null), 4000);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'offered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'interviewing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'applied':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: IMAP & Webhook Integration */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Automated Email Parsing & IMAP Webhook Ingestion
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Listens for ATS confirmation emails, recruiter interview links, and offer letters. Classifies stage with NLP and updates tracker state.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>IMAP Listener Active</span>
          </div>

          <button
            onClick={handleApplyAllUnprocessed}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync All to Board</span>
          </button>
        </div>
      </div>

      {syncStatusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncStatusMessage}</span>
        </div>
      )}

      {/* 2-Column Split: Ingested Inbox on left, Interactive Test Simulator on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parsed Email Feed (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              Parsed Inbound Emails ({emails.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Confidence &gt; 85% Auto-Routed
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {emails.map((email) => {
              const matchedApp = applications.find(
                a => a.id === email.linkedApplicationId || a.company.toLowerCase() === email.detectedCompany.toLowerCase()
              );

              return (
                <div
                  key={email.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          {email.detectedCompany}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold capitalize border ${getStatusBadge(
                            email.detectedStatus
                          )}`}
                        >
                          {email.detectedStatus}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {email.confidence}% confidence
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {email.subject}
                      </h4>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(email.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-[11px]">
                    "{email.bodySnippet}"
                  </p>

                  {/* Extracted Entities */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    {email.extractedDetails.recruiterName && (
                      <span className="flex items-center gap-1 text-slate-700">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Recruiter: {email.extractedDetails.recruiterName}</span>
                      </span>
                    )}

                    {email.extractedDetails.interviewDate && (
                      <span className="flex items-center gap-1 text-blue-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{email.extractedDetails.interviewDate}</span>
                      </span>
                    )}

                    {matchedApp && (
                      <span className="text-emerald-700 font-medium ml-auto flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Linked to {matchedApp.company}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {emails.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No Inbound Emails Parsed Yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Paste an application confirmation or recruiter status update on the right to auto-classify and advance pipeline stages.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Inbound Email Ingestion Parser (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Parse Recruiter / Status Email
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste any application confirmation or recruiter update to automatically detect the stage and link it to your tracked applications.
              </p>
            </div>

            <form onSubmit={handleIngestEmail} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Sender Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jobs@company.com or recruiter@anthropic.com"
                  value={senderInput}
                  onChange={(e) => setSenderInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next Steps with your Application / Interview Scheduled"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Email Body Content
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste the recruiter message or confirmation text here..."
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Parse & Run NLP Classifier</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
