import { Icon, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import type { Recommendations } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { getWarningNotificationCodes, hasNotificationsWarning } from 'utils/notifications';

import { notificationCodeMessages } from './notificationCodes';

interface NotificationWarningIconProps {
  recommendations?: Recommendations;
  /** Drop the optimized-only notices (list-table rule); headers keep every code. */
  isFilterNotifications?: boolean;
  /** Per-surface icon styling (each table/header passes its own styles.warningIcon). */
  style?: React.CSSProperties;
}

/**
 * The row-level warning icon with an explanatory tooltip (#879).
 *
 * Icon visibility is unchanged (hasNotificationsWarning, the same call every
 * surface made before); the tooltip adds the row's non-benign notification
 * codes and their short meanings from the documented code contract. Codes
 * newer than the map render a generic fallback, never blank.
 */
const NotificationWarningIcon = ({
  recommendations,
  isFilterNotifications = false,
  style,
}: NotificationWarningIconProps) => {
  const intl = useIntl();

  if (!hasNotificationsWarning(recommendations, isFilterNotifications)) {
    return null;
  }

  // Mirrors hasNotificationsWarning's source logic, so non-empty whenever the
  // icon renders: the slim notification_codes array, else the nested
  // per-engine notifications (legacy shape).
  const codes = getWarningNotificationCodes(recommendations, isFilterNotifications);

  const content = (
    <div>
      <div>{intl.formatMessage(messages.notificationCodesTooltipTitle)}</div>
      {codes.map(code => {
        const descriptor = notificationCodeMessages[code];
        return (
          <div key={code}>
            {descriptor ? (
              intl.formatMessage(descriptor)
            ) : (
              // The code number is a React node, not an ICU placeholder:
              // descriptor defaultMessages are the operative render path
              // here (see the catalog note on #879) and placeholders do
              // not interpolate on that path.
              <>
                {intl.formatMessage(messages.notificationCodeUnknown)} {code}
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <Tooltip content={content}>
      <span style={style} data-testid="notification-warning-icon">
        <Icon status="warning">
          <ExclamationTriangleIcon />
        </Icon>
      </span>
    </Tooltip>
  );
};

export default NotificationWarningIcon;
