import {
  CandidateProfile,
  JobApplication,
  IngestedEmail,
  LinkedInContact,
  GitHubRepoSync,
  AppNotification
} from '../types/job';
import {
  INITIAL_CANDIDATE_PROFILE,
  INITIAL_JOB_APPLICATIONS,
  INITIAL_INGESTED_EMAILS,
  INITIAL_LINKEDIN_CONTACTS,
  INITIAL_GITHUB_REPOS,
  INITIAL_NOTIFICATIONS
} from './mockData';

const KEYS = {
  APPLICATIONS: 'datatrack_applications_v1',
  CANDIDATE: 'datatrack_candidate_v1',
  EMAILS: 'datatrack_emails_v1',
  LINKEDIN: 'datatrack_linkedin_v1',
  GITHUB: 'datatrack_github_v1',
  NOTIFICATIONS: 'datatrack_notifications_v1',
  SETTINGS: 'datatrack_settings_v1'
};

export interface AppSettings {
  autoClassifyEmails: boolean;
  notifyOnStatusChange: boolean;
  followUpDaysThreshold: number; // default 5 days
  soundAlertsEnabled: boolean;
  githubUsername: string;
  linkedInConnected: boolean;
  emailSyncConnected: boolean;
  imapHost?: string;
  imapUser?: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoClassifyEmails: true,
  notifyOnStatusChange: true,
  followUpDaysThreshold: 5,
  soundAlertsEnabled: true,
  githubUsername: 'alexchen-ai',
  linkedInConnected: true,
  emailSyncConnected: true,
  imapHost: 'imap.mail.stanford.edu',
  imapUser: 'alex.chen.ai@stanford.edu'
};

export const Storage = {
  getApplications(): JobApplication[] {
    try {
      const data = localStorage.getItem(KEYS.APPLICATIONS);
      return data ? JSON.parse(data) : INITIAL_JOB_APPLICATIONS;
    } catch {
      return INITIAL_JOB_APPLICATIONS;
    }
  },

  saveApplications(apps: JobApplication[]): void {
    try {
      localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
    } catch (e) {
      console.error('Failed to save applications', e);
    }
  },

  getCandidate(): CandidateProfile {
    try {
      const data = localStorage.getItem(KEYS.CANDIDATE);
      return data ? JSON.parse(data) : INITIAL_CANDIDATE_PROFILE;
    } catch {
      return INITIAL_CANDIDATE_PROFILE;
    }
  },

  saveCandidate(profile: CandidateProfile): void {
    try {
      localStorage.setItem(KEYS.CANDIDATE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save candidate', e);
    }
  },

  getEmails(): IngestedEmail[] {
    try {
      const data = localStorage.getItem(KEYS.EMAILS);
      return data ? JSON.parse(data) : INITIAL_INGESTED_EMAILS;
    } catch {
      return INITIAL_INGESTED_EMAILS;
    }
  },

  saveEmails(emails: IngestedEmail[]): void {
    try {
      localStorage.setItem(KEYS.EMAILS, JSON.stringify(emails));
    } catch (e) {
      console.error('Failed to save emails', e);
    }
  },

  getLinkedInContacts(): LinkedInContact[] {
    try {
      const data = localStorage.getItem(KEYS.LINKEDIN);
      return data ? JSON.parse(data) : INITIAL_LINKEDIN_CONTACTS;
    } catch {
      return INITIAL_LINKEDIN_CONTACTS;
    }
  },

  saveLinkedInContacts(contacts: LinkedInContact[]): void {
    try {
      localStorage.setItem(KEYS.LINKEDIN, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to save contacts', e);
    }
  },

  getGitHubRepos(): GitHubRepoSync[] {
    try {
      const data = localStorage.getItem(KEYS.GITHUB);
      return data ? JSON.parse(data) : INITIAL_GITHUB_REPOS;
    } catch {
      return INITIAL_GITHUB_REPOS;
    }
  },

  saveGitHubRepos(repos: GitHubRepoSync[]): void {
    try {
      localStorage.setItem(KEYS.GITHUB, JSON.stringify(repos));
    } catch (e) {
      console.error('Failed to save repos', e);
    }
  },

  getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotifications(notifs: AppNotification[]): void {
    try {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  resetAll(): void {
    localStorage.removeItem(KEYS.APPLICATIONS);
    localStorage.removeItem(KEYS.CANDIDATE);
    localStorage.removeItem(KEYS.EMAILS);
    localStorage.removeItem(KEYS.LINKEDIN);
    localStorage.removeItem(KEYS.GITHUB);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
    localStorage.removeItem(KEYS.SETTINGS);
  }
};
