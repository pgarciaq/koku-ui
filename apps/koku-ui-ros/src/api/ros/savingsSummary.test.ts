import { getPluginSavingsAmount, getPluginSavingsBreakdown } from './savingsSummary';

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

  it('returns plugin-specific breakdown from by_plugin_breakdown', () => {
    const breakdown = getPluginSavingsBreakdown(
      {
        container: {
          savings: { value: '800.00', units: 'USD' },
          additional_cost: { value: '182.29', units: 'USD' },
          savings_count: 3,
          additional_cost_count: 2,
        },
      },
      'container'
    );
    expect(breakdown?.savings?.value).toBe('800.00');
    expect(breakdown?.additional_cost?.value).toBe('182.29');
    expect(breakdown?.savings_count).toBe(3);
    expect(breakdown?.additional_cost_count).toBe(2);
  });

  it('returns undefined breakdown for namespace plugin', () => {
    expect(
      getPluginSavingsBreakdown(
        { container: { savings: { value: '1', units: 'USD' } } },
        'namespace'
      )
    ).toBeUndefined();
  });
});
