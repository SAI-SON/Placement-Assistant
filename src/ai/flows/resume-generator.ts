'use server';

/**
 * @fileOverview An AI agent that generates a professional resume from user-provided data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ContactSchema = z.object({
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  linkedin: z.string(),
  portfolio: z.string(),
});

const EducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
  cgpa: z.string(),
});

const ProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  impact: z.string(),
  tech: z.array(z.string()),
});

const ResumeGeneratorInputSchema = z.object({
  name: z.string(),
  role: z.string(),
  contact: ContactSchema,
  education: z.array(EducationSchema),
  skills: z.array(z.string()),
  projects: z.array(ProjectSchema),
  achievements: z.array(z.string()),
});
export type ResumeGeneratorInput = z.infer<typeof ResumeGeneratorInputSchema>;

const ResumeGeneratorOutputSchema = z.object({
  text_resume: z.string().describe('A clean, plain-text, ATS-friendly version of the resume.'),
  formatted_resume_markdown: z.string().describe('A visually appealing markdown version of the resume, suitable for web display.'),
  suggestions: z.array(z.string()).describe('A list of suggestions to improve the resume.'),
});
export type ResumeGeneratorOutput = z.infer<typeof ResumeGeneratorOutputSchema>;

const resumeGeneratorPrompt = ai.definePrompt({
  name: 'resumeGeneratorPrompt',
  input: { schema: ResumeGeneratorInputSchema },
  output: { schema: ResumeGeneratorOutputSchema },
  prompt: `You are a professional Resume Builder AI designed to generate modern, ATS-friendly, and visually appealing resumes.

  🎯 TASK:
  Generate a clean, well-structured, and impactful resume using the provided user data.
  
  📄 FORMAT:
  - Maintain clear sections:
    1. Header (Name, Role, Contact, Portfolio/LinkedIn)
    2. Objective / Summary
    3. Education
    4. Skills (Technical + Soft Skills)
    5. Projects (with achievements and technologies used)
    6. Experience (if provided)
    7. Achievements & Certifications
  
  💡 STYLE GUIDE:
  - Use a professional tone (concise and confident).
  - Prioritize readability with consistent spacing and typography.
  - Highlight keywords relevant to software engineering roles.
  - Use bullet points. Do not use emojis.
  - Keep formatting compatible with ATS (no tables or columns).
  
  🧩 ENHANCEMENTS TO ADD:
  - Suggest improvements for missing or weak sections.
  - Add measurable results (e.g., “Improved efficiency by 25%”).
  - Include a one-line career tagline under the name.
  
  📤 RESPONSE STRUCTURE:
    Return a JSON object with three keys:
    1. "text_resume": A clean, plain-text, ATS-friendly version of the resume.
    2. "formatted_resume_markdown": A visually appealing markdown version of the resume. Use markdown for headers, bold text, italics, and lists.
    3. "suggestions": An array of strings with actionable suggestions for improvement.

  Here is the user's data:
  Name: {{{name}}}
  Role: {{{role}}}
  
  Contact:
  - Email: {{{contact.email}}}
  - Phone: {{{contact.phone}}}
  - Location: {{{contact.location}}}
  - LinkedIn: {{{contact.linkedin}}}
  - Portfolio: {{{contact.portfolio}}}

  Education:
  {{#each education}}
  - Degree: {{{degree}}}
    Institution: {{{institution}}}
    Year: {{{year}}}
    CGPA: {{{cgpa}}}
  {{/each}}

  Skills: {{{skills}}}
  
  Projects:
  {{#each projects}}
  - Title: {{{title}}}
    Description: {{{description}}}
    Impact: {{{impact}}}
    Tech: {{{tech}}}
  {{/each}}
  
  Achievements: {{{achievements}}}

  Now, generate the resume in the specified JSON format.`,
});

const resumeGeneratorFlow = ai.defineFlow(
  {
    name: 'resumeGeneratorFlow',
    inputSchema: ResumeGeneratorInputSchema,
    outputSchema: ResumeGeneratorOutputSchema,
  },
  async input => {
    const { output } = await resumeGeneratorPrompt(input);
    return output!;
  }
);

export async function generateResume(input: ResumeGeneratorInput): Promise<ResumeGeneratorOutput> {
  return resumeGeneratorFlow(input);
}
