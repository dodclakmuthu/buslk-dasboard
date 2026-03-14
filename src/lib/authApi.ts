import { apiRequest } from './api';

export type AuthUser = {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string | null;
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

export async function signup(input: SignupInput): Promise<{ user: AuthUser }> {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function login(input: LoginInput): Promise<{ accessToken: string; user: AuthUser }> {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function me(token: string): Promise<{ user: AuthUser }> {
  return apiRequest('/auth/me', {
    method: 'GET',
    token,
  });
}
