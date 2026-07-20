import { useEffect, useRef } from 'react';

/**
 * Detects when all visible rows have null/zero savings and triggers a one-time
 * fallback sort by a variation field instead. Prevents infinite loops by tracking
 * whether the fallback has already been applied for the current data set.
 */
export interface UseSavingsFallbackSortOptions {
  data: any[] | undefined;
  currentOrderBy: string | undefined;
  savingsField?: string;
  fallbackOrderBy: string;
  fallbackOrderHow?: string;
  onSort: (orderBy: string, isAscending: boolean) => void;
}

export function useSavingsFallbackSort({
  data,
  currentOrderBy,
  savingsField = 'estimated_monthly_savings',
  fallbackOrderBy,
  fallbackOrderHow = 'desc',
  onSort,
}: UseSavingsFallbackSortOptions) {
  const appliedFallbackRef = useRef<string | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }

    const fingerprint = `${data.length}-${currentOrderBy}`;
    if (appliedFallbackRef.current === fingerprint) {
      return;
    }

    if (currentOrderBy !== savingsField) {
      return;
    }

    const allZeroOrNull = data.every(item => {
      const savings = item?.[savingsField] ?? item?.estimated_monthly_savings;
      if (savings == null) {
        return true;
      }
      const val = typeof savings === 'object' ? savings.value : savings;
      return val == null || Number(val) === 0;
    });

    if (allZeroOrNull) {
      appliedFallbackRef.current = fingerprint;
      onSort(fallbackOrderBy, fallbackOrderHow !== 'asc');
    }
  }, [data, currentOrderBy, savingsField, fallbackOrderBy, fallbackOrderHow, onSort]);

  const isFallbackActive = appliedFallbackRef.current !== null && currentOrderBy === fallbackOrderBy;

  return { isFallbackActive };
}
