import { Interval, OptimizationType } from 'utils/commonTypes';

import type { RosQuery } from '../queries/rosQuery';

/** Default list projection passed to ROS list APIs (matches backend slim default). */
export const ROS_LIST_TERM = Interval.short_term;
export const ROS_LIST_ENGINE = OptimizationType.cost;

/** Query params excluded from the shared count cache key. */
const COUNT_CACHE_EXCLUDED_KEYS = new Set(['limit', 'offset', 'after', 'order_by', 'order_how']);

/** Merge explicit term/engine list projection into a ROS list query. */
export function withRosListProjection<T extends RosQuery>(query: T): T & { term: string; engine: string } {
  return {
    ...query,
    term: query.term ?? ROS_LIST_TERM,
    engine: query.engine ?? ROS_LIST_ENGINE,
  };
}

export interface RosDetailFetchQuery {
  engine?: string;
  id: string;
  term?: string;
}

/** Encode a detail fetch cache key with optional projection filters. */
export function encodeRosDetailFetchQuery({ id, term, engine }: RosDetailFetchQuery): string {
  const params = new URLSearchParams();
  if (term) {
    params.set('filter[term]', term);
  }
  if (engine) {
    params.set('filter[engine]', engine);
  }
  const suffix = params.toString();
  return suffix ? `${id}?${suffix}` : id;
}

/** Decode a detail fetch cache key into id and projection filters. */
export function decodeRosDetailFetchQuery(fetchQuery: string): RosDetailFetchQuery {
  const qIdx = fetchQuery.indexOf('?');
  if (qIdx === -1) {
    return { id: fetchQuery };
  }

  const params = new URLSearchParams(fetchQuery.slice(qIdx + 1));
  return {
    id: fetchQuery.slice(0, qIdx),
    term: params.get('filter[term]') ?? undefined,
    engine: params.get('filter[engine]') ?? undefined,
  };
}

/** Strip pagination and sort params for count-cache key stability. */
export function getRosCountCacheKey(rosPathsType: string, rosType: string, queryString: string): string {
  if (!queryString) {
    return `${rosPathsType}--${rosType}--count`;
  }

  const params = new URLSearchParams(queryString);
  for (const key of COUNT_CACHE_EXCLUDED_KEYS) {
    params.delete(key);
  }

  const normalized = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `${rosPathsType}--${rosType}--count${normalized ? `--${normalized}` : ''}`;
}

/** Derive a count-cache key from a full Redux fetch id. */
export function getRosCountCacheKeyFromFetchId(fetchId: string): string {
  const separator = '--';
  const firstSep = fetchId.indexOf(separator);
  const secondSep = fetchId.indexOf(separator, firstSep + separator.length);
  if (firstSep === -1 || secondSep === -1) {
    return fetchId;
  }

  const rosPathsType = fetchId.slice(0, firstSep);
  const rosType = fetchId.slice(firstSep + separator.length, secondSep);
  const queryString = fetchId.slice(secondSep + separator.length);
  return getRosCountCacheKey(rosPathsType, rosType, queryString);
}
