export function sanitizePhone(value: string): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function normalizeRoPhone(raw: string): string {
  const digits = sanitizePhone(raw);

  if (!digits) return "";

  // 0040XXXXXXXXX -> 40XXXXXXXXX
  if (digits.startsWith("00")) {
    return normalizeRoPhone(digits.slice(2));
  }

  // 40XXXXXXXXX -> 0XXXXXXXXX (RO national)
  if (digits.startsWith("40") && digits.length >= 11) {
    return `0${digits.slice(2)}`;
  }

  // 7XXXXXXXX -> 07XXXXXXXX
  if (digits.startsWith("7") && digits.length === 9) {
    return `0${digits}`;
  }

  return digits;
}

export function isValidRoPhone(raw: string): boolean {
  const normalized = normalizeRoPhone(raw);
  return /^0[2-9]\d{8}$/.test(normalized);
}
