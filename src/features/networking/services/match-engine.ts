import type { MatchResult, MatchScoreBreakdown, SeedAttendee } from '../types';

type UserNetworkingProfile = {
  onboardingAnswers?: {
    personalityTraits?: string[];
    primaryGoal?: string;
    conversationStyle?: string;
    favoriteTopics?: string[];
  };
  linkedin?: Record<string, unknown>;
  linkedinProfileDataResponse?: unknown;
  profile_name?: string;
};

const WEIGHTS = {
  primaryGoal: 35,
  topics: 25,
  personalityTraits: 20,
  conversationStyle: 15,
  linkedIn: 5,
} as const;

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'to',
  'for',
  'at',
  'in',
  'of',
  'with',
  'on',
  'new',
  'high',
  'level',
]);

const normalize = (value: string): string => value.trim().toLowerCase();

const tokenize = (value: string): string[] =>
  normalize(value)
    .replace(/[^a-z0-9+\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const topicCanonical = (topic: string): string => {
  const text = normalize(topic);
  if (text.includes('ai') || text.includes('ml') || text.includes('machine learning')) return 'ai';
  if (text.includes('start')) return 'startups';
  if (text.includes('design') || text.includes('ux')) return 'design';
  if (text.includes('fin')) return 'finance';
  if (text.includes('market')) return 'marketing';
  if (text.includes('data')) return 'data';
  if (text.includes('security')) return 'security';
  if (text.includes('saas')) return 'saas';
  if (text.includes('leader')) return 'leadership';
  return text;
};

const styleCanonical = (style: string): string => normalize(style).replace(/[^a-z]/g, '');

const intentFromText = (goal: string, headline: string): string => {
  const text = `${normalize(goal)} ${normalize(headline)}`;
  if (text.includes('active investor') || text.includes('vc partner') || text.includes('investor')) {
    if (!text.includes('finding potential investors')) return 'active-investor';
  }
  if (text.includes('finding potential investors') || text.includes('fundraising') || text.includes('raise capital')) {
    return 'seeking-investor';
  }
  if (text.includes('meeting technical co founders') || text.includes('technical co founders') || text.includes('co-founder')) {
    return 'seeking-technical-cofounder';
  }
  if (text.includes('technical co-founder') || text.includes('cto') || text.includes('engineer')) {
    return 'technical-builder';
  }
  if (text.includes('exploring new job opportunities') || text.includes('open to work') || text.includes('job')) {
    return 'job-seeker';
  }
  if (text.includes('hiring') || text.includes('recruiting') || text.includes('build team')) {
    return 'hiring-manager';
  }
  if (text.includes('networking casually')) {
    return 'casual-networker';
  }
  return 'other';
};

const keywordOverlapRatio = (a: string, b: string): number => {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) overlap += 1;
  }
  return overlap / Math.max(tokensA.size, tokensB.size);
};

const scorePrimaryGoal = (
  userGoal: string,
  candidateGoal: string,
  candidateHeadline: string,
): number => {
  const userIntent = intentFromText(userGoal, '');
  const candidateIntent = intentFromText(candidateGoal, candidateHeadline);

  const relationalPairs = new Set([
    'seeking-investor|active-investor',
    'active-investor|seeking-investor',
    'seeking-technical-cofounder|technical-builder',
    'technical-builder|seeking-technical-cofounder',
    'job-seeker|hiring-manager',
    'hiring-manager|job-seeker',
  ]);

  let multiplier = 0;
  if (normalize(userGoal) && normalize(userGoal) === normalize(candidateGoal)) {
    multiplier = 1;
  } else if (relationalPairs.has(`${userIntent}|${candidateIntent}`)) {
    multiplier = 1;
  } else if (userIntent === candidateIntent && userIntent !== 'other') {
    multiplier = 0.75;
  } else if (userIntent === 'casual-networker' || candidateIntent === 'casual-networker') {
    multiplier = 0.4;
  } else {
    multiplier = 0.1 + keywordOverlapRatio(userGoal, candidateGoal) * 0.4;
  }

  return Number((WEIGHTS.primaryGoal * Math.min(1, multiplier)).toFixed(2));
};

const scoreTopics = (userTopics: string[], candidateTopics: string[]): { score: number; overlap: string[] } => {
  const userSet = new Set(userTopics.map(topicCanonical));
  const candidateSet = new Set(candidateTopics.map(topicCanonical));

  const overlap: string[] = [];
  for (const topic of userSet) {
    if (candidateSet.has(topic)) overlap.push(topic);
  }

  const ratio = overlap.length / Math.max(userSet.size, candidateSet.size, 1);
  return {
    score: Number((WEIGHTS.topics * ratio).toFixed(2)),
    overlap,
  };
};

const scorePersonalityTraits = (userTraits: string[], candidateTraits: string[]): { score: number; matches: number } => {
  let matches = 0;
  for (let i = 0; i < 5; i += 1) {
    const user = normalize(userTraits[i] ?? '');
    const candidate = normalize(candidateTraits[i] ?? '');
    if (user && candidate && user === candidate) {
      matches += 1;
    }
  }

  return {
    score: Number((matches * 4).toFixed(2)),
    matches,
  };
};

