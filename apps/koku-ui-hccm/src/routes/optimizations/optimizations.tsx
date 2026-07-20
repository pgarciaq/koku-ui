import { Button, PageSection, Tab, Tabs, TabTitleText, Tooltip } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { useIsEfficiencyToggleEnabled } from 'components/featureToggle';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { routePaths } from 'routePaths';
import type { ChromeComponentProps } from 'utils/chrome';
import { withChrome } from 'utils/chrome';
import { formatPath } from 'utils/paths';

import { ContainerDetails } from './containerDetails';
import { Efficiency } from './efficiency';
import { FleetSummaryDetails } from './fleetSummaryDetails';
import { GpuDetails } from './gpuDetails';
import { HistoryDetails } from './historyDetails';
import { NamespaceDetails } from './namespaceDetails';
import { NodeDetails } from './nodeDetails';
import { styles } from './optimizations.styles';
import { QualityDetails } from './qualityDetails';
import { StorageDetails } from './storageDetails';
import { QuotaDetails } from './quotaDetails';
import { VmDetails } from './vmDetails';
import { useOptimizationsTabUrl } from './useOptimizationsTabUrl';

interface OptimizationsOwnProps extends ChromeComponentProps {
  // TBD...
}

type OptimizationsProps = OptimizationsOwnProps;

const Optimizations: React.FC<OptimizationsProps> = () => {
  const intl = useIntl();
  const isEfficiencyToggleEnabled = useIsEfficiencyToggleEnabled();
  const { activeTabKey, setActiveTab } = useOptimizationsTabUrl();

  const handleTabClick = (_event, tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  return (
    <>
      <PageSection style={styles.headerContainer}>
        <header>
          <div style={{ ...styles.headerContent, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <AsyncComponent scope="costManagementRos" module="./OptimizationsDetailsTitle" />
            <Tooltip content={intl.formatMessage(messages.optimizationsDecaySettings)}>
              <Link to={formatPath(routePaths.optimizationsDecaySettings.path)}>
                <Button variant="plain" aria-label={intl.formatMessage(messages.optimizationsDecaySettings)}>
                  <CogIcon />
                </Button>
              </Link>
            </Tooltip>
          </div>
          <div style={styles.tabs}>
            <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
              <Tab eventKey={0} title={<TabTitleText>{intl.formatMessage(messages.fleetSummaryTab)}</TabTitleText>} />
              {isEfficiencyToggleEnabled && (
                <Tab eventKey={1} title={<TabTitleText>{intl.formatMessage(messages.efficiency)}</TabTitleText>} />
              )}
              <Tab
                eventKey={2}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.container)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsBadge" />
                  </TabTitleText>
                }
              />
              <Tab
                eventKey={3}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.namespace)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsNamespacesBadge" />
                  </TabTitleText>
                }
              />
              <Tab
                eventKey={4}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.node)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsNodesBadge" />
                  </TabTitleText>
                }
              />
              <Tab
                eventKey={5}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.storage)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsStorageBadge" />
                  </TabTitleText>
                }
              />
              <Tab
                eventKey={6}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.virtualMachine)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsVmsBadge" />
                  </TabTitleText>
                }
              />
              <Tab
                eventKey={7}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.quota)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsQuotaBadge" />
                  </TabTitleText>
                }
              />
              <Tab
                eventKey={8}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.gpuTitle)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsGpuBadge" />
                  </TabTitleText>
                }
              />
              <Tab
                eventKey={9}
                title={<TabTitleText>{intl.formatMessage(messages.historyTab)}</TabTitleText>}
              />
              <Tab
                eventKey={10}
                title={<TabTitleText>{intl.formatMessage(messages.qualityTab)}</TabTitleText>}
              />
            </Tabs>
          </div>
        </header>
      </PageSection>
      <PageSection>
        {activeTabKey === 0 && <FleetSummaryDetails />}
        {activeTabKey === 1 && isEfficiencyToggleEnabled && <Efficiency />}
        {activeTabKey === 2 && <ContainerDetails activeTabKey={2} />}
        {activeTabKey === 3 && <NamespaceDetails activeTabKey={3} />}
        {activeTabKey === 4 && <NodeDetails activeTabKey={4} />}
        {activeTabKey === 5 && <StorageDetails activeTabKey={5} />}
        {activeTabKey === 6 && <VmDetails activeTabKey={6} />}
        {activeTabKey === 7 && <QuotaDetails activeTabKey={7} />}
        {activeTabKey === 8 && <GpuDetails activeTabKey={8} />}
        {activeTabKey === 9 && <HistoryDetails activeTabKey={9} />}
        {activeTabKey === 10 && <QualityDetails activeTabKey={10} />}
      </PageSection>
    </>
  );
};

export default withChrome(Optimizations);
