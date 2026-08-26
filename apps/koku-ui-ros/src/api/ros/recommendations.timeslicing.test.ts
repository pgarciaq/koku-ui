import {
  decodeGpuTimeslicingDetailFetchQuery,
  encodeContainerGpuLookupQuery,
  encodeGpuTimeslicingDetailFetchQuery,
} from './recommendations';

describe('encodeGpuTimeslicingDetailFetchQuery', () => {
  test('encodes node plus cluster, gpu_model, and term filters', () => {
    expect(
      encodeGpuTimeslicingDetailFetchQuery({
        node_name: 'gpu-node-1',
        cluster_uuid: 'abc',
        gpu_model: 'A100',
        term: 'short_term',
      })
    ).toBe('gpu-node-1?cluster_uuid=abc&filter%5Bgpu_model%5D=A100&filter%5Bterm%5D=short_term');
  });

  test('round-trips decode', () => {
    const encoded = encodeGpuTimeslicingDetailFetchQuery({
      node_name: 'gpu-node-1',
      cluster_uuid: 'abc',
      gpu_model: 'A100',
      term: 'medium_term',
    });
    expect(decodeGpuTimeslicingDetailFetchQuery(encoded)).toEqual({
      node_name: 'gpu-node-1',
      cluster_uuid: 'abc',
      gpu_model: 'A100',
      term: 'medium_term',
    });
  });
});

describe('encodeContainerGpuLookupQuery', () => {
  test('uses limit=2 so 0 vs 1 vs many ids can omit Peak hours', () => {
    expect(
      encodeContainerGpuLookupQuery({
        cluster_uuid: 'c1',
        project: 'ns',
        workload: 'job',
        container: 'trainer',
      })
    ).toBe(
      'filter%5Bcluster%5D=c1&filter%5Bproject%5D=ns&filter%5Bworkload%5D=job&filter%5Bcontainer%5D=trainer&limit=2'
    );
  });
});
