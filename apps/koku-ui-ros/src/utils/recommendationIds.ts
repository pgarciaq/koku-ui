import { v5 as uuidv5 } from 'uuid';

/** Must match ros-ocp-backend internal/model/recommendation_set_native.go nativeIDNamespace */
const NATIVE_ID_NAMESPACE = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

function nativeRecommendationId(name: string): string {
  return uuidv5(name, NATIVE_ID_NAMESPACE);
}

/** Mirrors model.NativeContainerID */
export function getContainerRecommendationId(
  clusterUuid: string,
  namespace: string,
  workload: string,
  workloadType: string,
  container: string
): string {
  return nativeRecommendationId(`${clusterUuid}/${namespace}/${workload}/${workloadType}/${container}`);
}

/** Mirrors model.NativeNamespaceID */
export function getNamespaceRecommendationId(clusterUuid: string, namespace: string): string {
  return nativeRecommendationId(`${clusterUuid}/${namespace}`);
}

/** Deterministic node recommendation id (type-prefixed to avoid namespace id collisions). */
export function getNodeRecommendationId(clusterUuid: string, node: string): string {
  return nativeRecommendationId(`node/${clusterUuid}/${node}`);
}

export function getPvcRecommendationId(clusterUuid: string, namespace: string, persistentVolumeClaim: string): string {
  return nativeRecommendationId(`pvc/${clusterUuid}/${namespace}/${persistentVolumeClaim}`);
}

export function getQuotaRecommendationId(clusterUuid: string, namespace: string, quotaName: string): string {
  return nativeRecommendationId(`quota/${clusterUuid}/${namespace}/${quotaName}`);
}

export function getClusterQuotaRecommendationId(clusterUuid: string, clusterQuotaName: string): string {
  return nativeRecommendationId(`cluster-quota/${clusterUuid}/${clusterQuotaName}`);
}

export function getSnapshotRecommendationId(clusterUuid: string, namespace: string, snapshotName: string): string {
  return nativeRecommendationId(`snapshot/${clusterUuid}/${namespace}/${snapshotName}`);
}

/** Deterministic VM recommendation id (type-prefixed). */
export function getVmRecommendationId(clusterUuid: string, namespace: string, vmName: string): string {
  return nativeRecommendationId(`vm/${clusterUuid}/${namespace}/${vmName}`);
}
