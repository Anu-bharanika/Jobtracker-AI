import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Copy,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Award
} from 'lucide-react';
import { JobApplication, CandidateProfile } from '../types/job';
import { generateTailoredBullets, BulletPointSuggestion } from '../utils/bulletGenerator';

interface BulletPointGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobApplication | null;
  candidateProfile: CandidateProfile;
}

export const BulletPointGeneratorModal: React.FC<BulletPointGeneratorModalProps> = ({
  isOpen,
  onClose,
  job,
  candidateProfile
}) => {
  if (!isOpen || !job) return null;

  // Selected missing keyword
  const defaultKeyword = job.missingSkills[0] || job.requiredSkills[0] || 'PyTorch';
  const [selectedKeyword, setSelectedKeyword] = useState<string>(defaultKeyword);
  
  // Selected experience or project to anchor to
  const availableExperiences = [
    ...candidateProfile.experience.map(e => ({ id: e.id, label: `${e.role} @ ${e.company}`, bullets: e.bullets })),
    ...candidateProfile.projects.map(p => ({ id: p.id, label: `Project: ${p.title}`, bullets: p.bullets }))
  ];

  const [selectedExpId, setSelectedExpId] = useState<string>(availableExperiences[0]?.id || '');
  const [selectedBulletIndex, setSelectedBulletIndex] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentExp = availableExperiences.find(e => e.id === selectedExpId) || availableExperiences[0];
  const originalBullet = currentExp?.bullets[selectedBulletIndex] || currentExp?.bullets[0] || '';

  const suggestions: BulletPointSuggestion[] = generateTailoredBullets(
    originalBullet,
    selectedKeyword,
    currentExp?.label || 'Previous Experience',
    originalBullet
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Tailored Resume Bullet-Point Generator
              </h2>
              <p className="text-xs text-slate-500">
                Targeting <span className="font-semibold text-slate-700">{job.title}</span> at <span className="font-semibold text-slate-700">{job.company}</span>
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

        {/* Authenticity Guardrail Banner */}
        <div className="px-6 py-2.5 bg-amber-50/80 border-b border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Factuality & Authenticity Guarantee:</span>
            <span className="ml-1">
              Suggestions adjust phrasing to highlight real candidate methodologies. Never fabricate tools you haven't used or metrics you cannot defend in technical interviews.
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-xs text-slate-800">
          {/* Step 1: Select Missing Skill to Bridge */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              1. Choose Target Keyword to Emphasize:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {job.missingSkills.map((skill, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedKeyword(skill)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                    selectedKeyword === skill
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {skill} (Gap)
                </button>
              ))}
              {job.matchedSkills.slice(0, 3).map((skill, idx) => (
                <button
                  key={`m-${idx}`}
                  onClick={() => setSelectedKeyword(skill)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                    selectedKeyword === skill
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Real Experience / Project Anchor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                2. Anchor to Actual Resume Experience:
              </label>
              <select
                value={selectedExpId}
                onChange={(e) => {
                  setSelectedExpId(e.target.value);
                  setSelectedBulletIndex(0);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {availableExperiences.map(exp => (
                  <option key={exp.id} value={exp.id}>{exp.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                Original Verified Bullet Point:
              </label>
              <select
                value={selectedBulletIndex}
                onChange={(e) => setSelectedBulletIndex(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 truncate"
              >
                {currentExp?.bullets.map((b, i) => (
                  <option key={i} value={i}>
                    Bullet {i + 1}: {b.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current verified text */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-xs italic">
            <span className="font-semibold text-slate-700 not-italic block mb-0.5">
              Current Resume Text:
            </span>
            "{originalBullet}"
          </div>

          {/* Step 3: Generated Tailored Suggestions */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Tailored Bullet Point Formulations:</span>
              <span className="font-mono text-slate-500 text-[11px]">
                Target: <span className="font-semibold text-blue-600">{selectedKeyword}</span>
              </span>
            </h3>

            <div className="flex flex-col gap-3">
              {suggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {sug.framework}
                    </span>
                    <button
                      onClick={() => handleCopy(sug.bullet, sug.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        copiedId === sug.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                      }`}
                    >
                      {copiedId === sug.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-900 leading-relaxed font-medium">
                    {sug.bullet}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-500">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{sug.authenticityWarning}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
