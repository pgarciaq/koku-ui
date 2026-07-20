import type { MessageDescriptor } from '@formatjs/intl';
import { intl } from 'components/i18n';
import messages from 'locales/messages';
import type { FormatOptions } from 'utils/format';
import { formatCurrency, unitsLookupKey } from 'utils/format';

export interface ChartDatum {
  childName?: string;
  date?: string;
  key: string | number;
  name?: string | number;
  show?: boolean;
  tooltip?: string;
  units: string;
  x: string | number;
  y: number;
  y0?: number;
}

export function getDatumDateRange(datums: ChartDatum[]): [Date, Date] {
  // Find the first populated (non-null) day
  let firstDay = 0;
  for (let i = firstDay; i < datums.length; i++) {
    if (datums[i]?.key && datums[i]?.y !== null) {
      firstDay = i;
      break;
    }
  }

  // Find the last populated (non-null) day
  let lastDay = datums.length - 1;
  for (let i = lastDay; i >= 0; i--) {
    if (datums[i]?.key && datums[i].y !== null) {
      lastDay = i;
      break;
    }
  }

  const start = new Date(datums[firstDay].key);
  const end = new Date(datums[lastDay].key);
  return [start, end];
}

export function getDateRangeString(
  datums: ChartDatum[],
  key: MessageDescriptor,
  isSameDate: boolean = false,
  noDataKey: MessageDescriptor = messages.chartNoData
) {
  if (!(datums?.length && key)) {
    return intl.formatMessage(noDataKey);
  }

  const [start, end] = getDatumDateRange(datums);
  const dateRange = intl.formatDateTimeRange(isSameDate ? end : start, end, {
    day: 'numeric',
    month: 'short',
  });
  return intl.formatMessage(key, {
    dateRange,
  });
}

export function getMaxMinValues(datums: ChartDatum[]) {
  let max = null;
  let min = null;
  if (datums && datums.length) {
    datums.forEach(datum => {
      const percentileValues = [(datum as any).p50, (datum as any).p95, (datum as any).p99, (datum as any).max].filter(
        val => val !== undefined && val !== null
      );
      const maxY =
        datum.y0 !== undefined
          ? Math.max(datum.y, datum.y0)
          : percentileValues.length > 0
            ? Math.max(...percentileValues, ...(datum.y !== null && datum.y !== undefined ? [datum.y] : []))
            : datum.y;
      const minY =
        datum.y0 !== undefined
          ? Math.min(datum.y, datum.y0)
          : percentileValues.length > 0
            ? Math.min(...percentileValues, ...(datum.y !== null && datum.y !== undefined ? [datum.y] : []))
            : datum.y;
      if ((max === null || maxY > max) && maxY !== null) {
        max = maxY;
      }
      if ((min === null || minY < min) && minY !== null) {
        min = minY;
      }
    });
  }
  return { max, min };
}

export function getTooltipContent(formatter) {
  return function labelFormatter(value: number, unit: string = null, options: FormatOptions = {}) {
    const lookup = unitsLookupKey(unit);
    if (lookup) {
      return intl.formatMessage(messages.unitTooltips, {
        units: lookup,
        value: formatter(value, unit, options),
      });
    }
    return formatCurrency(value, unit, options);
  };
}

// Returns true if non negative integer
export function isInt(n) {
  const result = Number(n) === n && n % 1 === 0;
  return result && n >= 0;
}

// Returns true if non-negative float
export function isFloat(n) {
  const result = Number(n) === n && n % 1 !== 0;
  return result && n >= 0;
}
