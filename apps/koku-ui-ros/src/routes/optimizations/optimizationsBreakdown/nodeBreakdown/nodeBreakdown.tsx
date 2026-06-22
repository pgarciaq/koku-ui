import '../optimizationsBreakdown.scss';

import { Alert, List, ListItem, PageSection, Tab, TabContent, Tabs, TabTitleText } from '@patternfly/react-core';
import type { Query } from 'api/queries/query';
import { parseQuery } from 'api/queries/query';
import type { NodeRecommendationData } from 'api/ros/recommendations';
import { RosPathsType, RosType } from 'api/ros/ros';
import type { AxiosError } from 'axios';
import messages from 'locales/messages';
import type { RefObject } from 'react';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { LoadingState } from 'routes/components/state/loadingState';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { rosActions, rosSelectors } from 'store/ros';
import { Interval, OptimizationType } from 'utils/commonTypes';
import { breadcrumbLabelKey } from 'utils/props';

import { styles } from '../optimizationsBreakdown.styles';
import { NodeBreakdownHeader } from './nodeBreakdownHeader';

export const getIdKeyForTab = (tab: OptimizationType) => {
  switch (tab) {
    case OptimizationType.cost:
      return 'cost';
    case OptimizationType.performance:
      return 'performance';
  }
};

interface AvailableTab {
  contentRef: RefObject<any>;
  tab: OptimizationType;
}

interface NodeBreakdownOwnProps {
  linkState?: any;
  projectPath?: string;
  queryStateName: string;
}

interface NodeBreakdownMapProps {
  queryStateName: string;
}

interface NodeBreakdownStateProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  report?: NodeRecommendationData;
  reportError?: AxiosError;
  reportFetchStatus?: FetchStatus;
  reportQueryString?: string;
}

type NodeBreakdownProps = NodeBreakdownOwnProps & NodeBreakdownStateProps;

const reportType = RosType.ros as any;
const reportPathsType = RosPathsType.nodeRecommendation as any;

const NodeBreakdown: React.FC<NodeBreakdownProps> = ({ linkState, projectPath, queryStateName }) => {
  const { breadcrumbLabel, breadcrumbPath, report, reportFetchStatus } = useMapToProps({
    queryStateName,
  });
  const [activeTabKey, setActiveTabKey] = useState(0);
  const intl = useIntl();

  const getOptimizationType = () => {
    switch (activeTabKey) {
      case 1:
        return OptimizationType.performance;
      case 0:
      default:
        return OptimizationType.cost;
    }
  };

  const getDefaultInterval = () => {
    const terms = report?.recommendation_terms;
    if (!terms) {
      return Interval.short_term;
    }
    if (terms?.short_term?.recommendation_engines) {
      return Interval.short_term;
    }
    if (terms?.medium_term?.recommendation_engines) {
      return Interval.medium_term;
    }
    if (terms?.long_term?.recommendation_engines) {
      return Interval.long_term;
    }
    return Interval.short_term;
  };

  const [currentInterval, setCurrentInterval] = useState(getDefaultInterval());

  const getNotificationAlert = () => {
    const notifications = (report as any)?.notifications;
    if (!notifications || Object.keys(notifications).length === 0) {
      return null;
    }
    return (
      <div style={styles.alertContainer}>
        <Alert isInline variant="warning" title={intl.formatMessage(messages.notificationsAlertTitle)}>
          <List>
            {Object.values(notifications).map((n: any, index) => (
              <ListItem key={index}>{n.message}</ListItem>
            ))}
          </List>
        </Alert>
      </div>
    );
  };

  const getAvailableTabs = () => {
    const availableTabs: AvailableTab[] = [
      {
        contentRef: React.createRef(),
        tab: OptimizationType.cost,
      },
      {
        contentRef: React.createRef(),
        tab: OptimizationType.performance,
      },
    ];
    return availableTabs;
  };

  const getTabContent = (availableTabs: AvailableTab[]) => {
    return availableTabs.map((val, index) => {
      return (
        <TabContent
          eventKey={index}
          key={`${getIdKeyForTab(val.tab)}-tabContent`}
          id={`tab-${index}`}
          ref={val.contentRef as any}
        >
          {getTabItem(val.tab, index)}
        </TabContent>
      );
    });
  };

  const getTabItem = (tab: OptimizationType, index: number) => {
    const emptyTab = <></>;

    if (activeTabKey !== index) {
      return emptyTab;
    }

    const currentTab = getIdKeyForTab(tab);
    if (currentTab === OptimizationType.cost || currentTab === OptimizationType.performance) {
      const termKey = currentInterval as string;
      const term = report?.recommendation_terms?.[termKey];
      const engine = term?.recommendation_engines?.[tab];

      if (!engine) {
        return (
          <div style={styles.alertContainer}>
            <Alert isInline variant="info" title={intl.formatMessage(messages.optimizationsNoRecommendations)} />
          </div>
        );
      }

      return (
        <div style={{ padding: '16px 0' }}>
          <NodeEngineDetails engine={engine} intl={intl} tab={tab} />
        </div>
      );
    }
    return emptyTab;
  };

  const getTab = (tab: OptimizationType, contentRef, index: number) => {
    return (
      <Tab
        eventKey={index}
        key={`${getIdKeyForTab(tab)}-tab`}
        tabContentId={`tab-${index}`}
        tabContentRef={contentRef}
        title={<TabTitleText>{getTabTitle(tab)}</TabTitleText>}
      />
    );
  };

  const getTabs = (availableTabs: AvailableTab[]) => {
    return (
      <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
        {availableTabs.map((val, index) => getTab(val.tab, val.contentRef, index))}
      </Tabs>
    );
  };

  const getTabTitle = (tab: OptimizationType) => {
    if (tab === OptimizationType.cost) {
      return intl.formatMessage(messages.optimizationsCost);
    } else if (tab === OptimizationType.performance) {
      return intl.formatMessage(messages.optimizationsPerformance);
    }
  };

  const handleOnSelect = (value: Interval) => {
    setCurrentInterval(value);
  };

  const handleTabClick = (event, tabIndex) => {
    if (activeTabKey !== tabIndex) {
      setActiveTabKey(tabIndex);
    }
  };

  const isLoading = reportFetchStatus === FetchStatus.inProgress;
  // eslint-disable-next-line
  const [availableTabs] = useState(getAvailableTabs());

  return (
    <>
      <PageSection style={styles.headerContainer}>
        <NodeBreakdownHeader
          breadcrumbLabel={breadcrumbLabel}
          breadcrumbPath={breadcrumbPath}
          currentInterval={currentInterval}
          isDisabled={isLoading}
          linkState={linkState}
          onSelect={handleOnSelect}
          optimizationType={getOptimizationType()}
          report={report}
        />
      </PageSection>
      <PageSection>{getTabs(availableTabs)}</PageSection>
      <PageSection>
        {isLoading ? (
          <LoadingState
            body={intl.formatMessage(messages.optimizationsLoadingStateDesc)}
            heading={intl.formatMessage(messages.optimizationsLoadingStateTitle)}
          />
        ) : (
          <div>
            {getNotificationAlert()}
            {getTabContent(availableTabs)}
          </div>
        )}
      </PageSection>
    </>
  );
};

