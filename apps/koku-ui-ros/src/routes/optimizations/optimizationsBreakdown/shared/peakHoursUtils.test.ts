import {
  gpuBhForTerm,
  hasAnyGpuBhSizing,
  hasGpuBhSizing,
  hasNodeBhSizing,
  hasTimeslicingBhSizing,
  hasVmBhSizing,
  nestWarningMessage,
  pickGpuTimeslicingItem,
  termToGpuKey,
  uniqueContainerId,
} from './peakHoursUtils';

describe('peakHoursUtils', () => {
  test('termToGpuKey maps short_term to GPU map keys', () => {
    expect(termToGpuKey('short_term')).toBe('short');
    expect(termToGpuKey('medium')).toBe('medium');
    expect(termToGpuKey(undefined)).toBe('medium');
  });

  test('hasNodeBhSizing requires cores or GiB', () => {
    expect(hasNodeBhSizing(undefined)).toBe(false);
    expect(hasNodeBhSizing({ reason: 'insufficient BH days' })).toBe(false);
    expect(hasNodeBhSizing({ recommended_cpu_cores: 4 })).toBe(true);
    expect(hasNodeBhSizing({ recommended_memory_gib: 16 })).toBe(true);
  });

  test('hasGpuBhSizing requires recommended profile', () => {
    expect(hasGpuBhSizing(undefined)).toBe(false);
    expect(hasGpuBhSizing({ reason: 'insufficient BH days' })).toBe(false);
    expect(hasGpuBhSizing({ recommended_gpu_profile: '1g.5gb' })).toBe(true);
  });

  test('hasTimeslicingBhSizing requires replica count', () => {
    expect(hasTimeslicingBhSizing(undefined)).toBe(false);
    expect(hasTimeslicingBhSizing({ reason: 'insufficient BH days' })).toBe(false);
    expect(hasTimeslicingBhSizing({ recommended_replicas: 4 })).toBe(true);
  });

  test('hasVmBhSizing requires vCPU or GiB', () => {
    expect(hasVmBhSizing(undefined)).toBe(false);
    expect(hasVmBhSizing({ reason: 'insufficient BH days' })).toBe(false);
    expect(hasVmBhSizing({ recommended_vcpu: 2 })).toBe(true);
    expect(hasVmBhSizing({ recommended_memory_gib: 8 })).toBe(true);
  });

  test('nestWarningMessage uses nest message for 79–82 only', () => {
    expect(nestWarningMessage(undefined)).toBeUndefined();
    expect(
      nestWarningMessage({
        '11': { code: 11, message: 'parent warning' },
      })
    ).toBeUndefined();
    expect(
      nestWarningMessage({
        '79': { code: 79, message: 'Business-hours node sizing is not peak-safe' },
      })
    ).toBe('Business-hours node sizing is not peak-safe');
    expect(nestWarningMessage([{ code: 82, message: 'VM office window' }])).toBe('VM office window');
  });

  test('gpuBhForTerm reads gpu.short not gpu.short_term', () => {
    const gpu = {
      short: { business_hours: { recommended_gpu_profile: '1g.5gb' } },
    };
    expect(gpuBhForTerm(gpu, 'short_term')?.recommended_gpu_profile).toBe('1g.5gb');
    expect(gpuBhForTerm(gpu, 'medium')).toBeUndefined();
    expect(hasAnyGpuBhSizing(gpu)).toBe(true);
    expect(hasAnyGpuBhSizing({})).toBe(false);
  });

  test('uniqueContainerId omits 0 or >1 distinct ids', () => {
    expect(uniqueContainerId(undefined)).toBeUndefined();
    expect(uniqueContainerId({ data: [] })).toBeUndefined();
    expect(uniqueContainerId({ data: [{}, {}] })).toBeUndefined();
    expect(uniqueContainerId({ data: [{ id: 'a' }, { id: 'b' }] })).toBeUndefined();
    expect(uniqueContainerId({ data: [{ id: 'a' }] })).toBe('a');
    expect(uniqueContainerId({ data: [{ id: 'a' }, { id: 'a' }] })).toBe('a');
  });

  test('pickGpuTimeslicingItem matches gpu_model and term', () => {
    const data = [
      { gpu_model: 'V100', term: 'short', recommended_replicas: 2 },
      { gpu_model: 'A100', term: 'medium', recommended_replicas: 8 },
      { gpu_model: 'A100', term: 'short_term', recommended_replicas: 4 },
    ];
    expect(pickGpuTimeslicingItem(data, 'A100', 'short_term')?.recommended_replicas).toBe(4);
    expect(pickGpuTimeslicingItem(data, 'A100', 'medium')?.recommended_replicas).toBe(8);
    expect(pickGpuTimeslicingItem(undefined, 'A100', 'short')).toBeUndefined();
    expect(pickGpuTimeslicingItem(data, 'missing', 'short')).toBeUndefined();
  });
});
