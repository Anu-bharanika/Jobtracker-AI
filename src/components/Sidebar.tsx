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
  FileText
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
    badge?: string | number;
    highlightBadge?: boolean;
  }[] = [
    {
      id: 'board',
      label: 'Applications',
      description: 'Kanban & List Pipeline',
      icon: <Layers className="w-4 h-4" />,
      badge: applicationsCount
    },
    {
      id: 'chat',
      label: 'Gemini AI Coach',
      description: 'Interview Prep & Letters',
      icon: <Sparkles className="w-4 h-4 text-blue-500" />,
      badge: 'Gemini 2.5',
      highlightBadge: true
    },
    {
      id: 'emails',
      label: 'Email Parser',
      description: 'Recruiter Ingestion',
      icon: <Mail className="w-4 h-4" />,
      badge: emailsCount > 0 ? emailsCount : undefined
    },
    {
      id: 'sync',
      label: 'Network & Sync',
      description: 'LinkedIn & GitHub',
      icon: <Share2 className="w-4 h-4" />
    },
    {
      id: 'analytics',
      label: 'Analytics & Insights',
      description: 'Funnel & Match Metrics',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'profile',
      label: 'Your Profile',
      description: 'Bio, phn, edu, resume',
      icon: <UserIcon className="w-4 h-4" />,
      badge: currentUser ? 'Verified' : undefined
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <button
            onClick={() => handleNavClick('board')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 font-display">
                  Jobtracker AI
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block -mt-0.5">
                Smart Career Intelligence
              </span>
            </div>
          </button>

          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-slate-700 lg:hidden rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={() => {
              onOpenNewJobModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-xs hover:shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Track New Job</span>
          </button>
        </div>

        {/* Navigation list (The 6 Pages) */}
        <div className="flex-1 px-3 py-3 overflow-y-auto flex flex-col gap-1">
          <span className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Navigation (6 Pages)
          </span>

          {navItems.map((item, index) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-blue-50/80 text-blue-700 font-bold border border-blue-200/70 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-200/60'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{item.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      item.highlightBadge
                        ? 'bg-blue-100 text-blue-700 font-bold'
                        : isActive
                        ? 'bg-blue-200/70 text-blue-900 font-semibold'
                        : 'bg-slate-100 text-slate-600 font-medium'
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
        <div className="p-3 border-t border-slate-200 bg-slate-50/60 flex flex-col gap-2">
          {/* Quick Guide Trigger */}
          <button
            onClick={() => {
              onOpenWelcome();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Getting Started Guide</span>
          </button>

          {/* User Account / Profile Widget */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
            <button
              onClick={() => handleNavClick('profile')}
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer group"
              title="Open Your Profile page"
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center font-display border border-blue-200">
                  {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 truncate block group-hover:text-blue-600 transition-colors">
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
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onLoginWithGoogle}
                title="Sign in with Google"
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
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
