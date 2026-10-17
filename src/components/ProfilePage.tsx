import React, { useState } from 'react';
import {
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
  Save,
  FileText,
  Upload,
  RefreshCw,
  Award,
  Layers,
  Code,
  Globe,
  Plus,
  Trash2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { extractSkillsFromText, DS_AI_TAXONOMY, performMatchAnalysis } from '../utils/embeddingEngine';

interface ProfilePageProps {
  currentUser: User | null;
  candidateProfile: CandidateProfile;
  applications: JobApplication[];
  onUpdateCandidateProfile: (updated: CandidateProfile) => void;
  onUpdateApplications?: (updated: JobApplication[]) => void;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  candidateProfile,
  applications,
  onUpdateCandidateProfile,
  onUpdateApplications,
  onLoginWithGoogle,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'resume' | 'education' | 'account'>('details');

  // Contact & Profile form state
  const [name, setName] = useState(candidateProfile.name);
  const [email, setEmail] = useState(currentUser?.email || candidateProfile.email);
  const [phoneNumber, setPhoneNumber] = useState(candidateProfile.phoneNumber || '+1 (650) 498-2100');
  const [location, setLocation] = useState(candidateProfile.location || 'Palo Alto, CA');
  const [headline, setHeadline] = useState(candidateProfile.headline);
  const [targetRole, setTargetRole] = useState(candidateProfile.targetRole || 'Machine Learning Engineer / AI Applied Scientist');
  const [bio, setBio] = useState(candidateProfile.bio || '');
  const [linkedInUrl, setLinkedInUrl] = useState(candidateProfile.linkedInUrl || 'https://linkedin.com');
  const [githubUrl, setGithubUrl] = useState(candidateProfile.githubUrl || 'https://github.com');

  // Resume Ingestion state
  const [rawResumeText, setRawResumeText] = useState(candidateProfile.rawResumeText);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);

  // Education state
  const [educationList, setEducationList] = useState(candidateProfile.education || []);

  const handleSaveContactDetails = (e: React.FormEvent) => {
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
      education: educationList,
      lastUpdated: new Date().toISOString()
    };

    onUpdateCandidateProfile(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingResume(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawResumeText(content);
        processParsedResumeText(content, file.name);
      }
      setIsParsingResume(false);
    };
    reader.onerror = () => {
      setIsParsingResume(false);
      setResumeNotice('Failed to read resume file. Please copy-paste the text.');
    };
    reader.readAsText(file);
  };

  const processParsedResumeText = (text: string, fileName?: string) => {
    const extractedSkills = extractSkillsFromText(text);

    // Group into categories
    const categorizedSkills = Object.entries(DS_AI_TAXONOMY).map(([category, skills]) => {
      const categoryLower = skills.map(s => s.toLowerCase());
      const matched = extractedSkills.filter(s => categoryLower.includes(s.toLowerCase()));
      return {
        category,
        items: matched
      };
    }).filter(c => c.items.length > 0);

    const updatedProfile: CandidateProfile = {
      ...candidateProfile,
      skills: categorizedSkills,
      rawResumeText: text,
      lastUpdated: new Date().toISOString()
    };

    onUpdateCandidateProfile(updatedProfile);

    // Recalculate match scores across all tracked applications
    if (onUpdateApplications && applications.length > 0) {
      const reIndexed = applications.map(app => {
        const analysis = performMatchAnalysis(text, app.description || `${app.title} at ${app.company}. Required skills: ${app.requiredSkills.join(', ')}`);
        return {
          ...app,
          matchScore: analysis.matchScore,
          matchedSkills: analysis.matchedSkills,
          missingSkills: analysis.missingSkills,
          updatedAt: new Date().toISOString()
        };
      });
      onUpdateApplications(reIndexed);
    }

    setResumeNotice(
      `Extracted ${extractedSkills.length} skills across ${categorizedSkills.length} technical domains${
        fileName ? ` from ${fileName}` : ''
      }! Application match scores updated.`
    );
    setTimeout(() => setResumeNotice(null), 5000);
  };

  const handleAddEducation = () => {
    const newEdu = {
      institution: 'University / Institute',
      degree: 'Master of Science',
      field: 'Computer Science & AI',
      gradYear: '2025',
      gpa: '3.9'
    };
    const updated = [...educationList, newEdu];
    setEducationList(updated);
    onUpdateCandidateProfile({
      ...candidateProfile,
      education: updated
    });
  };

  const handleRemoveEducation = (index: number) => {
    const updated = educationList.filter((_, i) => i !== index);
    setEducationList(updated);
    onUpdateCandidateProfile({
      ...candidateProfile,
      education: updated
    });
  };

  const totalSkillsCount = candidateProfile.skills.reduce((acc, cat) => acc + cat.items.length, 0);
  const activeInterviews = applications.filter(a => a.status === 'interviewing').length;
  const activeOffers = applications.filter(a => a.status === 'offered').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={candidateProfile.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center font-display shadow-xs">
                {candidateProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
            {currentUser && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white" title="Verified Account">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 font-display">
                {candidateProfile.name}
              </h1>
              {currentUser ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  <span>Local Guest Profile</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {candidateProfile.headline}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidateProfile.email}</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidateProfile.phoneNumber || '+1 (650) 498-2100'}</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidateProfile.location || 'Palo Alto, CA'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Information'}</span>
          </button>

          {currentUser ? (
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onLoginWithGoogle}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation for Sign Out */}
      {showSignOutConfirm && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4 text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Are you sure you want to sign out of <strong>{currentUser?.email}</strong>? Local workspace changes will remain stored locally.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onLogout();
                setShowSignOutConfirm(false);
              }}
              className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Confirm Sign Out
            </button>
            <button
              onClick={() => setShowSignOutConfirm(false)}
              className="px-3 py-1 bg-white border border-rose-300 text-rose-700 font-semibold rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile changes and contact details updated successfully.</span>
        </div>
      )}

      {resumeNotice && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{resumeNotice}</span>
        </div>
      )}

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Target Role</span>
          <span className="text-sm font-bold text-slate-900 block mt-1 truncate" title={candidateProfile.targetRole}>
            {candidateProfile.targetRole || 'Applied AI Scientist'}
          </span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Extracted Skills</span>
          <span className="text-lg font-bold text-blue-600 block mt-1 font-mono">
            {totalSkillsCount} Skills
          </span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Active Pipeline</span>
          <span className="text-lg font-bold text-slate-900 block mt-1 font-mono">
            {applications.length} Tracked
          </span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Interviews / Offers</span>
          <span className="text-lg font-bold text-emerald-600 block mt-1 font-mono">
            {activeInterviews} / {activeOffers}
          </span>
        </div>
      </div>

      {/* Tab Navigation inside Profile Page */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-2.5 transition-colors cursor-pointer ${
            activeTab === 'details'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Personal & Contact Details
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'resume'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Resume & Technical Skills ({totalSkillsCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'education'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Education & Credentials</span>
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'account'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Account & Cloud Sync</span>
        </button>
      </div>

      {/* TAB 1: Personal & Contact Details */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          {isEditing ? (
            <form onSubmit={handleSaveContactDetails} className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Edit Personal Information
                </h3>
                <span className="text-xs text-slate-400">All fields saved to persistent profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Phone Number (phn no) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (xxx) xxx-xxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Location & Work Preferences *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. San Francisco, CA / Open to Hybrid & Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Target Job Title
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Bio / Summary
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief background summary highlighting your core strengths, research areas, and career goals..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs resize-none"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs font-mono"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Contact Information Card */}
                <div className="p-5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col gap-4">
                  <h4 className="font-bold text-slate-900 font-display flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    <span>Contact Information</span>
                  </h4>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <span className="text-slate-500 font-medium">Email Address</span>
                      <span className="font-semibold text-slate-900 text-right">{candidateProfile.email}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-slate-500 font-medium">Phone Number</span>
                      <span className="font-mono font-semibold text-slate-900 text-right">
                        {candidateProfile.phoneNumber || '+1 (650) 498-2100'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-slate-500 font-medium">Primary Location</span>
                      <span className="font-semibold text-slate-900 text-right">
                        {candidateProfile.location || 'Palo Alto, CA'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-slate-500 font-medium">Target Role</span>
                      <span className="font-semibold text-blue-600 text-right">
                        {candidateProfile.targetRole || 'Machine Learning Engineer'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Professional Links & Presence Card */}
                <div className="p-5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col gap-4">
                  <h4 className="font-bold text-slate-900 font-display flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Online & Professional Links</span>
                  </h4>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">LinkedIn</span>
                      <a
                        href={candidateProfile.linkedInUrl || 'https://linkedin.com'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-mono"
                      >
                        <span>View LinkedIn</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">GitHub</span>
                      <a
                        href={candidateProfile.githubUrl || 'https://github.com'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-mono"
                      >
                        <span>View Repositories</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Profile Sync Status</span>
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Up to date</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio summary */}
              {candidateProfile.bio && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
                  <span className="font-bold text-blue-900 block mb-1">Professional Summary</span>
                  <p className="text-slate-700 leading-relaxed">{candidateProfile.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Resume Ingestion & Skills Radar */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload / Paste Resume (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Resume Ingestion & Parser</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload your resume file or paste text to extract technical skills and update semantic match scores.
              </p>
            </div>

            {/* File dropzone */}
            <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">
                Upload Resume Document (.txt, .md, .pdf)
              </span>
              <span className="text-[11px] text-slate-400">
                Parsed locally in browser with zero telemetry
              </span>
              <input
                type="file"
                accept=".txt,.md,.rtf,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Raw resume textarea */}
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Or Paste Resume Text</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {rawResumeText.length} characters
                </span>
              </label>
              <textarea
                rows={10}
                value={rawResumeText}
                onChange={(e) => setRawResumeText(e.target.value)}
                placeholder="Paste your resume work experience, projects, and education text here..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              onClick={() => processParsedResumeText(rawResumeText)}
              disabled={isParsingResume || !rawResumeText.trim()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isParsingResume ? 'Parsing...' : 'Re-Extract Skills & Recalculate Matches'}</span>
            </button>
          </div>

          {/* Right Column: Extracted Skills Taxonomy (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Technical Skills Radar & Taxonomy</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extracted from your resume and matched against ML, AI, & Data Science job postings.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                {totalSkillsCount} Skills Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidateProfile.skills.map((category) => (
                <div
                  key={category.category}
                  className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{category.category}</span>
                    <span className="text-[10px] font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {category.items.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.items.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Education & Credentials */}
      {activeTab === 'education' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Education & Academic Background</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Degrees, universities, specializations, and graduation milestones.
              </p>
            </div>
            <button
              onClick={handleAddEducation}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Degree</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {educationList.map((edu, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-50/70 rounded-xl border border-slate-200 relative group flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {edu.degree} in {edu.field}
                    </span>
                    <button
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove Degree"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    {edu.institution}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono border-t border-slate-200/60 pt-2.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Class of {edu.gradYear}</span>
                  </span>
                  {edu.gpa && (
                    <>
                      <span>·</span>
                      <span>GPA: {edu.gpa}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Account & Cloud Sync */}
      {activeTab === 'account' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Firebase Cloud Authentication</span>
            </h3>

            {currentUser ? (
              <div className="flex flex-col gap-4 text-xs">
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center gap-3">
                  {currentUser.photoURL && (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || ''}
                      className="w-10 h-10 rounded-full border border-emerald-300"
                    />
                  )}
                  <div>
                    <span className="font-bold text-emerald-900 block">
                      {currentUser.displayName || 'Authenticated User'}
                    </span>
                    <span className="text-emerald-700 block text-[11px] font-mono">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-slate-600 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span>User UID:</span>
                    <span className="font-mono text-[11px] text-slate-500 truncate max-w-[200px]">
                      {currentUser.uid}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span>Provider:</span>
                    <span className="font-medium text-slate-800">Google OAuth 2.0</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span>Database:</span>
                    <span className="font-medium text-emerald-700">Firestore Live Sync</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowSignOutConfirm(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold transition-colors cursor-pointer mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Jobtracker AI</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-xs">
                <p className="text-slate-600">
                  You are currently using guest local storage. Sign in with Google to synchronize your job applications, interview schedules, and notes across all your devices in real time.
                </p>
                <button
                  onClick={onLoginWithGoogle}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Workspace Data Management</span>
            </h3>
            <p className="text-slate-600">
              Manage your local and cloud pipeline data. All changes are encrypted in transit and saved to Firestore rules under user-scoped paths.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 mt-auto">
              <span className="font-semibold text-slate-800">Reset Workspace</span>
              <span className="text-[11px] text-slate-500">
                Clear all job applications and restore initial demo pipeline data.
              </span>
              <button
                onClick={() => {
                  if (confirm('Reset workspace to demo pipeline? This will clear locally cached applications.')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:text-rose-600 hover:border-rose-300 font-medium transition-colors text-xs self-start cursor-pointer"
              >
                Reset Workspace Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
