import { Flex, FlexItem, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import {
  OptimizationsClusterQuotasTable,
  OptimizationsQuotasTable,
} from 'routes/optimizations/optimizationsTable';
import { useOptimizationsQuotaSubUrl } from 'routes/optimizations/useOptimizationsQuotaSubUrl';

interface OptimizationsQuotaDetailsOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  clusterLinkPath?: string;
  clusterQueryStateName?: string;
  linkPath?: string;
  linkState?: any;
  queryStateName?: string;
}

const OptimizationsQuotaDetails: React.FC<OptimizationsQuotaDetailsOwnProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  clusterLinkPath,
  clusterQueryStateName,
  linkPath,
  linkState,
  queryStateName,
}) => {
  const intl = useIntl();
  const { sub, setSub } = useOptimizationsQuotaSubUrl('namespace');

  return (
    <>
      <Flex style={{ marginBottom: 16 }}>
        <FlexItem>
          <ToggleGroup aria-label="Quota recommendation scope">
            <ToggleGroupItem
              buttonId="namespace-quota"
              isSelected={sub === 'namespace'}
              onChange={() => setSub('namespace')}
              text={intl.formatMessage(messages.quotaSubNamespace)}
            />
            <ToggleGroupItem
              buttonId="cluster-quota"
              isSelected={sub === 'cluster'}
              onChange={() => setSub('cluster')}
              text={intl.formatMessage(messages.quotaSubCluster)}
            />
          </ToggleGroup>
        </FlexItem>
      </Flex>
      {sub === 'namespace' ? (
        <OptimizationsQuotasTable
          breadcrumbLabel={breadcrumbLabel}
          breadcrumbPath={breadcrumbPath}
          linkPath={linkPath}
          linkState={linkState}
          queryStateName={queryStateName}
        />
      ) : (
        <OptimizationsClusterQuotasTable
          breadcrumbLabel={breadcrumbLabel}
          breadcrumbPath={breadcrumbPath}
          linkPath={clusterLinkPath}
          linkState={linkState}
          queryStateName={clusterQueryStateName}
        />
      )}
    </>
  );
};

export default OptimizationsQuotaDetails;
