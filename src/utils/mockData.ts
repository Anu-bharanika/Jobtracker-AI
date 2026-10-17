import { CandidateProfile, JobApplication, IngestedEmail, LinkedInContact, GitHubRepoSync, AppNotification } from '../types/job';

export const INITIAL_CANDIDATE_PROFILE: CandidateProfile = {
  name: 'Alex Chen',
  email: 'alex.chen.ai@stanford.edu',
  phoneNumber: '+1 (650) 498-2100',
  location: 'Palo Alto, CA (Open to SF Bay Area & Remote)',
  targetRole: 'Machine Learning Engineer / AI Applied Scientist',
  headline: 'M.S. Candidate in Data Science & Machine Learning @ Stanford University',
  bio: 'Specializing in LLM alignment, retrieval-augmented generation (RAG), and high-throughput PyTorch training benchmarks. Seeking full-time Machine Learning and Applied AI roles.',
  linkedInUrl: 'https://linkedin.com/in/alexchen-ai',
  githubUrl: 'https://github.com/alexchen-ai',
  education: [
    {
      institution: 'Stanford University',
      degree: 'Master of Science',
      field: 'Data Science & Artificial Intelligence',
      gradYear: '2026',
      gpa: '3.92 / 4.0'
    },
    {
      institution: 'UC Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science & Statistics',
      gradYear: '2024',
      gpa: '3.88 / 4.0'
    }
  ],
  skills: [
    {
      category: 'Deep Learning & LLMs',
      items: ['PyTorch', 'Transformers', 'Hugging Face', 'LLMs', 'Fine-tuning', 'LoRA', 'RAG', 'LangChain', 'Prompt Engineering']
    },
    {
      category: 'Core ML & Mathematics',
      items: ['Machine Learning', 'Scikit-learn', 'Statistics', 'Probability', 'Linear Algebra', 'XGBoost', 'A/B Testing', 'Hypothesis Testing', 'PCA']
    },
    {
      category: 'Data Engineering & Systems',
      items: ['Python', 'SQL', 'PostgreSQL', 'Pandas', 'NumPy', 'Spark', 'DuckDB', 'Vector Databases', 'ChromaDB', 'pgvector']
    },
    {
      category: 'MLOps & Cloud Infrastructure',
      items: ['Docker', 'FastAPI', 'Git', 'GitHub Actions', 'MLflow', 'Weights & Biases', 'AWS', 'REST API']
    }
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Stanford Artificial Intelligence Laboratory',
      role: 'Graduate Machine Learning Researcher',
      duration: 'Sep 2024 – Present',
      bullets: [
        'Researched retrieval-augmented generation (RAG) latency bottlenecks, developing a hybrid semantic caching index that diminished token usage by 42%.',
        'Fine-tuned open-source Llama-3 checkpoints on specialized scientific corpora using LoRA/PEFT, outperforming zero-shot baselines by 18.4% on domain benchmarks.',
        'Authored reproducible PyTorch training benchmarks and distributed data pipelines over 1.2M academic document pairs.'
      ]
    },
    {
      id: 'exp-2',
      company: 'Autonomous Systems Lab',
      role: 'Data Science Intern',
      duration: 'Jun 2024 – Aug 2024',
      bullets: [
        'Built automated anomaly detection pipelines in Python and SQL analyzing 450GB+ daily telemetry data from sensor arrays.',
        'Productionized Scikit-learn and XGBoost predictive failure models into a containerized FastAPI service with automated CI/CD testing.',
        'Conducted A/B statistical significance tests to validate real-time sensor calibration thresholds, reducing false alarms by 28%.'
      ]
    }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Biomed-RAG: Domain-Grounded Literature Assistant',
      techStack: ['PyTorch', 'Hugging Face', 'LangChain', 'pgvector', 'FastAPI'],
      description: 'End-to-end literature assistant with hybrid dense-sparse vector search over PubMed abstracts.',
      githubUrl: 'https://github.com/alexchen-ai/biomed-rag',
      bullets: [
        'Engineered vector ingestion pipeline indexing 250k PubMed abstracts using Hugging Face embeddings and pgvector.',
        'Implemented citation verification pass that reduced ungrounded hallucination rates below 2.8% on clinical query test suites.'
      ]
    },
    {
      id: 'proj-2',
      title: 'Distributed Vision Transformer Classifier',
      techStack: ['PyTorch', 'Docker', 'MLflow', 'Weights & Biases'],
      description: 'Scalable ViT architecture trained across multi-GPU nodes with automated metric logging.',
      githubUrl: 'https://github.com/alexchen-ai/vision-transformer-distributed',
      bullets: [
        'Trained custom vision transformers on ImageNet subsets with mixed-precision FP16, attaining 84.2% top-1 accuracy.',
        'Logged experiments and hyperparameters via MLflow and Weights & Biases for systematic model governance.'
      ]
    }
  ],
  rawResumeText: `ALEX CHEN
alex.chen.ai@stanford.edu | Palo Alto, CA | github.com/alexchen-ai | linkedin.com/in/alexchen-ai

EDUCATION
Stanford University — M.S. in Data Science & Artificial Intelligence (Expected May 2026, GPA: 3.92)
UC Berkeley — B.S. in Computer Science & Statistics (May 2024, GPA: 3.88)

TECHNICAL SKILLS
Languages & Frameworks: Python, SQL, PyTorch, Scikit-learn, Transformers, Hugging Face, Pandas, NumPy, Spark, FastAPI, Docker
Core Competencies: Machine Learning, Deep Learning, LLMs, RAG, LoRA Fine-tuning, Statistics, A/B Testing, Vector Databases, MLOps, MLflow

EXPERIENCE
Stanford Artificial Intelligence Laboratory — Graduate ML Researcher (Sep 2024 - Present)
- Researched retrieval-augmented generation (RAG) latency bottlenecks, developing hybrid semantic caching index diminishing token usage by 42%.
- Fine-tuned open-source Llama-3 checkpoints on specialized scientific corpora using LoRA/PEFT, outperforming zero-shot baselines by 18.4%.
- Authored reproducible PyTorch training benchmarks and distributed data pipelines over 1.2M document pairs.

Autonomous Systems Lab — Data Science Intern (Jun 2024 - Aug 2024)
- Built automated anomaly detection pipelines in Python and SQL analyzing 450GB+ daily telemetry data from sensor arrays.
- Productionized Scikit-learn and XGBoost predictive failure models into a containerized FastAPI service with automated CI/CD testing.
- Conducted A/B statistical significance tests to validate real-time sensor calibration thresholds, reducing false alarms by 28%.

PROJECTS
Biomed-RAG Literature Search (PyTorch, LangChain, pgvector, FastAPI)
- Engineered vector ingestion pipeline indexing 250k PubMed abstracts using Hugging Face embeddings and pgvector.
- Implemented citation verification pass reducing ungrounded hallucinations below 2.8%.`,
  lastUpdated: '2026-10-15T14:30:00Z'
};

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [
  {
    id: 'job-1',
    company: 'Anthropic',
    title: 'AI Research Engineer, Applied Alignment',
    location: 'San Francisco, CA',
    workMode: 'hybrid',
    salaryRange: '$175,000 - $220,000 / yr',
    url: 'https://boards.greenhouse.io/anthropic/jobs/4829104',
    appliedDate: '2026-10-02',
    status: 'interviewing',
    matchScore: 94,
    experienceLevel: 'entry',
    requiredSkills: ['Python', 'PyTorch', 'Transformers', 'Hugging Face', 'LLMs', 'Fine-tuning', 'Statistics'],
    matchedSkills: ['Python', 'PyTorch', 'Transformers', 'Hugging Face', 'LLMs', 'Fine-tuning', 'Statistics'],
    missingSkills: ['Distributed Training', 'Triton'],
    description: 'We are seeking an AI Research Engineer to work on empirical alignment and safety evaluation for frontier LLMs. You will design synthetic data generation pipelines, fine-tune models using LoRA and RLHF techniques, and evaluate behavioral properties across standard benchmarks.',
    recruiterName: 'Maya Lin',
    recruiterEmail: 'mlin@anthropic.com',
    linkedInUrl: 'https://linkedin.com/company/anthropicresearch',
    linkedGitHubRepo: 'https://github.com/alexchen-ai/biomed-rag',
    notes: 'Round 2 technical coding went very well. Round 3 ML Architecture scheduled with Lead Research Scientist Dr. Aris Thorne.',
    interviewRounds: [
      { id: 'r1', roundName: 'Recruiter Screen', completed: true, scheduledAt: '2026-10-08T10:00:00Z', notes: 'Discussed Stanford MS research on RAG caching.' },
      { id: 'r2', roundName: 'Technical Coding & PyTorch Implementation', completed: true, scheduledAt: '2026-10-13T14:00:00Z', notes: 'Implemented custom attention masking and KV-cache simulator.' },
      { id: 'r3', roundName: 'System Architecture & Alignment Theory', completed: false, scheduledAt: '2026-10-18T14:00:00Z', interviewer: 'Dr. Aris Thorne' }
    ],
    nextFollowUpDate: '2026-10-18',
    source: 'linkedin',
    createdAt: '2026-10-02T11:20:00Z',
    updatedAt: '2026-10-14T09:15:00Z',
    history: [
      { id: 'h1', date: '2026-10-02', toStatus: 'applied', note: 'Ingested via LinkedIn Job Post URL' },
      { id: 'h2', date: '2026-10-06', fromStatus: 'applied', toStatus: 'interviewing', note: 'Email auto-classified: Recruiter Maya Lin invited to phone screen' }
    ]
  },
  {
    id: 'job-2',
    company: 'Stripe',
    title: 'Data Scientist, Risk & Fraud Intelligence',
    location: 'South San Francisco, CA (or Remote)',
    workMode: 'hybrid',
    salaryRange: '$165,000 - $195,000 / yr',
    url: 'https://stripe.com/jobs/listings/ds-fraud-ai',
    appliedDate: '2026-10-05',
    status: 'interviewing',
    matchScore: 89,
    experienceLevel: 'entry',
    requiredSkills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'A/B Testing', 'Scikit-learn', 'XGBoost'],
    matchedSkills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'A/B Testing', 'Scikit-learn', 'XGBoost'],
    missingSkills: ['Snowflake', 'dbt'],
    description: 'Stripe builds financial infrastructure for the internet. As a Data Scientist on Risk, you will leverage machine learning and causal inference to defend against payment fraud, building predictive models on billions of dollars in daily transactions.',
    recruiterName: 'David Patel',
    recruiterEmail: 'davidp@stripe.com',
    linkedInUrl: 'https://linkedin.com/company/stripe',
    linkedGitHubRepo: 'https://github.com/alexchen-ai/duckdb-fastapi-featurestore',
    notes: 'Take-home assessment received. Focuses on credit default predictive modeling with imbalanced classes and ROC-AUC evaluation.',
    interviewRounds: [
      { id: 'r1', roundName: 'Recruiter Chat', completed: true, scheduledAt: '2026-10-09T11:30:00Z' },
      { id: 'r2', roundName: 'Take-Home Data Science Case Study', completed: false, scheduledAt: '2026-10-19T23:59:00Z', notes: '48hr window to submit Jupyter Notebook and executive summary.' }
    ],
    nextFollowUpDate: '2026-10-19',
    source: 'url_ingest',
    createdAt: '2026-10-05T15:40:00Z',
    updatedAt: '2026-10-12T16:20:00Z',
    history: [
      { id: 'h1', date: '2026-10-05', toStatus: 'applied', note: 'Submitted application on Stripe careers portal' },
      { id: 'h2', date: '2026-10-08', fromStatus: 'applied', toStatus: 'interviewing', note: 'Take-home challenge dispatched by recruiter David Patel' }
    ]
  },
  {
    id: 'job-3',
    company: 'OpenAI',
    title: 'Member of Technical Staff, Data & Evaluation',
    location: 'San Francisco, CA',
    workMode: 'onsite',
    salaryRange: '$190,000 - $240,000 / yr + Equity',
    url: 'https://openai.com/careers/data-eval-mts',
    appliedDate: '2026-09-18',
    status: 'offered',
    matchScore: 96,
    experienceLevel: 'entry',
    requiredSkills: ['Python', 'PyTorch', 'LLMs', 'Transformers', 'Evaluation', 'Statistics', 'Docker', 'FastAPI'],
    matchedSkills: ['Python', 'PyTorch', 'LLMs', 'Transformers', 'Statistics', 'Docker', 'FastAPI'],
    missingSkills: ['Kubernetes'],
    description: 'Join the Data & Evaluation team at OpenAI to push the frontier of generative AI. You will build rigorous evaluation benchmarks, curate high-quality pretraining and post-training data mixtures, and evaluate reasoning safety.',
    recruiterName: 'Elena Rostova',
    recruiterEmail: 'erostova@openai.com',
    notes: 'OFFER RECEIVED! Base $195k + generous equity grant + relocation package. Decision deadline: Oct 25, 2026.',
    interviewRounds: [
      { id: 'r1', roundName: 'Recruiter Screen', completed: true },
      { id: 'r2', roundName: 'Technical Coding', completed: true },
      { id: 'r3', roundName: 'Data Pipeline & ML System Design', completed: true },
      { id: 'r4', roundName: 'Values & Team Fit with VP Engineering', completed: true }
    ],
    nextFollowUpDate: '2026-10-23',
    source: 'github',
    createdAt: '2026-09-18T10:00:00Z',
    updatedAt: '2026-10-14T18:00:00Z',
    history: [
      { id: 'h1', date: '2026-09-18', toStatus: 'applied', note: 'Discovered via GitHub repo "hiring-without-whiteboards"' },
      { id: 'h2', date: '2026-09-24', fromStatus: 'applied', toStatus: 'interviewing', note: 'Interview loop started' },
      { id: 'h3', date: '2026-10-14', fromStatus: 'interviewing', toStatus: 'offered', note: 'Formal offer letter generated and emailed' }
    ]
  },
  {
    id: 'job-4',
    company: 'Databricks',
    title: 'Machine Learning Systems Engineer',
    location: 'San Francisco, CA / Remote',
    workMode: 'remote',
    salaryRange: '$170,000 - $210,000 / yr',
    url: 'https://databricks.com/company/careers/ml-systems',
    appliedDate: '2026-10-11',
    status: 'applied',
    matchScore: 82,
    experienceLevel: 'entry',
    requiredSkills: ['Python', 'Spark', 'MLflow', 'Docker', 'SQL', 'FastAPI'],
    matchedSkills: ['Python', 'Spark', 'MLflow', 'Docker', 'SQL', 'FastAPI'],
    missingSkills: ['Kubernetes', 'Delta Lake', 'Scala'],
    description: 'Databricks is pioneering Lakehouse and Generative AI infrastructure. As an ML Systems Engineer, you will contribute to MLflow model registry, distributed model serving pipelines, and high-performance feature stores.',
    notes: 'Submitted 6 days ago. Follow-up reminder triggered.',
    interviewRounds: [],
    nextFollowUpDate: '2026-10-17',
    source: 'url_ingest',
    createdAt: '2026-10-11T13:00:00Z',
    updatedAt: '2026-10-11T13:00:00Z',
    history: [
      { id: 'h1', date: '2026-10-11', toStatus: 'applied', note: 'Direct submission via Databricks Careers' }
    ]
  },
  {
    id: 'job-5',
    company: 'Scale AI',
    title: 'Generative AI Solutions Engineer',
    location: 'San Francisco, CA',
    workMode: 'onsite',
    salaryRange: '$160,000 - $190,000 / yr',
    url: 'https://scale.com/careers/genai-solutions',
    appliedDate: undefined,
    status: 'saved',
    matchScore: 91,
    experienceLevel: 'entry',
    requiredSkills: ['Python', 'LLMs', 'RAG', 'Prompt Engineering', 'LangChain', 'FastAPI'],
    matchedSkills: ['Python', 'LLMs', 'RAG', 'Prompt Engineering', 'LangChain', 'FastAPI'],
    missingSkills: ['Enterprise Client Facing', 'AWS Bedrock'],
    description: 'Work directly with enterprise clients to build custom enterprise GenAI agents, RAG workflows, and evaluation pipelines atop Scale Foundry platform.',
    notes: 'Bookmarked after seeing LinkedIn post by hiring manager James Walsh. Need to tailor resume bullet points for client-facing deployment.',
    interviewRounds: [],
    source: 'linkedin',
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
    history: [
      { id: 'h1', date: '2026-10-15', toStatus: 'saved', note: 'Bookmarked from LinkedIn Job recommendation' }
    ]
  },
  {
    id: 'job-6',
    company: 'Google DeepMind',
    title: 'Research Engineer, Gemini Multimodal',
    location: 'Mountain View, CA',
    workMode: 'hybrid',
    salaryRange: '$180,000 - $225,000 / yr',
    url: 'https://deepmind.google/careers/multimodal-re',
    appliedDate: '2026-09-12',
    status: 'rejected',
    matchScore: 86,
    experienceLevel: 'entry',
    requiredSkills: ['Python', 'JAX', 'PyTorch', 'Multimodal AI', 'Computer Vision', 'Transformers'],
    matchedSkills: ['Python', 'PyTorch', 'Transformers'],
    missingSkills: ['JAX', 'Flax', 'TPU Optimization'],
    description: 'Join DeepMind to scale multimodal foundation models. Responsibilities include building scalable training datasets, JAX model definitions, and latency benchmarking.',
    notes: 'Reached final stage. Recruiter shared kind feedback: strong ML research fundamentals, but they chose a candidate with 2+ years of prior JAX/TPU experience.',
    interviewRounds: [
      { id: 'r1', roundName: 'Technical Screen', completed: true },
      { id: 'r2', roundName: 'JAX & Deep Learning Coding', completed: true }
    ],
    source: 'manual',
    createdAt: '2026-09-12T09:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z',
    history: [
      { id: 'h1', date: '2026-09-12', toStatus: 'applied', note: 'Application submitted with Stanford reference' },
      { id: 'h2', date: '2026-10-04', fromStatus: 'interviewing', toStatus: 'rejected', note: 'Email auto-classified: polite rejection with feedback' }
    ]
  }
];

