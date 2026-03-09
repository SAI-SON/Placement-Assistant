import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Using gemini-1.5-flash for better rate limits (60 RPM vs 20 RPM)
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});