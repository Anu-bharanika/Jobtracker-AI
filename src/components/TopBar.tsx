import { Bell, Sparkles, Plus, LogIn, LogOut, User as UserIcon, HelpCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { AppNotification } from '../types/job';

interface TopBarProps {
  currentTab: 'board' | 'chat' | 'emails' | 'sync' | 'analytics' | 'resume';
  onSelectTab: (tab: 'board' | 'chat' | 'emails' | 'sync' | 'analytics' | 'resume') => void;
  onOpenNewJobModal: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  currentUser: User | null;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenWelcome: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewJobModal,
  notifications,
  onOpenNotifications,
  currentUser,
  onLoginWithGoogle,
  onLogout,
  onOpenProfile,
  onOpenWelcome
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
      {/* Zone 1: Single wordmark element */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectTab('board')}
          className="text-left group cursor-pointer"
        >
          <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap font-display">
            Jobtracker AI
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">
            Smart Job Tracker
          </span>
        </button>
      </div>

      {/* Zone 2: 4-5 single-line clean navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onSelectTab('board')}
          className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
            currentTab === 'board'
              ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Applications
        </button>
        <button
          onClick={() => onSelectTab('chat')}
          className={`cursor-pointer whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 ${
            currentTab === 'chat'
              ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
              : 'hover:text-slate-900 text-blue-600 font-semibold'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Gemini AI Coach</span>
        </button>
        <button
          onClick={() => onSelectTab('emails')}
          className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
            currentTab === 'emails'
              ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Email Parser
        </button>
        <button
          onClick={() => onSelectTab('sync')}
          className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
            currentTab === 'sync'
              ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Network Sync
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
            currentTab === 'analytics'
              ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => onSelectTab('resume')}
          className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
            currentTab === 'resume'
              ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Resume
        </button>
      </nav>

      {/* Zone 3: Primary action + Profile + Auth + Notification bell */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Your Profile trigger */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-semibold text-slate-800 transition-colors cursor-pointer border border-slate-200/60"
          title="Open Your Profile (Email, Phone, Education, Location)"
        >
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Profile"
              className="w-4 h-4 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserIcon className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span>Your Profile</span>
        </button>

        {currentUser ? (
          <button
            onClick={onLogout}
            title="Sign Out"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        ) : (
          <button
            onClick={onLoginWithGoogle}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
          >
            <LogIn className="w-3.5 h-3.5 text-blue-600" />
            <span>Sign in with Google</span>
          </button>
        )}

        <button
          onClick={onOpenWelcome}
          aria-label="Getting Started Guide"
          title="Getting Started & Features Guide"
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white font-mono tabular-nums">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenNewJobModal}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Track Job</span>
        </button>
      </div>
    </header>
  );
};
