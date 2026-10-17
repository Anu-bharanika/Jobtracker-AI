import React, { useState } from 'react';
import {
  X,
  Bell,
  Clock,
  AlertCircle,
  Mail,
  Check,
  Calendar,
  ChevronRight,
  Send,
  Trash2,
  Copy
} from 'lucide-react';
import { AppNotification, JobApplication } from '../types/job';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  applications: JobApplication[];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onSelectJob: (job: JobApplication) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  applications,
  onMarkAsRead,
  onDismiss,
  onSelectJob
}) => {
  const [draftModalPayload, setDraftModalPayload] = useState<{
    to: string;
    subject: string;
    body: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Automated Status Alerts & Reminders
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3">
          {notifications.map((notif) => {
            const linkedApp = applications.find(a => a.id === notif.applicationId);

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all flex flex-col gap-2.5 ${
                  notif.isRead
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : 'bg-white border-blue-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {notif.type === 'interview_reminder' && (
                      <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    )}
                    {notif.type === 'follow_up' && (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    {notif.type === 'status_update' && (
                      <Bell className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    {notif.actionPayload?.suggestedEmail && (
                      <button
                        onClick={() => setDraftModalPayload(notif.actionPayload!.suggestedEmail!)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Open Draft Follow-up Email</span>
                      </button>
                    )}

                    {linkedApp && (
                      <button
                        onClick={() => {
                          onClose();
                          onSelectJob(linkedApp);
                        }}
                        className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                      >
                        View {linkedApp.company} Job
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!notif.isRead && (
                      <button
                        onClick={() => onMarkAsRead(notif.id)}
                        className="text-slate-400 hover:text-emerald-600 cursor-pointer text-[11px]"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => onDismiss(notif.id)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              All caught up! No active follow-up alerts.
            </div>
          )}
        </div>

        {/* Sub-modal: Pre-generated Follow-up Email Viewer */}
        {draftModalPayload && (
          <div className="p-5 bg-slate-900 text-white border-t border-slate-700 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono">Suggested Follow-Up Email</span>
              <button
                onClick={() => setDraftModalPayload(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Close Draft
              </button>
            </div>

            <div className="text-xs text-slate-300 flex flex-col gap-1 font-mono">
              <div><span className="text-slate-400">To:</span> {draftModalPayload.to}</div>
              <div><span className="text-slate-400">Subject:</span> {draftModalPayload.subject}</div>
            </div>

            <div className="p-3 bg-slate-800 rounded-lg text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
              {draftModalPayload.body}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleCopyEmail(`${draftModalPayload.subject}\n\n${draftModalPayload.body}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied to Clipboard' : 'Copy Email Text'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
