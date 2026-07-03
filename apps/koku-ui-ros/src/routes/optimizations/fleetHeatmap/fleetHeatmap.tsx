import {
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  Skeleton,
  ToggleGroup,
  ToggleGroupItem,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import type { FleetHeatmapNode } from 'api/ros/fleetHeatmap';
import { useFleetHeatmap } from 'hooks/useFleetHeatmap';
import messages from 'locales/messages';
import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { getOptimizationsBreakdownPath } from 'routes/utils/paths';
import { AccessibilityTable, bandColorTokens, bandOrder } from 'routes/optimizations/visualInsightsUtils';
import type { UtilizationBand } from 'routes/optimizations/visualInsightsUtils';
import { FetchStatus } from 'store/common';

import { FleetHeatmapCell } from './fleetHeatmapCell';
import { styles } from './fleetHeatmap.styles';

const MAX_VISIBLE_NODES = 100;

export const FleetHeatmap: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [metric, setMetric] = useState<'cpu' | 'memory'>('cpu');
  const [showAll, setShowAll] = useState(false);

  const { data, fetchStatus, error } = useFleetHeatmap({ metric });

  const groups = useMemo(() => {
    if (!data?.data) {
      return new Map<string, FleetHeatmapNode[]>();
    }

    let nodes = [...data.data];

    if (!showAll && nodes.length > MAX_VISIBLE_NODES) {
      const utilKey = metric === 'cpu' ? 'cpu_util_p95' : 'mem_util_p95';
      nodes.sort((a, b) => b[utilKey] - a[utilKey]);
      nodes = nodes.slice(0, MAX_VISIBLE_NODES);
    }

    const grouped = new Map<string, FleetHeatmapNode[]>();
    for (const node of nodes) {
      const key = node.machineset_name || intl.formatMessage(messages.fleetHeatmapUngrouped);
      const group = grouped.get(key) ?? [];
      group.push(node);
      grouped.set(key, group);
    }
    return grouped;
  }, [data, showAll, metric, intl]);

  const handleNodeClick = (node: FleetHeatmapNode) => {
    navigate(
      getOptimizationsBreakdownPath({
        basePath: '/optimizations/node-breakdown',
        id: node.node,
        title: node.node,
      })
    );
  };

  if (fetchStatus === FetchStatus.inProgress) {
    return (
      <div style={styles.container}>
        <Card isCompact>
          <CardTitle>{intl.formatMessage(messages.fleetHeatmapTitle)}</CardTitle>
          <CardBody>
            <Skeleton width="100%" height="120px" />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (fetchStatus === FetchStatus.none || error) {
    return null;
  }

  if (!data || data.data.length === 0) {
    return (
      <div style={styles.container}>
        <Card isCompact>
          <CardTitle>{intl.formatMessage(messages.fleetHeatmapTitle)}</CardTitle>
          <CardBody>
            <EmptyState headingLevel="h4" titleText={intl.formatMessage(messages.fleetHeatmapNoData)}>
              <EmptyStateBody>{intl.formatMessage(messages.fleetHeatmapNoDataDesc)}</EmptyStateBody>
            </EmptyState>
          </CardBody>
        </Card>
      </div>
    );
  }

  const totalNodes = data.data.length;
  const isLargeFleet = totalNodes > MAX_VISIBLE_NODES;

  const accessibilityRows = data.data.map(n => ({
    node: n.node,
    cluster: n.cluster_alias,
    machineSet: n.machineset_name || intl.formatMessage(messages.fleetHeatmapUngrouped),
    instanceType: n.instance_type || '—',
    cpuUtil: `${(n.cpu_util_p95 * 100).toFixed(1)}%`,
    memUtil: `${(n.mem_util_p95 * 100).toFixed(1)}%`,
    band: n.utilization_band,
    idleState: n.idle_state,
  }));

  return (
    <div style={styles.container}>
      <Card isCompact>
        <CardTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Title headingLevel="h3" size={TitleSizes.md}>
              {intl.formatMessage(messages.fleetHeatmapTitle)}
            </Title>
            <ToggleGroup aria-label={intl.formatMessage(messages.fleetHeatmapMetricToggleLabel)}>
              <ToggleGroupItem
                text={intl.formatMessage(messages.fleetHeatmapMetricCpu)}
                isSelected={metric === 'cpu'}
                onChange={() => setMetric('cpu')}
              />
              <ToggleGroupItem
                text={intl.formatMessage(messages.fleetHeatmapMetricMemory)}
                isSelected={metric === 'memory'}
                onChange={() => setMetric('memory')}
              />
            </ToggleGroup>
          </div>
        </CardTitle>
        <CardBody>
          {Array.from(groups.entries()).map(([groupName, nodes]) => (
            <div key={groupName} style={styles.groupSection}>
              <div style={styles.groupLabel}>{groupName}</div>
              <div style={styles.cellGrid}>
                {nodes.map(node => (
                  <FleetHeatmapCell key={node.node} node={node} metric={metric} onClick={handleNodeClick} />
                ))}
              </div>
            </div>
          ))}

          {isLargeFleet && (
            <button type="button" style={styles.toggleLink} onClick={() => setShowAll(!showAll)}>
              {showAll
                ? intl.formatMessage(messages.fleetHeatmapShowTop, { count: MAX_VISIBLE_NODES })
                : intl.formatMessage(messages.fleetHeatmapShowAll, { count: totalNodes })}
            </button>
          )}

          <div style={styles.legend} role="list" aria-label={intl.formatMessage(messages.fleetHeatmapLegendLabel)}>
            {bandOrder.map(band => (
              <span key={band} style={styles.legendItem} role="listitem">
                <span style={{ ...styles.legendSwatch, backgroundColor: bandColorTokens[band as UtilizationBand] }} />
                {intl.formatMessage(messages[`fleetHeatmapBand${band.charAt(0).toUpperCase() + band.slice(1)}`])}
              </span>
            ))}
          </div>

          <AccessibilityTable
            caption={intl.formatMessage(messages.fleetHeatmapAccessibilityCaption)}
            columns={[
              { key: 'node', label: 'Node' },
              { key: 'cluster', label: 'Cluster' },
              { key: 'machineSet', label: 'MachineSet' },
              { key: 'instanceType', label: 'Instance Type' },
              { key: 'cpuUtil', label: 'CPU p95' },
              { key: 'memUtil', label: 'Memory p95' },
              { key: 'band', label: 'Utilization Band' },
              { key: 'idleState', label: 'Idle State' },
            ]}
            rows={accessibilityRows}
          />
        </CardBody>
      </Card>
    </div>
  );
};
