'use server';

/**
 * @fileOverview An AI-powered interview coach that asks personalized questions and evaluates answers.
 *
 * - generateQuestions - Generates a list of interview questions.
 * - evaluateAnswer - Evaluates a user's answer to a question.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define schemas for structured input and output

const InterviewQuestionSchema = z.object({
  question: z.string().describe("The interview question to ask the user."),
  questionNumber: z.number().describe("The number of the question in the sequence (e.g., 1 of 10).")
});

const InterviewPlanSchema = z.object({
  questions: z.array(InterviewQuestionSchema).describe("A personalized 5-question interview plan based on the user's resume and the target job description.")
});

const AnswerEvaluationSchema = z.object({
    score: z.number().describe("The total score for the answer, out of 10."),
    whatYouDidWell: z.string().describe("One or two positive points about the user's answer."),
    howToImprove: z.string().describe("One or two actionable suggestions for how the user can improve their answer.")
});

// Define schemas for the flow's main inputs and outputs

const GenerateQuestionsInputSchema = z.object({
  resumeDataUri: z.string().describe("The user's resume as a data URI."),
  jobDescription: z.string().describe("The target job description."),
});
type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

const EvaluateAnswerInputSchema = z.object({
  question: z.string(),
  answer: z.string(),
  resumeDataUri: z.string(),
  jobDescription: z.string(),
});
type EvaluateAnswerInput = z.infer<typeof EvaluateAnswerInputSchema>;

// Define the prompts for Genkit

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateQuestionsInputSchema},
  output: {schema: InterviewPlanSchema},
  prompt: `You are an AI Interview Coach. Your task is to generate a personalized 5-question interview plan based on the provided resume and target job description.

Resume: {{media url=resumeDataUri}}
Job Description: {{{jobDescription}}}

Generate 5 questions that a real hiring manager would ask for this role, based on the experience and skills listed in the resume.`,
});

const evaluateAnswerPrompt = ai.definePrompt({
    name: 'evaluateAnswerPrompt',
    input: {schema: EvaluateAnswerInputSchema},
    output: {schema: AnswerEvaluationSchema},
    prompt: `You are an AI Interview Evaluator. Your goal is to provide constructive, data-driven feedback on the user's answer.

You will evaluate based on the "Professional Answer Rubric":
1.  **Relevance & Focus (3 points):** Did they directly answer the question?
2.  **Structure & Clarity (4 points):** Was the answer logical? Did they use the STAR method (Situation, Task, Action, Result)?
3.  **Impact & Detail (3 points):** Did they provide specific examples or metrics?

**User's Resume (for context):** {{media url=resumeDataUri}}
**Job Description (for context):** {{{jobDescription}}}

**Question Asked:** {{{question}}}
**User's Answer:** {{{answer}}}

Provide a score and feedback in the required JSON format. The feedback should be supportive and professional.
`,
});

// Define the flows

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: InterviewPlanSchema,
  },
  async (input) => {
    const {output} = await generateQuestionsPrompt(input);
    return output!;
  }
);

const evaluateAnswerFlow = ai.defineFlow(
    {
      name: 'evaluateAnswerFlow',
      inputSchema: EvaluateAnswerInputSchema,
      outputSchema: AnswerEvaluationSchema,
    },
    async (input) => {
      const {output} = await evaluateAnswerPrompt(input);
      return output!;
    }
);

// Export simple async wrapper functions for use in Server Actions
export async function generateQuestions(input: GenerateQuestionsInput) {
    return await generateQuestionsFlow(input);
}

export async function evaluateAnswer(input: EvaluateAnswerInput) {
    return await evaluateAnswerFlow(input);
}
