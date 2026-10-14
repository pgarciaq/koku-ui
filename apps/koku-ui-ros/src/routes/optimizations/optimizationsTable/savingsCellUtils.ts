/**
 * Shared savings-cell formatting for optimizations tables.
 *
 * Savings follow the backend sign convention (current cost minus recommended
 * cost), so upsizes (e.g. `Undersized` rows) arrive as negative amounts.
 * Negatives render with a `+` prefix to read as additional cost
 * (`+$182.29 USD`) instead of misleading `$-182.29 USD` savings (#686).
 * Missing or unparsable values return null so callers keep their existing
 * empty-state rendering.
 */
export function formatSignedMoney(numeric: number, units?: string): string {
  const unitsSuffix = units ?? 'USD';
  if (numeric < 0) {
    return `+$${Math.abs(numeric).toFixed(2)} ${unitsSuffix}`;
  }
  return `$${numeric.toFixed(2)} ${unitsSuffix}`;
}

export function formatSavingsCellValue(value?: string | null, units?: string | null): string | null {
  if (value == null || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }
  return formatSignedMoney(numeric, units ?? undefined);
}
