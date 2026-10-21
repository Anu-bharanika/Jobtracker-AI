/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Sidebar, AppPage } from './components/Sidebar';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { JobDetailModal } from './components/JobDetailModal';
import { NewApplicationModal } from './components/NewApplicationModal';
import { BulletPointGeneratorModal } from './components/BulletPointGeneratorModal';
import { EmailIngestionCenter } from './components/EmailIngestionCenter';
import { SyncIntegrationsModal } from './components/SyncIntegrationsModal';
import { ResumeIngestionModal } from './components/ResumeIngestionModal';
import { NotificationCenter } from './components/NotificationCenter';
import { AnalyticsView } from './components/AnalyticsView';
import { CareerChatbot } from './components/CareerChatbot';
import { UserProfileModal } from './components/UserProfileModal';
import { ProfilePage } from './components/ProfilePage';
import { WelcomeModal } from './components/WelcomeModal';

import {
  JobApplication,
  CandidateProfile,
  IngestedEmail,
  LinkedInContact,
  GitHubRepoSync,
  AppNotification,
  ApplicationStatus
} from './types/job';
import { Storage } from './utils/storage';
import { FirebaseSync } from './utils/firebaseSync';
import {
  INITIAL_JOB_APPLICATIONS,
  INITIAL_INGESTED_EMAILS,
  INITIAL_NOTIFICATIONS,
  INITIAL_LINKEDIN_CONTACTS,
  INITIAL_GITHUB_REPOS
} from './utils/mockData';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // State loaded from Storage with initial seed data
  const [applications, setApplications] = useState<JobApplication[]>(() => Storage.getApplications());
  const [candidate, setCandidate] = useState<CandidateProfile>(() => Storage.getCandidate());
  const [emails, setEmails] = useState<IngestedEmail[]>(() => Storage.getEmails());
  const [linkedInContacts, setLinkedInContacts] = useState<LinkedInContact[]>(() => Storage.getLinkedInContacts());
  const [gitHubRepos, setGitHubRepos] = useState<GitHubRepoSync[]>(() => Storage.getGitHubRepos());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => Storage.getNotifications());

  // UI & Layout state for 6 dedicated pages
  const [currentPage, setCurrentPage] = useState<AppPage>('board');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [tailorJob, setTailorJob] = useState<JobApplication | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jobtracker_welcome_seen') !== 'true';
    } catch {
      return true;
    }
  });
  const [authBanner, setAuthBanner] = useState<string | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = FirebaseSync.onAuthChange((user) => {
      setCurrentUser(user);
      if (user) {
        setAuthBanner(`Signed in as ${user.displayName || user.email}. Cloud sync active.`);
        setTimeout(() => setAuthBanner(null), 4000);

        // Personalize candidate profile if it was using default placeholder name
        setCandidate(prev => {
          if (prev.name === 'Alex Chen' || !prev.name) {
            return {
              ...prev,
              name: user.displayName || prev.name,
              email: user.email || prev.email,
              lastUpdated: new Date().toISOString()
            };
          }
          return prev;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleStartBlank = () => {
    setApplications([]);
    setEmails([]);
    setNotifications([]);
    setIsWelcomeOpen(false);
    try {
      localStorage.setItem('jobtracker_welcome_seen', 'true');
    } catch {}
  };

  const handleExploreSample = () => {
    setApplications(INITIAL_JOB_APPLICATIONS);
    setEmails(INITIAL_INGESTED_EMAILS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setLinkedInContacts(INITIAL_LINKEDIN_CONTACTS);
    setGitHubRepos(INITIAL_GITHUB_REPOS);
    setIsWelcomeOpen(false);
    try {
      localStorage.setItem('jobtracker_welcome_seen', 'true');
    } catch {}
  };

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
    try {
      localStorage.setItem('jobtracker_welcome_seen', 'true');
    } catch {}
  };

  // Sync with Firestore when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to applications in Firestore
    const unsubscribe = FirebaseSync.subscribeApplications(
      currentUser.uid,
      (remoteApps) => {
        if (remoteApps.length > 0) {
          setApplications(remoteApps);
        } else if (applications.length > 0) {
          // First time sign-in: seed Firestore with current applications
          FirebaseSync.syncAllApplications(currentUser.uid, applications).catch(console.error);
        }
      },
      (err) => console.error('Firestore subscription error:', err)
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Sync to localStorage as fallback
  useEffect(() => {
    Storage.saveApplications(applications);
  }, [applications]);

  useEffect(() => {
    Storage.saveCandidate(candidate);
  }, [candidate]);

  useEffect(() => {
    Storage.saveEmails(emails);
  }, [emails]);

  useEffect(() => {
    Storage.saveLinkedInContacts(linkedInContacts);
  }, [linkedInContacts]);

  useEffect(() => {
    Storage.saveGitHubRepos(gitHubRepos);
  }, [gitHubRepos]);

  useEffect(() => {
    Storage.saveNotifications(notifications);
  }, [notifications]);

  // Auth Handlers
  const handleLoginWithGoogle = async () => {
    try {
      const user = await FirebaseSync.loginWithGoogle();
      setCurrentUser(user);
    } catch (err: any) {
      console.error('Login failed', err);
      setAuthBanner(`Sign-in failed: ${err?.message || 'Check popup permissions'}`);
      setTimeout(() => setAuthBanner(null), 5000);
    }
  };

  const handleLogout = async () => {
    try {
      await FirebaseSync.logout();
      setCurrentUser(null);
      setAuthBanner('Signed out. Local cache enabled.');
      setTimeout(() => setAuthBanner(null), 3000);
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  // Handlers
  const handleUpdateStatus = (jobId: string, newStatus: ApplicationStatus) => {
    const targetJob = applications.find(j => j.id === jobId);
    if (!targetJob) return;

    const oldStatus = targetJob.status;
    const updatedJob: JobApplication = {
      ...targetJob,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      history: [
        ...targetJob.history,
        {
          id: `h-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          fromStatus: oldStatus,
          toStatus: newStatus,
          note: `Status updated to ${newStatus}`
        }
      ]
    };

    const updatedApps = applications.map(app => (app.id === jobId ? updatedJob : app));
    setApplications(updatedApps);

    // Persist to Firestore if signed in
    if (currentUser) {
      FirebaseSync.saveApplication(currentUser.uid, updatedJob).catch(console.error);
    }

    // Create an automated notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'status_update',
      title: `${targetJob.company} Moved to ${newStatus.toUpperCase()}`,
      message: `The application for ${targetJob.title} at ${targetJob.company} was transitioned from ${oldStatus} to ${newStatus}.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: newStatus === 'offered' ? 'high' : 'medium',
      applicationId: targetJob.id,
      actionPayload: {
        type: 'view_job'
      }
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(updatedJob);
    }
  };

  const handleSaveJob = (newJob: JobApplication) => {
    setApplications(prev => [newJob, ...prev]);

    if (currentUser) {
      FirebaseSync.saveApplication(currentUser.uid, newJob).catch(console.error);
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'status_update',
      title: `New Role Tracked: ${newJob.company}`,
      message: `Saved ${newJob.title} at ${newJob.company} with a ${newJob.matchScore}% semantic resume match.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'low',
      applicationId: newJob.id
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleUpdateJob = (updatedJob: JobApplication) => {
    setApplications(prev => prev.map(j => (j.id === updatedJob.id ? updatedJob : j)));
    setSelectedJob(updatedJob);

    if (currentUser) {
      FirebaseSync.saveApplication(currentUser.uid, updatedJob).catch(console.error);
    }
  };

  const handleApplyEmailUpdates = (inboundEmails: IngestedEmail[]) => {
    let updatedApps = [...applications];
    const newNotifs: AppNotification[] = [];

    inboundEmails.forEach(email => {
      const targetApp = updatedApps.find(
        a => a.id === email.linkedApplicationId || a.company.toLowerCase() === email.detectedCompany.toLowerCase()
      );

      if (targetApp && targetApp.status !== email.detectedStatus) {
        const updated: JobApplication = {
          ...targetApp,
          status: email.detectedStatus,
          updatedAt: new Date().toISOString(),
          history: [
            ...targetApp.history,
            {
              id: `h-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              fromStatus: targetApp.status,
              toStatus: email.detectedStatus,
              note: `Auto-updated via incoming email: "${email.subject}"`
            }
          ]
        };

        updatedApps = updatedApps.map(a => (a.id === targetApp.id ? updated : a));

        if (currentUser) {
          FirebaseSync.saveApplication(currentUser.uid, updated).catch(console.error);
        }

        newNotifs.push({
          id: `notif-email-${Date.now()}-${targetApp.id}`,
          type: 'email_ingested',
          title: `Email Status Sync: ${targetApp.company}`,
          message: `Inbound email auto-transitioned status to ${email.detectedStatus.toUpperCase()}.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          priority: email.detectedStatus === 'interviewing' || email.detectedStatus === 'offered' ? 'high' : 'medium',
          applicationId: targetApp.id
        });
      }
    });

    setApplications(updatedApps);
    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev]);
    }
  };

  const handleAddIngestedEmail = (newEmail: IngestedEmail) => {
    setEmails(prev => [newEmail, ...prev]);

    const matchedApp = applications.find(
      a => a.id === newEmail.linkedApplicationId || a.company.toLowerCase() === newEmail.detectedCompany.toLowerCase()
    );

    if (matchedApp) {
      handleUpdateStatus(matchedApp.id, newEmail.detectedStatus);
    }
  };

  const handleAddLinkedInContact = (newContact: LinkedInContact) => {
    setLinkedInContacts(prev => [newContact, ...prev]);
  };

  const handleUpdateContactStatus = (contactId: string, status: LinkedInContact['outreachStatus']) => {
    setLinkedInContacts(prev =>
      prev.map(c => (c.id === contactId ? { ...c, outreachStatus: status } : c))
    );
  };

  const handleLinkRepoToJob = (jobId: string, repoUrl: string) => {
    const updated = applications.map(app =>
      app.id === jobId ? { ...app, linkedGitHubRepo: repoUrl || undefined } : app
    );
    setApplications(updated);
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(updated.find(j => j.id === jobId) || null);
    }
    const target = updated.find(j => j.id === jobId);
    if (currentUser && target) {
      FirebaseSync.saveApplication(currentUser.uid, target).catch(console.error);
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleResetData = () => {
    Storage.resetAll();
    window.location.reload();
  };

  // Filter applications by global search query if present
  const displayApplications = globalSearch.trim()
    ? applications.filter(
        app =>
          app.company.toLowerCase().includes(globalSearch.toLowerCase()) ||
          app.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
          app.requiredSkills.some(s => s.toLowerCase().includes(globalSearch.toLowerCase()))
      )
    : applications;

  const currentUserName = currentUser?.displayName || candidate.name || 'Candidate';
  const currentUserEmail = currentUser?.email || candidate.email;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#f8f9fe] via-[#f1f3fb] to-[#faf5ff] flex font-['Manrope',sans-serif] text-slate-900 overflow-x-hidden">
      {/* Eye-catching ambient background gradient glows */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/3 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-80 h-80 bg-pink-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 6-Page Navigation Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        onOpenNewJobModal={() => setIsNewJobModalOpen(true)}
        onOpenWelcome={() => setIsWelcomeOpen(true)}
        currentUser={currentUser}
        onLoginWithGoogle={handleLoginWithGoogle}
        onLogout={handleLogout}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        applicationsCount={applications.length}
        emailsCount={emails.length}
        unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
        userName={currentUserName}
        userEmail={currentUserEmail}
      />

      {/* Main Workspace Frame (offset for fixed sidebar on lg screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 min-h-screen">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onOpenNewJobModal={() => setIsNewJobModalOpen(true)}
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          currentUser={currentUser}
          onOpenWelcome={() => setIsWelcomeOpen(true)}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          userName={currentUserName}
        />

        {/* Cloud Sync Status Banner */}
        {authBanner && (
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 text-white text-xs py-2 px-6 text-center font-bold shadow-xs">
            {authBanner}
          </div>
        )}

        {/* The 6 Dedicated Pages */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Page 1: Applications Pipeline */}
          {currentPage === 'board' && (
            <KanbanBoard
              applications={displayApplications}
              onSelectJob={(job) => setSelectedJob(job)}
              onUpdateStatus={handleUpdateStatus}
              onOpenTailorModal={(job) => setTailorJob(job)}
              onOpenNewJobModal={() => setIsNewJobModalOpen(true)}
            />
          )}

          {/* Page 2: Free Career & Interview Coach */}
          {currentPage === 'chat' && (
            <CareerChatbot
              currentUser={currentUser}
              applications={applications}
              candidateProfile={candidate}
            />
          )}

          {/* Page 3: Recruiter Email Parser */}
          {currentPage === 'emails' && (
            <EmailIngestionCenter
              emails={emails}
              applications={applications}
              onApplyEmailUpdates={handleApplyEmailUpdates}
              onAddIngestedEmail={handleAddIngestedEmail}
            />
          )}

          {/* Page 4: Network & Portfolio Sync */}
          {currentPage === 'sync' && (
            <SyncIntegrationsModal
              linkedInContacts={linkedInContacts}
              gitHubRepos={gitHubRepos}
              applications={applications}
              onAddContact={handleAddLinkedInContact}
              onUpdateContactStatus={handleUpdateContactStatus}
              onLinkRepoToJob={handleLinkRepoToJob}
            />
          )}

          {/* Page 5: Analytics & Funnel Metrics */}
          {currentPage === 'analytics' && (
            <AnalyticsView applications={applications} />
          )}

          {/* Page 6: Your Profile & Resume (Full Page Hub) */}
          {currentPage === 'profile' && (
            <ProfilePage
              currentUser={currentUser}
              candidateProfile={candidate}
              applications={applications}
              onUpdateCandidateProfile={(updated) => {
                setCandidate(updated);
                if (currentUser) {
                  FirebaseSync.saveCandidateProfile(currentUser.uid, updated).catch(console.error);
                }
              }}
              onUpdateApplications={setApplications}
              onLoginWithGoogle={handleLoginWithGoogle}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Modern Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 font-display">Jobtracker AI</span>
            <span aria-hidden="true">·</span>
            <span>6-Page Unified Career Intelligence Workspace</span>
            {currentUser && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-mono text-[11px]">Firestore Cloud Connected</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsWelcomeOpen(true)}
              className="hover:text-blue-600 transition-colors cursor-pointer text-[11px] font-medium"
            >
              Welcome Guide
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setCurrentPage('profile')}
              className="hover:text-blue-600 transition-colors cursor-pointer text-[11px] font-medium"
            >
              Your Profile
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={applications.length === 0 ? handleExploreSample : handleStartBlank}
              className="hover:text-slate-900 transition-colors cursor-pointer text-[11px]"
              title={applications.length === 0 ? 'Load sample pipeline to explore' : 'Clear all sample data and start fresh'}
            >
              {applications.length === 0 ? 'Load Sample Pipeline' : 'Clear All (Fresh Slate)'}
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              {applications.length} Tracked Roles
            </span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          candidateProfile={candidate}
          onUpdateJob={handleUpdateJob}
          onOpenTailorModal={(j) => {
            setSelectedJob(null);
            setTailorJob(j);
          }}
        />
      )}

      {isNewJobModalOpen && (
        <NewApplicationModal
          isOpen={isNewJobModalOpen}
          onClose={() => setIsNewJobModalOpen(false)}
          candidateProfile={candidate}
          onSaveJob={handleSaveJob}
        />
      )}

      {tailorJob && (
        <BulletPointGeneratorModal
          isOpen={!!tailorJob}
          onClose={() => setTailorJob(null)}
          job={tailorJob}
          candidateProfile={candidate}
        />
      )}

      {isNotificationsOpen && (
        <NotificationCenter
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          applications={applications}
          onMarkAsRead={handleMarkNotificationRead}
          onDismiss={handleDismissNotification}
          onSelectJob={(j) => {
            setIsNotificationsOpen(false);
            setSelectedJob(j);
          }}
        />
      )}

      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          candidateProfile={candidate}
          applications={applications}
          onUpdateCandidateProfile={(updated) => {
            setCandidate(updated);
            if (currentUser) {
              FirebaseSync.saveCandidateProfile(currentUser.uid, updated).catch(console.error);
            }
          }}
          onLoginWithGoogle={handleLoginWithGoogle}
          onLogout={handleLogout}
        />
      )}

      {/* First-time Welcome & Getting Started Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={handleCloseWelcome}
        onStartBlank={handleStartBlank}
        onExploreSample={handleExploreSample}
      />
    </div>
  );
}
