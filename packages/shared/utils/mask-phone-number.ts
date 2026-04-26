export function maskPhoneNumber(phoneNumber: string | null | undefined): string | null {
  if (!phoneNumber) {
    return null;
  }

  const normalized = phoneNumber.replace(/\s+/g, '');

  if (normalized.length < 7) {
    return normalized;
  }

  return `${normalized.slice(0, 3)}****${normalized.slice(-4)}`;
}
