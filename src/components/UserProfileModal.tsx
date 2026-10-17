import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Edit3,
  Check,
  LogOut,
  LogIn,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Save
} from 'lucide-react';
import { User } from 'firebase/auth';
import { CandidateProfile, JobApplication } from '../types/job';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  candidateProfile: CandidateProfile;
  applications: JobApplication[];
  onUpdateCandidateProfile: (updated: CandidateProfile) => void;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  candidateProfile,
  applications,
  onUpdateCandidateProfile,
  onLoginWithGoogle,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Form state
  const [name, setName] = useState(candidateProfile.name);
  const [email, setEmail] = useState(currentUser?.email || candidateProfile.email);
  const [phoneNumber, setPhoneNumber] = useState(candidateProfile.phoneNumber || '+1 (650) 498-2100');
  const [location, setLocation] = useState(candidateProfile.location || 'Palo Alto, CA');
  const [headline, setHeadline] = useState(candidateProfile.headline);
  const [targetRole, setTargetRole] = useState(candidateProfile.targetRole || 'Machine Learning Engineer / AI Applied Scientist');
  const [bio, setBio] = useState(candidateProfile.bio || '');
  const [linkedInUrl, setLinkedInUrl] = useState(candidateProfile.linkedInUrl || 'https://linkedin.com');
  const [githubUrl, setGithubUrl] = useState(candidateProfile.githubUrl || 'https://github.com');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: CandidateProfile = {
      ...candidateProfile,
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      location: location.trim(),
      headline: headline.trim(),
      targetRole: targetRole.trim(),
      bio: bio.trim(),
      linkedInUrl: linkedInUrl.trim(),
      githubUrl: githubUrl.trim(),
      lastUpdated: new Date().toISOString()
    };

    onUpdateCandidateProfile(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const activeInterviews = applications.filter(a => a.status === 'interviewing').length;
  const activeOffers = applications.filter(a => a.status === 'offered').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Your Profile
              </h2>
              <p className="text-xs text-slate-500">
                Personal contact information, education background, and account management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-xs text-slate-800">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile details updated and synced successfully.</span>
            </div>
          )}

          {/* User Hero Banner */}
          <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={candidateProfile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center font-display border-2 border-white shadow-xs">
                  {candidateProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {candidateProfile.name}
                  </h3>
                  {currentUser && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Google Verified</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {candidateProfile.headline}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{candidateProfile.location || 'Location not set'}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{candidateProfile.phoneNumber || 'Phone not set'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* Edit Form OR View Mode */}
          {isEditing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-4 p-5 bg-white rounded-xl border border-blue-200 shadow-2xs">
              <h4 className="font-bold text-slate-900 uppercase font-mono tracking-wider">
                Edit Contact & Profile Info
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (xxx) xxx-xxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Location / Work Preferences *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. San Francisco, CA / Open to Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Target Roles
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={linkedInUrl}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact Information card */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col gap-3">
                <h4 className="font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Contact Information</span>
                </h4>

                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium text-slate-900 text-right truncate max-w-[200px]">
                      {currentUser?.email || candidateProfile.email}
                    </span>
                  </div>

                  <div className="flex items-start justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-mono text-slate-900 font-medium">
                      {candidateProfile.phoneNumber || '+1 (650) 498-2100'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Location</span>
                    <span className="font-medium text-slate-900 text-right">
                      {candidateProfile.location || 'Palo Alto, CA'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between py-1">
                    <span className="text-slate-500">Target Role</span>
                    <span className="font-medium text-slate-900 text-right">
                      {candidateProfile.targetRole || 'ML Engineer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Education Background card */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col gap-3">
                <h4 className="font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Education Credentials</span>
                </h4>

                <div className="flex flex-col gap-2.5">
                  {candidateProfile.education.map((edu, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="font-bold text-slate-900">{edu.institution}</div>
                      <div className="text-slate-600">{edu.degree} in {edu.field}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Graduating {edu.gradYear} {edu.gpa && `· GPA: ${edu.gpa}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Activity KPI Strip */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-around text-center">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Total Applications</span>
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">{applications.length}</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Interview Loops</span>
              <span className="text-lg font-bold text-blue-600 font-mono tabular-nums">{activeInterviews}</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Offers In Hand</span>
              <span className="text-lg font-bold text-emerald-600 font-mono tabular-nums">{activeOffers}</span>
            </div>
          </div>

          {/* Account Authentication & Sign Out Section */}
          <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
            <h4 className="font-bold text-slate-900 uppercase font-mono tracking-wider">
              Account & Cloud Sync Security
            </h4>

            {currentUser ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Signed in with Google
                    </span>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {currentUser.email} · All changes synced to Cloud Firestore
                    </span>
                  </div>
                </div>

                {showSignOutConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-600">Are you sure?</span>
                    <button
                      onClick={() => {
                        onLogout();
                        setShowSignOutConfirm(false);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
                    >
                      Yes, Sign Out
                    </button>
                    <button
                      onClick={() => setShowSignOutConfirm(false)}
                      className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSignOutConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-blue-950 block">
                    Cloud Sync is Paused
                  </span>
                  <span className="text-blue-800 text-[11px]">
                    Sign in with your Google account to back up your applications and access them across devices.
                  </span>
                </div>

                <button
                  onClick={onLoginWithGoogle}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Google</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
