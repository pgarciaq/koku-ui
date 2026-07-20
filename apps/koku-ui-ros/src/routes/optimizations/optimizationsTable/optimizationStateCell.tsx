import { Label } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

interface OptimizationStateCellProps {
  analyticsIncomplete?: boolean;
  idleDays?: number;
  idleState?: string;
  ingestHooksFailed?: boolean;
}

const OptimizationStateCell: React.FC<OptimizationStateCellProps> = ({
  analyticsIncomplete,
  idleDays,
  idleState,
  ingestHooksFailed,
}) => {
  const intl = useIntl();

  const stateBadge = (() => {
    if (idleState === 'idle' || idleState === 'zombie') {
      return (
        <Label color={idleState === 'zombie' ? 'red' : 'orange'} isCompact>
          {intl.formatMessage(messages.idleStateBadge, {
            state: idleState === 'zombie' ? 'Zombie' : 'Idle',
            days: idleDays ?? 0,
          })}
        </Label>
      );
    }

    return (
      <Label color="green" isCompact>
        {intl.formatMessage(messages.idleStateActive)}
      </Label>
    );
  })();

  return (
    <>
      {stateBadge}
      {analyticsIncomplete && (
        <Label color="yellow" isCompact style={{ marginLeft: 4 }}>
          {intl.formatMessage(messages.dataQualityIncomplete)}
        </Label>
      )}
      {ingestHooksFailed && (
        <Label color="yellow" isCompact style={{ marginLeft: 4 }}>
          {intl.formatMessage(messages.dataQualityIngestFailed)}
        </Label>
      )}
    </>
  );
};

export { OptimizationStateCell };