export const INITIAL_INGESTED_EMAILS: IngestedEmail[] = [
  {
    id: 'email-1',
    sender: 'recruiting@stripe.com',
    subject: 'Stripe: Next Steps - Data Science Case Study Invitation',
    date: '2026-10-12T16:15:00Z',
    bodySnippet: 'Hi Alex, thank you for speaking with our recruiting team. We would like to invite you to take the Risk Data Science case study challenge. Please review the attached instructions...',
    detectedCompany: 'Stripe',
    detectedStatus: 'interviewing',
    confidence: 94,
    extractedDetails: {
      actionRequired: 'Complete case study challenge before Oct 19 deadline',
      interviewDate: '2026-10-19',
      recruiterName: 'David Patel'
    },
    linkedApplicationId: 'job-2',
    isProcessed: true
  },
  {
    id: 'email-2',
    sender: 'careers@anthropic.com',
    subject: 'Anthropic Interview Confirmation: Round 3 ML Architecture',
    date: '2026-10-14T09:10:00Z',
    bodySnippet: 'Hi Alex, we are pleased to confirm your next interview round for the AI Research Engineer role. You will be meeting with Dr. Aris Thorne on Friday at 2:00 PM PT via Google Meet...',
    detectedCompany: 'Anthropic',
    detectedStatus: 'interviewing',
    confidence: 98,
    extractedDetails: {
      actionRequired: 'Review Google Meet link and prep architecture slides',
      interviewDate: 'Friday, Oct 18 at 2:00 PM PT',
      recruiterName: 'Maya Lin'
    },
    linkedApplicationId: 'job-1',
    isProcessed: true
  },
  {
    id: 'email-3',
    sender: 'talent@openai.com',
    subject: 'Formal Offer of Employment: Member of Technical Staff at OpenAI',
    date: '2026-10-14T17:45:00Z',
    bodySnippet: 'Dear Alex, on behalf of OpenAI, we are delighted to offer you the position of Member of Technical Staff on the Data & Evaluation team. Please find attached your formal offer letter...',
    detectedCompany: 'OpenAI',
    detectedStatus: 'offered',
    confidence: 99,
    extractedDetails: {
      actionRequired: 'Sign offer letter and benefits documents by Oct 25',
      recruiterName: 'Elena Rostova'
    },
    linkedApplicationId: 'job-3',
    isProcessed: true
  },
  {
    id: 'email-4',
    sender: 'jobs@databricks.com',
    subject: 'Thank you for your application to Databricks (ML Systems Engineer)',
    date: '2026-10-11T13:05:00Z',
    bodySnippet: 'Hi Alex, thank you for your interest in Databricks! We have received your application for the Machine Learning Systems Engineer position and our team is currently reviewing your profile...',
    detectedCompany: 'Databricks',
    detectedStatus: 'applied',
    confidence: 90,
    extractedDetails: {
      actionRequired: 'Follow up if no recruiter reach-out within 5 business days'
    },
    linkedApplicationId: 'job-4',
    isProcessed: true
  }
];

