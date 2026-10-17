import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Loader2,
  Trash2,
  Cpu,
  Zap,
  Shield,
  Layers,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { User } from 'firebase/auth';
import { JobApplication, CandidateProfile } from '../types/job';
import { ChatMessage, FirebaseSync } from '../utils/firebaseSync';

interface GeminiChatbotProps {
  currentUser: User | null;
  applications: JobApplication[];
  candidateProfile: CandidateProfile;
}

type RolePersona = 'interview_coach' | 'resume_advisor' | 'negotiation_strategist' | 'career_strategist';
type TaskComplexity = 'general' | 'fast' | 'complex';

const PERSONAS: { id: RolePersona; label: string; desc: string; icon: string }[] = [
  { id: 'interview_coach', label: 'Technical Interview Coach', desc: 'Mock interviews, PyTorch/ML systems coding & theory', icon: '🎯' },
  { id: 'resume_advisor', label: 'Resume & Skill-Gap Advisor', desc: 'XYZ bullet crafting, missing keyword coverage', icon: '📝' },
  { id: 'negotiation_strategist', label: 'Compensation & Offer Strategist', desc: 'Evaluating base, equity, and counter-offer drafts', icon: '💼' },
  { id: 'career_strategist', label: 'Career Mentor', desc: 'Application cadence, LinkedIn outreach & GitHub audit', icon: '🚀' }
];

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-welcome',
  role: 'model',
  content: `Hello! I'm your **Jobtracker AI Assistant**. 

I can help you prepare for technical interview rounds, evaluate offer terms, tailor resume bullet points to bridge skill gaps, and strategize your next career move.

**Choose a role or try one of the prompt starters below!**`,
  timestamp: new Date().toISOString(),
  modelUsed: 'gemini-3.8-flash'
};

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  currentUser,
  applications,
  candidateProfile
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rolePersona, setRolePersona] = useState<RolePersona>('interview_coach');
  const [taskComplexity, setTaskComplexity] = useState<TaskComplexity>('general');
  const [includePipelineContext, setIncludePipelineContext] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from Firestore if user is signed in
  useEffect(() => {
    if (currentUser) {
      FirebaseSync.loadChatMessages(currentUser.uid).then((saved) => {
        if (saved.length > 0) {
          setMessages(saved);
        }
      }).catch(err => console.error('Failed to load chat from Firestore', err));
    }
  }, [currentUser]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_GREETING]);
  };

  const handleSendMessage = async (e?: React.FormEvent, promptOverride?: string) => {
    if (e) e.preventDefault();
    const promptToSend = promptOverride || inputPrompt;
    if (!promptToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptToSend.trim(),
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputPrompt('');
    setIsLoading(true);

    if (currentUser) {
      FirebaseSync.saveChatMessage(currentUser.uid, userMessage).catch(console.error);
    }

    // Build context string from active applications
    let contextStr = '';
    if (includePipelineContext) {
      const activeRoles = applications.map(
        a => `${a.company} - ${a.title} (Status: ${a.status}, Match: ${a.matchScore}%, Missing: [${a.missingSkills.join(', ')}])`
      ).join('\n');
      contextStr = `Candidate: ${candidateProfile.name} (${candidateProfile.headline})\n\nCurrent Tracked Applications:\n${activeRoles}`;
    }

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.filter(m => m.id !== 'msg-welcome').map(m => ({
            role: m.role,
            content: m.content
          })),
          rolePersona,
          taskComplexity,
          context: contextStr
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Server error communicating with Gemini');
      }

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.content,
        timestamp: data.timestamp || new Date().toISOString(),
        modelUsed: data.modelUsed
      };

      setMessages(prev => [...prev, botMessage]);

      if (currentUser) {
        FirebaseSync.saveChatMessage(currentUser.uid, botMessage).catch(console.error);
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `Sorry, an error occurred while connecting to Gemini: ${error?.message || 'Check network connection.'}`,
        timestamp: new Date().toISOString(),
        modelUsed: 'gemini-3.8-flash'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getModelLabel = (complexity: TaskComplexity) => {
    switch (complexity) {
      case 'complex':
        return 'gemini-4-argon (Deep Reasoning)';
      case 'fast':
        return 'gemini-3.1-flash-lite (Ultra-fast)';
      case 'general':
      default:
        return 'gemini-3.8-flash (Balanced)';
    }
  };

  return (
    <div className="flex flex-col h-[750px] bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Gemini AI Career & Interview Advisor</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                Multi-Turn
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Interactive AI agent for technical screening, resume gap bridging, and offer negotiation
            </p>
          </div>
        </div>

        {/* Model & Persona Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Persona selector */}
          <select
            value={rolePersona}
            onChange={(e) => setRolePersona(e.target.value as RolePersona)}
            aria-label="Select AI Advisor Persona"
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {PERSONAS.map(p => (
              <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
            ))}
          </select>

          {/* Task complexity / model */}
          <select
            value={taskComplexity}
            onChange={(e) => setTaskComplexity(e.target.value as TaskComplexity)}
            aria-label="Select Model Complexity"
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px] focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="general">gemini-3.8-flash (General)</option>
            <option value="fast">gemini-3.1-flash-lite (Fast)</option>
            <option value="complex">gemini-4-argon (Complex/Deep)</option>
          </select>

          <button
            onClick={handleClearHistory}
            title="Clear Chat History"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context grounding toggle ribbon */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs flex items-center justify-between text-slate-600">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includePipelineContext}
            onChange={(e) => setIncludePipelineContext(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>Ground AI with my active applications pipeline ({applications.length} roles)</span>
        </label>

        {currentUser ? (
          <span className="text-[11px] text-emerald-700 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Firestore Sync Active</span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-mono">
            Sign in with Google to persist chat
          </span>
        )}
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 text-xs leading-relaxed">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-blue-700 border border-slate-200'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex flex-col gap-1.5 p-4 rounded-xl shadow-2xs ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                {/* Header info */}
                <div className={`flex items-center gap-2 text-[10px] font-mono ${isUser ? 'text-blue-100 justify-end' : 'text-slate-400'}`}>
                  <span>{isUser ? 'You' : 'Jobtracker AI'}</span>
                  {msg.modelUsed && !isUser && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-blue-600 font-semibold">{msg.modelUsed}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Content */}
                <div className="whitespace-pre-wrap leading-relaxed font-normal">
                  {msg.content}
                </div>

                {/* Footer copy button for bot messages */}
                {!isUser && (
                  <div className="self-end pt-1">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-xl self-start">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-blue-700 border border-slate-200 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 flex items-center gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="font-mono">
                {taskComplexity === 'complex' ? 'Reasoning with gemini-4-argon...' : 'Generating response...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Starters */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-mono shrink-0">Starters:</span>
        <button
          onClick={() => handleSendMessage(undefined, "Conduct a mock technical interview for my Anthropic Round 3 on ML System Architecture.")}
          className="px-2.5 py-1 bg-white border border-slate-200 rounded-full hover:border-blue-400 text-slate-700 whitespace-nowrap cursor-pointer hover:bg-blue-50/50"
        >
          Mock Interview for Anthropic
        </button>
        <button
          onClick={() => handleSendMessage(undefined, "How should I structure a counter-offer or deadline extension for my OpenAI offer?")}
          className="px-2.5 py-1 bg-white border border-slate-200 rounded-full hover:border-blue-400 text-slate-700 whitespace-nowrap cursor-pointer hover:bg-blue-50/50"
        >
          Negotiate OpenAI Offer
        </button>
        <button
          onClick={() => handleSendMessage(undefined, "What are the most critical take-home case study pitfalls for Stripe Risk Data Science?")}
          className="px-2.5 py-1 bg-white border border-slate-200 rounded-full hover:border-blue-400 text-slate-700 whitespace-nowrap cursor-pointer hover:bg-blue-50/50"
        >
          Stripe DS Case Study Tips
        </button>
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <textarea
          rows={2}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask your Gemini AI coach anything (e.g. conduct a mock technical interview, review resume bullet)..."
          className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
        />

        <button
          type="submit"
          disabled={isLoading || !inputPrompt.trim()}
          className="h-10 px-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
