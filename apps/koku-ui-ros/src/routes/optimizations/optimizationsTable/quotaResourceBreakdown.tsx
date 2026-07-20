import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import type { QuotaResourceValues } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

import { formatCpuMillicores, formatMemoryBytes } from './quotaTableUtils';

interface QuotaResourceBreakdownProps {
  hard?: QuotaResourceValues;
  recommended?: QuotaResourceValues;
  title: string;
  used?: QuotaResourceValues;
}

const QuotaResourceBreakdown: React.FC<QuotaResourceBreakdownProps> = ({ hard, recommended, title, used }) => {
  const intl = useIntl();

  const rows: { label: string; hard?: number; used?: number; recommended?: number; formatter: (v?: number) => string }[] =
    [
      {
        label: intl.formatMessage(messages.quotaResourceCpuRequest),
        hard: hard?.cpu_request_millicores,
        used: used?.cpu_request_millicores,
        recommended: recommended?.cpu_request_millicores,
        formatter: formatCpuMillicores,
      },
      {
        label: intl.formatMessage(messages.quotaResourceMemoryRequest),
        hard: hard?.memory_request_bytes,
        used: used?.memory_request_bytes,
        recommended: recommended?.memory_request_bytes,
        formatter: formatMemoryBytes,
      },
      {
        label: intl.formatMessage(messages.quotaResourceStorageRequest),
        hard: hard?.storage_request_bytes,
        used: used?.storage_request_bytes,
        recommended: recommended?.storage_request_bytes,
        formatter: formatMemoryBytes,
      },
      {
        label: intl.formatMessage(messages.quotaResourcePods),
        hard: hard?.pods,
        used: used?.pods,
        recommended: recommended?.pods,
        formatter: (v?: number) => (v == null ? '—' : String(v)),
      },
    ];

  return (
    <>
      <h4 style={{ marginTop: 16 }}>{title}</h4>
      {rows.map(row => (
        <DescriptionList isCompact key={row.label} style={{ marginBottom: 8 }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{row.label}</DescriptionListTerm>
            <DescriptionListDescription>
              {intl.formatMessage(messages.quotaHardLimit)}: {row.formatter(row.hard)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{intl.formatMessage(messages.quotaUsed)}</DescriptionListTerm>
            <DescriptionListDescription>{row.formatter(row.used)}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{intl.formatMessage(messages.quotaRecommended)}</DescriptionListTerm>
            <DescriptionListDescription>{row.formatter(row.recommended)}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      ))}
    </>
  );
};

export { QuotaResourceBreakdown };
