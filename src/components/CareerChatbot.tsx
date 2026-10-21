import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  Briefcase,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Target,
  Award,
  Zap,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { User } from 'firebase/auth';
import { JobApplication, CandidateProfile } from '../types/job';
import { ChatMessage, FirebaseSync } from '../utils/firebaseSync';

interface CareerChatbotProps {
  currentUser: User | null;
  applications: JobApplication[];
  candidateProfile: CandidateProfile;
}

type RolePersona = 'interview_coach' | 'resume_advisor' | 'negotiation_strategist' | 'career_strategist';

interface PersonaDef {
  id: RolePersona;
  label: string;
  tagline: string;
  desc: string;
  icon: string;
  gradient: string;
  starters: string[];
}

const PERSONAS: PersonaDef[] = [
  {
    id: 'interview_coach',
    label: 'Technical Interview Coach',
    tagline: 'Mock rounds & technical Q&A',
    desc: 'Deep-dive into PyTorch, ML systems, coding problems & STAR behavioral questions',
    icon: '🎯',
    gradient: 'from-violet-500 to-indigo-600',
    starters: [
      'Mock interview: Explain difference between CrossEntropy and NLLLoss in PyTorch',
      'What are common System Design questions for ML inference at scale?',
      'How to answer "Tell me about a time an ML model failed in production" using STAR method?'
    ]
  },
  {
    id: 'resume_advisor',
    label: 'Resume & ATS Advisor',
    tagline: 'XYZ bullet points & keyword coverage',
    desc: 'Craft impactful accomplishment bullets and bridge technical skill gaps',
    icon: '📝',
    gradient: 'from-pink-500 to-rose-600',
    starters: [
      'How to rewrite my project bullet point using Google XYZ formula?',
      'Which missing skills should I prioritize to improve my match scores?',
      'How do I showcase distributed training on a 1-page resume?'
    ]
  },
  {
    id: 'negotiation_strategist',
    label: 'Compensation & Offer Strategist',
    tagline: 'Salary benchmarks & counter-offers',
    desc: 'Evaluate base, equity/RSUs, sign-on bonuses and counter-offer email drafts',
    icon: '💼',
    gradient: 'from-amber-500 to-orange-600',
    starters: [
      'Draft a polite counter-offer email requesting a 10% higher base salary',
      'How should I evaluate RSUs vs private startup equity?',
      'How to ask for a 1-week extension on an offer deadline?'
    ]
  },
  {
    id: 'career_strategist',
    label: 'Pipeline & Outreach Mentor',
    tagline: 'LinkedIn outreach & follow-up',
    desc: 'Recruiter message templates, application cadence, and tracking advice',
    icon: '🚀',
    gradient: 'from-emerald-500 to-teal-600',
    starters: [
      'Write a warm LinkedIn outreach message to a technical recruiter',
      'What is the ideal follow-up cadence after submitting an application?',
      'Analyze my active pipeline: Which roles should I focus on this week?'
    ]
  }
];

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-welcome',
  role: 'model',
  content: `👋 **Welcome to your Free Career & Interview Assistant!**

I am your 100% free, instant-response career coach. No subscriptions, no API tokens, and no fees required.

Here is what I can help you with today:
- 🎯 **Technical Mock Interviews**: PyTorch, ML architecture, algorithms, Python, and system design
- 📝 **Resume Bullet Tailoring**: Craft quantified Google XYZ bullets to bridge skill gaps
- 💼 **Offer & Salary Strategy**: Professional counter-offer email drafts and compensation benchmarks
- 🚀 **Networking & Outreach**: High-conversion LinkedIn cold messages and interview follow-up emails
- 📊 **Pipeline Strategy**: Real-time advice on your active tracked applications

*Click any prompt starter below or ask anything!*`,
  timestamp: new Date().toISOString(),
  modelUsed: 'Free Client Engine'
};

