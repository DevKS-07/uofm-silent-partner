export type SeedLinkedInProfile = {
  name: string;
  headline: string;
  company: string;
  location: string;
  summary: string;
  pastCompanies: string[];
  universities: string[];
  skills: string[];
};

export type SeedOnboardingAnswers = {
  personalityTraits: string[];
  primaryGoal: string;
  conversationStyle: string;
  favoriteTopics: string[];
};

export type SeedAttendee = {
  id: string;
  image: string;
  linkedIn: SeedLinkedInProfile;
  onboardingAnswers: SeedOnboardingAnswers;
};

export type MatchScoreBreakdown = {
  primaryGoal: number;
  topics: number;
  personalityTraits: number;
  conversationStyle: number;
  linkedIn: number;
  total: number;
};

export type MatchResult = {
  attendee: SeedAttendee;
  score: number;
  summary: string;
  reasons: string[];
  breakdown: MatchScoreBreakdown;
};
