import React from 'react';
import {
  Menu,
  Bell,
  Sparkles,
  Plus,
  Search,
  User as UserIcon,
  HelpCircle,
  ShieldCheck,
  Layers,
  Mail,
  Share2,
  BarChart3
} from 'lucide-react';
import { User } from 'firebase/auth';
import { AppNotification } from '../types/job';
import { AppPage } from './Sidebar';

interface HeaderProps {
  currentPage: AppPage;
  onSelectPage: (page: AppPage) => void;
  onOpenMobileMenu: () => void;
  onOpenNewJobModal: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  currentUser: User | null;
  onOpenWelcome: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onSelectPage,
  onOpenMobileMenu,
  onOpenNewJobModal,
  notifications,
  onOpenNotifications,
  currentUser,
  onOpenWelcome,
  searchQuery,
  onSearchChange,
  userName
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const pageMeta: Record<
    AppPage,
    { title: string; subtitle: string; icon: React.ReactNode }
  > = {
    board: {
      title: 'Applications Pipeline',
      subtitle: 'Manage active job opportunities, stages & interview schedules',
      icon: <Layers className="w-4 h-4 text-blue-600" />
    },
    chat: {
      title: 'Gemini AI Career Coach',
      subtitle: 'Prepare for technical interviews, tailor cover letters & practice Q&A',
      icon: <Sparkles className="w-4 h-4 text-blue-600" />
    },
    emails: {
      title: 'Email Parser & Inbound Hub',
      subtitle: 'Automated recruiter email parsing & interview schedule updates',
      icon: <Mail className="w-4 h-4 text-blue-600" />
    },
    sync: {
      title: 'Network & Portfolio Sync',
      subtitle: 'Track LinkedIn recruiter outreach & link GitHub repositories',
      icon: <Share2 className="w-4 h-4 text-blue-600" />
    },
    analytics: {
      title: 'Analytics & Funnel Metrics',
      subtitle: 'Conversion ratios, semantic match correlations & technical skill gaps',
      icon: <BarChart3 className="w-4 h-4 text-blue-600" />
    },
    profile: {
      title: 'Your Profile & Resume',
      subtitle: 'Contact info, phone number, education, resume parsing & account settings',
      icon: <UserIcon className="w-4 h-4 text-blue-600" />
    }
  };

  const currentMeta = pageMeta[currentPage] || pageMeta.board;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Hamburger + Page Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="hidden sm:flex p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            {currentMeta.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 truncate font-display">
                {currentMeta.title}
              </h1>
              {currentUser && (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Cloud Active</span>
                </span>
              )}
            </div>
            <p className="hidden md:block text-xs text-slate-500 truncate -mt-0.5">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Center/Right: Quick Search across jobs (if on pipeline) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search jobs & companies..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Direct Action: + Add Job */}
        <button
          onClick={onOpenNewJobModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Job</span>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Getting Started Guide */}
        <button
          onClick={onOpenWelcome}
          title="Getting Started & Features Guide"
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Profile Avatar Quick Button */}
        <button
          onClick={() => onSelectPage('profile')}
          title="Go to Your Profile page"
          className={`flex items-center gap-1.5 p-1 rounded-lg border transition-all cursor-pointer ${
            currentPage === 'profile'
              ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
              : 'border-slate-200 hover:bg-slate-50'
          }`}
        >
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={userName}
              className="w-6 h-6 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center font-display">
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <span className="hidden xl:inline text-xs font-semibold text-slate-700 pr-1">
            Profile
          </span>
        </button>
      </div>
    </header>
  );
};
