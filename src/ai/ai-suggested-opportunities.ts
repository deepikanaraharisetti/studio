'use server';

/**
 * @fileOverview Provides AI-suggested opportunities based on user profile and interests.
 *
 * - getSuggestedOpportunities - A function to retrieve AI-suggested opportunities.
 * - SuggestedOpportunitiesInput - The input type for the getSuggestedOpportunities function.
 * - SuggestedOpportunitiesOutput - The return type for the getSuggestedOpportunities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestedOpportunitiesInputSchema = z.object({
  userProfile: z.string().describe('The user profile information, including skills and interests.'),
  opportunities: z.string().describe('A list of available opportunities with their descriptions and required skills.'),
});

export type SuggestedOpportunitiesInput = z.infer<typeof SuggestedOpportunitiesInputSchema>;

const SuggestedOpportunitiesOutputSchema = z.array(
  z.object({
    opportunityId: z.string().describe('The ID of the suggested opportunity.'),
    reason: z.string().describe('The reason why this opportunity is suggested for the user.'),
  })
);

export type SuggestedOpportunitiesOutput = z.infer<typeof SuggestedOpportunitiesOutputSchema>;

export async function getSuggestedOpportunities(input: SuggestedOpportunitiesInput): Promise<SuggestedOpportunitiesOutput> {
  return suggestedOpportunitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestedOpportunitiesPrompt',
  input: {schema: SuggestedOpportunitiesInputSchema},
  output: {schema: SuggestedOpportunitiesOutputSchema},
  prompt: `You are an AI assistant designed to suggest relevant opportunities to users based on their profiles and interests.

  Given the following user profile:
  {{userProfile}}

  And the following available opportunities:
  {{opportunities}}

  Determine which opportunities are the best fit for the user and provide a reason for each suggestion.
  Return a JSON array of objects, where each object contains the opportunityId and a brief reason for the suggestion.
  Make sure to return only valid and parseable JSON.
  `,
});

const suggestedOpportunitiesFlow = ai.defineFlow(
  {
    name: 'suggestedOpportunitiesFlow',
    inputSchema: SuggestedOpportunitiesInputSchema,
    outputSchema: SuggestedOpportunitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
