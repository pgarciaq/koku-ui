import { Flex, FlexItem, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { OptimizationsPvcsTable, OptimizationsSnapshotsTable } from 'routes/optimizations/optimizationsTable';
import { useOptimizationsSubUrl } from 'routes/optimizations/useOptimizationsSubUrl';

interface OptimizationsStorageDetailsOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkPath?: string;
  linkState?: any;
  queryStateName?: string;
}

const OptimizationsStorageDetails: React.FC<OptimizationsStorageDetailsOwnProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  linkPath,
  linkState,
  queryStateName,
}) => {
  const intl = useIntl();
  const { sub, setSub } = useOptimizationsSubUrl('pvc');

  return (
    <>
      <Flex style={{ marginBottom: 16 }}>
        <FlexItem>
          <ToggleGroup aria-label="Storage recommendation type">
            <ToggleGroupItem
              buttonId="pvc"
              isSelected={sub === 'pvc'}
              onChange={() => setSub('pvc')}
              text={intl.formatMessage(messages.storageSubPvc)}
            />
            <ToggleGroupItem
              buttonId="snapshot"
              isSelected={sub === 'snapshot'}
              onChange={() => setSub('snapshot')}
              text={intl.formatMessage(messages.storageSubSnapshot)}
            />
          </ToggleGroup>
        </FlexItem>
      </Flex>
      {sub === 'pvc' ? (
        <OptimizationsPvcsTable
          breadcrumbLabel={breadcrumbLabel}
          breadcrumbPath={breadcrumbPath}
          linkPath={linkPath}
          linkState={linkState}
          queryStateName={queryStateName}
        />
      ) : (
        <OptimizationsSnapshotsTable />
      )}
    </>
  );
};

export default OptimizationsStorageDetails;
