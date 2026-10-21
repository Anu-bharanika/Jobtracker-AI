import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Bot,
  Bell,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  FileText,
  Briefcase,
  X,
  Compass
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBlank: () => void;
  onExploreSample: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartBlank,
  onExploreSample
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleDismiss = (action: 'blank' | 'sample' | 'close') => {
    if (dontShowAgain) {
      localStorage.setItem('jobtracker_welcome_dismissed', 'true');
    }
    if (action === 'blank') onStartBlank();
    else if (action === 'sample') onExploreSample();
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Hero */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white relative">
          <button
            onClick={() => handleDismiss('close')}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-[11px] font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Welcome to Jobtracker AI</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight font-display">
            Your Smart Job Search Command Center
          </h2>
          <p className="text-xs text-blue-100 mt-1.5 max-w-xl leading-relaxed">
            An intelligent workspace designed for job seekers to ingest job postings, analyze resume-to-job semantic fit, simulate technical interviews with a free career coach, and manage follow-ups with automated alerts.
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 text-xs text-slate-700">
          {/* Main Features Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider mb-3">
              Main Capabilities & Features (100% Free)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Applications Pipeline</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Visual Kanban board and tabular view tracking roles through Saved, Applied, Interviewing, and Offered stages.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Semantic Match & Gaps</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    NLP vector embedding engine computes a 0–100% Match Score and pinpoints critical missing technical keywords.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Free Career AI Coach</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Multi-turn mock interview coach, Google XYZ bullet-point re-writer, and compensation negotiation strategist with zero fees.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Status Alerts & Notifications</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Automated reminders when applications need follow-up notes, interview countdowns, and pre-drafted emails.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Where to Start (3 Actionable Steps) */}
          <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl">
            <h3 className="text-xs font-bold text-blue-900 uppercase font-mono tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Where to Start</span>
            </h3>

            <div className="flex flex-col gap-2.5 text-xs text-blue-950">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <span className="font-bold">Set Up Your Profile & Resume:</span>
                  <span className="text-blue-800 ml-1">
                    Click <strong>Resume</strong> or <strong>Your Profile</strong> in the top navigation bar to input your contact details and upload your CV so our embedding engine indexes your skills.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <span className="font-bold">Track Your First Job:</span>
                  <span className="text-blue-800 ml-1">
                    Click <strong>+ Track Job</strong> to paste any job posting link (LinkedIn, Greenhouse, Lever) or description text for automated parsing.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <span className="font-bold">Prepare with Free Career Coach:</span>
                  <span className="text-blue-800 ml-1">
                    Switch to the <strong>Career AI Coach</strong> tab to conduct a mock interview or generate tailored bullet points that bridge identified skill gaps.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Don't show again toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Don't show this welcome message automatically on startup</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => handleDismiss('blank')}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Start with Blank Workspace
          </button>

          <button
            onClick={() => handleDismiss('sample')}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <span>Explore with Sample Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
