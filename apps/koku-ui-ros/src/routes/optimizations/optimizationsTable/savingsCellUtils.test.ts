import { formatSavingsCellValue, formatSignedMoney } from './savingsCellUtils';

describe('savingsCellUtils', () => {
  describe('formatSignedMoney', () => {
    it('formats positive amounts unchanged', () => {
      expect(formatSignedMoney(800, 'USD')).toBe('$800.00 USD');
    });

    it('formats negative amounts as additional cost with a plus prefix', () => {
      expect(formatSignedMoney(-182.29, 'USD')).toBe('+$182.29 USD');
    });

    it('defaults missing units to USD', () => {
      expect(formatSignedMoney(10)).toBe('$10.00 USD');
    });
  });

  describe('formatSavingsCellValue', () => {
    it('formats positive string amounts', () => {
      expect(formatSavingsCellValue('800.00', 'USD')).toBe('$800.00 USD');
    });

    it('formats negative string amounts as additional cost', () => {
      expect(formatSavingsCellValue('-182.29', 'USD')).toBe('+$182.29 USD');
    });

    it('keeps zero amounts as $0.00', () => {
      expect(formatSavingsCellValue('0', 'USD')).toBe('$0.00 USD');
    });

    it('returns null for missing or unparsable values', () => {
      expect(formatSavingsCellValue(undefined, 'USD')).toBeNull();
      expect(formatSavingsCellValue(null, 'USD')).toBeNull();
      expect(formatSavingsCellValue('', 'USD')).toBeNull();
      expect(formatSavingsCellValue('n/a', 'USD')).toBeNull();
    });
  });
});
