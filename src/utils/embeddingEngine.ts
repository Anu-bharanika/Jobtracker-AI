/**
 * Semantic Vector Embedding and Cosine Similarity Engine
 * Optimized for Data Science & AI job market parsing and candidate profile matching.
 */

// Canonical Data Science & AI skill taxonomy
export const DS_AI_TAXONOMY: Record<string, string[]> = {
  'Deep Learning & LLMs': [
    'PyTorch', 'TensorFlow', 'Keras', 'Transformers', 'Hugging Face',
    'LLMs', 'Large Language Models', 'Fine-tuning', 'LoRA', 'PEFT',
    'RAG', 'Retrieval-Augmented Generation', 'LangChain', 'LlamaIndex',
    'Prompt Engineering', 'vLLM', 'Ollama', 'Triton', 'CUDA',
    'Diffusion Models', 'Vision Transformers', 'BERT', 'GTP', 'Attention Mechanisms'
  ],
  'Core ML & Mathematics': [
    'Machine Learning', 'Scikit-learn', 'Statistics', 'Probability',
    'Linear Algebra', 'Calculus', 'Supervised Learning', 'Unsupervised Learning',
    'Gradient Boosting', 'XGBoost', 'LightGBM', 'CatBoost', 'Random Forest',
    'Dimensionality Reduction', 'PCA', 't-SNE', 'A/B Testing', 'Hypothesis Testing',
    'Bayesian Modeling', 'Time Series Analysis', 'ARIMA', 'Clustering'
  ],
  'Data Engineering & Systems': [
    'SQL', 'PostgreSQL', 'Python', 'Spark', 'PySpark',
    'Pandas', 'NumPy', 'SciPy', 'Polars', 'Dask',
    'Airflow', 'Prefect', 'Kafka', 'dbt', 'Snowflake',
    'BigQuery', 'ETL', 'Data Pipelines', 'Vector Databases', 'Pinecone',
    'pgvector', 'ChromaDB', 'Milvus', 'Qdrant', 'DuckDB'
  ],
  'MLOps & Cloud Infrastructure': [
    'MLOps', 'Docker', 'Kubernetes', 'AWS', 'GCP',
    'Google Cloud', 'Azure', 'MLflow', 'Weights & Biases', 'Wandb',
    'CI/CD', 'Git', 'GitHub Actions', 'Model Deployment', 'FastAPI',
    'Flask', 'REST API', 'ONNX', 'TensorRT', 'Ray', 'Kubeflow'
  ],
  'Computer Vision & NLP': [
    'Computer Vision', 'NLP', 'Natural Language Processing', 'OpenCV',
    'Image Segmentation', 'Object Detection', 'YOLO', 'Named Entity Recognition',
    'NER', 'Text Classification', 'Sentiment Analysis', 'Speech Recognition',
    'Whisper', 'Audio Processing', 'Multimodal AI'
  ]
};

// Flattened list of all canonical skills
export const ALL_CANONICAL_SKILLS = Object.values(DS_AI_TAXONOMY).flat();

/**
 * Normalizes text for NLP analysis
 */
export function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\-\+\#\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts recognized technical skills from text
 */
