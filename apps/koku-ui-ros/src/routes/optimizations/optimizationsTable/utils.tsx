import { Icon } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { TrendDownIcon } from '@patternfly/react-icons/dist/esm/icons/trend-down-icon';
import { TrendUpIcon } from '@patternfly/react-icons/dist/esm/icons/trend-up-icon';
import type { Query } from 'api/queries/query';
import { intl } from 'components/i18n';
import messages from 'locales/messages';
import React from 'react';
import type { Location } from 'react-router-dom';
import { ROS_LIST_ENGINE, ROS_LIST_TERM } from 'api/ros/rosListParams';
import { formatOptimization, formatPercentage, unitsLookupKey } from 'utils/format';

import { styles } from './optimizationsTable.styles';

const formatValue = (value, units, isFormatted = true, isK8Units = false) => {
  if (!value) {
    return '';
  }

  if (units === 'percent' || units === 'percentage') {
    const percentage = value ? value : 0;

    return isFormatted
      ? intl.formatMessage(messages.percentPlus, {
          count: percentage > 0 ? 1 : 0,
          value: formatPercentage(percentage),
        })
      : value;
  } else {
    const formattedUnits = intl.formatMessage(isK8Units ? messages.unitsK8 : messages.units, {
      units: unitsLookupKey(units),
    });

    return isFormatted
      ? intl.formatMessage(messages.optimizationsValue, {
          count: 1,
          value: formatOptimization(value),
          units: formattedUnits,
        })
      : value;
  }
};

// Helper to determine if cpu and variation are empty objects
const hasValues = (values: any, key: string) => {
  let result = false;
  if (values?.[key]) {
    result = Object.keys(values[key]).length > 0;
  }
  return result;
};

// Normalize a native engine list item into the flat shape getConfiguration expects.
// Native format: item.recommendations.current.requests.cpu.{amount,format}
// Legacy format: item.cpu_request_current.{value,format}
const normalizeNativeItem = (item: any, term: string = ROS_LIST_TERM, engine: string = ROS_LIST_ENGINE) => {
  const current = item?.recommendations?.current;
  if (!current) {
    return null;
  }

  const variation = item?.recommendations?.recommendation_terms?.[term]?.recommendation_engines?.[engine]?.variation;

  const result: any = {};

  if (current?.requests?.cpu) {
    result.cpu_request_current = { value: current.requests.cpu.amount, format: current.requests.cpu.format };
  }
  if (current?.requests?.memory) {
    result.memory_request_current = { value: current.requests.memory.amount, format: current.requests.memory.format };
  }
  if (variation?.requests?.cpu) {
    result.cpu_variation = { value: variation.requests.cpu.amount, format: variation.requests.cpu.format };
  }
  if (variation?.requests?.memory) {
    result.memory_variation = { value: variation.requests.memory.amount, format: variation.requests.memory.format };
  }

  return result;
};

export const getConfiguration = (
  values: any,
  isFormatted: boolean,
  isK8Units: boolean,
  term: string = ROS_LIST_TERM,
  engine: string = ROS_LIST_ENGINE
) => {
  if (!values) {
    return undefined;
  }

  // Detect native format and normalize
  const normalized = values?.recommendations?.current ? normalizeNativeItem(values, term, engine) : values;
  if (!normalized) {
    return undefined;
  }

  const hasCpuRequestCurrent = hasValues(normalized, 'cpu_request_current');
  const hasMemoryRequestCurrent = hasValues(normalized, 'memory_request_current');

  const cpuRequestCurrentValue = hasCpuRequestCurrent ? normalized.cpu_request_current.value : undefined;
  const cpuRequestCurrentUnits = hasCpuRequestCurrent ? normalized.cpu_request_current.format : undefined;
  const cpuVariationValue = hasCpuRequestCurrent ? normalized.cpu_variation?.value : undefined;
  const cpuVariationUnits = hasCpuRequestCurrent ? normalized.cpu_variation?.format : undefined;

  const memoryRequestCurrentValue = hasMemoryRequestCurrent ? normalized.memory_request_current.value : undefined;
  const memoryRequestCurrentUnits = hasMemoryRequestCurrent ? normalized.memory_request_current.format : undefined;
  const memoryVariationValue = hasMemoryRequestCurrent ? normalized.memory_variation?.value : undefined;
  const memoryVariationUnits = hasMemoryRequestCurrent ? normalized.memory_variation?.format : undefined;

  return {
    cpu_request_current: formatValue(cpuRequestCurrentValue, cpuRequestCurrentUnits, isFormatted, isK8Units),
    cpu_variation: formatValue(cpuVariationValue, cpuVariationUnits, isFormatted, isK8Units),
    memory_request_current: formatValue(memoryRequestCurrentValue, memoryRequestCurrentUnits, isFormatted, isK8Units),
    memory_variation: formatValue(memoryVariationValue, memoryVariationUnits, isFormatted, isK8Units),
  };
};

export const getLinkState = ({
  breadcrumbPath,
  linkState,
  location,
  query,
  queryStateName,
}: {
  breadcrumbPath?: string;
  isOptimizationsDetails?: boolean;
  linkState?: any; // Optimizations breakdown link state
  location?: Location;
  query?: Query;
  queryStateName: string;
}) => {
  return {
    ...(location?.state || {}),
    ...(linkState || {}),
    ...(queryStateName && {
      [queryStateName]: {
        ...(linkState?.[queryStateName] || {}),
        ...(breadcrumbPath && { breadcrumbPath }), // Path back to optimizations details page
        ...(query || {}),
      },
    }),
  };
};

export const getRequestProps = (values: any, term?: string, engine?: string) => {
  const configFormatted = getConfiguration(values, true, false, term, engine);
  const configRaw = getConfiguration(values, false, false, term, engine);

  const getTrend = value => {
    return value > 0 ? (
      <Icon status="success" style={styles.trendIcon}>
        <TrendUpIcon />
      </Icon>
    ) : (
      <Icon status="danger" style={styles.trendIcon}>
        <TrendDownIcon />
      </Icon>
    );
  };

  const getWarningOrTrend = (value: string, raw: number) => {
    return isMissingValue(value) ? (
      getWarning()
    ) : (
      <>
        {getTrend(raw)}
        {value}
      </>
    );
  };

  const getWarningOrValue = (value: string) => {
    return isMissingValue(value) ? getWarning() : value;
  };

  const getWarning = () => {
    return (
      <Icon status="warning">
        <ExclamationTriangleIcon />
      </Icon>
    );
  };

  const isMissingValue = value => {
    return !value || `${value}`.trim().length === 0;
  };

  const cpuRequestCurrent = getWarningOrValue(configFormatted?.cpu_request_current);
  const cpuVariation = getWarningOrTrend(configFormatted?.cpu_variation, configRaw?.cpu_variation);
  const memoryRequestCurrent = getWarningOrValue(configFormatted?.memory_request_current);
  const memoryVariation = getWarningOrTrend(configFormatted?.memory_variation, configRaw?.memory_variation);

  return {
    cpuRequestCurrent,
    cpuVariation,
    memoryRequestCurrent,
    memoryVariation,
  };
};
