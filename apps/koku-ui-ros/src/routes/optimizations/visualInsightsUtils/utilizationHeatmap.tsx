import { Tooltip } from '@patternfly/react-core';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { AccessibilityTable } from './accessibilityTable';
import type { UtilizationBand } from './heatmapColors';
import { bandColorTokens, bandOrder, getCellStyle } from './heatmapColors';

export interface HeatmapDataPoint {
  report_date: string;
  hour: number;
  value: number;
}

export interface UtilizationHeatmapProps {
  data: HeatmapDataPoint[];
  maxValue: number;
  metricLabel: string;
  entityLabel: string;
  valueFormatter?: (value: number) => string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getBand(value: number, maxValue: number): UtilizationBand {
  if (maxValue <= 0 || value <= 0) {
    return 'idle';
  }
  const ratio = value / maxValue;
  if (ratio < 0.1) {
    return 'idle';
  }
  if (ratio < 0.35) {
    return 'low';
  }
  if (ratio < 0.6) {
    return 'moderate';
  }
  if (ratio < 0.85) {
    return 'healthy';
  }
  return 'hot';
}

function groupByDayAndHour(
  data: HeatmapDataPoint[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const point of data) {
    const date = new Date(point.report_date + 'T00:00:00Z');
    const dayOfWeek = date.getUTCDay();
    const key = `${dayOfWeek}-${point.hour}`;
    const existing = map.get(key);
    if (existing === undefined || point.value > existing) {
      map.set(key, point.value);
    }
  }
  return map;
}

const emptyCellStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 4,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 2,
  border: '1px dashed var(--pf-t--global--border--color--default)',
  backgroundColor: 'transparent',
};

const UtilizationHeatmap: React.FC<UtilizationHeatmapProps> = ({
  data,
  maxValue,
  metricLabel,
  entityLabel,
  valueFormatter,
}) => {
  const intl = useIntl();
  const formatValue = valueFormatter ?? ((v: number) => String(v));

  const cellMap = useMemo(() => groupByDayAndHour(data), [data]);

  const accessRows = useMemo(() => {
    const rows: Record<string, string | number>[] = [];
    for (const [key, value] of cellMap.entries()) {
      const [day, hour] = key.split('-').map(Number);
      rows.push({
        day: DAY_LABELS[day],
        hour: `${hour}:00`,
        value: formatValue(value),
      });
    }
    return rows;
  }, [cellMap, formatValue]);

  if (data.length === 0) {
    return (
      <div style={{ padding: '16px 0', color: 'var(--pf-t--global--text--color--subtle)' }}>
        {intl.formatMessage(messages.visualInsightsVmActivityHeatmapEmpty)}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', fontSize: 11, marginBottom: 4, paddingLeft: 40, minWidth: 'max-content' }}>
        {HOURS.map(h => (
          <div key={h} style={{ width: 32, textAlign: 'center', color: 'var(--pf-t--global--text--color--subtle)' }}>
            {h}
          </div>
        ))}
      </div>
      {DAY_INDICES.map(dayIdx => (
        <div key={dayIdx} style={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
          <div style={{ width: 36, fontSize: 12, textAlign: 'right', marginRight: 4, color: 'var(--pf-t--global--text--color--subtle)' }}>
            {DAY_LABELS[dayIdx]}
          </div>
          {HOURS.map(hour => {
            const key = `${dayIdx}-${hour}`;
            const value = cellMap.get(key);
            if (value === undefined) {
              return <div key={key} style={emptyCellStyle} />;
            }
            const band = getBand(value, maxValue);
            const style = getCellStyle(band);
            const tooltipContent = intl.formatMessage(messages.visualInsightsHeatmapTooltip, {
              dayOfWeek: DAY_LABELS[dayIdx],
              hour: String(hour),
              value: formatValue(value),
              unit: metricLabel,
            });
            return (
              <Tooltip key={key} content={tooltipContent}>
                <div
                  style={style}
                  tabIndex={0}
                  role="gridcell"
                  aria-label={tooltipContent}
                />
              </Tooltip>
            );
          })}
        </div>
      ))}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, paddingLeft: 40, flexWrap: 'wrap' }}
        aria-label={intl.formatMessage(messages.fleetHeatmapLegendLabel)}
        role="img"
      >
        <span style={{ fontSize: 11, color: 'var(--pf-t--global--text--color--subtle)', marginRight: 4 }}>
          {intl.formatMessage(messages.fleetHeatmapBandIdle)}
        </span>
        {bandOrder.map(band => (
          <div
            key={band}
            style={{
              width: 16,
              height: 16,
              borderRadius: 3,
              backgroundColor: bandColorTokens[band],
              border: '1px solid var(--pf-t--global--border--color--default)',
            }}
          />
        ))}
        <span style={{ fontSize: 11, color: 'var(--pf-t--global--text--color--subtle)', marginLeft: 4 }}>
          {intl.formatMessage(messages.fleetHeatmapBandHot)}
        </span>
      </div>
      <AccessibilityTable
        caption={intl.formatMessage(messages.visualInsightsHeatmapAccessCaption, {
          entity: entityLabel,
          metric: metricLabel,
        })}
        columns={[
          { key: 'day', label: intl.formatMessage(messages.visualInsightsHeatmapAccessDay) },
          { key: 'hour', label: intl.formatMessage(messages.visualInsightsHeatmapAccessHour) },
          { key: 'value', label: intl.formatMessage(messages.visualInsightsHeatmapAccessValue) },
        ]}
        rows={accessRows}
      />
    </div>
  );
};

export { UtilizationHeatmap };