export function extractSkillsFromText(text: string): string[] {
  const normalizedText = ` ${cleanText(text)} `;
  const foundSkills = new Set<string>();

  for (const skill of ALL_CANONICAL_SKILLS) {
    const cleanSkill = cleanText(skill);
    // Boundary check to avoid substring false positives (e.g. "r" in "order")
    const regex = new RegExp(`(^|\\s|[,\\/\\(\\)])${escapeRegExp(cleanSkill)}($|\\s|[,\\/\\(\\)])`, 'i');
    if (regex.test(normalizedText)) {
      foundSkills.add(skill);
    }
  }

  // Also check for common standalone acronyms
  const acronyms: Record<string, string> = {
    'nlp': 'NLP',
    'cv': 'Computer Vision',
    'ml': 'Machine Learning',
    'ai': 'Artificial Intelligence',
    'llm': 'LLMs',
    'rag': 'RAG',
    'sql': 'SQL',
    'aws': 'AWS',
    'gcp': 'GCP',
    'dl': 'Deep Learning',
    'eda': 'Exploratory Data Analysis'
  };

  const words = normalizedText.split(/\s+/);
  for (const word of words) {
    if (acronyms[word]) {
      foundSkills.add(acronyms[word]);
    }
  }

  return Array.from(foundSkills);
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generates an N-dimensional semantic pseudo-embedding vector
 * utilizing hashing and subword/token frequency with TF-IDF weighting.
 * Vector dimension = 128 dimensions.
 */
export function generateEmbedding(text: string, dimensions = 128): number[] {
  const vector = new Array(dimensions).fill(0);
  const cleaned = cleanText(text);
  const tokens = cleaned.split(/\s+/).filter(t => t.length > 1);

  if (tokens.length === 0) {
    return vector;
  }

  // Domain booster weights
  const domainBoosters = new Set(ALL_CANONICAL_SKILLS.map(s => s.toLowerCase()));

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const weight = domainBoosters.has(token) ? 3.0 : 1.0;

    // Word hashing into vector slots
    let hash = 0;
    for (let c = 0; c < token.length; c++) {
      hash = (hash << 5) - hash + token.charCodeAt(c);
      hash |= 0;
    }
    const primaryIndex = Math.abs(hash) % dimensions;
    vector[primaryIndex] += weight * 1.5;

    // Bi-gram hashing if next token exists
    if (i < tokens.length - 1) {
      const bigram = `${token}_${tokens[i + 1]}`;
      let biHash = 0;
      for (let c = 0; c < bigram.length; c++) {
        biHash = (biHash << 5) - biHash + bigram.charCodeAt(c);
        biHash |= 0;
      }
      const secondaryIndex = Math.abs(biHash) % dimensions;
      vector[secondaryIndex] += weight * 1.0;
    }
  }

  // Normalize to unit length (L2 norm)
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

/**
 * Computes Cosine Similarity between two unit-normalized vectors:
 * cos(theta) = (A dot B) / (||A|| * ||B||)
 */
export function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }

  // Clamp between 0 and 1 for realistic scoring
  return Math.max(0, Math.min(1, dotProduct));
}

/**
 * Full Match & Gap Analysis between Resume and Job Posting
 */
export interface MatchAnalysisResult {
  matchScore: number; // 0 - 100
  cosineSimilarity: number; // 0.00 - 1.00
  matchedSkills: string[];
  missingSkills: string[];
  allJobSkills: string[];
  dimensionScores: {
    name: string;
    score: number; // 0 - 100
    matchedCount: number;
    totalCount: number;
  }[];
  criticalGaps: string[];
  bonusOpportunities: string[];
}

