import React from 'react';
import {
  Layers,
  Sparkles,
  Mail,
  Share2,
  BarChart3,
  User as UserIcon,
  Plus,
  LogOut,
  LogIn,
  HelpCircle,
  X,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Bot
} from 'lucide-react';
import { User } from 'firebase/auth';

export type AppPage = 'board' | 'chat' | 'emails' | 'sync' | 'analytics' | 'profile';

interface SidebarProps {
  currentPage: AppPage;
  onSelectPage: (page: AppPage) => void;
  onOpenNewJobModal: () => void;
  onOpenWelcome: () => void;
  currentUser: User | null;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  applicationsCount: number;
  emailsCount: number;
  unreadNotificationsCount: number;
  userName: string;
  userEmail: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  onOpenNewJobModal,
  onOpenWelcome,
  currentUser,
  onLoginWithGoogle,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  applicationsCount,
  emailsCount,
  unreadNotificationsCount,
  userName,
  userEmail
}) => {
  const navItems: {
    id: AppPage;
    label: string;
    description: string;
    icon: React.ReactNode;
    colorIcon: string;
    badge?: string | number;
    highlightBadge?: boolean;
    badgeStyle?: string;
  }[] = [
    {
      id: 'board',
      label: 'Applications',
      description: 'Kanban & List Pipeline',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      colorIcon: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
      badge: applicationsCount,
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
    },
    {
      id: 'chat',
      label: 'Career AI Coach',
      description: 'Free Interview Prep & Q&A',
      icon: <Bot className="w-4 h-4 text-pink-400" />,
      colorIcon: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
      badge: 'Free',
      highlightBadge: true,
      badgeStyle: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold shadow-2xs'
    },
    {
      id: 'emails',
      label: 'Email Parser',
      description: 'Recruiter Ingestion Hub',
      icon: <Mail className="w-4 h-4 text-amber-400" />,
      colorIcon: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      badge: emailsCount > 0 ? emailsCount : undefined,
      badgeStyle: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
    },
    {
      id: 'sync',
      label: 'Network & Sync',
      description: 'LinkedIn & GitHub Hub',
      icon: <Share2 className="w-4 h-4 text-purple-400" />,
      colorIcon: 'bg-purple-500/15 border-purple-500/30 text-purple-400'
    },
    {
      id: 'analytics',
      label: 'Analytics & Insights',
      description: 'Funnel & Match Metrics',
      icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
      colorIcon: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
    },
    {
      id: 'profile',
      label: 'Your Profile',
      description: 'Bio, phn, edu & resume',
      icon: <UserIcon className="w-4 h-4 text-rose-400" />,
      colorIcon: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      badge: currentUser ? 'Verified' : undefined,
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
    }
  ];

  const handleNavClick = (page: AppPage) => {
    onSelectPage(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container - Eye-catching colorful dark-luminous aesthetic */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-r border-indigo-900/40 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-900/50">
          <button
            onClick={() => handleNavClick('board')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight font-display text-white">
                  Jobtracker <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs">
                  FREE
                </span>
              </div>
              <span className="text-[11px] text-indigo-300/80 block -mt-0.5 font-medium">
                100% Free Career Workspace
              </span>
            </div>
          </button>

          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 lg:hidden rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="p-4 border-b border-indigo-900/40">
          <button
            onClick={() => {
              onOpenNewJobModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.01] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Track New Job</span>
          </button>
        </div>

        {/* Navigation list (The 6 Pages) */}
        <div className="flex-1 px-3 py-3 overflow-y-auto flex flex-col gap-1.5">
          <span className="px-3 py-1 text-[10px] font-extrabold text-indigo-300/60 uppercase tracking-widest font-mono">
            Navigation (6 Pages)
          </span>

          {navItems.map((item) => {
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 text-white font-bold shadow-md shadow-indigo-600/30 border border-white/20'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl border transition-colors ${
                      isActive
                        ? 'bg-white/20 border-white/30 text-white shadow-xs'
                        : `${item.colorIcon} group-hover:scale-105 transition-transform`
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] block -mt-0.5 ${
                        isActive ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      item.badgeStyle || (isActive ? 'bg-white/20 text-white font-bold' : 'bg-slate-800 text-slate-300 font-semibold')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer / User Account Section */}
        <div className="p-3 border-t border-indigo-900/50 bg-slate-950/80 flex flex-col gap-2">
          {/* Quick Guide Trigger */}
          <button
            onClick={() => {
              onOpenWelcome();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Getting Started Guide</span>
          </button>

          {/* User Account / Profile Widget */}
          <div className="p-2.5 bg-slate-900/90 rounded-xl border border-indigo-900/60 shadow-inner flex items-center justify-between gap-2">
            <button
              onClick={() => handleNavClick('profile')}
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer group"
              title="Open Your Profile page"
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500 shadow-2xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 text-white font-bold text-xs flex items-center justify-center font-display shadow-2xs">
                  {userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white truncate block group-hover:text-pink-400 transition-colors">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  {userEmail}
                </span>
              </div>
            </button>

            {currentUser ? (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onLoginWithGoogle}
                title="Sign in with Google"
                className="p-1.5 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