export const INITIAL_LINKEDIN_CONTACTS: LinkedInContact[] = [
  {
    id: 'li-1',
    name: 'Maya Lin',
    title: 'Senior Technical Recruiter (AI / Research)',
    company: 'Anthropic',
    profileUrl: 'https://linkedin.com/in/mayalin-recruiting',
    outreachStatus: 'connected',
    lastInteractionDate: '2026-10-14',
    notes: 'Very responsive. Appreciates candidates who have worked with open-source transformer checkpoints.'
  },
  {
    id: 'li-2',
    name: 'David Patel',
    title: 'Engineering Manager, Risk Machine Learning',
    company: 'Stripe',
    profileUrl: 'https://linkedin.com/in/davidpatel-stripe-ml',
    outreachStatus: 'inmail_sent',
    lastInteractionDate: '2026-10-09',
    notes: 'Sent message highlighting UC Berkeley statistics background and DuckDB project.'
  },
  {
    id: 'li-3',
    name: 'Sarah Jenkins',
    title: 'Lead AI Solutions Architect',
    company: 'Scale AI',
    profileUrl: 'https://linkedin.com/in/sarahjenkins-scaleai',
    outreachStatus: 'referral_agreed',
    lastInteractionDate: '2026-10-15',
    notes: 'Stanford alumna. Agreed to submit internal referral once application is ready.'
  }
];

