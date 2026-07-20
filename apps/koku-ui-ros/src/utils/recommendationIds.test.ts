import {
  getContainerRecommendationId,
  getNamespaceRecommendationId,
  getNodeRecommendationId,
  getPvcRecommendationId,
} from './recommendationIds';

describe('recommendationIds', () => {
  it('matches ros-ocp-backend NativeContainerID', () => {
    expect(getContainerRecommendationId('cluster-1', 'ns', 'deploy', 'Deployment', 'container')).toBe(
      'd8c2e363-ce76-51a8-ae42-ec531cbbfce3'
    );
  });

  it('matches ros-ocp-backend NativeNamespaceID', () => {
    expect(getNamespaceRecommendationId('cluster-uuid-1', 'kube-system')).toBe('b18fbac7-cfe0-5724-a2be-62111c0bae32');
  });

  it('matches ros-ocp-backend NativeNodeID', () => {
    expect(getNodeRecommendationId('cluster-1', 'kube-system')).toBe('2197ba7c-d75a-5b5d-83d9-fc712236809c');
  });

  it('matches ros-ocp-backend NativePvcID', () => {
    expect(getPvcRecommendationId('c1', 'apps', 'data')).toBe('7eda0e9b-46a3-50c6-aaab-dd7d2a844c01');
  });

  it('produces distinct ids for node vs namespace on same cluster/name', () => {
    const nodeId = getNodeRecommendationId('cluster-1', 'kube-system');
    const namespaceId = getNamespaceRecommendationId('cluster-1', 'kube-system');
    expect(nodeId).not.toBe(namespaceId);
  });

  it('produces distinct pvc ids', () => {
    const id1 = getPvcRecommendationId('c1', 'apps', 'data');
    const id2 = getPvcRecommendationId('c1', 'apps', 'logs');
    expect(id1).not.toBe(id2);
  });
});
