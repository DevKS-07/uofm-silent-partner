import { z } from 'zod';

import { aiConfig } from '../../config/ai';
import type { SeedAttendee } from '../../features/networking';

const GeneratedIcebreakerSchema = z.object({
  primaryLine: z.string().min(1),
  followupLine: z.string().min(1),
  fallbackLine: z.string().min(1),
  rescueLines: z
    .array(
      z.object({
        title: z.string().min(1),
        text: z.string().min(1),
      }),
    )
    .length(3),
});

export type GeneratedIcebreakerPack = z.infer<typeof GeneratedIcebreakerSchema>;

const extractText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  const output = (value as { output?: unknown[] }).output;
  if (!Array.isArray(output)) return '';

  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = (item as { content?: unknown[] }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== 'object') continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === 'string') {
        chunks.push(text);
      }
    }
  }

  return chunks.join('\n').trim();
};

const fallbackIcebreakers = (attendee: SeedAttendee): GeneratedIcebreakerPack => ({
  primaryLine: `Hi ${attendee.linkedIn.name.split(' ')[0]}, your work at ${attendee.linkedIn.company} caught my eye. What are you focused on this quarter?`,
  followupLine: `You mentioned ${attendee.onboardingAnswers.favoriteTopics[0]}. Which trend there are you most bullish on?`,
  fallbackLine: `Great to meet you, ${attendee.linkedIn.name.split(' ')[0]}. What brought you to this event today?`,
  rescueLines: [
    {
      title: 'Soft Pivot',
      text: 'By the way, what session or speaker has stood out for you so far?',
    },
    {
      title: 'Curiosity Pivot',
      text: `How are you seeing ${attendee.onboardingAnswers.favoriteTopics[0]} evolve this year?`,
    },
    {
      title: 'Bridge Question',
      text: 'Would you be open to sharing one challenge your team is solving right now?',
    },
  ],
});

export const generateIcebreakerPack = async (params: {
  userProfile: Record<string, unknown>;
  attendee: SeedAttendee;
}): Promise<GeneratedIcebreakerPack> => {
  if (!aiConfig.EXPO_PUBLIC_OPENAI_API_KEY) {
    return fallbackIcebreakers(params.attendee);
  }

  const userOnboarding = params.userProfile.onboardingAnswers ?? {};
  const userLinkedIn = params.userProfile.linkedin ?? {};

  const prompt = [
    'Generate networking icebreakers for a real-time conference conversation.',
    'Return ONLY valid JSON with keys: primaryLine, followupLine, fallbackLine, rescueLines.',
    'Constraints:',
    '- Natural spoken English, concise, specific, not generic.',
    '- No emojis, no quotation marks around full lines, no markdown.',
    '- primaryLine should reference a concrete overlap.',
    '- followupLine should deepen the conversation (insight-seeking).',
    '- fallbackLine should be safe and socially easy.',
    '- rescueLines must contain exactly 3 items with title + text.',
    `Current user onboarding: ${JSON.stringify(userOnboarding)}`,
    `Current user LinkedIn snapshot: ${JSON.stringify(userLinkedIn)}`,
    `Target match profile: ${JSON.stringify(params.attendee)}`,
  ].join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${aiConfig.EXPO_PUBLIC_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt,
      }),
    });

    if (!response.ok) {
      return fallbackIcebreakers(params.attendee);
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const text = extractText(payload);
    if (!text) {
      return fallbackIcebreakers(params.attendee);
    }

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const jsonSlice = jsonStart >= 0 && jsonEnd > jsonStart ? text.slice(jsonStart, jsonEnd + 1) : text;
    const parsed = JSON.parse(jsonSlice) as unknown;
    return GeneratedIcebreakerSchema.parse(parsed);
  } catch {
    return fallbackIcebreakers(params.attendee);
  }
};

