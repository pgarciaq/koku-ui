import type { Rate } from 'api/rates';

import { rateFormReducer } from './useRateForm';
import { genFormDataFromRate, initialRateFormData, transformFormDataToRequest } from './utils';

describe('do not update state scenarios', () => {
  test('in the initial step discard UPDATE_MEASUREMENT', () => {
    const state = rateFormReducer(undefined, { type: 'UPDATE_MEASUREMENT', value: 'Usage' });
    expect(state.measurement).toEqual(initialRateFormData.measurement);
  });
  test('in the initial step discard UPDATE_CALCULATION', () => {
    const state = rateFormReducer(undefined, { type: 'UPDATE_CALCULATION', value: 'Infrastructure' });
    expect(state.calculation).toEqual(initialRateFormData.calculation);
  });
  test('unless step is set_rate discard TOGGLE_RATE_KIND', () => {
    let state = rateFormReducer(undefined, { type: 'TOGGLE_RATE_KIND' });
    expect(state.rateKind).toEqual(initialRateFormData.rateKind);
    state = rateFormReducer({ ...initialRateFormData, step: 'set_metric' }, { type: 'TOGGLE_RATE_KIND' });
    expect(state.rateKind).toEqual(initialRateFormData.rateKind);
  });
  test('unless step is set_rate and rate kind is regular discard BLUR_REGULAR', () => {
    let state = rateFormReducer(undefined, { type: 'BLUR_REGULAR' });
    expect(state.errors.tieredRates).toEqual(initialRateFormData.errors.tieredRates);
    state = rateFormReducer(
      { ...initialRateFormData, rateKind: 'regular', step: 'set_rate' },
      { type: 'TOGGLE_RATE_KIND' }
    );
    expect(state.errors.tieredRates).toEqual(initialRateFormData.errors.tieredRates);
  });
  test('unless step is set_rate and rate kind is tagging discard UPDATE_TAG_KEY', () => {
    let state = rateFormReducer(undefined, { type: 'UPDATE_TAG_KEY', value: 'value!' });
    expect(state.taggingRates.tagKey).toEqual(initialRateFormData.taggingRates.tagKey);
    state = rateFormReducer(
      { ...initialRateFormData, rateKind: 'regular', step: 'set_rate' },
      { type: 'UPDATE_TAG_KEY', value: 'value!' }
    );
    expect(state.taggingRates.tagKey).toEqual(initialRateFormData.taggingRates.tagKey);
  });
  test('unless step is set_rate and rate kind is tagging discard UPDATE_TAG_DEFAULT', () => {
    let state = rateFormReducer(undefined, { type: 'UPDATE_TAG_DEFAULT', index: 0 });
    expect(state.taggingRates.defaultTag).toEqual(initialRateFormData.taggingRates.defaultTag);
    state = rateFormReducer(
      { ...initialRateFormData, rateKind: 'regular', step: 'set_rate' },
      { type: 'UPDATE_TAG_DEFAULT', index: 0 }
    );
    expect(state.taggingRates.tagKey).toEqual(initialRateFormData.taggingRates.tagKey);
  });
  test('unless step is set_rate and rate kind is tagging discard BLUR_TAG_RATE', () => {
    let state = rateFormReducer(undefined, { type: 'BLUR_TAG_RATE', index: 0 });
    expect(state.errors).toEqual(initialRateFormData.errors);
    state = rateFormReducer(
      { ...initialRateFormData, rateKind: 'regular', step: 'set_rate' },
      { type: 'BLUR_TAG_RATE', index: 0 }
    );
    expect(state.errors).toEqual(initialRateFormData.errors);
  });
  test('unless step is set_rate and rate kind is tagging discard UPDATE_TAG', () => {
    let state = rateFormReducer(undefined, { type: 'UPDATE_TAG', index: 0, payload: { value: '20' } });
    expect(state.taggingRates).toEqual(initialRateFormData.taggingRates);
    state = rateFormReducer(
      { ...initialRateFormData, rateKind: 'regular', step: 'set_rate' },
      { type: 'UPDATE_TAG', index: 0, payload: { value: '20' } }
    );
    expect(state.taggingRates).toEqual(initialRateFormData.taggingRates);
  });
  test('unless step is set_rate and rate kind is tagging discard REMOVE_TAG', () => {
    let state = rateFormReducer(undefined, { type: 'REMOVE_TAG', index: 1 });
    expect(state).toEqual(initialRateFormData);
    const initial = { ...initialRateFormData, rateKind: 'regular', step: 'set_rate' };
    state = rateFormReducer(initial, { type: 'REMOVE_TAG', index: 1 });
    expect(state).toEqual(initial);
  });
  test('unless step is set_rate and rate kind is tagging discard ADD_TAG', () => {
    let state = rateFormReducer(undefined, { type: 'ADD_TAG' });
    expect(state).toEqual(initialRateFormData);
    const initial = { ...initialRateFormData, rateKind: 'regular', step: 'set_rate' };
    state = rateFormReducer(initial, { type: 'ADD_TAG' });
    expect(state).toEqual(initial);
  });
  test('discard any action that is not a valid type', () => {
    const state = rateFormReducer(undefined, { type: 'BLAAAAA' });
    expect(state).toEqual(initialRateFormData);
  });
});