// Knowledge base generator for comprehensive, tailored, zero-fee responses
function generateNormalChatbotReply(
  prompt: string,
  persona: RolePersona,
  applications: JobApplication[],
  candidateProfile: CandidateProfile
): string {
  const query = prompt.toLowerCase().trim();

  // 1. Pipeline Analysis & specific application questions
  if (
    query.includes('pipeline') ||
    query.includes('my application') ||
    query.includes('which job') ||
    query.includes('my active') ||
    query.includes('which roles')
  ) {
    if (!applications || applications.length === 0) {
      return `### 📊 Application Pipeline Overview\n\nYou currently don't have any tracked jobs in your pipeline yet.\n\n**Next Steps:**\n1. Click **"+ Add Application"** in the sidebar or header to add your target roles.\n2. Once added, I will automatically calculate match scores, detect missing technical keywords, and help you tailor tailored resume bullets!`;
    }

    const sortedByMatch = [...applications].sort((a, b) => b.matchScore - a.matchScore);
    const topMatch = sortedByMatch[0];
    const interviewing = applications.filter(a => a.status === 'interviewing');
    const applied = applications.filter(a => a.status === 'applied');

    let summary = `### 📊 Your Active Pipeline Intelligence\n\n`;
    summary += `You are tracking **${applications.length} total opportunities**:\n`;
    summary += `- **${interviewing.length}** in active interview stages\n`;
    summary += `- **${applied.length}** submitted applications awaiting response\n`;
    summary += `- **${applications.filter(a => a.status === 'saved').length}** saved opportunities\n\n`;

    if (topMatch) {
      summary += `🌟 **Top Match Opportunity:** **${topMatch.company}** - *${topMatch.title}* (${topMatch.matchScore}% Match)\n`;
      if (topMatch.matchedSkills.length > 0) {
        summary += `- **Strengths:** ${topMatch.matchedSkills.slice(0, 4).join(', ')}\n`;
      }
      if (topMatch.missingSkills.length > 0) {
        summary += `- **Key Missing Keywords:** ${topMatch.missingSkills.slice(0, 3).join(', ')} *(Recommend highlighting these in your prep or resume)*\n\n`;
      }
    }

    summary += `💡 **Coach Recommendation:**\n`;
    if (interviewing.length > 0) {
      summary += `Prioritize deep technical prep for **${interviewing.map(i => i.company).join(', ')}**. Practice system design trade-offs and behavioral STAR stories right now!`;
    } else {
      summary += `Aim for **5 tailored applications per week**. Review missing keywords on your top saved roles to boost your match scores into the 80%+ bracket.`;
    }

    return summary;
  }

  // 2. Counter-offer / Negotiation
  if (
    query.includes('counter-offer') ||
    query.includes('counter offer') ||
    query.includes('negotiat') ||
    query.includes('salary') ||
    query.includes('base salary') ||
    query.includes('rsu') ||
    query.includes('equity')
  ) {
    return `### 💼 Professional Counter-Offer Email Template

Here is an executive-tested template you can adapt:

\`\`\`text
Subject: Re: Offer of Employment - ${candidateProfile.name || '[Your Name]'}

Dear [Hiring Manager / Recruiter Name],

Thank you so much for extending the offer to join [Company] as [Job Title]. I am thrilled by the vision of the team and the opportunity to contribute directly to [mention specific project or goal, e.g., ML infrastructure / product growth].

After reviewing the full package and considering market data for comparable [Role Title] positions, I would like to discuss the base compensation. Given my experience in [Key Skill 1] and [Key Skill 2], which will allow me to deliver immediate impact on [specific deliverable], I would be thrilled to accept immediately if we could bring the base salary to $[Target Amount, e.g., 145,000].

I am very excited about the prospect of joining [Company] and hope we can reach a mutually beneficial agreement. Thank you again for your time and advocacy!

Warm regards,
${candidateProfile.name || '[Your Name]'}
${candidateProfile.phoneNumber || '[Your Phone]'}
\`\`\`

**Key Negotiation Rules:**
1. **Always express enthusiasm first** before talking numbers.
2. **Anchor with value**: Tie your request to specific deliverables you will achieve.
3. **Be flexible on levers**: If base is capped, ask for a sign-on bonus, equity refreshers, or accelerated review at 6 months.`;
  }

  // 3. Technical Interview Prep (PyTorch, ML, Coding, System Design)
  if (
    query.includes('pytorch') ||
    query.includes('loss') ||
    query.includes('cross-entropy') ||
    query.includes('interview') ||
    query.includes('system design') ||
    query.includes('technical') ||
    query.includes('star method')
  ) {
    if (query.includes('loss') || query.includes('cross') || query.includes('nll')) {
      return `### 🎯 Technical Deep-Dive: \`nn.CrossEntropyLoss\` vs \`nn.NLLLoss\` in PyTorch

This is a classic ML engineering screen question. Here is the concise, interview-winning breakdown:

#### 1. Mathematical Difference
- **\`nn.CrossEntropyLoss\`** combines **\`nn.LogSoftmax\`** and **\`nn.NLLLoss\`** in a single numerically stable class.
  $$\\text{CrossEntropy}(x, y) = -\\log \\left( \\frac{\\exp(x_y)}{\\sum_j \\exp(x_j)} \\right)$$
- **\`nn.NLLLoss\`** (Negative Log Likelihood) expects **log-probabilities** as inputs (meaning you must apply \`F.log_softmax()\` beforehand).

#### 2. PyTorch Code Comparison
\`\`\`python
import torch
import torch.nn as nn
import torch.nn.functional as F

logits = torch.randn(3, 5, requires_grad=True) # Raw unnormalized outputs
target = torch.empty(3, dtype=torch.long).random_(5)

# Method A: Standard recommended way (numerically stable)
criterion_ce = nn.CrossEntropyLoss()
loss_a = criterion_ce(logits, target)

# Method B: Equivalent manual pipeline
log_probs = F.log_softmax(logits, dim=1)
criterion_nll = nn.NLLLoss()
loss_b = criterion_nll(log_probs, target)

assert torch.allclose(loss_a, loss_b) # True!
\`\`\`

#### 3. Why PyTorch Combines Them:
Applying \`LogSoftmax\` followed by \`NLLLoss\` separately can suffer from floating-point underflow. PyTorch's combined implementation uses the **LogSumExp** trick for mathematical stability.`;
    }

    if (query.includes('system design') || query.includes('inference') || query.includes('scale')) {
      return `### 🎯 ML System Design Framework: Large-Scale Inference

When asked to design an ML inference system (e.g. recommendation, fraud detection, LLM serving):

#### 1. Requirements & Constraints
- **Latency Budget**: p99 < 50ms (real-time) vs async batching
- **Throughput**: e.g., 20,000 QPS peak
- **Model Size**: e.g., 7B parameters (requires FP16/INT8 quantization)

#### 2. Architecture Layers
1. **API Gateway & Load Balancer**: Rate-limiting, geo-routing, SSL termination.
2. **Feature Store (Low Latency)**: Redis or Feast for online feature retrieval (< 5ms).
3. **Inference Engine**:
   - Dynamic batching (e.g. Triton Inference Server, vLLM, TensorRT)
   - Model parallelism: Tensor parallelism across GPUs
   - KV Cache optimizations (PagedAttention) for generative models
4. **Fallback & Graceful Degradation**:
   - Cache frequent query results in Redis
   - Fall back to a lightweight heuristic or simpler gradient-boosted tree if GPU queue overflows.

#### 3. Monitoring & Guardrails
- Track drift (Wasserstein distance / PSI), tail latency, GPU memory utilization, and cost per million queries.`;
    }

    if (query.includes('star') || query.includes('behavioral') || query.includes('failed')) {
      return `### 🎯 STAR Behavioral Framework: "Tell Me About a Time a Model Failed"

Interviewers ask this to test **engineering ownership, debugging rigor, and post-mortem maturity**.

#### Structure Your Answer:
1. **Situation (20%)**: "In my previous project, we deployed a real-time lead qualification model with 92% validation accuracy."
2. **Task (15%)**: "Shortly after launch, inference performance degraded noticeably, resulting in a 15% increase in false negatives."
3. **Action (50% - Core)**: 
   - "I immediately investigated the data pipeline and identified **feature drift**: an upstream API schema had changed, passing null timestamps converted to 0."
   - "I rolled back to the prior rule-based checkpoint within 30 minutes to safeguard user experience."
   - "I built automated schema validation and distribution alerting using Great Expectations to catch statistical anomalies before inference."
4. **Result (15%)**: "The system maintained 99.9% uptime, zero further silent failures occurred, and we adopted automated drift monitoring as a company-wide standard."`;
    }

    return `### 🎯 Technical Interview Preparation Checklist

Here are the 4 core pillars to master for top AI & Software roles:

1. **Coding & Algorithms**:
   - Two Pointers & Sliding Window (Substrings, arrays)
   - BFS/DFS Graph Traversal (Dependency resolution, tree search)
   - Dynamic Programming (Edit distance, knapsack)
2. **Data Science & ML Core**:
   - Bias-Variance trade-off & regularizations (L1 Lasso vs L2 Ridge)
   - Evaluation metrics: ROC-AUC, PR-AUC, F1-Score for imbalanced classes
   - Cross-validation pitfalls (Data leakage, temporal split)
3. **System Architecture**:
   - Microservices vs Monolith trade-offs
   - Database selection: Postgres (relational ACID) vs Vector DB (FAISS/Pinecone)
   - Asynchronous processing with Redis queues or Kafka
4. **Behavioral Impact**:
   - Have 3 polished STAR stories ready (conflict, technical failure, rapid delivery).

*Ask me to quiz you on any specific topic!*`;
  }

  // 4. Resume & XYZ Bullets
  if (
    query.includes('resume') ||
    query.includes('xyz') ||
    query.includes('bullet') ||
    query.includes('tailor') ||
    query.includes('ats')
  ) {
    return `### 📝 Google XYZ Formula for High-Impact Resumes

Google's formula for standout accomplishment bullets is:
> **"Accomplished [X], as measured by [Y], by doing [Z]"**

#### ❌ Weak Example (Task-oriented):
> *"Responsible for training machine learning models on customer data."*

#### ✅ Strong XYZ Example:
> *"Boosted customer churn prediction accuracy by **18% (from 74% to 92% ROC-AUC)** by engineering automated feature pipelines with PyTorch and LightGBM over 1.2M user event streams."*

#### Key Action Verbs to Use:
- **Architected**, **Spearheaded**, **Optimized**, **Automated**, **Reduced**, **Accelerated**

#### Pro Tip for ATS Scanners:
ATS systems perform exact keyword matching. Ensure the exact technical names from the job posting (e.g. \`Docker\`, \`PyTorch\`, \`PostgreSQL\`, \`Kubernetes\`) appear in your skills section and directly within your bullet points!`;
  }

  // 5. LinkedIn & Recruiter Outreach
  if (
    query.includes('linkedin') ||
    query.includes('outreach') ||
    query.includes('recruiter') ||
    query.includes('message') ||
    query.includes('cold') ||
    query.includes('follow-up') ||
    query.includes('follow up')
  ) {
    return `### 🚀 High-Converting Recruiter Outreach Templates

#### 1. InMail / Direct Message to Technical Recruiter:
\`\`\`text
Hi [Recruiter Name],

I noticed you are leading talent acquisition for the [Engineering / Data Team] at [Company]. I've been closely following [Company]'s recent work in [mention specific tech or initiative, e.g. real-time AI indexing].

With my background in [Your Specialization, e.g., ML Engineering & distributed systems], I recently [brief highlight: e.g. built a high-throughput transformer pipeline reducing latency by 35%]. 

I saw the opening for [Role Title] and believe my background aligns closely with the team's needs. I'd love to connect and share a brief overview if you're open to a quick conversation!

Best,
${candidateProfile.name || '[Your Name]'}
${candidateProfile.linkedInUrl || 'LinkedIn Profile'}
\`\`\`

#### 2. Follow-Up Email (1 Week After Submitting):
\`\`\`text
Subject: Following up: Application for [Role Title] - ${candidateProfile.name || '[Your Name]'}

Hi [Hiring Manager / Recruiter Name],

I hope your week is going well! I wanted to follow up on my application submitted on [Date] for the [Role Title] position. 

I remain very enthusiastic about the opportunity to contribute to [Company], particularly with my experience in [Top Skill 1] and [Top Skill 2]. 

Please let me know if there are any additional materials, portfolio links, or references I can provide. Thank you for your consideration!

Best regards,
${candidateProfile.name || '[Your Name]'}
\`\`\``;
  }

  // Fallback intelligent response
  return `### 💡 Career Guidance & Advice

Thank you for your question! Here is targeted guidance based on your current profile:

1. **Focus on High-Leverage Actions**:
   - Check your semantic match score on your active tracked applications.
   - For any role with **< 75% match**, examine the missing keywords and weave relevant verified coursework or open-source projects into your resume.
2. **Interview Preparedness**:
   - Practice explaining your past architecture decisions out loud. Focus on *why* you chose one approach over another (trade-offs, constraints, cost, latency).
3. **Need specific help?** Try asking:
   - *"Give me a mock interview question on Transformers"*
   - *"How to answer: What is your biggest weakness?"*
   - *"Draft an email asking for feedback after an interview rejection"*
   - *"How to negotiate an offer with competing timelines"*`;
}

