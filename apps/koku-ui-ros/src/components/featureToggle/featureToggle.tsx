import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useUnleashClient } from '@unleash/proxy-client-react';
import { useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';
import { featureToggleActions } from 'store/featureToggle';

export const enum FeatureToggle {
  boxPlot = 'cost-management.koku-ui-ros.box-plot', // https://redhat.atlassian.net/browse/COST-4619
  debug = 'cost-management.koku-ui-ros.debug', // Logs user data (e.g., account ID) in browser console
  projectLink = 'cost-management.koku-ui-ros.project-link', // Optimizations breakdown project link https://redhat.atlassian.net/browse/COST-4527
  visualInsights = 'cost-management.koku-ui-ros.visual-insights', // Savings waterfall and other visual insight charts
}

const useIsToggleEnabled = (toggle: FeatureToggle) => {
  const client = useUnleashClient();
  return client?.isEnabled?.(toggle) ?? false;
};

export const useIsDebugToggleEnabled = () => {
  return useIsToggleEnabled(FeatureToggle.debug);
};

export const useIsBoxPlotToggleEnabled = () => {
  return useIsToggleEnabled(FeatureToggle.boxPlot);
};

export const useIsProjectLinkToggleEnabled = () => {
  return useIsToggleEnabled(FeatureToggle.projectLink);
};

export const useIsVisualInsightsToggleEnabled = () => {
  return useIsToggleEnabled(FeatureToggle.visualInsights);
};
// The FeatureToggle component saves feature toggles in store for places where Unleash hooks not available
const useFeatureToggle = () => {
  const dispatch = useDispatch();
  const { auth } = useChrome();

  const isDebugToggleEnabled = useIsDebugToggleEnabled();
  const isBoxPlotToggleEnabled = useIsBoxPlotToggleEnabled();
  const isProjectLinkToggleEnabled = useIsProjectLinkToggleEnabled();
  const isVisualInsightsToggleEnabled = useIsVisualInsightsToggleEnabled();

  const fetchUser = callback => {
    auth.getUser().then(user => {
      callback((user as any).identity);
    });
  };

  useLayoutEffect(() => {
    // Workaround for code that doesn't use hooks
    dispatch(
      featureToggleActions.setFeatureToggle({
        isDebugToggleEnabled,
        isBoxPlotToggleEnabled,
        isProjectLinkToggleEnabled,
        isVisualInsightsToggleEnabled,
      })
    );
    if (isDebugToggleEnabled) {
      // eslint-disable-next-line no-console
      fetchUser(identity => console.log('User identity:', identity));
    }
  }, [isDebugToggleEnabled, isBoxPlotToggleEnabled, isProjectLinkToggleEnabled, isVisualInsightsToggleEnabled]);
};

export default useFeatureToggle;
