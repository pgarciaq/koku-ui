import type { RosQuery } from 'api/queries/rosQuery';
import { ROS_LIST_ENGINE, ROS_LIST_TERM } from 'api/ros/rosListParams';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Serializes a RosQuery into URLSearchParams, encoding filter_by, order_by,
 * limit, offset, after, term, engine, and after into the URL for deep-linkable state.
 */
export function serializeQuery(query: RosQuery, prefix: string): URLSearchParams {
  const params = new URLSearchParams();

  if (query.limit != null) {
    params.set(`${prefix}limit`, String(query.limit));
  }
  if (query.offset != null) {
    params.set(`${prefix}offset`, String(query.offset));
  }
  if (query.after != null) {
    params.set(`${prefix}after`, query.after);
  }
  if (query.term != null) {
    params.set(`${prefix}term`, query.term);
  }
  if (query.engine != null) {
    params.set(`${prefix}engine`, query.engine);
  }

  if (query.order_by) {
    for (const [key, val] of Object.entries(query.order_by)) {
      params.set(`${prefix}order_by`, `${key}:${val}`);
    }
  }

  if (query.filter_by) {
    for (const [key, val] of Object.entries(query.filter_by)) {
      if (val == null) {
        continue;
      }
      const values = Array.isArray(val) ? val : [val];
      for (const v of values) {
        if (v != null) {
          params.append(`${prefix}filter_by[${key}]`, String(v));
        }
      }
    }
  }

  if (query.group_by) {
    for (const [key, val] of Object.entries(query.group_by)) {
      if (val != null) {
        params.set(`${prefix}group_by[${key}]`, String(val));
      }
    }
  }

  return params;
}

/**
 * Parses URLSearchParams back into a partial RosQuery, extracting filter_by,
 * order_by, limit, offset, after, term, and engine fields.
 */
export function deserializeQuery(params: URLSearchParams, prefix: string): Partial<RosQuery> {
  const query: Partial<RosQuery> = {};

  const limit = params.get(`${prefix}limit`);
  if (limit != null) {
    query.limit = Number(limit);
  }

  const offset = params.get(`${prefix}offset`);
  if (offset != null) {
    query.offset = Number(offset);
  }

  const after = params.get(`${prefix}after`);
  if (after != null) {
    query.after = after;
  }

  const term = params.get(`${prefix}term`);
  if (term != null) {
    query.term = term;
  }

  const engine = params.get(`${prefix}engine`);
  if (engine != null) {
    query.engine = engine;
  }

  const orderBy = params.get(`${prefix}order_by`);
  if (orderBy) {
    const colonIdx = orderBy.indexOf(':');
    if (colonIdx > 0) {
      query.order_by = {
        [orderBy.substring(0, colonIdx)]: orderBy.substring(colonIdx + 1),
      };
    }
  }

  const filterBy: Record<string, string | string[]> = {};
  for (const [rawKey, val] of params.entries()) {
    const filterMatch = rawKey.match(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}filter_by\\[(.+)]$`));
    if (filterMatch) {
      const filterKey = filterMatch[1];
      const existing = filterBy[filterKey];
      if (existing) {
        filterBy[filterKey] = Array.isArray(existing) ? [...existing, val] : [existing, val];
      } else {
        filterBy[filterKey] = val;
      }
    }
  }
  if (Object.keys(filterBy).length > 0) {
    query.filter_by = filterBy;
  }

  const groupBy: Record<string, string> = {};
  for (const [rawKey, val] of params.entries()) {
    const groupMatch = rawKey.match(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}group_by\\[(.+)]$`));
    if (groupMatch) {
      groupBy[groupMatch[1]] = val;
    }
  }
  if (Object.keys(groupBy).length > 0) {
    query.group_by = groupBy;
  }

  return query;
}

export interface UseUrlStateOptions {
  baseQuery: RosQuery;
  prefix?: string;
}

export interface UseUrlStateResult {
  query: RosQuery;
  setQuery: (newQuery: RosQuery) => void;
}

/**
 * Hook that persists RosQuery state in URL search parameters instead of
 * location.state. Uses a prefix to avoid collisions when multiple tabs
 * share the same URL.
 */
export function useUrlState({ baseQuery, prefix = '' }: UseUrlStateOptions): UseUrlStateResult {
  const location = useLocation();
  const navigate = useNavigate();

  const query = useMemo<RosQuery>(() => {
    const params = new URLSearchParams(location.search);
    const fromUrl = deserializeQuery(params, prefix);
    return {
      ...baseQuery,
      term: baseQuery.term ?? ROS_LIST_TERM,
      engine: baseQuery.engine ?? ROS_LIST_ENGINE,
      ...fromUrl,
    };
  }, [baseQuery, location.search, prefix]);

  const setQuery = useCallback(
    (newQuery: RosQuery) => {
      const currentParams = new URLSearchParams(location.search);

      // Remove all params with our prefix to start clean
      const keysToRemove: string[] = [];
      for (const key of currentParams.keys()) {
        if (key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        currentParams.delete(key);
      }

      const newParams = serializeQuery(newQuery, prefix);
      for (const [key, val] of newParams.entries()) {
        currentParams.append(key, val);
      }

      navigate(`${location.pathname}?${currentParams.toString()}`, {
        replace: true,
        state: location.state,
      });
    },
    [location.pathname, location.search, location.state, navigate, prefix]
  );

  return { query, setQuery };
}