export const CareerChatbot: React.FC<CareerChatbotProps> = ({
  currentUser,
  applications,
  candidateProfile
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Check localStorage cache
    try {
      const cached = localStorage.getItem('jobtracker_free_chat_history');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [INITIAL_GREETING];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [rolePersona, setRolePersona] = useState<RolePersona>('interview_coach');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to Firestore if user is authenticated
  useEffect(() => {
    if (currentUser) {
      FirebaseSync.loadChatMessages(currentUser.uid)
        .then((saved) => {
          if (saved && saved.length > 0) {
            setMessages(saved);
          }
        })
        .catch((err) => console.error('Failed to load chat from Firestore', err));
    }
  }, [currentUser]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jobtracker_free_chat_history', JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_GREETING]);
    try {
      localStorage.removeItem('jobtracker_free_chat_history');
    } catch (e) {
      // ignore
    }
  };

  const handleSendMessage = (e?: React.FormEvent, promptOverride?: string) => {
    if (e) e.preventDefault();
    const promptToSend = promptOverride || inputPrompt;
    if (!promptToSend.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptToSend.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsTyping(true);

    if (currentUser) {
      FirebaseSync.saveChatMessage(currentUser.uid, userMessage).catch(console.error);
    }

    // Generate response with human-like brief delay (350ms)
    setTimeout(() => {
      const replyContent = generateNormalChatbotReply(
        promptToSend,
        rolePersona,
        applications,
        candidateProfile
      );

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: replyContent,
        timestamp: new Date().toISOString(),
        modelUsed: 'Free Client Engine'
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);

      if (currentUser) {
        FirebaseSync.saveChatMessage(currentUser.uid, botMessage).catch(console.error);
      }
    }, 380);
  };

  const activePersona = PERSONAS.find((p) => p.id === rolePersona) || PERSONAS[0];

  return (
    <div className="flex flex-col h-[780px] bg-white/95 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-500/5 overflow-hidden">
      {/* Eye-catching Chat Header */}
      <div className="p-4 sm:p-5 border-b border-indigo-100/80 bg-gradient-to-r from-violet-50/80 via-indigo-50/60 to-pink-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 font-display">
                Free Career & Interview Coach
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-2xs">
                100% Free • No API Fee
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Instant mock interviews, ATS resume bullet tailoring, and compensation strategy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Persona Selector Tabs */}
      <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0 uppercase tracking-wider">
          Coach Role:
        </span>
        {PERSONAS.map((p) => {
          const isActive = rolePersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setRolePersona(p.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all cursor-pointer ${
                isActive
                  ? `bg-gradient-to-r ${p.gradient} text-white shadow-xs`
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/70'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-white via-slate-50/40 to-indigo-50/20">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white'
                    : 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 text-white'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`relative max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-800 border border-indigo-100/90 shadow-sm'
                }`}
              >
                {/* Copy button for model response */}
                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title="Copy answer"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                {/* Content formatted */}
                <div className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed break-words pr-6">
                  {msg.content}
                </div>

                {/* Timestamp & badge */}
                <div
                  className={`mt-2.5 flex items-center gap-2 text-[10px] ${
                    isUser ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {!isUser && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-600 font-medium">Free Engine</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-indigo-100 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 font-medium ml-2">
                Generating advice...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Strip */}
      <div className="p-3 bg-indigo-50/40 border-t border-indigo-100/70">
        <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Quick Prompts for {activePersona.label}:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {activePersona.starters.map((starter, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(undefined, starter)}
              className="text-left text-[11px] px-2.5 py-1.5 bg-white hover:bg-indigo-50/80 border border-indigo-200/70 hover:border-indigo-400 text-slate-700 hover:text-indigo-900 rounded-lg transition-all shadow-2xs cursor-pointer"
            >
              {starter}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask your ${activePersona.label} anything (e.g. interview prep, resume help, salary tips)...`}
            className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={!inputPrompt.trim() || isTyping}
          className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
