import { canSubmit } from './canSubmit';
import { initialRateFormData } from './utils';

describe('canSubmit with name field', () => {
  test('canSubmit returns false when name has an error', () => {
    const formData = {
      ...initialRateFormData,
      step: 'set_rate',
      rateKind: 'regular',
      errors: { ...initialRateFormData.errors, name: 'Rate name is required', measurement: null, tieredRates: null },
    };
    expect(canSubmit(formData)).toEqual(false);
  });

  test('canSubmit returns true when name and all other fields are valid', () => {
    const formData = {
      ...initialRateFormData,
      step: 'set_rate',
      rateKind: 'regular',
      name: 'CPU charge',
      errors: { ...initialRateFormData.errors, name: null, measurement: null, tieredRates: null },
    };
    expect(canSubmit(formData)).toEqual(true);
  });
});
