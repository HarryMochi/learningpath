'use server';
/**
 * @fileOverview Answers questions about a specific course step.
 *
 * - askStepQuestion - A function that answers a question about a step.
 * - AskStepQuestionInput - The input type for the askStepQuestion function.
 * - AskStepQuestionOutput - The return type for the askStepQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskStepQuestionInputSchema = z.object({
  topic: z.string().describe('The topic of the course.'),
  stepTitle: z.string().describe('The title of the step.'),
  stepContent: z.string().describe('The content of the step.'),
  question: z.string().describe('The user\'s question about the step.'),
});
export type AskStepQuestionInput = z.infer<typeof AskStepQuestionInputSchema>;

const AskStepQuestionOutputSchema = z.object({
  answer: z.string().describe('A helpful and concise answer to the user\'s question.'),
});
export type AskStepQuestionOutput = z.infer<typeof AskStepQuestionOutputSchema>;

export async function askStepQuestion(input: AskStepQuestionInput): Promise<AskStepQuestionOutput> {
  return askStepQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askStepQuestionPrompt',
  input: {schema: AskStepQuestionInputSchema},
  output: {schema: AskStepQuestionOutputSchema},
  prompt: `You are an AI assistant for a learning platform. Your role is to answer user questions about specific course content.

  Here is the context:
  - Course Topic: {{{topic}}}
  - Step Title: {{{stepTitle}}}
  - Step Content:
  ---
  {{{stepContent}}}
  ---

  User's Question: {{{question}}}

  Please provide a clear, concise, and helpful answer to the user's question based *only* on the provided step content. If the question cannot be answered from the content, politely state that.
  `,
});

const askStepQuestionFlow = ai.defineFlow(
  {
    name: 'askStepQuestionFlow',
    inputSchema: AskStepQuestionInputSchema,
    outputSchema: AskStepQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
