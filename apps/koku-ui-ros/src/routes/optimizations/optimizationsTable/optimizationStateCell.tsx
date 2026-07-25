import { Label } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

interface OptimizationStateCellProps {
  analyticsIncomplete?: boolean;
  category?: string;
  idleDays?: number;
  ingestHooksFailed?: boolean;
}

const categoryBadgeMap: Record<string, { messageKey: keyof typeof messages; color: string }> = {
  zombie: { messageKey: 'idleStateZombie', color: 'red' },
  idle: { messageKey: 'idleStateIdle', color: 'orange' },
  undersized: { messageKey: 'categoryUndersized', color: 'purple' },
  oversized: { messageKey: 'categoryOversized', color: 'blue' },
  optimized: { messageKey: 'categoryOptimized', color: 'green' },
};

const OptimizationStateCell: React.FC<OptimizationStateCellProps> = ({
  analyticsIncomplete,
  category,
  idleDays,
  ingestHooksFailed,
}) => {
  const intl = useIntl();

  const stateBadge = (() => {
    if (category === 'zombie' || category === 'idle') {
      return (
        <Label color={category === 'zombie' ? 'red' : 'orange'} isCompact>
          {intl.formatMessage(messages.idleStateBadge, {
            state: category === 'zombie' ? 'Zombie' : 'Idle',
            days: idleDays ?? 0,
          })}
        </Label>
      );
    }

    const badge = category ? categoryBadgeMap[category] : undefined;
    if (badge) {
      return (
        <Label color={badge.color as any} isCompact>
          {intl.formatMessage(messages[badge.messageKey])}
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
