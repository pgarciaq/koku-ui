import { getPluginSavingsAmount } from './savingsSummary';

describe('savingsSummary', () => {
  it('returns plugin-specific savings from by_plugin', () => {
    const amount = getPluginSavingsAmount(
      {
        container: { value: '10.00', units: 'USD' },
        pvc: { value: '5.00', units: 'USD' },
      },
      'pvc'
    );
    expect(amount?.value).toBe('5.00');
  });

  it('returns undefined for namespace plugin', () => {
    expect(getPluginSavingsAmount({ container: { value: '1', units: 'USD' } }, 'namespace')).toBeUndefined();
  });
});
