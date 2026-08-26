import type {
  ContainerGpuRecommendation,
  GpuBhRecommendation,
  GPUTimeslicingRecommendationData,
  NodeBhRecommendation,
  Notification,
  TimeslicingBhRecommendation,
  VmBhRecommendation,
} from 'api/ros/recommendations';

/** Nest warning codes for Peak hours cards (node / GPU / timeslicing / VM). */
export const PEAK_HOURS_WARNING_CODES = new Set([79, 80, 81, 82]);

export function termToGpuKey(term?: string): string {
  if (!term) {
    return 'medium';
  }
  return term.replace(/_term$/, '');
}

function notificationList(
  notifications?: Record<string, Notification> | Notification[]
): Notification[] {
  if (!notifications) {
    return [];
  }
  return Array.isArray(notifications) ? notifications : Object.values(notifications);
}

/** Warning text from nest `message` for codes 79–82. Do not i18n a second copy. */
export function nestWarningMessage(
  notifications?: Record<string, Notification> | Notification[]
): string | undefined {
  const hit = notificationList(notifications).find(
    n => n?.code != null && PEAK_HOURS_WARNING_CODES.has(Number(n.code)) && Boolean(n.message)
  );
  return hit?.message;
}

export function hasNodeBhSizing(bh?: NodeBhRecommendation): boolean {
  return bh != null && (bh.recommended_cpu_cores != null || bh.recommended_memory_gib != null);
}

export function hasGpuBhSizing(bh?: GpuBhRecommendation): boolean {
  return Boolean(bh?.recommended_gpu_profile);
}

export function hasTimeslicingBhSizing(bh?: TimeslicingBhRecommendation): boolean {
  return bh?.recommended_replicas != null;
}

export function hasVmBhSizing(bh?: VmBhRecommendation): boolean {
  return bh != null && (bh.recommended_vcpu != null || bh.recommended_memory_gib != null);
}

export function gpuBhForTerm(
  gpu: Record<string, ContainerGpuRecommendation> | undefined,
  term?: string
): GpuBhRecommendation | undefined {
  if (!gpu) {
    return undefined;
  }
  const key = termToGpuKey(term);
  return gpu[key]?.business_hours ?? gpu[term ?? '']?.business_hours;
}

export function hasAnyGpuBhSizing(gpu?: Record<string, ContainerGpuRecommendation>): boolean {
  if (!gpu) {
    return false;
  }
  return Object.values(gpu).some(termGpu => hasGpuBhSizing(termGpu?.business_hours));
}

/** Exactly one distinct container `id`; 0 or >1 means omit Peak hours (do not guess). */
export function uniqueContainerId(report?: { data?: Array<{ id?: string }> }): string | undefined {
  const ids = [
    ...new Set((report?.data ?? []).map(row => row.id).filter((id): id is string => Boolean(id))),
  ];
  return ids.length === 1 ? ids[0] : undefined;
}

export function pickGpuTimeslicingItem(
  data: GPUTimeslicingRecommendationData[] | undefined,
  gpuModel?: string,
  term?: string
): GPUTimeslicingRecommendationData | undefined {
  if (!data?.length) {
    return undefined;
  }
  const termKey = term ? termToGpuKey(term) : undefined;
  let rows = data;
  if (gpuModel) {
    rows = rows.filter(row => row.gpu_model === gpuModel);
  }
  if (termKey) {
    const byTerm = rows.filter(row => termToGpuKey(row.term) === termKey);
    if (byTerm.length > 0) {
      rows = byTerm;
    }
  }
  return rows[0];
}
