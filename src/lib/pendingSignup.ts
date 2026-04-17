export type SignupChallenge = {
  challengeId: string;
  expiresAt: string;
  resendAvailableAt: string;
  maskedMobile: string;
};

type ApiErrorPayload = {
  code?: string;
  challenge?: SignupChallenge;
};

const STORAGE_KEY = 'busapp.pending-signup-challenge';

function isSignupChallenge(value: unknown): value is SignupChallenge {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.challengeId === 'string'
    && typeof candidate.expiresAt === 'string'
    && typeof candidate.resendAvailableAt === 'string'
    && typeof candidate.maskedMobile === 'string'
  );
}

export function getSignupChallengeFromErrorPayload(payload: unknown): SignupChallenge | null {
  if (!payload || typeof payload !== 'object') return null;

  const data = payload as ApiErrorPayload;
  if (data.code !== 'ACCOUNT_NOT_VERIFIED' || !isSignupChallenge(data.challenge)) {
    return null;
  }

  return data.challenge;
}

export function savePendingSignupChallenge(challenge: SignupChallenge): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
}

export function loadPendingSignupChallenge(): SignupChallenge | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isSignupChallenge(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingSignupChallenge(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}