const scoreConversationStyle = (userStyle: string, candidateStyle: string): number => {
  if (!userStyle || !candidateStyle) return 0;
  return styleCanonical(userStyle) === styleCanonical(candidateStyle) ? WEIGHTS.conversationStyle : 0;
};

const collectUserLinkedInText = (userProfile: UserNetworkingProfile): string => {
  const chunks: string[] = [];
  if (userProfile.profile_name) chunks.push(userProfile.profile_name);
  if (userProfile.linkedin) chunks.push(JSON.stringify(userProfile.linkedin));
  if (userProfile.linkedinProfileDataResponse) chunks.push(JSON.stringify(userProfile.linkedinProfileDataResponse));
  return normalize(chunks.join(' '));
};

const scoreLinkedIn = (userProfile: UserNetworkingProfile, candidate: SeedAttendee): number => {
  const userText = collectUserLinkedInText(userProfile);
  if (!userText) return 0;

  let score = 0;

  const companyNames = [candidate.linkedIn.company, ...candidate.linkedIn.pastCompanies];
  if (companyNames.some((company) => normalize(company) && userText.includes(normalize(company)))) {
    score += 2;
  }

  if (candidate.linkedIn.universities.some((school) => normalize(school) && userText.includes(normalize(school)))) {
    score += 1.5;
  }

  const matchingSkills = candidate.linkedIn.skills.filter((skill) => {
    const token = normalize(skill);
    return token.length > 1 && userText.includes(token);
  });
  if (matchingSkills.length > 0) {
    score += Math.min(1.5, (matchingSkills.length / Math.max(candidate.linkedIn.skills.length, 1)) * 1.5);
  }

  return Number(Math.min(WEIGHTS.linkedIn, score).toFixed(2));
};

const buildSummary = (breakdown: MatchScoreBreakdown): string => {
  const ranked = [
    { label: 'primary-goal alignment', score: breakdown.primaryGoal },
    { label: 'topic overlap', score: breakdown.topics },
    { label: 'personality fit', score: breakdown.personalityTraits },
    { label: 'conversation style', score: breakdown.conversationStyle },
    { label: 'LinkedIn overlap', score: breakdown.linkedIn },
  ].sort((a, b) => b.score - a.score);

  return `Strong fit on ${ranked[0].label} and ${ranked[1].label}.`;
};

const buildReasons = (
  candidate: SeedAttendee,
  breakdown: MatchScoreBreakdown,
  sharedTopics: string[],
  matchingTraits: number,
): string[] => {
  const reasons: string[] = [];

  if (breakdown.primaryGoal > 0) {
    reasons.push(`Primary goal alignment with "${candidate.onboardingAnswers.primaryGoal}".`);
  }
  if (sharedTopics.length > 0) {
    reasons.push(`Shared topics: ${sharedTopics.slice(0, 3).join(', ')}.`);
  }
  if (matchingTraits > 0) {
    reasons.push(`${matchingTraits}/5 personality traits align.`);
  }
  if (breakdown.conversationStyle > 0) {
    reasons.push(`Both prefer "${candidate.onboardingAnswers.conversationStyle}".`);
  }
  if (breakdown.linkedIn > 0) {
    reasons.push('LinkedIn background overlap (industry, company, school, or skills).');
  }

  return reasons.slice(0, 4);
};

export const rankSeedAttendees = (
  userProfile: UserNetworkingProfile,
  attendees: SeedAttendee[],
): MatchResult[] => {
  const userOnboarding = userProfile.onboardingAnswers ?? {};
  const userGoal = userOnboarding.primaryGoal ?? '';
  const userTopics = Array.isArray(userOnboarding.favoriteTopics) ? userOnboarding.favoriteTopics : [];
  const userTraits = Array.isArray(userOnboarding.personalityTraits) ? userOnboarding.personalityTraits : [];
  const userStyle = userOnboarding.conversationStyle ?? '';

  const ranked = attendees.map((attendee) => {
    const primaryGoal = scorePrimaryGoal(
      userGoal,
      attendee.onboardingAnswers.primaryGoal,
      attendee.linkedIn.headline,
    );
    const topicResult = scoreTopics(userTopics, attendee.onboardingAnswers.favoriteTopics);
    const personalityResult = scorePersonalityTraits(userTraits, attendee.onboardingAnswers.personalityTraits);
    const conversationStyle = scoreConversationStyle(userStyle, attendee.onboardingAnswers.conversationStyle);
    const linkedIn = scoreLinkedIn(userProfile, attendee);

    const total = Number(
      (primaryGoal + topicResult.score + personalityResult.score + conversationStyle + linkedIn).toFixed(2),
    );

    const breakdown: MatchScoreBreakdown = {
      primaryGoal,
      topics: topicResult.score,
      personalityTraits: personalityResult.score,
      conversationStyle,
      linkedIn,
      total,
    };

    return {
      attendee,
      score: Math.round(total),
      summary: buildSummary(breakdown),
      reasons: buildReasons(attendee, breakdown, topicResult.overlap, personalityResult.matches),
      breakdown,
    };
  });

  return ranked.sort((a, b) => b.score - a.score);
};

