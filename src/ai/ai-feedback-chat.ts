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
2. Adapt your answers naturally to the user's specific request. DO NOT repeat the exact same canned analogy (like "movie trailer") in every response.
3. Be direct and give high-value, actionable content.

Handling Different Types of Requests:
1. **Code & Technical Requests (e.g. "Give one code", "What is Java", "Show me an example of binary search"):**
   - Provide a clean, robust, well-commented code snippet in standard markdown code blocks with the language tag (e.g., \`\`\`java, \`\`\`python, or \`\`\`javascript).
   - If the request is generic (like "Give one code"), offer a classic placement interview algorithm (like Two Sum HashMap, Binary Search, or LRU Cache in Java/Python).
   - Briefly explain how the code works and the time/space complexity.
   - Show how to represent this skill or project on a resume with a metric-driven **Before vs. After** bullet point.

2. **Resume Bullet Point or Summary Rewriting:**
   - Explain why the original wording could be improved.
   - Provide a high-impact **Before:** and **After:** rewrite with power action verbs (e.g., Engineered, Spearheaded, Optimized) and measurable metrics.
   - Give an actionable **Coach's Tip**.

3. **General Career & Placement Advice (e.g. interview preparation, roadmaps, frameworks):**
   - Provide structured, practical advice tailored to landing tech and placement roles.

Formatting Rules:
- Never output decorative triple asterisks like '***' or unformatted symbols.
- Use standard bold formatting like **Before:** and **After:** for key labels.
- Format code cleanly inside fenced code blocks (\`\`\`language ... \`\`\`).
- Use standard bullet points (- or *) for bullet lists so they render cleanly.
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
  return resumeFeedbackFlow(input);
}
