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
  BarChart3,
  Bot
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
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const pageMeta: Record<
    AppPage,
    { title: string; subtitle: string; icon: React.ReactNode; iconBg: string }
  > = {
    board: {
      title: 'Applications Pipeline',
      subtitle: 'Manage active job opportunities, stages & interview schedules',
      icon: <Layers className="w-4 h-4 text-cyan-600" />,
      iconBg: 'bg-cyan-50 border-cyan-200'
    },
    chat: {
      title: 'Free Career & Interview Coach',
      subtitle: 'Instant mock interviews, resume tailoring & salary negotiation without fees',
      icon: <Bot className="w-4 h-4 text-pink-600" />,
      iconBg: 'bg-pink-50 border-pink-200'
    },
    emails: {
      title: 'Email Parser & Inbound Hub',
      subtitle: 'Automated recruiter email parsing & interview schedule updates',
      icon: <Mail className="w-4 h-4 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-200'
    },
    sync: {
      title: 'Network & Portfolio Sync',
      subtitle: 'Track LinkedIn recruiter outreach & link GitHub repositories',
      icon: <Share2 className="w-4 h-4 text-purple-600" />,
      iconBg: 'bg-purple-50 border-purple-200'
    },
    analytics: {
      title: 'Analytics & Funnel Metrics',
      subtitle: 'Conversion ratios, semantic match correlations & technical skill gaps',
      icon: <BarChart3 className="w-4 h-4 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-200'
    },
    profile: {
      title: 'Your Profile & Resume',
      subtitle: 'Contact info, phone number, education, resume parsing & account settings',
      icon: <UserIcon className="w-4 h-4 text-rose-600" />,
      iconBg: 'bg-rose-50 border-rose-200'
    }
  };

  const currentMeta = pageMeta[currentPage] || pageMeta.board;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-xs">
      {/* Eye-catching rainbow accent ribbon */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-pink-500 via-amber-400 to-cyan-400" />

      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Hamburger + Page Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`hidden sm:flex p-2 rounded-xl border ${currentMeta.iconBg} shadow-2xs shrink-0`}
            >
              {currentMeta.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 truncate font-display tracking-tight">
                  {currentMeta.title}
                </h1>
                {currentUser && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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

        {/* Center/Right: Quick Search across jobs + Action buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative hidden md:block w-48 lg:w-60">
            <Search className="w-3.5 h-3.5 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search jobs & companies..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
            />
          </div>

          {/* Direct Action: + Add Job in vibrant gradient */}
          <button
            onClick={onOpenNewJobModal}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/25 cursor-pointer whitespace-nowrap hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Job</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="relative p-2 text-slate-600 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-pink-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Getting Started Guide */}
          <button
            onClick={onOpenWelcome}
            title="Getting Started & Features Guide"
            className="p-2 text-slate-600 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Profile Avatar Quick Button */}
          <button
            onClick={() => onSelectPage('profile')}
            title="Go to Your Profile page"
            className={`flex items-center gap-1.5 p-1 rounded-xl border transition-all cursor-pointer ${
              currentPage === 'profile'
                ? 'border-pink-500 ring-2 ring-pink-100 bg-pink-50/50'
                : 'border-slate-200 hover:bg-indigo-50/50'
            }`}
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={userName}
                className="w-6 h-6 rounded-full object-cover border border-indigo-400 shadow-2xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 text-white font-bold text-[10px] flex items-center justify-center font-display shadow-2xs">
                {userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <span className="hidden xl:inline text-xs font-bold text-slate-700 pr-1">
              Profile
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
