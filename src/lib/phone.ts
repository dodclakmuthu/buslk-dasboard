export const PHONE_COUNTRIES = [
  {
    code: 'LK',
    label: 'Sri Lanka',
    flag: '🇱🇰',
    dialCode: '+94',
    placeholder: '0771045601',
    invalidMessage: 'Invalid Sri Lanka mobile number. Enter it without the country code, for example 0771045601.',
  },
] as const;

export type SupportedPhoneCountryCode = (typeof PHONE_COUNTRIES)[number]['code'];

export const DEFAULT_PHONE_COUNTRY_CODE: SupportedPhoneCountryCode = 'LK';

const sriLankanMobilePattern = /^7\d{8}$/;

function sanitizePhoneInputValue(value: string): string {
  return value.trim().replace(/[\s()-]/g, '');
}

export function sanitizePhoneInput(value: string): string {
  const compact = sanitizePhoneInputValue(value);
  if (!compact) return '';

  return compact.replace(/\D/g, '');
}

export function getPhoneCountryByCode(code: SupportedPhoneCountryCode) {
  return PHONE_COUNTRIES.find((country) => country.code === code) ?? PHONE_COUNTRIES[0];
}

export function getInvalidPhoneMessage(code: SupportedPhoneCountryCode): string {
  return getPhoneCountryByCode(code).invalidMessage;
}

export function normalizePhoneNumber(value: string, countryCode: SupportedPhoneCountryCode): string | null {
  const compact = sanitizePhoneInputValue(value);
  if (!compact) return null;

  if (countryCode !== 'LK') {
    return null;
  }

  const digits = compact.replace(/\D/g, '');

  if (digits.startsWith('94')) {
    return null;
  }

  if (!digits.startsWith('0')) {
    return null;
  }

  const nationalNumber = digits.slice(1);

  if (!sriLankanMobilePattern.test(nationalNumber)) {
    return null;
  }

  return `+94${nationalNumber}`;
}