export const INITIAL_GITHUB_REPOS: GitHubRepoSync[] = [
  {
    name: 'biomed-rag',
    description: 'Literature RAG assistant with hybrid dense-sparse vector search using Hugging Face & pgvector',
    stars: 142,
    forks: 29,
    language: 'Python',
    topics: ['rag', 'langchain', 'pytorch', 'pgvector', 'transformers'],
    url: 'https://github.com/alexchen-ai/biomed-rag',
    pushedAt: '2026-10-14T20:11:00Z',
    readinessScore: 96
  },
  {
    name: 'duckdb-fastapi-featurestore',
    description: 'Lightweight real-time ML feature store powered by DuckDB, Parquet, and containerized FastAPI',
    stars: 88,
    forks: 14,
    language: 'Python',
    topics: ['duckdb', 'fastapi', 'mlops', 'sql', 'python'],
    url: 'https://github.com/alexchen-ai/duckdb-fastapi-featurestore',
    pushedAt: '2026-10-08T18:45:00Z',
    readinessScore: 92
  },
  {
    name: 'vision-transformer-distributed',
    description: 'Scalable ViT architecture training benchmarks across multi-GPU nodes with MLflow logging',
    stars: 64,
    forks: 11,
    language: 'Python',
    topics: ['pytorch', 'vision-transformers', 'mlflow', 'docker'],
    url: 'https://github.com/alexchen-ai/vision-transformer-distributed',
    pushedAt: '2026-09-28T14:30:00Z',
    readinessScore: 89
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'interview_reminder',
    title: 'Upcoming Round 3 with Anthropic',
    message: 'System Architecture & Alignment Theory interview scheduled for tomorrow (Friday, Oct 18) at 2:00 PM PT.',
    timestamp: '2026-10-17T06:00:00Z',
    isRead: false,
    priority: 'high',
    applicationId: 'job-1',
    actionPayload: {
      type: 'view_job'
    }
  },
  {
    id: 'notif-2',
    type: 'follow_up',
    title: 'Databricks Application Follow-up Due',
    message: 'It has been 6 days since you submitted your application for ML Systems Engineer at Databricks with no ATS status change.',
    timestamp: '2026-10-17T04:30:00Z',
    isRead: false,
    priority: 'medium',
    applicationId: 'job-4',
    actionPayload: {
      type: 'draft_email',
      suggestedEmail: {
        to: 'jobs@databricks.com',
        subject: 'Inquiry regarding ML Systems Engineer Application — Alex Chen',
        body: `Dear Databricks Talent Team,\n\nI hope you are having a productive week. I recently submitted my application for the Machine Learning Systems Engineer position (Application submitted on Oct 11). Given my background in distributed Python systems, Spark, and MLflow, I remain very enthusiastic about contributing to Databricks' Lakehouse AI mission.\n\nCould you kindly let me know if there are any additional materials, code repositories, or references I can provide to support my application?\n\nThank you for your time and consideration,\nAlex Chen\nStanford University`
      }
    }
  },
  {
    id: 'notif-3',
    type: 'status_update',
    title: 'Offer Decision Pending for OpenAI',
    message: 'OpenAI formal offer letter is awaiting response. Deadline to respond is Oct 25, 2026.',
    timestamp: '2026-10-16T15:00:00Z',
    isRead: true,
    priority: 'high',
    applicationId: 'job-3',
    actionPayload: {
      type: 'view_job'
    }
  }
];
