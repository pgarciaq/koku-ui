import { Flex, FlexItem, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

import OptimizationsGpuMigTable from './optimizationsGpuMigTable';
import OptimizationsGpuTimeslicingTable from './optimizationsGpuTimeslicingTable';
import { useOptimizationsGpuSubUrl } from './useOptimizationsGpuSubUrl';

interface OptimizationsGpuDetailsOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkPath?: string;
  linkState?: any;
  migBreakdownPath?: string;
  queryStateName?: string;
  timeslicingBreakdownPath?: string;
}

const OptimizationsGpuDetails: React.FC<OptimizationsGpuDetailsOwnProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  migBreakdownPath,
  queryStateName,
  timeslicingBreakdownPath,
}) => {
  const intl = useIntl();
  const { sub, setSub } = useOptimizationsGpuSubUrl('mig');

  return (
    <>
      <Flex style={{ marginBottom: 16 }}>
        <FlexItem>
          <ToggleGroup aria-label="GPU recommendation type">
            <ToggleGroupItem
              buttonId="mig"
              isSelected={sub === 'mig'}
              onChange={() => setSub('mig')}
              text={intl.formatMessage(messages.gpuMig)}
            />
            <ToggleGroupItem
              buttonId="timeslicing"
              isSelected={sub === 'timeslicing'}
              onChange={() => setSub('timeslicing')}
              text={intl.formatMessage(messages.gpuTimeslicing)}
            />
          </ToggleGroup>
        </FlexItem>
      </Flex>
      {sub === 'mig' ? (
        <OptimizationsGpuMigTable
          breadcrumbLabel={breadcrumbLabel}
          breadcrumbPath={breadcrumbPath}
          breakdownPath={migBreakdownPath}
          queryStateName={queryStateName}
        />
      ) : (
        <OptimizationsGpuTimeslicingTable
          breadcrumbLabel={breadcrumbLabel}
          breadcrumbPath={breadcrumbPath}
          breakdownPath={timeslicingBreakdownPath}
          queryStateName={queryStateName}
        />
      )}
    </>
  );
};

export default OptimizationsGpuDetails;
