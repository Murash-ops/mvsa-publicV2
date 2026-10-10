/**
 * Kenyan phone handling, shared by the booking widget and the route handlers.
 * Safe to import from the browser: no secrets, no backend calls.
 */

/** Returns the number in E.164 (+2547… / +2541…) or null if it is not valid. */
export function normalizeKenyanPhone(input: string): string | null {
  const digitsOnly = input.replace(/[\s()\-.]/g, '');

  const candidate = digitsOnly.startsWith('+')
    ? digitsOnly.slice(1)
    : digitsOnly.startsWith('254')
      ? digitsOnly
      : digitsOnly.startsWith('0')
        ? `254${digitsOnly.slice(1)}`
        : /^[17]\d{8}$/.test(digitsOnly)
          ? `254${digitsOnly}`
          : digitsOnly;

  return /^254[17]\d{8}$/.test(candidate) ? `+${candidate}` : null;
}

export function isValidKenyanPhone(input: string): boolean {
  return normalizeKenyanPhone(input) !== null;
}

/**
 * The WhatsApp provider identifier for an E.164 number is the number without
 * the leading "+", which is the form the gateway sends (see the backend's
 * booking-api-addendum.md).
 */
export function whatsAppProviderUserId(phoneE164: string): string {
  return phoneE164.replace(/^\+/, '');
}
