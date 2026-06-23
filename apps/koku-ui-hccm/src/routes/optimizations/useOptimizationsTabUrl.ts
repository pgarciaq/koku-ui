import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const OPTIMIZATION_TAB_KEYS = ['efficiency', 'container', 'namespace', 'node', 'storage'] as const;
export type OptimizationTabKey = (typeof OPTIMIZATION_TAB_KEYS)[number];

export const TAB_KEY_TO_INDEX: Record<OptimizationTabKey, number> = {
  efficiency: 0,
  container: 1,
  namespace: 2,
  node: 3,
  storage: 4,
};

const INDEX_TO_TAB_KEY: Record<number, OptimizationTabKey> = {
  0: 'efficiency',
  1: 'container',
  2: 'namespace',
  3: 'node',
  4: 'storage',
};

export type StorageSubKey = 'pvc' | 'snapshot';

export interface UseOptimizationsTabUrlResult {
  activeTab: OptimizationTabKey;
  activeTabKey: number;
  setActiveTab: (tabIndex: number) => void;
  setStorageSub: (sub: StorageSubKey) => void;
  storageSub: StorageSubKey;
}

export function useOptimizationsTabUrl(): UseOptimizationsTabUrlResult {
  const location = useLocation();
  const navigate = useNavigate();

  const { activeTabKey, activeTab, storageSub } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') as OptimizationTabKey | null;
    const subParam = params.get('sub');

    let tabKey = 0;
    if (tabParam && tabParam in TAB_KEY_TO_INDEX) {
      tabKey = TAB_KEY_TO_INDEX[tabParam];
    } else if (location?.state?.efficiencyState?.activeTabKey !== undefined) {
      tabKey = location.state.efficiencyState.activeTabKey;
    }

    return {
      activeTabKey: tabKey,
      activeTab: INDEX_TO_TAB_KEY[tabKey] ?? 'efficiency',
      storageSub: subParam === 'snapshot' ? ('snapshot' as StorageSubKey) : ('pvc' as StorageSubKey),
    };
  }, [location.search, location.state]);

  const setActiveTab = useCallback(
    (tabIndex: number) => {
      const tab = INDEX_TO_TAB_KEY[tabIndex] ?? 'efficiency';
      const params = new URLSearchParams(location.search);
      params.set('tab', tab);
      if (tab !== 'storage') {
        params.delete('sub');
      } else if (!params.get('sub')) {
        params.set('sub', 'pvc');
      }

      navigate(`${location.pathname}?${params.toString()}`, {
        replace: true,
        state: {
          ...(location.state || {}),
          efficiencyState: {
            ...(location?.state?.efficiencyState || {}),
            activeTabKey: tabIndex,
          },
        },
      });
    },
    [location.pathname, location.search, location.state, navigate]
  );

  const setStorageSub = useCallback(
    (sub: StorageSubKey) => {
      const params = new URLSearchParams(location.search);
      params.set('tab', 'storage');
      params.set('sub', sub);

      navigate(`${location.pathname}?${params.toString()}`, {
        replace: true,
        state: {
          ...(location.state || {}),
          efficiencyState: {
            ...(location?.state?.efficiencyState || {}),
            activeTabKey: TAB_KEY_TO_INDEX.storage,
          },
        },
      });
    },
    [location.pathname, location.search, location.state, navigate]
  );

  return { activeTabKey, activeTab, storageSub, setActiveTab, setStorageSub };
}
