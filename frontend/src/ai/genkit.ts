import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

const defaultModel = process.env.GEMINI_MODEL || 'googleai/gemini-3.5-flash-lite';

export const FALLBACK_MODELS = [
  defaultModel,
  'googleai/gemini-3.5-flash-lite',
  'googleai/gemini-3.5-flash',
  'googleai/gemini-flash-latest',
  'googleai/gemini-3.8-flash',
].filter((val, idx, self) => self.indexOf(val) === idx);

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey,
    }),
  ],
  model: defaultModel,
});

/**
 * Executes a prompt with automatic multi-model failover.
 * If the primary model hits 503 (High Demand) or 429 (Rate Limit), it immediately
 * retries with the next healthy model in the pool.
 */
export async function executePromptWithFallback<TInput, TOutput>(
  promptFn: (input: TInput, options?: any) => Promise<{ output?: TOutput | null; text?: string }>,
  input: TInput
): Promise<TOutput> {
  let lastError: any = null;
  for (const model of FALLBACK_MODELS) {
    try {
      const res = await promptFn(input, { model });
      if (res.output !== undefined && res.output !== null) {
        return res.output;
      }
      if (res.text) {
        return res.text as unknown as TOutput;
      }
    } catch (err: any) {
      console.warn(`[Genkit Model Failover] Model ${model} failed with: ${err.message}. Retrying with next model...`);
      lastError = err;
    }
  }
  throw lastError || new Error('All model failovers failed.');
}