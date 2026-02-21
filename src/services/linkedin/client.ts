import * as WebBrowser from 'expo-web-browser';

import { linkedInConfig } from '../../config/linkedin';
import { docRef } from '../firebase';

WebBrowser.maybeCompleteAuthSession();

class LinkedInAuthCancelledError extends Error {
  constructor(message = 'LinkedIn sign-in was cancelled.') {
    super(message);
    this.name = 'LinkedInAuthCancelledError';
  }
}

type LinkedInUserInfo = {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
};

type LinkedInMe = Record<string, unknown>;

export type LinkedInConnectionSummary = {
  name: string;
  email: string;
  picture: string;
  headline: string;
  summary: string;
  positionCount: number;
  educationCount: number;
};

const pickString = (value: unknown): string => (typeof value === 'string' ? value : '');

const pickElementsCount = (value: unknown): number => {
  if (!value || typeof value !== 'object') {
    return 0;
  }

  const elements = (value as { elements?: unknown[] }).elements;
  return Array.isArray(elements) ? elements.length : 0;
};

const buildConnectionSummary = (profile: {
  userInfo: LinkedInUserInfo;
  me: LinkedInMe;
}): LinkedInConnectionSummary => ({
  name: profile.userInfo.name ?? '',
  email: profile.userInfo.email ?? '',
  picture: profile.userInfo.picture ?? '',
  headline: pickString(profile.me.headline),
  summary: pickString(profile.me.summary),
  positionCount: pickElementsCount(profile.me.positions),
  educationCount: pickElementsCount(profile.me.educations),
});

const buildAuthorizationUrl = (): string => {
  if (
    !linkedInConfig.clientId ||
    !linkedInConfig.clientSecret ||
    !linkedInConfig.redirectUri ||
    !linkedInConfig.appRedirectUri
  ) {
    throw new Error(
      'LinkedIn config missing. Set EXPO_PUBLIC_LINKEDIN_CLIENT_ID, EXPO_PUBLIC_LINKEDIN_CLIENT_SECRET, EXPO_PUBLIC_LINKEDIN_REDIRECT_URI, and EXPO_PUBLIC_LINKEDIN_APP_REDIRECT_URI in .env.',
    );
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: linkedInConfig.clientId,
    redirect_uri: linkedInConfig.redirectUri,
    scope: linkedInConfig.scopes.join(' '),
    state: Math.random().toString(36).slice(2),
    prompt: 'login',
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
};

const parseAuthResponse = (
  url: string,
): { code: string | null; error: string | null; errorDescription: string | null } => {
  const codeMatch = url.match(/[?&]code=([^&]+)/);
  const errorMatch = url.match(/[?&]error=([^&]+)/);
  const errorDescriptionMatch = url.match(/[?&]error_description=([^&]+)/);

  return {
    code: codeMatch ? decodeURIComponent(codeMatch[1]) : null,
    error: errorMatch ? decodeURIComponent(errorMatch[1]) : null,
    errorDescription: errorDescriptionMatch ? decodeURIComponent(errorDescriptionMatch[1]) : null,
  };
};

const exchangeCodeForToken = async (code: string): Promise<string> => {
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: [
      'grant_type=authorization_code',
      `code=${encodeURIComponent(code)}`,
      `redirect_uri=${encodeURIComponent(linkedInConfig.redirectUri)}`,
      `client_id=${encodeURIComponent(linkedInConfig.clientId)}`,
      `client_secret=${encodeURIComponent(linkedInConfig.clientSecret)}`,
    ].join('&'),
  });

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!tokenData.access_token) {
    throw new Error(tokenData.error_description ?? 'Failed to get access token from LinkedIn.');
  }

  return tokenData.access_token;
};

const fetchLinkedInProfile = async (accessToken: string): Promise<{ userInfo: LinkedInUserInfo; me: LinkedInMe }> => {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', { headers });
  const userInfo = (await userinfoRes.json()) as LinkedInUserInfo;

  let me: LinkedInMe = {};
  try {
    const meRes = await fetch(
      'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,headline,summary,profilePicture(displayImage~:playableStreams),positions,educations)',
      { headers },
    );
    me = (await meRes.json()) as LinkedInMe;
  } catch {
    me = {};
  }

  return { userInfo, me };
};

const saveLinkedInProfile = async (
  userId: string,
  profile: { userInfo: LinkedInUserInfo; me: LinkedInMe },
): Promise<void> => {
  await docRef(`users/${userId}`).set(
    {
      linkedin: {
        name: profile.userInfo.name ?? '',
        email: profile.userInfo.email ?? '',
        picture: profile.userInfo.picture ?? '',
        sub: profile.userInfo.sub ?? '',
        headline: (profile.me.headline as string | undefined) ?? '',
        summary: (profile.me.summary as string | undefined) ?? '',
        firstName: (profile.me.firstName as Record<string, unknown> | undefined) ?? {},
        lastName: (profile.me.lastName as Record<string, unknown> | undefined) ?? {},
        positions: (profile.me.positions as { elements?: unknown[] } | undefined)?.elements ?? [],
        educations: (profile.me.educations as { elements?: unknown[] } | undefined)?.elements ?? [],
        rawMe: profile.me,
      },
      linkedinConnected: true,
      linkedinConnectedAt: new Date().toISOString(),
    },
    { merge: true },
  );
};

export const connectLinkedInForUser = async (userId: string): Promise<LinkedInConnectionSummary> => {
  const authUrl = buildAuthorizationUrl();
  const result = await WebBrowser.openAuthSessionAsync(authUrl, linkedInConfig.appRedirectUri, {
    preferEphemeralSession: true,
  });

  if (result.type !== 'success') {
    throw new LinkedInAuthCancelledError(`LinkedIn auth did not complete (result: ${result.type}).`);
  }

  const { code, error, errorDescription } = parseAuthResponse(result.url);
  if (error) {
    throw new Error(errorDescription ?? `LinkedIn returned an OAuth error: ${error}.`);
  }

  if (!code) {
    throw new Error(`No authorization code received from LinkedIn. Callback URL: ${result.url}`);
  }

  const accessToken = await exchangeCodeForToken(code);
  const profile = await fetchLinkedInProfile(accessToken);
  await saveLinkedInProfile(userId, profile);
  return buildConnectionSummary(profile);
};

export const isLinkedInCancelledError = (error: unknown): boolean =>
  error instanceof LinkedInAuthCancelledError;
