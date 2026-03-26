import { formatDurationLabel } from './durationDisplay';

describe('formatDurationLabel', () => {
  it('formats 24 hours as "1 day"', () => {
    expect(formatDurationLabel(24.0)).toBe('1 day');
  });

  it('formats 72 hours as "3 days"', () => {
    expect(formatDurationLabel(72.0)).toBe('3 days');
  });

  it('formats 480 hours as "20 days"', () => {
    expect(formatDurationLabel(480.0)).toBe('20 days');
  });

  it('formats 2160 hours as "90 days"', () => {
    expect(formatDurationLabel(2160.0)).toBe('90 days');
  });

  it('falls back to hours for non-whole days', () => {
    expect(formatDurationLabel(36.0)).toBe('36 hours');
  });

  it('handles null/undefined gracefully', () => {
    expect(formatDurationLabel(undefined)).toBe('Unknown');
    expect(formatDurationLabel(null)).toBe('Unknown');
  });

  it('handles 0 hours', () => {
    expect(formatDurationLabel(0)).toBe('0 hours');
  });
});
