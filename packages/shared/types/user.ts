export type LoginMethod = 'wechat' | 'phone' | 'unknown';

export interface UserProfile {
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
  maskedPhoneNumber: string | null;
  loginMethod: LoginMethod;
  consentAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
