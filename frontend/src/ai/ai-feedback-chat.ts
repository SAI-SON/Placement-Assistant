// AIFeedbackChat.ts
'use server';

/**
 * @fileOverview An AI-powered resume coach that provides detailed feedback and sample phrases to improve resumes for specific roles.
 *
 * - getResumeFeedback - A function that handles the resume feedback process.
 * - ResumeFeedbackInput - The input type for the getResumeFeedback function.
 * - ResumeFeedbackOutput - The return type for the getResumefeedback function.
 */

import { ai, executePromptWithFallback } from '@/ai/genkit';
import { z } from 'genkit';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ResumeFeedbackInputSchema = z.object({
  query: z
    .string()
    .describe("The user's query about improving their resume for a specific role."),
});
export type ResumeFeedbackInput = z.infer<typeof ResumeFeedbackInputSchema>;

const ResumeFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Detailed feedback and sample phrases to improve the resume. Use markdown for lists.'),
});
export type ResumeFeedbackOutput = z.infer<typeof ResumeFeedbackOutputSchema>;

const resumeFeedbackPrompt = ai.definePrompt({
  name: 'resumeFeedbackPrompt',
  input: { schema: ResumeFeedbackInputSchema },
  output: { schema: ResumeFeedbackOutputSchema },
  prompt: `You are the "AI Career & Placement Coach" for Placement Assistant.
You are an expert technical mentor, software engineering career strategist, and placement advisor.

Your Tone & Approach:
1. Enthusiastic, supportive, practical, and intelligent.
2. Adapt your answers naturally to the user's specific request. DO NOT repeat the exact same canned analogy in every response.
3. Be direct and give high-value, actionable content.

Handling Different Types of Requests:
1. Code & Technical Requests: Provide clean, robust code snippets in markdown with language tag.
2. Resume Bullet Point Rewriting: High-impact Before: and After: rewrites with power verbs and metrics.
3. Career Guidance: Structured, practical advice tailored to landing tech and placement roles.

Formatting Rules:
- Never output decorative triple asterisks like '***'.
- Use standard bold formatting like **Before:** and **After:** for key labels.
- Format code cleanly inside fenced code blocks (\`\`\`language ... \`\`\`).
- Keep paragraphs clearly separated with blank lines.

Now, respond to the user's query:
User Query: {{{query}}}`
});

const resumeFeedbackFlow = ai.defineFlow(
  {
    name: 'resumeFeedbackFlow',
    inputSchema: ResumeFeedbackInputSchema,
    outputSchema: ResumeFeedbackOutputSchema,
  },
  async input => {
    return executePromptWithFallback<ResumeFeedbackInput, ResumeFeedbackOutput>(
      resumeFeedbackPrompt,
      input
    );
  }
);

export async function getResumeFeedback(input: ResumeFeedbackInput): Promise<ResumeFeedbackOutput> {
  try {
    // 1. Call Express + PostgreSQL Backend
    const response = await fetch(`${BACKEND_URL}/api/coach/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: input.query }),
      signal: AbortSignal.timeout(45000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.feedback) {
        return { feedback: data.feedback };
      }
    }
    return await resumeFeedbackFlow(input);
  } catch (err) {
    console.warn('[Frontend Coach] Backend unreachable, using fallback flow:', err);
    return await resumeFeedbackFlow(input);
  }
}
