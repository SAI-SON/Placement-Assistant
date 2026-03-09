'use server';

/**
 * @fileOverview Provides personalized learning suggestions based on resume quality.
 *
 * - suggestYouTubeVideos - A function that suggests YouTube videos based on resume quality.
 * - SuggestYouTubeVideosInput - The input type for the suggestYouTubeVideos function.
 * - SuggestYouTubeVideosOutput - The return type for the suggestYouTubeVideos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestYouTubeVideosInputSchema = z.object({
  resumeScore: z.number().describe('The resume score (0-100).'),
  areasToImprove: z.string().describe('The specific areas in the resume that need improvement.'),
});
export type SuggestYouTubeVideosInput = z.infer<typeof SuggestYouTubeVideosInputSchema>;

const SuggestYouTubeVideosOutputSchema = z.object({
  videoSuggestions: z.array(z.string()).describe('A list of relevant YouTube video suggestions.'),
});
export type SuggestYouTubeVideosOutput = z.infer<typeof SuggestYouTubeVideosOutputSchema>;

const prompt = ai.definePrompt({
  name: 'suggestYouTubeVideosPrompt',
  input: {schema: SuggestYouTubeVideosInputSchema},
  output: {schema: SuggestYouTubeVideosOutputSchema},
  prompt: `You are a resume improvement assistant. Based on the resume score and areas to improve, suggest relevant YouTube videos to help the user improve their resume.

Resume Score: {{{resumeScore}}}
Areas to Improve: {{{areasToImprove}}}

Suggest YouTube videos that address these areas, formatted as a list of video titles:
`, // Corrected template string
});

const suggestYouTubeVideosFlow = ai.defineFlow(
  {
    name: 'suggestYouTubeVideosFlow',
    inputSchema: SuggestYouTubeVideosInputSchema,
    outputSchema: SuggestYouTubeVideosOutputSchema,
  },
  async input => {
    if (input.resumeScore < 70) {
      const {output} = await prompt(input);
      return {videoSuggestions: output!.videoSuggestions};
    } else {
      return {videoSuggestions: []};
    }
  }
);

export async function suggestYouTubeVideos(input: SuggestYouTubeVideosInput): Promise<SuggestYouTubeVideosOutput> {
  return suggestYouTubeVideosFlow(input);
}
