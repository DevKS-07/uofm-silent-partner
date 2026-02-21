import { z } from 'zod';

const LinkedInConfigSchema = z.object({
  EXPO_PUBLIC_LINKEDIN_CLIENT_ID: z.string().optional().default(''),
  EXPO_PUBLIC_LINKEDIN_CLIENT_SECRET: z.string().optional().default(''),
  EXPO_PUBLIC_LINKEDIN_REDIRECT_URI: z.string().optional().default(''),
  EXPO_PUBLIC_LINKEDIN_APP_REDIRECT_URI: z.string().min(1).default('networkingapp://oauth'),
  EXPO_PUBLIC_LINKEDIN_SCOPES: z.string().min(1).default('openid profile email'),
});

const parsed = LinkedInConfigSchema.parse({
  EXPO_PUBLIC_LINKEDIN_CLIENT_ID: process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID,
  EXPO_PUBLIC_LINKEDIN_CLIENT_SECRET: process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_SECRET,
  EXPO_PUBLIC_LINKEDIN_REDIRECT_URI: process.env.EXPO_PUBLIC_LINKEDIN_REDIRECT_URI,
  EXPO_PUBLIC_LINKEDIN_APP_REDIRECT_URI: process.env.EXPO_PUBLIC_LINKEDIN_APP_REDIRECT_URI,
  EXPO_PUBLIC_LINKEDIN_SCOPES: process.env.EXPO_PUBLIC_LINKEDIN_SCOPES,
});

export const linkedInConfig = {
  clientId: parsed.EXPO_PUBLIC_LINKEDIN_CLIENT_ID,
  clientSecret: parsed.EXPO_PUBLIC_LINKEDIN_CLIENT_SECRET,
  redirectUri: parsed.EXPO_PUBLIC_LINKEDIN_REDIRECT_URI,
  appRedirectUri: parsed.EXPO_PUBLIC_LINKEDIN_APP_REDIRECT_URI,
  scopes: parsed.EXPO_PUBLIC_LINKEDIN_SCOPES.split(/\s+/).filter(Boolean),
} as const;
