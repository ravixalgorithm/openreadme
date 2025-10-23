export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
}

export interface ThemeData {
  name: string;
  githubURL: string;
  imageUrl: string;
  twitterURL: string;
  linkedinURL: string;
  portfolioUrl: string;
  userStats: Record<string, unknown>;
  contributionStats: Record<string, unknown>;
  graphSVG: string;
}

export enum ThemeId {
  Bento = 'bento',
  Minimal = 'minimal',
}
