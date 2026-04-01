import { apiRequest } from './api';

export type WageDefaults = {
  defaultDriverPercentage: number | null;
  defaultConductorPercentage: number | null;
  defaultFixedDriverWage: number | null;
  defaultFixedConductorWage: number | null;
  maxCombinedPercentageWarning: number | null;
  combinedPercentageExceedsWarning: boolean;
  busesUpdated?: number;
};

export type UpdateWageDefaultsInput = {
  defaultDriverPercentage?: number;
  defaultConductorPercentage?: number;
  defaultFixedDriverWage?: number;
  defaultFixedConductorWage?: number;
  maxCombinedPercentageWarning?: number;
  /** When true, also apply the saved values to buses. */
  applyToBuses?: boolean;
  /** true = overwrite all active buses; false = only update buses with no wage info */
  overwriteAll?: boolean;
};

/** GET /settings/wage-defaults */
export async function getWageDefaults(token: string): Promise<WageDefaults> {
  return apiRequest<WageDefaults>('/settings/wage-defaults', { token });
}

/** PATCH /settings/wage-defaults */
export async function updateWageDefaults(
  token: string,
  input: UpdateWageDefaultsInput,
): Promise<WageDefaults> {
  return apiRequest<WageDefaults>('/settings/wage-defaults', {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}
