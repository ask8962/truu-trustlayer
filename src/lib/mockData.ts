import { SkillCredential, ActivityEvent, TruuUser } from './types';

export const MOCK_USER: any = null;
export const MOCK_SKILLS: SkillCredential[] = [];
export const MOCK_ACTIVITIES: ActivityEvent[] = [];
export const SKILL_GROWTH_DATA: any[] = [];
export const MINING_FREQUENCY_DATA: any[] = [];
export const TRUST_METRICS = {
  developersVerified: 0,
  skillsMined: 0,
  verificationAccuracy: 0,
};

export function generateMiningSkills(): Partial<SkillCredential>[] {
  return [];
}