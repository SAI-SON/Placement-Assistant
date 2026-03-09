'use server';

/**
 * @fileOverview A resume scoring and feedback AI agent.
 *
 * - resumeScoringAndFeedback - A function that handles the resume scoring and feedback process.
 * - ResumeScoringAndFeedbackInput - The input type for the resumeScoringAndFeedback function.
 * - ResumeScoringAndFeedbackOutput - The return type for the resumeScoringAndFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeScoringAndFeedbackInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ResumeScoringAndFeedbackInput = z.infer<typeof ResumeScoringAndFeedbackInputSchema>;

const ImprovementSchema = z.object({
  title: z.string().describe('The title of the improvement point, e.g., "Clarify Your Work Dates (Critical)".'),
  whatsWrong: z.string().describe("A description of what is wrong or missing."),
  howToFix: z.string().describe("A description of how to fix the issue, with examples if possible."),
});

const ResumeScoringAndFeedbackOutputSchema = z.object({
  score: z.number().describe('The overall score of the resume (0-100).'),
  summary: z.string().describe('A friendly, high-level summary of the resume quality and score.'),
  whatWeLoved: z.array(z.string()).describe("A list of things that are well-done in the resume."),
  whatsHoldingYouBack: z.array(z.string()).describe("A list of things that are negatively impacting the score."),
  improvements: z.array(ImprovementSchema).describe("A checklist of the top opportunities for improvement."),
});
export type ResumeScoringAndFeedbackOutput = z.infer<typeof ResumeScoringAndFeedbackOutputSchema>;

const prompt = ai.definePrompt({
  name: 'resumeScoringAndFeedbackPrompt',
  input: {schema: ResumeScoringAndFeedbackInputSchema},
  output: {schema: ResumeScoringAndFeedbackOutputSchema},
  prompt: `You are an expert resume consultant. Analyze the resume provided and return a structured analysis.

Resume: {{media url=resumeDataUri}}

Your analysis must include:
1.  An overall score from 0-100.
2.  A friendly, high-level summary. Example: "This is a strong start. You've done a great job showing your technical skills..."
3.  A "What We Loved" section with 3-4 bullet points on its strengths (e.g., "Strong Keywords," "Clear & Readable").
4.  A "What's Holding You Back" section with 2-3 bullet points on its weaknesses (e.g., "Confusing Dates," "Vague Descriptions").
5.  A "Quick-Win Checklist" with 2-3 actionable "improvements." Each improvement must have a title, a "What's Wrong/Missing" explanation, and a "How to Fix" guide with examples.

Provide your response in the required JSON format.`,
});

const resumeScoringAndFeedbackFlow = ai.defineFlow(
  {
    name: 'resumeScoringAndFeedbackFlow',
    inputSchema: ResumeScoringAndFeedbackInputSchema,
    outputSchema: ResumeScoringAndFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function resumeScoringAndFeedback(
  input: ResumeScoringAndFeedbackInput
): Promise<ResumeScoringAndFeedbackOutput> {
  return resumeScoringAndFeedbackFlow(input);
}
