import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];

/**
 * Convert data URI (e.g. data:application/pdf;base64,xxxx) into a GenerativeAI inline part
 */
function dataUriToGenerativePart(dataUri: string): Part | null {
  try {
    const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return null;
    }
    const mimeType = match[1];
    const data = match[2];
    return {
      inlineData: {
        data,
        mimeType,
      },
    };
  } catch (err) {
    console.error('[Gemini Service] Error parsing data URI:', err);
    return null;
  }
}

/**
 * Robust JSON parser for LLM responses (strips markdown code blocks)
 */
function extractJSON<T>(text: string): T {
  let cleaned = text.trim();
  // Remove markdown fenced code blocks if present (```json ... ``` or ``` ...)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  return JSON.parse(cleaned) as T;
}

/**
 * Run generation with multi-model failover
 */
async function generateWithFallback(
  promptParts: (string | Part)[],
  jsonMode: boolean = false,
  systemInstruction?: string
): Promise<string> {
  let lastError: any = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined,
        systemInstruction,
      });

      const result = await model.generateContent(promptParts);
      const text = result.response.text();
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn(`[Gemini Failover] Model ${modelName} failed: ${err.message}. Retrying with next model...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini model fallbacks failed.');
}

// ---------------------------------------------------------------------------
// 1. Resume Scoring and Feedback
// ---------------------------------------------------------------------------

export interface ResumeAnalysisOutput {
  score: number;
  summary: string;
  whatWeLoved: string[];
  whatsHoldingYouBack: string[];
  improvements: Array<{
    title: string;
    whatsWrong: string;
    howToFix: string;
  }>;
}

export async function analyzeResumeWithGemini(resumeDataUri: string): Promise<ResumeAnalysisOutput> {
  const filePart = dataUriToGenerativePart(resumeDataUri);
  const promptText = `
You are an expert ATS and technical resume consultant. Analyze the provided resume document and return a detailed structured JSON object matching this schema exactly:

{
  "score": number (0-100),
  "summary": "Friendly, high-level summary of the resume quality and score",
  "whatWeLoved": ["3-4 specific strengths, strong keywords, clarity, achievements"],
  "whatsHoldingYouBack": ["2-3 specific weaknesses, formatting issues, vague phrasing, or metric gaps"],
  "improvements": [
    {
      "title": "Actionable title (e.g. Quantify Cloud Impact in Project 1)",
      "whatsWrong": "Clear explanation of what is lacking or weak",
      "howToFix": "Specific example and advice on how to improve this section"
    }
  ]
}

Provide ONLY valid JSON.
`;

  const parts: (string | Part)[] = [];
  if (filePart) {
    parts.push(filePart);
  }
  parts.push(promptText);

  const rawJson = await generateWithFallback(parts, true);
  return extractJSON<ResumeAnalysisOutput>(rawJson);
}

// ---------------------------------------------------------------------------
// 2. Personalized Learning Suggestions
// ---------------------------------------------------------------------------

export interface LearningSuggestionsOutput {
  videoSuggestions: string[];
}

export async function getLearningSuggestionsWithGemini(
  resumeScore: number,
  areasToImprove: string
): Promise<LearningSuggestionsOutput> {
  if (resumeScore >= 70) {
    return { videoSuggestions: [] };
  }

  const prompt = `
You are a technical career coach. Based on the resume score (${resumeScore}/100) and areas needing improvement:
"${areasToImprove}"

Suggest 3 to 5 highly relevant YouTube tutorial and masterclass search titles that will help the candidate learn these technologies and improve their resume.
Return JSON formatted as:
{
  "videoSuggestions": [
    "Full course title or topic 1",
    "Full course title or topic 2"
  ]
}
`;

  const rawJson = await generateWithFallback([prompt], true);
  return extractJSON<LearningSuggestionsOutput>(rawJson);
}

// ---------------------------------------------------------------------------
// 3. AI Interview Coach: Generate Questions
// ---------------------------------------------------------------------------

export interface InterviewQuestion {
  questionNumber: number;
  question: string;
}

export async function generateInterviewQuestionsWithGemini(
  resumeDataUri: string,
  jobDescription: string
): Promise<{ questions: InterviewQuestion[] }> {
  const filePart = dataUriToGenerativePart(resumeDataUri);
  const promptText = `
You are an elite Senior Engineering Hiring Manager and Technical Interviewer.
Your task is to generate a personalized 5-question interview plan tailored specifically to the candidate's resume and the target job description.

Job Description:
${jobDescription || 'Full Stack Software Engineer / Technical Placement Candidate'}

Return JSON formatted as:
{
  "questions": [
    {
      "questionNumber": 1,
      "question": "First question tailored to their background and target role..."
    },
    {
      "questionNumber": 2,
      "question": "Second technical question..."
    },
    {
      "questionNumber": 3,
      "question": "Third question..."
    },
    {
      "questionNumber": 4,
      "question": "Fourth question..."
    },
    {
      "questionNumber": 5,
      "question": "Fifth behavioral or architectural question..."
    }
  ]
}
`;

  const parts: (string | Part)[] = [];
  if (filePart) parts.push(filePart);
  parts.push(promptText);

  const rawJson = await generateWithFallback(parts, true);
  return extractJSON<{ questions: InterviewQuestion[] }>(rawJson);
}

// ---------------------------------------------------------------------------
// 4. AI Interview Coach: Evaluate Answer
// ---------------------------------------------------------------------------

export interface AnswerEvaluationOutput {
  score: number;
  whatYouDidWell: string;
  howToImprove: string;
}

export async function evaluateInterviewAnswerWithGemini(
  question: string,
  answer: string,
  resumeDataUri?: string,
  jobDescription?: string
): Promise<AnswerEvaluationOutput> {
  const parts: (string | Part)[] = [];
  if (resumeDataUri) {
    const filePart = dataUriToGenerativePart(resumeDataUri);
    if (filePart) parts.push(filePart);
  }

  const promptText = `
You are an AI Interview Evaluator. Evaluate the candidate's response to the interview question below based on the Professional Answer Rubric:
1. Relevance & Focus (3 points)
2. Structure & Clarity (STAR method: Situation, Task, Action, Result) (4 points)
3. Impact & Detail (quantified metrics and depth) (3 points)

Question: "${question}"
Candidate's Answer: "${answer}"
${jobDescription ? `Target Job Description: ${jobDescription}` : ''}

Return JSON formatted as:
{
  "score": number (1-10),
  "whatYouDidWell": "1-2 constructive positive highlights",
  "howToImprove": "1-2 high-impact actionable suggestions to make this answer top-tier"
}
`;

  parts.push(promptText);
  const rawJson = await generateWithFallback(parts, true);
  return extractJSON<AnswerEvaluationOutput>(rawJson);
}

// ---------------------------------------------------------------------------
// 5. AI Career Coach Chat Feedback
// ---------------------------------------------------------------------------

export async function getCoachFeedbackWithGemini(query: string): Promise<{ feedback: string }> {
  const systemInstruction = `You are the "AI Career & Placement Coach" for Placement Assistant.
You are an expert technical mentor, software engineering career strategist, and placement advisor.

Your Tone & Approach:
1. Enthusiastic, supportive, practical, and intelligent.
2. Adapt your answers naturally to the user's specific request.
3. Be direct and give high-value, actionable content.

Handling Different Requests:
- Code/Technical: Clean, robust code snippets in markdown (\`\`\`language ... \`\`\`), explanation, complexity, and how to put it on a resume.
- Bullet Point / Summary Rewrite: Provide high-impact **Before:** and **After:** rewrites with power verbs and metrics.
- Career Guidance: Concrete frameworks and step-by-step roadmaps.

Formatting Rules:
- Never output decorative triple asterisks like '***'.
- Use standard bold formatting like **Before:** and **After:**.
- Keep paragraphs clearly separated with blank lines.`;

  const prompt = `User Query: ${query}`;
  const response = await generateWithFallback([prompt], false, systemInstruction);
  return { feedback: response };
}

// ---------------------------------------------------------------------------
// 6. Resume Generator / Builder
// ---------------------------------------------------------------------------

export interface ResumeGeneratorInput {
  name: string;
  role: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    cgpa: string;
  }>;
  skills: string[];
  projects: Array<{
    title: string;
    description: string;
    impact: string;
    tech: string[];
  }>;
  achievements: string[];
}

export interface ResumeGeneratorOutput {
  text_resume: string;
  formatted_resume_markdown: string;
  suggestions: string[];
}

export async function generateResumeWithGemini(
  input: ResumeGeneratorInput
): Promise<ResumeGeneratorOutput> {
  const prompt = `
You are a professional Resume Builder AI designed to generate modern, ATS-friendly, and visually appealing resumes.

Candidate Information:
${JSON.stringify(input, null, 2)}

TASK:
1. Generate a clean plain-text ATS-friendly version ("text_resume").
2. Generate an elegant, beautifully formatted markdown version ("formatted_resume_markdown").
3. Provide 3-5 tactical suggestions ("suggestions") to enhance this profile for recruiters.

Return JSON formatted as:
{
  "text_resume": "Plain text ATS formatted resume...",
  "formatted_resume_markdown": "Full Markdown formatted resume with #, ##, bullet points...",
  "suggestions": [
    "Suggestion 1...",
    "Suggestion 2...",
    "Suggestion 3..."
  ]
}
`;

  const rawJson = await generateWithFallback([prompt], true);
  return extractJSON<ResumeGeneratorOutput>(rawJson);
}
