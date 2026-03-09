'use server';

import { resumeScoringAndFeedback } from '@/ai/flows/resume-scoring-and-feedback';
import type { ResumeScoringAndFeedbackInput, ResumeScoringAndFeedbackOutput } from '@/ai/flows/resume-scoring-and-feedback';
import { suggestYouTubeVideos } from '@/ai/flows/personalized-learning-suggestions';
import type { SuggestYouTubeVideosInput, SuggestYouTubeVideosOutput } from '@/ai/flows/personalized-learning-suggestions';
import { generateQuestions, evaluateAnswer } from '@/ai/flows/interview-coach';
import { generateResume } from '@/ai/flows/resume-generator';
import type { ResumeGeneratorInput, ResumeGeneratorOutput } from '@/ai/flows/resume-generator';

// Helper to parse API errors and provide user-friendly messages
function parseAPIError(error: any): string {
  const errorMessage = error?.message || String(error);
  
  if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests') || errorMessage.includes('Quota exceeded')) {
    return 'Too many requests. Please wait 30 seconds and try again. The free tier has rate limits.';
  }
  
  if (errorMessage.includes('403') || errorMessage.includes('Forbidden') || errorMessage.includes('leaked')) {
    return 'API key is invalid or blocked. Please check your environment configuration.';
  }
  
  if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    return 'API authentication failed. Please verify your API key in .env.local file.';
  }
  
  if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
    return 'Invalid request. Please check your input and try again.';
  }
  
  return 'An unexpected error occurred. Please try again later.';
}


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
    throw new Error(parseAPIError(error));
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
    throw new Error(parseAPIError(error));
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
    throw new Error(parseAPIError(error));
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
        throw new Error(parseAPIError(error));
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
        throw new Error(parseAPIError(error));
    }
}
