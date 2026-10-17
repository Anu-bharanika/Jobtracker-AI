import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  BookOpen,
  GraduationCap,
  Briefcase,
  Layers,
  Code,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { CandidateProfile } from '../types/job';
import { extractSkillsFromText, DS_AI_TAXONOMY } from '../utils/embeddingEngine';

interface ResumeIngestionModalProps {
  candidate: CandidateProfile;
  onUpdateCandidate: (updated: CandidateProfile) => void;
}

export const ResumeIngestionModal: React.FC<ResumeIngestionModalProps> = ({
  candidate,
  onUpdateCandidate
}) => {
  const [isEditingRaw, setIsEditingRaw] = useState(false);
  const [rawText, setRawText] = useState(candidate.rawResumeText);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processParsedResumeText(content, file.name);
      }
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
      ...candidate,
      skills: categorizedSkills,
      rawResumeText: text,
      lastUpdated: new Date().toISOString()
    };

    onUpdateCandidate(updatedProfile);
    setRawText(text);
    setUploadNotice(
      `Successfully ingested ${fileName || 'resume text'}. Extracted ${extractedSkills.length} Data Science & AI competencies and updated vector embeddings.`
    );
    setTimeout(() => setUploadNotice(null), 5000);
  };

  const handleSaveRawText = () => {
    processParsedResumeText(rawText);
    setIsEditingRaw(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Candidate Resume & Semantic Embedding Vector Space
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Vector representation used for cosine similarity computation and skill gap identification against job postings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Resume (PDF / TXT)</span>
            <input
              type="file"
              accept=".txt,.pdf,.docx,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{candidate.name}</h3>
            <p className="text-xs font-medium text-slate-600 mt-0.5">{candidate.headline}</p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Last vector sync: {new Date(candidate.lastUpdated).toLocaleDateString()}
          </span>
        </div>

        {/* Education Section */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider mb-2.5 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Academic Background</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {candidate.education.map((edu, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                <span className="font-bold text-slate-900 block">{edu.institution}</span>
                <span className="text-slate-700 font-medium">{edu.degree} in {edu.field}</span>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Class of {edu.gradYear} {edu.gpa && `· GPA: ${edu.gpa}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extracted Technical Competencies */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider mb-2.5 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-blue-600" />
            <span>Extracted Technical Competency Vectors</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {candidate.skills.map((skillGroup, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  {skillGroup.category} ({skillGroup.items.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {skillGroup.items.map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[11px] font-mono bg-white border border-slate-200 rounded text-slate-700 font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Raw Resume Text Editor */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              Raw Resume Text (Source for NLP Embeddings)
            </h4>
            <button
              onClick={() => setIsEditingRaw(!isEditingRaw)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingRaw ? 'Cancel Edit' : 'Edit Resume Text'}</span>
            </button>
          </div>

          {isEditingRaw ? (
            <div className="flex flex-col gap-2">
              <textarea
                rows={12}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                onClick={handleSaveRawText}
                className="self-end px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Re-Index Vector Embeddings
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
              {candidate.rawResumeText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
