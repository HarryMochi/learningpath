
'use server';
/**
 * @fileOverview Generates a complete, structured course with all step content included.
 *
 * - generateFullCourse - A function that generates a structured course outline and content.
 * - GenerateFullCourseInput - The input type for the function.
 * - GenerateFullCourseOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFullCourseInputSchema = z.object({
  topic: z.string().describe('The topic of the course.'),
  depth: z.enum(['15', '30']).describe('The depth of the course (15 for overview, 30 for deep dive).'),
});
export type GenerateFullCourseInput = z.infer<typeof GenerateFullCourseInputSchema>;

const QuizSchema = z.object({
    question: z.string().describe('The quiz question.'),
    options: z.array(z.string()).describe('An array of possible answers.'),
    correctAnswerIndex: z.number().describe('The index of the correct answer in the options array.'),
    explanation: z.string().describe('A brief explanation of why the answer is correct.'),
});

const ExternalLinkSchema = z.object({
    title: z.string().describe('The title of the external website or resource.'),
    url: z.string().url().describe('The full URL to the external resource.'),
});

const GenerateFullCourseOutputSchema = z.object({
  course: z.array(z.object({
    step: z.number().describe('The step number.'),
    title: z.string().describe('The title of the step.'),
    description: z.string().describe('A brief description of what the step covers.'),
    content: z.string().describe('The detailed content for the step, formatted in Markdown. Use headings, lists, bold text, and blockquotes to make it engaging and readable.'),
    funFact: z.string().describe("A surprising or interesting fun fact related to the step's topic.").optional(),
    externalLinks: z.array(ExternalLinkSchema).describe('An array of 2-3 high-quality external links for further reading.').optional(),
    quiz: QuizSchema.describe('A multiple-choice quiz question to test understanding of the step content.').optional(),
  })).describe('A structured course with the specified number of steps, including all content and a quiz for each step.'),
});
export type GenerateFullCourseOutput = z.infer<typeof GenerateFullCourseOutputSchema>;

export async function generateFullCourse(input: GenerateFullCourseInput): Promise<GenerateFullCourseOutput> {
  return generateFullCourseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFullCoursePrompt',
  input: {schema: GenerateFullCourseInputSchema},
  output: {schema: GenerateFullCourseOutputSchema},
  prompt: `You are an AI course generator and expert educator. Your primary task is to create a complete, structured course based on a topic.

    The MOST IMPORTANT requirement is to generate a course with the EXACT number of steps requested.
    - '15' steps for an overview.
    - '30' steps for a deep dive.

    The second MOST IMPORTANT requirement is the QUALITY of the content for each step. Each step's content must be substantial, thorough, and comprehensive, like a mini-lesson. It is absolutely forbidden to generate short, one-sentence, or empty content for any step.

    For each and every step, you must generate:
    1.  A step number.
    2.  A clear and concise title.
    3.  A brief one-sentence description of the step's topic.
    4.  Detailed, thorough, and comprehensive content. This is the most important part. The content must be formatted in Markdown. Use elements like headings (#, ##), bullet points (*), bold text (**text**), and blockquotes (>) to make it structured and engaging. DO NOT use emojis. DO NOT leave the content for any step empty. Each step must have substantial content.
    5.  A surprising or interesting "Fun Fact" related to the step's content.
    6.  An array of 2-3 high-quality, real, and relevant external links for further reading.
    7.  A short, multiple-choice quiz. It is critical that if you include a quiz, it must be complete with a question, 3-4 options, a correct answer index, and an explanation. If you cannot generate a complete quiz, omit the quiz object entirely for that step.

    Your goal is to take a user from a beginner to an advanced level for the given topic.

    Topic: {{{topic}}}
    Number of Steps: {{{depth}}}

    Generate a complete, high-quality course. The output must be a single JSON object.`,
});

const generateFullCourseFlow = ai.defineFlow(
  {
    name: 'generateFullCourseFlow',
    inputSchema: GenerateFullCourseInputSchema,
    outputSchema: GenerateFullCourseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    if (!output || !output.course || output.course.length === 0) {
        throw new Error(`AI failed to generate any steps for this topic. Please try again.`);
    }

    return output!;
  }
);
