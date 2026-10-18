import { Flex, FlexItem, Pagination, PaginationVariant, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { ROS_LIST_TERM } from 'api/ros/rosListParams';
import { useRecommendationTermOptions } from 'hooks/useRecommendationTermOptions';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { ColdStartState } from 'routes/components/page/coldStart';
import { NotAvailable } from 'routes/components/page/notAvailable';
import { NotConfigured } from 'routes/components/page/notConfigured';
import { LoadingState } from 'routes/components/state/loadingState';
import { styles } from 'routes/optimizations/optimizationsBreakdown/optimizationsBreakdown.styles';
import { useHcpSubUrl } from 'routes/optimizations/useHcpSubUrl';
import * as queryUtils from 'routes/utils/query';
import { formatPath } from 'utils/paths';
import { useUrlState } from 'routes/utils/useUrlState';
import { FetchStatus } from 'store/common';

import { INTERVAL_TO_TERM_NAME } from '../recommendationTermLabels';
import { hcpRecommendationsBaseQuery, useHcpRecommendationsReport } from '../useHcpRecommendationsReport';
import { useSavingsFallbackSort } from '../useSavingsFallbackSort';
import { getLinkState } from '../utils';
import { HcpSummaryStrip } from './hcpSummaryStrip';
import { getHcpGroupBy, hcpSubToGroupBy } from './hcpTableUtils';
import { OptimizationsHcpDataTable } from './optimizationsHcpDataTable';
import { OptimizationsHcpToolbar } from './optimizationsHcpToolbar';

interface OptimizationsHcpTableOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  cluster?: string | string[];
  isClusterHidden?: boolean;
  linkPath?: string;
  linkState?: any;
  queryStateName: string;
}

type OptimizationsHcpTableProps = OptimizationsHcpTableOwnProps;

