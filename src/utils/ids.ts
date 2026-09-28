export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** VS2026-000001 style reference. Sequence is derived from existing records. */
export function registrationReference(year: number, sequence: number): string {
  return `VS${String(year).slice(2)}-${String(sequence).padStart(6, '0')}`;
}

export function enquiryReference(sequence: number): string {
  return `ENQ-${String(sequence).padStart(6, '0')}`;
}
