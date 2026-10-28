'use server';

import { resumeScoringAndFeedback } from '@/ai/flows/resume-scoring-and-feedback';
import type { ResumeScoringAndFeedbackInput, ResumeScoringAndFeedbackOutput } from '@/ai/flows/resume-scoring-and-feedback';
import { suggestYouTubeVideos } from '@/ai/flows/personalized-learning-suggestions';
import type { SuggestYouTubeVideosInput, SuggestYouTubeVideosOutput } from '@/ai/flows/personalized-learning-suggestions';
import { generateQuestions, evaluateAnswer } from '@/ai/flows/interview-coach';
import { generateResume } from '@/ai/flows/resume-generator';
import type { ResumeGeneratorInput, ResumeGeneratorOutput } from '@/ai/flows/resume-generator';

// Helper to parse API errors and provide descriptive, user-friendly messages
function parseAPIError(error: any): string {
  const errorMessage = error?.message || (typeof error === 'string' ? error : JSON.stringify(error)) || '';
  console.error('[Action Error Details]:', errorMessage);
  
  if (
    errorMessage.includes('503') ||
    errorMessage.includes('Service Unavailable') ||
    errorMessage.includes('high demand')
  ) {
    return 'Google Gemini servers are currently experiencing high demand. Please try again in a few moments.';
  }

  if (
    errorMessage.includes('429') ||
    errorMessage.includes('RESOURCE_EXHAUSTED') ||
    errorMessage.includes('Too Many Requests') ||
    errorMessage.includes('Quota exceeded')
  ) {
    return 'Gemini API Daily or Minute Quota reached on Free Tier. Please wait a moment or check your Google AI Studio plan.';
  }
  
  if (
    errorMessage.includes('403') ||
    errorMessage.includes('Forbidden') ||
    errorMessage.includes('API_KEY_INVALID') ||
    errorMessage.includes('leaked')
  ) {
    return 'Gemini API key is invalid or blocked. Please verify GEMINI_API_KEY in .env.local.';
  }
  
  if (
    errorMessage.includes('401') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('FAILED_PRECONDITION')
  ) {
    return 'API key is missing or unauthorized. Please verify your GEMINI_API_KEY environment variable.';
  }
  
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return 'The AI model service endpoint was not found. Please check model configuration.';
  }

  if (errorMessage.includes('SAFETY') || errorMessage.includes('blocked')) {
    return 'The AI response was filtered by safety guidelines. Please adjust your input content.';
  }
  
  if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
    return 'Invalid request format or file too large. Please upload a standard PDF or DOCX file under 4MB.';
  }

  // Provide the actual clean error message rather than a generic opaque string
  if (errorMessage.length > 0 && errorMessage.length < 200) {
    return errorMessage.replace(/(\r\n|\n|\r)/gm, " ");
  }
  
  return 'The AI service encountered an issue processing this request. Please try again or with a different sample.';
}

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
