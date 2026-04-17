import { apiRequest } from './api';
import type { SignupChallenge } from './pendingSignup';

export type AuthUser = {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string | null;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
  isMobileVerified: boolean;
  mobileVerifiedAt?: string | null;
  isActive: boolean;
};

export type SignupInput = {
  fullName: string;
  mobileNumber: string;
  email?: string;
  password: string;
};

export type LoginInput = {
  mobileNumber: string;
  password: string;
};

export type VerifySignupOtpInput = {
  challengeId: string;
  otp: string;
};

export async function signup(input: SignupInput): Promise<{ challenge: SignupChallenge }> {
  return apiRequest('/auth/signup/start', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function verifySignupOtp(input: VerifySignupOtpInput): Promise<{ user: AuthUser }> {
  return apiRequest('/auth/signup/verify', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function resendSignupOtp(challengeId: string): Promise<{ challenge: SignupChallenge }> {
  return apiRequest('/auth/signup/resend', {
    method: 'POST',
    body: JSON.stringify({ challengeId }),
  });
}

export async function login(input: LoginInput): Promise<{ user: AuthUser }> {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function logout(): Promise<{ success: boolean }> {
  return apiRequest('/auth/logout', {
    method: 'POST',
  });
}

export async function me(token?: string): Promise<{ user: AuthUser }> {
  return apiRequest('/auth/me', {
    method: 'GET',
    token,
  });
}