const NodeEngineDetails: React.FC<{ engine: any; intl: any; tab: OptimizationType }> = ({ engine, intl }) => {
  const formatValue = (value: number | undefined, unit: string) => {
    if (value == null) return '—';
    return `${value.toFixed(2)} ${unit}`;
  };

  const savings = engine.estimated_monthly_savings;
  const savingsDisplay =
    savings?.value != null ? `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}` : '—';

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                padding: '8px',
                borderBottom: '2px solid var(--pf-t--global--border--color--default)',
              }}
            >
              {intl.formatMessage(messages.metric)}
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid var(--pf-t--global--border--color--default)',
              }}
            >
              {intl.formatMessage(messages.recommended)}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid var(--pf-t--global--border--color--default)' }}>
              CPU Cores
            </td>
            <td
              style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '1px solid var(--pf-t--global--border--color--default)',
              }}
            >
              {formatValue(engine.recommended_cpu_cores, 'cores')}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid var(--pf-t--global--border--color--default)' }}>
              Memory
            </td>
            <td
              style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '1px solid var(--pf-t--global--border--color--default)',
              }}
            >
              {formatValue(engine.recommended_memory_gib, 'GiB')}
            </td>
          </tr>
          {engine.node_count_reduction > 0 && (
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid var(--pf-t--global--border--color--default)' }}>
                {intl.formatMessage(messages.nodeCountReduction)}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '8px',
                  borderBottom: '1px solid var(--pf-t--global--border--color--default)',
                }}
              >
                {engine.node_count_reduction}
              </td>
            </tr>
          )}
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid var(--pf-t--global--border--color--default)' }}>
              {intl.formatMessage(messages.savingsEstimatedMonthly)}
            </td>
            <td
              style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '1px solid var(--pf-t--global--border--color--default)',
              }}
            >
              {savingsDisplay}
            </td>
          </tr>
        </tbody>
      </table>
      {engine.notifications && Object.keys(engine.notifications).length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Alert isInline variant="info" title={intl.formatMessage(messages.notificationsAlertTitle)}>
            <List>
              {Object.values(engine.notifications).map((n: any, idx) => (
                <ListItem key={idx}>{n.message}</ListItem>
              ))}
            </List>
          </Alert>
        </div>
      )}
    </div>
  );
};

const useQueryFromRoute = () => {
  const location = useLocation();
  return parseQuery<Query>(location.search);
};

const useMapToProps = ({ queryStateName }: NodeBreakdownMapProps): NodeBreakdownStateProps => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const queryFromRoute = useQueryFromRoute();
  const location = useLocation();

  const reportQueryString = queryFromRoute ? queryFromRoute.id : '';
  const report: any = useSelector((state: RootState) =>
    rosSelectors.selectRos(state, reportPathsType, reportType, reportQueryString)
  );
  const reportFetchStatus = useSelector((state: RootState) =>
    rosSelectors.selectRosFetchStatus(state, reportPathsType, reportType, reportQueryString)
  );
  const reportError = useSelector((state: RootState) =>
    rosSelectors.selectRosError(state, reportPathsType, reportType, reportQueryString)
  );

  useEffect(() => {
    if (!reportError && reportFetchStatus !== FetchStatus.inProgress) {
      dispatch(rosActions.fetchRosReport(reportPathsType, reportType, reportQueryString));
    }
  }, [reportQueryString]);

  return {
    breadcrumbLabel: queryFromRoute[breadcrumbLabelKey],
    breadcrumbPath: location?.state?.[queryStateName]?.breadcrumbPath,
    report,
    reportError,
    reportFetchStatus,
    reportQueryString,
  };
};

export default NodeBreakdown;
