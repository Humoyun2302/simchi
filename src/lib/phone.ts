/** Digits only from an arbitrary phone string. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Normalize to E.164 for Uzbekistan: +998XXXXXXXXX
 * Accepts: 901234567, 998901234567, +998901234567, +998 90 123 45 67, etc.
 * Returns null if fewer than 9 local digits after country code.
 */
export function normalizeUzbekPhone(value: string): string | null {
  let digits = digitsOnly(value)
  if (digits.startsWith('998')) {
    digits = digits.slice(3)
  }
  digits = digits.slice(0, 9)
  if (digits.length !== 9) return null
  return `+998${digits}`
}

/** True when value is a complete +998 + 9 digits number. */
export function isValidUzbekPhone(value: string): boolean {
  return normalizeUzbekPhone(value) !== null
}

/**
 * Format for UI display: +998 XX XXX XX XX
 * Works with partial input (only local digits or full strings).
 */
export function formatUzbekPhone(value: string): string {
  let digits = digitsOnly(value)
  if (digits.startsWith('998')) {
    digits = digits.slice(3)
  }
  digits = digits.slice(0, 9)

  const p1 = digits.slice(0, 2)
  const p2 = digits.slice(2, 5)
  const p3 = digits.slice(5, 7)
  const p4 = digits.slice(7, 9)

  let out = '+998'
  if (p1) out += ` ${p1}`
  if (p2) out += ` ${p2}`
  if (p3) out += ` ${p3}`
  if (p4) out += ` ${p4}`
  return out
}

/** Extract up to 9 local digits (after +998) from any phone-like string. */
export function extractUzbekLocalDigits(value: string): string {
  let digits = digitsOnly(value)
  if (digits.startsWith('998')) {
    digits = digits.slice(3)
  }
  return digits.slice(0, 9)
}
