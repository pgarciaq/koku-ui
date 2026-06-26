import { PageSection, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { useIsEfficiencyToggleEnabled } from 'components/featureToggle';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import type { ChromeComponentProps } from 'utils/chrome';
import { withChrome } from 'utils/chrome';

import { ContainerDetails } from './containerDetails';
import { Efficiency } from './efficiency';
import { NamespaceDetails } from './namespaceDetails';
import { NodeDetails } from './nodeDetails';
import { styles } from './optimizations.styles';
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

  if (!isEfficiencyToggleEnabled) {
    return <ContainerDetails />;
  }
  return (
    <>
      <PageSection style={styles.headerContainer}>
        <header>
          <div style={styles.headerContent}>
            <AsyncComponent scope="costManagementRos" module="./OptimizationsDetailsTitle" />
          </div>
          <div style={styles.tabs}>
            <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
              <Tab eventKey={0} title={<TabTitleText>{intl.formatMessage(messages.efficiency)}</TabTitleText>} />
              <Tab
                eventKey={1}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.container)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsBadge" />
                  </TabTitleText>
                }
              />
              <Tab
                eventKey={2}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.namespace)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsNamespacesBadge" />
                  </TabTitleText>
                }
              />
              <Tab
                eventKey={3}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.node)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsNodesBadge" />
                  </TabTitleText>
                }
              />
              <Tab
                eventKey={4}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.storage)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsStorageBadge" />
                  </TabTitleText>
                }
              />
              <Tab
                eventKey={5}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.virtualMachine)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsVmsBadge" />
                  </TabTitleText>
                }
              />
              <Tab
                eventKey={6}
                title={
                  <TabTitleText>
                    {intl.formatMessage(messages.quota)}{' '}
                    <AsyncComponent scope="costManagementRos" module="./OptimizationsQuotaBadge" />
                  </TabTitleText>
                }
              />
            </Tabs>
          </div>
        </header>
      </PageSection>
      <PageSection>
        {activeTabKey === 0 && <Efficiency />}
        {activeTabKey === 1 && <ContainerDetails activeTabKey={1} />}
        {activeTabKey === 2 && <NamespaceDetails activeTabKey={2} />}
        {activeTabKey === 3 && <NodeDetails activeTabKey={3} />}
        {activeTabKey === 4 && <StorageDetails activeTabKey={4} />}
        {activeTabKey === 5 && <VmDetails activeTabKey={5} />}
        {activeTabKey === 6 && <QuotaDetails activeTabKey={6} />}
      </PageSection>
    </>
  );
};

export default withChrome(Optimizations);