describe('UPDATE_NAME action', () => {
  test('UPDATE_NAME with valid name sets name and clears error', () => {
    const state = rateFormReducer(
      { ...initialRateFormData, step: 'set_rate' },
      { type: 'UPDATE_NAME', value: 'CPU charge' }
    );
    expect(state.name).toEqual('CPU charge');
    expect(state.errors.name).toEqual(null);
  });

  test('UPDATE_NAME with empty string sets required error', () => {
    const state = rateFormReducer(
      { ...initialRateFormData, step: 'set_rate', name: 'previously set' },
      { type: 'UPDATE_NAME', value: '' }
    );
    expect(state.name).toEqual('');
    expect(state.errors.name).toBeTruthy();
  });

  test('UPDATE_NAME with >50 chars sets too-long error', () => {
    const state = rateFormReducer(
      { ...initialRateFormData, step: 'set_rate' },
      { type: 'UPDATE_NAME', value: 'X'.repeat(51) }
    );
    expect(state.name).toEqual('X'.repeat(51));
    expect(state.errors.name).toBeTruthy();
  });

  test('UPDATE_NAME with exactly 50 chars is valid', () => {
    const state = rateFormReducer(
      { ...initialRateFormData, step: 'set_rate' },
      { type: 'UPDATE_NAME', value: 'X'.repeat(50) }
    );
    expect(state.name).toEqual('X'.repeat(50));
    expect(state.errors.name).toEqual(null);
  });

  test('UPDATE_NAME with duplicate name sets uniqueness error', () => {
    const otherTiers = [
      { name: 'CPU charge', metric: { name: 'cpu_core_usage_per_hour' }, cost_type: 'Infrastructure' },
    ] as Rate[];
    const state = rateFormReducer(
      { ...initialRateFormData, step: 'set_rate', otherTiers },
      { type: 'UPDATE_NAME', value: 'CPU charge' }
    );
    expect(state.errors.name).toBeTruthy();
  });

  test('UPDATE_NAME is accepted at any step', () => {
    const state = rateFormReducer(undefined, { type: 'UPDATE_NAME', value: 'test' });
    expect(state.name).toEqual('test');
    expect(state.errors.name).toEqual(null);
  });
});

describe('form data utilities with name', () => {
  test('transformFormDataToRequest includes name in output', () => {
    const metricsHash = {
      CPU: {
        Usage: {
          metric: 'cpu_core_usage_per_hour',
          label_metric: 'CPU',
          label_measurement: 'Usage',
          label_measurement_unit: 'core-hours',
          default_cost_type: 'Infrastructure',
          source_type: 'OpenShift Cluster Platform',
        },
      },
    };
    const formData = {
      ...initialRateFormData,
      name: 'CPU charge',
      step: 'set_rate',
      rateKind: 'regular',
      metric: 'CPU',
      measurement: { value: 'Usage', isDirty: true },
      calculation: 'Infrastructure',
      tieredRates: [{ isDirty: true, value: '0.05' }],
    };
    const request = transformFormDataToRequest(formData, metricsHash, 'USD');
    expect(request.name).toEqual('CPU charge');
  });

  test('genFormDataFromRate populates name from rate', () => {
    const rate: Rate = {
      name: 'Memory charge',
      metric: {
        name: 'memory_gb_usage_per_hour',
        label_metric: 'Memory',
        label_measurement: 'Usage',
        label_measurement_unit: 'GB-hours',
      },
      tiered_rates: [{ value: 0.03, unit: 'USD', usage: { unit: 'GB-hours' } }],
      cost_type: 'Supplementary',
    };
    const formData = genFormDataFromRate(rate, undefined, []);
    expect(formData.name).toEqual('Memory charge');
  });

  test('genFormDataFromRate with no name defaults to empty string', () => {
    const rate: Rate = {
      metric: {
        name: 'cpu_core_usage_per_hour',
        label_metric: 'CPU',
        label_measurement: 'Usage',
        label_measurement_unit: 'core-hours',
      },
      tiered_rates: [{ value: 0.05, unit: 'USD', usage: { unit: 'core-hours' } }],
      cost_type: 'Infrastructure',
    };
    const formData = genFormDataFromRate(rate, undefined, []);
    expect(formData.name).toEqual('');
  });
});
