export type LoginMethod = 'wechat' | 'phone' | 'unknown';
export type UserGender = 'male' | 'female' | 'undisclosed';

export interface UserProfile {
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
  gender: UserGender | null;
  birthday: string | null;
  maskedPhoneNumber: string | null;
  loginMethod: LoginMethod;
  consentAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
