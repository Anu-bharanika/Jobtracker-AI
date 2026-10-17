import React, { useState } from 'react';
import {
  X,
  Link as LinkIcon,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { JobApplication, ApplicationStatus, WorkMode, ExperienceLevel, CandidateProfile } from '../types/job';
import { parseJobPostingText, performMatchAnalysis } from '../utils/embeddingEngine';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateProfile: CandidateProfile;
  onSaveJob: (job: JobApplication) => void;
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({
  isOpen,
  onClose,
  candidateProfile,
  onSaveJob
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'raw_text' | 'manual'>('url');
  
  // URL Tab state
  const [urlInput, setUrlInput] = useState('');
  const [urlParsing, setUrlParsing] = useState(false);

  // Raw Text Tab state
  const [rawTextInput, setRawTextInput] = useState('');

  // Form Fields (Extracted or Manual)
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('hybrid');
  const [salaryRange, setSalaryRange] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('entry');
  const [status, setStatus] = useState<ApplicationStatus>('saved');
  const [description, setDescription] = useState('');
  const [skillsString, setSkillsString] = useState('');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState<'url_ingest' | 'manual' | 'linkedin' | 'github'>('url_ingest');

  if (!isOpen) return null;

  // Process and extract text
  const handleExtractFromUrl = () => {
    if (!urlInput.trim()) return;
    setUrlParsing(true);

    // Realistic parsing simulator for LinkedIn, Greenhouse, Lever, etc.
    setTimeout(() => {
      let sampleText = '';
      if (urlInput.toLowerCase().includes('anthropic')) {
        sampleText = `Anthropic - AI Research Engineer (Applied Alignment)\nLocation: San Francisco, CA (Hybrid)\nSalary: $175,000 - $220,000 / yr\nRequirements:\n- Proficiency in Python and PyTorch\n- Experience fine-tuning Transformers and LLMs using LoRA or RLHF\n- Deep understanding of probability, statistics, and evaluation metrics\n- Familiarity with distributed training and CUDA is a plus.`;
      } else if (urlInput.toLowerCase().includes('stripe')) {
        sampleText = `Stripe - Data Scientist, Fraud Risk ML\nLocation: South San Francisco, CA / Remote\nSalary: $165,000 - $195,000 / yr\nRequirements:\n- Strong foundation in Python, SQL, and Scikit-learn\n- Experience building XGBoost classification models for risk and fraud\n- Solid grasp of A/B testing, hypothesis testing, and causal inference.`;
      } else if (urlInput.toLowerCase().includes('github')) {
        sampleText = `Open Source AI Lab - ML Systems Engineer\nLocation: Remote (US / Global)\nSalary: $150,000 - $190,000\nRequirements: Python, PyTorch, Docker, FastAPI, Vector Databases, ChromaDB, RAG architectures.`;
      } else {
        sampleText = `Position at ${urlInput.replace(/^https?:\/\/(?:www\.)?([^.\/]+).*/i, '$1')}\nJob Title: Machine Learning & Data Science Engineer\nLocation: San Francisco, CA (Hybrid)\nRequirements: Python, PyTorch, SQL, Scikit-learn, Transformers, MLOps, Docker.`;
      }

      const extracted = parseJobPostingText(sampleText, urlInput);
      setCompany(extracted.company);
      setTitle(extracted.title);
      setLocation(extracted.location);
      setWorkMode(extracted.workMode);
      setSalaryRange(extracted.salaryRange || '');
      setExperienceLevel(extracted.experienceLevel);
      setDescription(sampleText);
      setSkillsString(extracted.requiredSkills.join(', '));
      setSource(urlInput.includes('linkedin') ? 'linkedin' : urlInput.includes('github') ? 'github' : 'url_ingest');
      setUrlParsing(false);
      setActiveTab('manual'); // Show extracted results for confirmation
    }, 450);
  };

  const handleExtractFromRawText = () => {
    if (!rawTextInput.trim()) return;
    const extracted = parseJobPostingText(rawTextInput);
    setCompany(extracted.company);
    setTitle(extracted.title);
    setLocation(extracted.location);
    setWorkMode(extracted.workMode);
    setSalaryRange(extracted.salaryRange || '');
    setExperienceLevel(extracted.experienceLevel);
    setDescription(rawTextInput);
    setSkillsString(extracted.requiredSkills.join(', '));
    setSource('manual');
    setActiveTab('manual');
  };

  // Live match analysis
  const currentSkills = skillsString.split(',').map(s => s.trim()).filter(Boolean);
  const matchResult = performMatchAnalysis(
    candidateProfile.rawResumeText,
    `${company} ${title} ${description} ${skillsString}`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !title.trim()) return;

    const newJob: JobApplication = {
      id: `job-${Date.now()}`,
      company: company.trim(),
      title: title.trim(),
      location: location.trim(),
      workMode,
      salaryRange: salaryRange.trim() || undefined,
      url: urlInput.trim() || undefined,
      appliedDate: status === 'applied' ? new Date().toISOString().split('T')[0] : undefined,
      status,
      matchScore: matchResult.matchScore,
      experienceLevel,
      requiredSkills: currentSkills,
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      description: description.trim() || `${title} at ${company}`,
      notes: notes.trim(),
      interviewRounds: [],
      source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `h-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          toStatus: status,
          note: `Tracked via ${source} ingestion`
        }
      ]
    };

    onSaveJob(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Track New Job Application
            </h2>
            <p className="text-xs text-slate-500">
              Ingest via posting URL, raw text parser, or structured input
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ingestion Mode Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Posting URL Ingest</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw_text')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'raw_text'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Description Text</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Structured Review & Save</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'url' && (
            <div className="flex flex-col gap-4">
              <label className="text-xs font-medium text-slate-700">
                Job Posting URL (LinkedIn, Greenhouse, Lever, Ashby, GitHub)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://linkedin.com/jobs/view/... or https://boards.greenhouse.io/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleExtractFromUrl}
                  disabled={urlParsing || !urlInput.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {urlParsing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Extract Info</span>
                    </>
                  )}
                </button>
              </div>

              {/* Ingestion guidance */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block mb-0.5">
                    Automated Information Extractor
                  </span>
                  <span className="text-[11px] leading-relaxed">
                    Paste any live job posting URL from LinkedIn, Greenhouse, Lever, Ashby, or company career pages. Our NLP engine will extract title, location, salary, and required competencies, then compute your semantic match score.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw_text' && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-slate-700">
                Paste Raw Job Description or Email Text
              </label>
              <textarea
                rows={7}
                placeholder="Paste requirements, responsibilities, salary info, or bullet points here..."
                value={rawTextInput}
                onChange={(e) => setRawTextInput(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
              <button
                type="button"
                onClick={handleExtractFromRawText}
                disabled={!rawTextInput.trim()}
                className="self-end flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extract Details</span>
              </button>
            </div>
          )}

          {activeTab === 'manual' && (
            <form id="job-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Match Score Banner */}
              <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-700 font-mono tabular-nums">
                    {matchResult.matchScore}%
                  </span>
                  <div className="text-xs text-blue-900">
                    <span className="font-semibold block">Semantic Resume Match</span>
                    <span className="text-[11px] text-blue-700">
                      Cosine sim: {matchResult.cosineSimilarity} · {matchResult.matchedSkills.length} of {matchResult.allJobSkills.length} skills matched
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-blue-800">
                    {matchResult.missingSkills.length} skill gaps identified
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Work Mode
                  </label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Salary Range (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $160,000 - $190,000"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 capitalize"
                  >
                    <option value="saved">Saved / Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offered">Offered</option>
                    <option value="rejected">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, PyTorch, SQL, Transformers"
                  value={skillsString}
                  onChange={(e) => setSkillsString(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Private Notes or Strategy
                </label>
                <textarea
                  rows={2}
                  placeholder="Recruiter notes, referral contact, or interview focus..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {activeTab === 'manual' ? (
            <button
              type="submit"
              form="job-form"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Application</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span>Skip to Manual Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