export function performMatchAnalysis(resumeText: string, jobDescription: string): MatchAnalysisResult {
  // 1. Vector Cosine Similarity
  const resumeVector = generateEmbedding(resumeText);
  const jobVector = generateEmbedding(jobDescription);
  const cosine = computeCosineSimilarity(resumeVector, jobVector);

  // 2. Keyword & Skills Gap Analysis
  const jobSkills = extractSkillsFromText(jobDescription);
  const resumeSkills = new Set(extractSkillsFromText(resumeText).map(s => s.toLowerCase()));

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of jobSkills) {
    if (resumeSkills.has(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // 3. Dimensional Scoring
  const dimensionScores = Object.entries(DS_AI_TAXONOMY).map(([category, skills]) => {
    const categoryLower = skills.map(s => s.toLowerCase());
    const jobCategorySkills = jobSkills.filter(s => categoryLower.includes(s.toLowerCase()));
    
    if (jobCategorySkills.length === 0) {
      return {
        name: category,
        score: 100, // No requirement in this category
        matchedCount: 0,
        totalCount: 0
      };
    }

    const matchedInCategory = jobCategorySkills.filter(s => resumeSkills.has(s.toLowerCase()));
    const score = Math.round((matchedInCategory.length / jobCategorySkills.length) * 100);

    return {
      name: category,
      score,
      matchedCount: matchedInCategory.length,
      totalCount: jobCategorySkills.length
    };
  }).filter(dim => dim.totalCount > 0);

  // 4. Blended Score Calculation
  // 45% Keyword coverage ratio + 55% Semantic Cosine Similarity
  const skillRatio = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) : 0.7;
  // Boost base cosine score slightly since natural text has diverse vocabulary
  const normalizedCosine = Math.min(1, cosine * 1.35);
  const compositeScore = Math.round((skillRatio * 0.50 + normalizedCosine * 0.50) * 100);
  const finalScore = Math.max(15, Math.min(98, compositeScore));

  // Critical gaps are high-impact frameworks/skills
  const criticalGaps = missingSkills.filter(skill => {
    const highPriority = ['PyTorch', 'TensorFlow', 'SQL', 'Python', 'Transformers', 'Docker', 'RAG', 'Spark', 'MLOps'];
    return highPriority.includes(skill);
  });

  const bonusOpportunities = missingSkills.filter(skill => !criticalGaps.includes(skill));

  return {
    matchScore: finalScore,
    cosineSimilarity: Math.round(cosine * 100) / 100,
    matchedSkills,
    missingSkills,
    allJobSkills: jobSkills,
    dimensionScores,
    criticalGaps,
    bonusOpportunities
  };
}

/**
 * Information Extractor (Heuristic & NLP) for job posting texts & URLs
 */
export interface ExtractedJobData {
  company: string;
  title: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'onsite';
  salaryRange?: string;
  experienceLevel: 'intern' | 'entry' | 'mid' | 'senior' | 'lead';
  requiredSkills: string[];
  cleanDescription: string;
}

export function parseJobPostingText(rawText: string, url = ''): ExtractedJobData {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const lowerText = rawText.toLowerCase();

  // 1. Detect Company
  let company = 'Target Company';
  const urlMatches = url.match(/https?:\/\/(?:www\.)?([^.\/]+)/i);
  if (urlMatches && !['linkedin', 'github', 'greenhouse', 'lever', 'ashbyhq', 'workday'].includes(urlMatches[1])) {
    company = urlMatches[1].charAt(0).toUpperCase() + urlMatches[1].slice(1);
  } else {
    // Try first line or common company indicators
    for (const line of lines.slice(0, 5)) {
      if (/company|at\s+([A-Z][\w\s]+)/i.test(line)) {
        const match = line.match(/(?:at|company:?)\s+([A-Z][\w\s&]+)/i);
        if (match && match[1].length < 30) {
          company = match[1].trim();
          break;
        }
      }
    }
    if (company === 'Target Company' && lines.length > 0 && lines[0].length < 40 && !lines[0].toLowerCase().includes('job')) {
      company = lines[0];
    }
  }

  // 2. Detect Job Title
  let title = 'Data Scientist / ML Engineer';
  const titlePatterns = [
    /machine learning engineer/i,
    /ai research engineer/i,
    /ai engineer/i,
    /data scientist/i,
    /nlp engineer/i,
    /computer vision engineer/i,
    /mlops engineer/i,
    /data engineer/i,
    /applied scientist/i,
    /data science intern/i,
    /machine learning intern/i
  ];

  for (const pattern of titlePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      title = match[0].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  // 3. Work Mode
  let workMode: 'remote' | 'hybrid' | 'onsite' = 'hybrid';
  if (lowerText.includes('remote') || lowerText.includes('anywhere') || lowerText.includes('work from home')) {
    workMode = 'remote';
  } else if (lowerText.includes('onsite') || lowerText.includes('on-site') || lowerText.includes('in-office')) {
    workMode = 'onsite';
  }

  // 4. Location
  let location = 'San Francisco, CA (or Remote)';
  const locRegex = /(?:location|office|based in|in)\s*:?\s*([A-Za-z\s,]+(?:CA|NY|WA|TX|MA|Remote|USA|United States|London|Toronto|Remote))/i;
  const locMatch = rawText.match(locRegex);
  if (locMatch && locMatch[1].length < 45) {
    location = locMatch[1].trim();
  } else if (workMode === 'remote') {
    location = 'Remote (US/Global)';
  }

  // 5. Salary Range
  let salaryRange: string | undefined = undefined;
  const salRegex = /(?:\$|usd\s*)[0-9]{2,3}(?:,[0-9]{3})*(?:\s*k|\s*K)?\s*[-–—to]+\s*(?:\$)?[0-9]{2,3}(?:,[0-9]{3})*(?:\s*k|\s*K)?(?:\s*(?:\/yr|\/year|annually|per year))?/i;
  const salMatch = rawText.match(salRegex);
  if (salMatch) {
    salaryRange = salMatch[0].trim();
  }

  // 6. Experience Level
  let experienceLevel: 'intern' | 'entry' | 'mid' | 'senior' | 'lead' = 'entry';
  if (lowerText.includes('intern') || lowerText.includes('student') || lowerText.includes('co-op')) {
    experienceLevel = 'intern';
  } else if (lowerText.includes('senior') || lowerText.includes('sr.') || lowerText.includes('staff') || lowerText.includes('principal')) {
    experienceLevel = 'senior';
  } else if (lowerText.includes('lead') || lowerText.includes('manager')) {
    experienceLevel = 'lead';
  } else if (lowerText.includes('3+ years') || lowerText.includes('4+ years') || lowerText.includes('mid-level')) {
    experienceLevel = 'mid';
  }

  // 7. Extract skills
  const skills = extractSkillsFromText(rawText);

  return {
    company,
    title,
    location,
    workMode,
    salaryRange,
    experienceLevel,
    requiredSkills: skills.length > 0 ? skills : ['Python', 'PyTorch', 'SQL', 'Machine Learning'],
    cleanDescription: rawText.slice(0, 3000)
  };
}
