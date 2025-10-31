'use server';

import { resumeScoringAndFeedback } from '@/ai/flows/resume-scoring-and-feedback';
import type { ResumeScoringAndFeedbackInput, ResumeScoringAndFeedbackOutput } from '@/ai/flows/resume-scoring-and-feedback';
import { suggestYouTubeVideos } from '@/ai/flows/personalized-learning-suggestions';
import type { SuggestYouTubeVideosInput, SuggestYouTubeVideosOutput } from '@/ai/flows/personalized-learning-suggestions';
import { generateQuestions, evaluateAnswer } from '@/ai/flows/interview-coach';
import { generateResume } from '@/ai/flows/resume-generator';
import type { ResumeGeneratorInput, ResumeGeneratorOutput } from '@/ai/flows/resume-generator';


// Define the types within the action file since they can't be exported from the 'use server' file.
type GenerateQuestionsInput = {
  resumeDataUri: string;
  jobDescription: string;
};

type EvaluateAnswerInput = {
  question: string;
  answer: string;
  resumeDataUri: string;
  jobDescription: string;
};

export async function analyzeResumeAction(
  input: ResumeScoringAndFeedbackInput
): Promise<ResumeScoringAndFeedbackOutput> {
  try {
    const result = await resumeScoringAndFeedback(input);
    return result;
  } catch (error) {
    console.error('Error in analyzeResumeAction:', error);
    throw new Error('Failed to analyze resume. The API key might be invalid or missing.');
  }
}

export async function getLearningSuggestionsAction(
  input: SuggestYouTubeVideosInput
): Promise<SuggestYouTubeVideosOutput> {
  try {
    const result = await suggestYouTubeVideos(input);
    return result;
  } catch (error) {
    console.error('Error in getLearningSuggestionsAction:', error);
    throw new Error('Failed to get learning suggestions.');
  }
}

export async function generateQuestionsAction(
  input: GenerateQuestionsInput
) {
  try {
    const result = await generateQuestions(input);
    return result;
  } catch (error) {
    console.error('Error in generateQuestionsAction:', error);
    throw new Error('Failed to generate interview questions.');
  }
}

export async function evaluateAnswerAction(
  input: EvaluateAnswerInput
) {
    try {
        const result = await evaluateAnswer(input);
        return result;
    } catch (error) {
        console.error('Error in evaluateAnswerAction:', error);
        throw new Error('Failed to evaluate your answer.');
    }
}

export async function generateResumeAction(
    input: ResumeGeneratorInput
): Promise<ResumeGeneratorOutput> {
    try {
        const result = await generateResume(input);
        return result;
    } catch (error) {
        console.error('Error in generateResumeAction:', error);
        throw new Error('Failed to generate resume.');
    }
}
