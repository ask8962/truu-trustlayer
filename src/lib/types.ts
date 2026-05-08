export interface TruuUser {
  uid: string;
  githubUsername: string;
  email: string;
  avatar: string;
  bio: string;
  trustScore: number;
  createdAt: string;
  lastLogin: string;
  repoCount: number;
  commitCount: number;
}

export interface SkillCredential {
  id: string;
  userId: string;
  skillName: string;
  proficiency: 'Novice' | 'Practitioner' | 'Expert' | 'Master';
  confidence: number;
  proofHash: string;
  verifiedAt: string;
  category: string;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  type: 'mining' | 'credential' | 'sync' | 'upgrade';
  message: string;
  createdAt: string;
  metadata?: Record<string, string | number>;
}

export interface GitHubIntegration {
  userId: string;
  provider: 'github';
  status: 'connected' | 'syncing' | 'error';
  syncedAt: string;
  repoCount: number;
  commitCount: number;
  username: string;
}

export interface TrustMetrics {
  developersVerified: number;
  skillsMined: number;
  verificationAccuracy: number;
}