const OptimizationsHcpTable: React.FC<OptimizationsHcpTableProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  cluster,
  isClusterHidden,
  linkPath,
  linkState,
  queryStateName,
}) => {
  const intl = useIntl();
  const location = useLocation();
  const { termSettings } = useRecommendationTermOptions('hcp');

  const [cursorPage, setCursorPage] = useState(1);
  const [newLinkState, setNewLinkState] = useState();
  const { query, setQuery } = useUrlState({
    baseQuery: hcpRecommendationsBaseQuery,
    prefix: 'hcp_',
  });
  const { sub } = useHcpSubUrl();
  const { report, reportError, reportFetchStatus, reportQueryString } = useHcpRecommendationsReport({
    cluster,
    query,
    sub,
  });
  // Summary strip source: grouped per-HC totals, fetched only on the Hosted
  // sub. The store is query-keyed so this never clashes with the list fetch.
  const { report: groupedReport } = useHcpRecommendationsReport({
    cluster,
    query: { ...query, group_by: { hosted_cluster_id: '*' } },
    skipFetch: sub !== 'hosted',
    sub,
  });

  useEffect(() => {
    // Default landing is the Hosted-clusters grouped view (explicit behavior
    // change, #689). An explicit sub param always wins over this default.
    if (new URLSearchParams(location.search).get('sub') == null) {
      handleSubSelect('hosted');
    }
  }, []);

  const hcpGroupBy = getHcpGroupBy(query);

  const currentOrderBy = query.order_by ? Object.keys(query.order_by)[0] : undefined;
  useSavingsFallbackSort({
    data: report?.data,
    currentOrderBy,
    fallbackOrderBy: 'cpu_variation_short_cost',
    onSort: (orderBy, isAscending) => handleOnSort(orderBy, isAscending),
  });

  useEffect(() => {
    setNewLinkState(
      getLinkState({
        breadcrumbPath,
        linkState,
        location,
        query,
        queryStateName,
      })
    );
  }, [query]);

  const getPagination = (isDisabled = false, isBottom = false) => {
    const count = report?.meta?.count ?? 0;
    const limit = report?.meta?.limit ?? query.limit ?? hcpRecommendationsBaseQuery.limit;
    const offset = report?.meta?.offset ?? query.offset ?? hcpRecommendationsBaseQuery.offset;
    const page = query.after ? cursorPage : Math.trunc(offset / limit + 1);

    return (
      <Pagination
        isCompact={!isBottom}
        isDisabled={isDisabled}
        itemCount={count}
        onPerPageSelect={(event, perPage) => handleOnPerPageSelect(perPage)}
        onSetPage={(event, pageNumber) => handleOnSetPage(pageNumber)}
        page={page}
        perPage={limit}
        titles={{
          paginationAriaLabel: intl.formatMessage(messages.paginationTitle, {
            title: intl.formatMessage(messages.openShift),
            placement: isBottom ? 'bottom' : 'top',
          }),
        }}
        variant={isBottom ? PaginationVariant.bottom : PaginationVariant.top}
        widgetId={`hcp-pagination${isBottom ? '-bottom' : ''}`}
      />
    );
  };

  const getTable = () => {
    return (
      <OptimizationsHcpDataTable
        breadcrumbLabel={breadcrumbLabel}
        engine={query.engine}
        filterBy={query.filter_by}
        groupBy={hcpGroupBy}
        isClusterHidden={isClusterHidden}
        isLoading={reportFetchStatus === FetchStatus.inProgress}
        linkPath={linkPath}
        linkState={newLinkState}
        scope={sub === 'overhead' ? 'management' : undefined}
        onDrillDown={filter => handleDrillDownFromGroup(filter)}
        onFilterAdded={filter => handleOnFilterAdded(filter)}
        onSort={(sortType, isSortAscending) => handleOnSort(sortType, isSortAscending)}
        orderBy={query.order_by}
        report={report}
        reportQueryString={reportQueryString}
        term={query.term}
      />
    );
  };

  const getToolbar = () => {
    const itemsPerPage = report?.meta?.limit ?? query.limit ?? hcpRecommendationsBaseQuery.limit;
    const itemsTotal = report?.meta?.count ?? 0;
    const isDisabled = itemsTotal === 0;

    return (
      <OptimizationsHcpToolbar
        isClusterHidden={isClusterHidden}
        isDisabled={isDisabled}
        itemsPerPage={itemsPerPage}
        itemsTotal={itemsTotal}
        onEngineSelect={handleOnEngineSelect}
        onFilterAdded={filter => handleOnFilterAdded(filter)}
        onFilterRemoved={filter => handleOnFilterRemoved(filter)}
        onTermSelect={handleOnTermSelect}
        pagination={getPagination(isDisabled)}
        query={query}
      />
    );
  };

  const getSubToggle = () => {
    return (
      <Flex style={{ marginBottom: 16 }}>
        <FlexItem>
          <ToggleGroup aria-label="HCP recommendation scope">
            <ToggleGroupItem
              buttonId="hosted"
              isSelected={sub === 'hosted'}
              onChange={() => handleSubSelect('hosted')}
              text={intl.formatMessage(messages.hcpSubHosted)}
            />
            <ToggleGroupItem
              buttonId="overhead"
              isSelected={sub === 'overhead'}
              onChange={() => handleSubSelect('overhead')}
              text={intl.formatMessage(messages.hcpSubOverhead)}
            />
          </ToggleGroup>
        </FlexItem>
        {/* #694 item 5: per-sub subtitles (#689 companion). The overhead
            subtitle links out to the containers view for the full cluster
            picture instead of duplicating it here. */}
        <FlexItem>
          {intl.formatMessage(
            sub === 'overhead' ? messages.hcpTabSubtitleOverhead : messages.hcpTabSubtitleHosted
          )}{' '}
          {sub === 'overhead' && (
            <Link to={formatPath(routePaths.optimizationsContainersTable.path)}>
              {intl.formatMessage(messages.hcpOverheadContainersLink)}
            </Link>
          )}
        </FlexItem>
      </Flex>
    );
  };

  const handleSubSelect = (nextSub: 'hosted' | 'overhead') => {
    // Single atomic navigation: a separate sub navigate followed by setQuery
    // reads the same stale location.search twice and the second replace
    // silently drops sub — the toggle visibly did nothing. Extras ride along.
    const groupBy = hcpSubToGroupBy(nextSub);
    const rest = { ...query };
    if (!groupBy) {
      delete rest.group_by;
    } else {
      rest.group_by = { [groupBy]: '*' };
    }
    setCursorPage(1);
    setQuery({ ...rest, offset: 0, after: undefined }, { sub: nextSub });
  };

  const handleChipSelect = (hostedClusterId: string) => {
    // Chip drill-down filters the flat list in place (stays on the sub).
    setCursorPage(1);
    setQuery({
      ...query,
      filter_by: {
        ...query.filter_by,
        hosted_cluster_id: hostedClusterId,
      },
      offset: 0,
      after: undefined,
    });
  };

  const handleOnFilterAdded = filter => {
    setCursorPage(1);
    const newQuery = queryUtils.handleOnFilterAdded(query, filter);
    setQuery(newQuery);
  };

  const handleOnFilterRemoved = filter => {
    setCursorPage(1);
    const newQuery = queryUtils.handleOnFilterRemoved(query, filter);
    setQuery(newQuery);
  };

  const handleOnPerPageSelect = perPage => {
    setCursorPage(1);
    const newQuery = queryUtils.handleOnPerPageSelect(query, perPage, true);
    setQuery(newQuery);
  };

  const handleOnSetPage = pageNumber => {
    const isNextPage = pageNumber === cursorPage + 1;
    if (isNextPage && report?.meta?.has_next && report?.meta?.next_cursor) {
      setCursorPage(pageNumber);
      const newQuery = queryUtils.handleOnSetPage(query, report, pageNumber, true);
      setQuery(newQuery);
    } else {
      setCursorPage(pageNumber);
      const limit = report?.meta?.limit ?? query.limit ?? hcpRecommendationsBaseQuery.limit;
      const offset = (pageNumber - 1) * limit;
      setQuery({
        ...query,
        after: undefined,
        offset: pageNumber === 1 ? 0 : offset,
        limit,
      });
    }
  };

  const handleOnSort = (sortType, isSortAscending) => {
    setCursorPage(1);
    const newQuery = queryUtils.handleOnSort(query, sortType, isSortAscending);
    setQuery({ ...newQuery, offset: 0, after: undefined });
  };

  const handleOnTermSelect = (term: string) => {
    setCursorPage(1);
    setQuery({ ...query, term, offset: 0, after: undefined });
  };

  const handleOnEngineSelect = (engine: string) => {
    setCursorPage(1);
    setQuery({ ...query, engine, offset: 0, after: undefined });
  };

  const handleDrillDownFromGroup = (filter: { key: string; value: string }) => {
    setCursorPage(1);
    const rest = { ...query };
    delete rest.group_by;
    setQuery(
      {
        ...rest,
        filter_by: {
          ...query.filter_by,
          [filter.key]: filter.value,
        },
        offset: 0,
        after: undefined,
      },
      { sub: 'overhead' }
    );
  };

  const itemsTotal = report?.meta ? report.meta.count : 0;
  const isDisabled = itemsTotal === 0;
  const hasOptimizations = report?.meta && report.meta.count > 0;

  const isNoDataResponse =
    reportError && (reportError.response?.status === 404 || reportError.response?.status === 501);

  if (reportError && !isNoDataResponse) {
    return <NotAvailable title={intl.formatMessage(messages.optimizations)} />;
  }
  if (isNoDataResponse) {
    return <NotConfigured />;
  }
  if (!query.filter_by && !hasOptimizations && reportFetchStatus === FetchStatus.complete) {
    const dataDaysAvailable = report?.meta?.data_days_available ?? 0;
    const minDataDays =
      report?.meta?.min_data_days ??
      (() => {
        const activeTerm = query.term ?? ROS_LIST_TERM;
        const termName = INTERVAL_TO_TERM_NAME[activeTerm];
        const matchedTerm = termSettings.find(t => t.name === termName);
        return matchedTerm?.min_data_days ?? 3;
      })();
    if (dataDaysAvailable < minDataDays) {
      return <ColdStartState currentDays={dataDaysAvailable} minDays={minDataDays} />;
    }
    return <NotConfigured />;
  }
  return (
    <>
      {getSubToggle()}
      {sub === 'hosted' && <HcpSummaryStrip groups={groupedReport?.data} onSelect={handleChipSelect} />}
      {getToolbar()}
      {reportFetchStatus !== FetchStatus.complete ? (
        <LoadingState
          body={intl.formatMessage(messages.optimizationsLoadingStateDesc)}
          heading={intl.formatMessage(messages.optimizationsLoadingStateTitle)}
        />
      ) : (
        <>
          {getTable()}
          <div style={styles.paginationContainer}>{getPagination(isDisabled, true)}</div>
        </>
      )}
    </>
  );
};

export default OptimizationsHcpTable;
