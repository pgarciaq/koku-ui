import { Tooltip } from '@patternfly/react-core';
import type { FleetHeatmapNode } from 'api/ros/fleetHeatmap';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { getCellStyle } from 'routes/optimizations/visualInsightsUtils';
import type { UtilizationBand } from 'routes/optimizations/visualInsightsUtils';

export interface FleetHeatmapCellProps {
  node: FleetHeatmapNode;
  metric: 'cpu' | 'memory';
  onClick: (node: FleetHeatmapNode) => void;
}

const formatPercent = (ratio: number): string => `${(ratio * 100).toFixed(1)}%`;

export const FleetHeatmapCell: React.FC<FleetHeatmapCellProps> = ({ node, metric, onClick }) => {
  const intl = useIntl();
  const band = node.utilization_band as UtilizationBand;
  const utilValue = metric === 'cpu' ? node.cpu_util_p95 : node.mem_util_p95;

  const tooltipContent = intl.formatMessage(messages.fleetHeatmapTooltip, {
    node: node.node,
    utilization: formatPercent(utilValue),
    band: intl.formatMessage(messages[`fleetHeatmapBand${band.charAt(0).toUpperCase() + band.slice(1)}`]),
    machineSet: node.machineset_name || intl.formatMessage(messages.fleetHeatmapUngrouped),
    instanceType: node.instance_type || '—',
  });

  return (
    <Tooltip content={tooltipContent}>
      <div
        style={getCellStyle(band)}
        role="button"
        tabIndex={0}
        aria-label={`${node.node}: ${formatPercent(utilValue)} ${band}`}
        onClick={() => onClick(node)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(node);
          }
        }}
      />
    </Tooltip>
  );
};
