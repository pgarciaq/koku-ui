import { Card, CardBody, CardTitle, Flex, FlexItem } from '@patternfly/react-core';
import type { HcpCapacityRow } from 'api/ros/hcpCapacity';
import { formatHeadroom, getScenarioByName, isScenarioUnavailable } from 'api/ros/hcpCapacity';
import { useHcpCapacityLatest } from 'hooks/useHcpCapacityLatest';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { FetchStatus } from 'store/common';

// W4 fleet-capacity advisory panel (#392): one card per management cluster
// on the Hosted-clusters subview. Renders the five published-sizing
// scenarios with the API's serve-time headroom — the panel never computes
// max - current itself (affirmed pressure withholds the figure server-side
// and a locally derived +N would defeat that). Fleet headroom stays here:
// it is never threaded into per-HC table rows. Unavailable values render
// the em-dash marker, never zero.

const SCENARIO_ORDER = ['request', 'low_qps', 'average_qps', 'medium_qps', 'high_qps'];

interface FleetCapacityPanelProps {
  cluster?: string;
}

export const FleetCapacityPanel: React.FC<FleetCapacityPanelProps> = ({ cluster }) => {
  const intl = useIntl();
  const { rows, fetchStatus } = useHcpCapacityLatest(cluster);

  if (fetchStatus === FetchStatus.inProgress || !rows || rows.length === 0) {
    return null;
  }

  const scenarioLabel = (name: string): string => {
    switch (name) {
      case 'request':
        return intl.formatMessage(messages.hcpCapacityScenarioRequest);
      case 'low_qps':
        return intl.formatMessage(messages.hcpCapacityScenarioLowQps);
      case 'average_qps':
        return intl.formatMessage(messages.hcpCapacityScenarioAverageQps);
      case 'medium_qps':
        return intl.formatMessage(messages.hcpCapacityScenarioMediumQps);
      default:
        return intl.formatMessage(messages.hcpCapacityScenarioHighQps);
    }
  };

  const cautions = (row: HcpCapacityRow): string[] => {
    const w = row.warnings ?? {};
    const out: string[] = [];
    if (w.stale) {
      out.push(intl.formatMessage(messages.hcpCapacityWarningStale));
    }
    if (w.below_version_floor) {
      out.push(intl.formatMessage(messages.hcpCapacityWarningBelowFloor));
    }
    if (w.pressured) {
      out.push(intl.formatMessage(messages.hcpCapacityWarningPressured));
    }
    if (w.pressure_unknown) {
      out.push(intl.formatMessage(messages.hcpCapacityWarningPressureUnknown));
    }
    if (w.mce_may_be_stale) {
      out.push(intl.formatMessage(messages.hcpCapacityWarningMceStale));
    }
    if (!row.inventory_complete) {
      out.push(intl.formatMessage(messages.hcpCapacityWarningInventoryIncomplete));
    }
    if (!row.worker_placement_known) {
      out.push(intl.formatMessage(messages.hcpCapacityWarningPlacementUnknown));
    }
    if (row.scenarios?.some(s => s.status === 'illustrative_only')) {
      out.push(intl.formatMessage(messages.hcpCapacityIllustrativeOnly));
    }
    return out;
  };

  return (
    <Flex style={{ marginBottom: 16 }} spaceItems={{ default: 'spaceItemsLg' }}>
      {rows.map(row => {
        const ocp = row.source_versions?.ocp || '—';
        const operator = row.source_versions?.operator || '—';
        return (
          <FlexItem key={row.cluster_uuid}>
            <Card isCompact ouiaId={`hcp-fleet-capacity-${row.cluster_uuid}`}>
              <CardTitle>{row.cluster_uuid}</CardTitle>
              <CardBody>
                <div>{intl.formatMessage(messages.hcpCapacitySourceVersions, { ocp, operator })}</div>
                {SCENARIO_ORDER.map(name => {
                  const scenario = getScenarioByName(row, name);
                  const unavailable = isScenarioUnavailable(scenario);
                  const maxText = unavailable ? '—' : String(scenario.max_hcs);
                  const headroom = unavailable ? null : formatHeadroom(scenario.headroom);
                  return (
                    <div key={name}>
                      <span>{scenarioLabel(name)}</span>
                      <span>: </span>
                      <span>{maxText}</span>
                      <span> hosted clusters · headroom </span>
                      <span>{headroom ?? '—'}</span>
                    </div>
                  );
                })}
                {cautions(row).map(caution => (
                  <div key={caution}>{caution}</div>
                ))}
              </CardBody>
            </Card>
          </FlexItem>
        );
      })}
    </Flex>
  );
};
