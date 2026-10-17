import { ApplicationStatus, IngestedEmail } from '../types/job';

export interface EmailClassificationResult {
  detectedStatus: ApplicationStatus;
  detectedCompany: string;
  confidence: number; // 0 - 100
  recruiterName?: string;
  interviewDate?: string;
  actionRequired?: string;
  explanation: string;
}

export function classifyEmail(subject: string, body: string, sender: string): EmailClassificationResult {
  const combined = `${subject} ${body}`.toLowerCase();
  const rawCombined = `${subject}\n${body}`;

  // 1. Detect Company
  let detectedCompany = 'Unknown Company';
  
  // From sender domain (e.g. jobs@stripe.com -> Stripe)
  const senderMatch = sender.match(/@(?:[a-zA-Z0-9-]+\.)*([a-zA-Z0-9-]+)\.(?:com|io|ai|org|net|co)/i);
  if (senderMatch && !['gmail', 'yahoo', 'outlook', 'hotmail', 'greenhouse', 'lever', 'ashbyhq', 'workday', 'smartrecruiters', 'linkedin', 'github'].includes(senderMatch[1].toLowerCase())) {
    detectedCompany = senderMatch[1].charAt(0).toUpperCase() + senderMatch[1].slice(1);
  } else {
    // Check subject patterns like "Your application to Anthropic", "Stripe Interview Invitation"
    const subjectMatch = subject.match(/(?:at|to|with|from)\s+([A-Z][\w\s&]+?)(?:\s+for|\s*[-–:]|\s+team|\s+careers|\.|$)/);
    if (subjectMatch && subjectMatch[1].length < 30) {
      detectedCompany = subjectMatch[1].trim();
    } else {
      // Common tech company list
      const commonCompanies = ['OpenAI', 'Anthropic', 'Stripe', 'Google', 'Meta', 'Databricks', 'Scale AI', 'Hugging Face', 'NVIDIA', 'Microsoft', 'Amazon', 'Apple', 'Cohere', 'Palantir', 'Snowflake'];
      for (const comp of commonCompanies) {
        if (new RegExp(`\\b${comp}\\b`, 'i').test(rawCombined)) {
          detectedCompany = comp;
          break;
        }
      }
    }
  }

  // 2. Detect Recruiter Name
  let recruiterName: string | undefined = undefined;
  const recruiterPatterns = [
    /(?:best regards|sincerely|thanks|cheers|warmly|best),?\s*\n+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /my name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /i['’]m\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:from|with|on)\s+the\s+recruiting/i
  ];

  for (const pattern of recruiterPatterns) {
    const match = rawCombined.match(pattern);
    if (match && match[1].length < 25 && !['Team', 'Recruiting', 'Talent', 'Careers'].includes(match[1])) {
      recruiterName = match[1].trim();
      break;
    }
  }

  // 3. Detect Interview Date & Time
  let interviewDate: string | undefined = undefined;
  const datePatterns = [
    /(?:scheduled for|time:?|date:?)\s*([A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM|ET|PT|PST|EST|UTC))?)/i,
    /(\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s+\d{4})?\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm|ET|PT)?)/i
  ];
  for (const pattern of datePatterns) {
    const match = rawCombined.match(pattern);
    if (match) {
      interviewDate = match[1].trim();
      break;
    }
  }

  // 4. Classify Status
  let detectedStatus: ApplicationStatus = 'applied';
  let confidence = 75;
  let explanation = 'Application confirmation received';
  let actionRequired: string | undefined = undefined;

  // Check for OFFER
  if (
    combined.includes('pleased to offer') ||
    combined.includes('offer letter') ||
    combined.includes('offer of employment') ||
    combined.includes('formal offer') ||
    combined.includes('congratulations on your offer')
  ) {
    detectedStatus = 'offered';
    confidence = 96;
    explanation = 'Formal offer detected in email text';
    actionRequired = 'Review compensation terms, benefits, and response deadline';
  }
  // Check for INTERVIEW / SCREENING
  else if (
    combined.includes('interview') ||
    combined.includes('phone screen') ||
    combined.includes('technical screen') ||
    combined.includes('schedule a time') ||
    combined.includes('take-home') ||
    combined.includes('coding assessment') ||
    combined.includes('hackerrank') ||
    combined.includes('codesignal') ||
    combined.includes('next steps with your application') ||
    combined.includes('speak with our team')
  ) {
    detectedStatus = 'interviewing';
    confidence = 92;
    explanation = 'Interview invitation or technical assessment requested';
    actionRequired = interviewDate
      ? `Interview scheduled for ${interviewDate}. Review prep questions & GitHub project.`
      : 'Select interview availability slot via scheduling link.';
  }
  // Check for REJECTION
  else if (
    combined.includes('unfortunately') ||
    combined.includes('not moving forward') ||
    combined.includes('decided to pursue other') ||
    combined.includes('other candidates whose') ||
    combined.includes('impressive background, however') ||
    combined.includes('we will keep your resume on file') ||
    combined.includes('regret to inform')
  ) {
    detectedStatus = 'rejected';
    confidence = 94;
    explanation = 'Rejection / closing email detected';
    actionRequired = 'Archive application and request feedback if in late stage';
  }
  // Check for CONFIRMATION / APPLIED
  else if (
    combined.includes('thank you for applying') ||
    combined.includes('received your application') ||
    combined.includes('application submitted') ||
    combined.includes('we have received your resume') ||
    combined.includes('application confirmation')
  ) {
    detectedStatus = 'applied';
    confidence = 88;
    explanation = 'Submission confirmation acknowledged by company ATS';
    actionRequired = 'Set reminder to follow up if no response within 7 business days';
  }

  return {
    detectedStatus,
    detectedCompany,
    confidence,
    recruiterName,
    interviewDate,
    actionRequired,
    explanation
  };
}

export function parseRawEmailIntoIngestedEmail(
  rawSubject: string,
  rawBody: string,
  rawSender: string,
  existingApplicationsCount: number
): IngestedEmail {
  const classification = classifyEmail(rawSubject, rawBody, rawSender);

  return {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sender: rawSender,
    subject: rawSubject,
    date: new Date().toISOString(),
    bodySnippet: rawBody.slice(0, 400),
    detectedCompany: classification.detectedCompany,
    detectedStatus: classification.detectedStatus,
    confidence: classification.confidence,
    extractedDetails: {
      actionRequired: classification.actionRequired,
      interviewDate: classification.interviewDate,
      recruiterName: classification.recruiterName
    },
    isProcessed: false
  };
}
