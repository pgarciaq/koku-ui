import { axiosInstance } from 'api';

import { fetchRate } from './rates';
import type { Rate, RateRequest } from './rates';

test('api get provider calls axiosInstance.get', () => {
  fetchRate();
  expect(axiosInstance.get).toHaveBeenCalledWith('cost-models/');
});

test('RateRequest with name field is accepted', () => {
  const request: RateRequest = {
    name: 'CPU charge',
    metric: { name: 'cpu_core_usage_per_hour' },
    tiered_rates: [{ value: 0.05, unit: 'USD', usage: { unit: 'core-hours' } }],
    cost_type: 'Infrastructure',
  };
  expect(request.name).toEqual('CPU charge');
});

test('Rate interface includes name field', () => {
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
  expect(rate.name).toEqual('Memory charge');
});
