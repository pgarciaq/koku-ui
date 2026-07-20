import {
  Card,
  CardBody,
  CardTitle,
  Icon,
  Pagination,
  PaginationVariant,
  Popover,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import { getQuery } from 'api/queries/query';
import type { RosReport } from 'api/ros/ros';
import { RosPathsType, RosType } from 'api/ros/ros';
import { withRosListProjection } from 'api/ros/rosListParams';
import type { AxiosError } from 'axios';
import messages from 'locales/messages';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';
import { LoadingState } from 'routes/components/state/loadingState';
import { getOptimizationsBreakdownPath } from 'routes/utils/paths';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { rosActions, rosSelectors } from 'store/ros';
import { getTimeFromNow } from 'utils/dates';

import { getRequestProps } from '../../optimizationsTable/utils';

interface NamespaceContainerInventoryProps {
  breakdownPath?: string;
  linkState?: any;
  namespace: string;
  clusterUuid?: string;
  term?: string;
  engine?: string;
}

const PAGE_SIZE = 10;

const NamespaceContainerInventory: React.FC<NamespaceContainerInventoryProps> = ({
  breakdownPath,
  linkState,
  namespace,
  clusterUuid,
  term,
  engine,
}) => {
  const intl = useIntl();
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);

  const reportQuery = useMemo(() => {
    const q = withRosListProjection({
      project: namespace,
      ...(clusterUuid && { cluster: clusterUuid }),
      limit: perPage,
      offset: (page - 1) * perPage,
      order_by: 'last_reported',
      order_how: 'desc',
      term,
      engine,
    });
    return q;
  }, [namespace, clusterUuid, page, perPage, term, engine]);

  const reportQueryString = useMemo(() => getQuery(reportQuery), [reportQuery]);
  const reportPathsType = RosPathsType.recommendations;
  const reportType = RosType.ros as any;

  const report: RosReport = useSelector((state: RootState) =>
    rosSelectors.selectRos(state, reportPathsType, reportType, reportQueryString)
  );
  const reportFetchStatus = useSelector((state: RootState) =>
    rosSelectors.selectRosFetchStatus(state, reportPathsType, reportType, reportQueryString)
  );
  const reportError: AxiosError = useSelector((state: RootState) =>
    rosSelectors.selectRosError(state, reportPathsType, reportType, reportQueryString)
  );

  useEffect(() => {
    if (!reportError && reportFetchStatus !== FetchStatus.inProgress) {
      dispatch(rosActions.fetchRosReport(reportPathsType, reportType, reportQueryString));
    }
  }, [reportQueryString]);

  const handlePerPageSelect = useCallback((_event: any, newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  }, []);

  const handleSetPage = useCallback((_event: any, newPage: number) => {
    setPage(newPage);
  }, []);

  const isLoading = reportFetchStatus === FetchStatus.inProgress;
  const count = report?.meta?.count ?? 0;

  const { columns, rows } = useMemo(() => {
    if (!report?.data?.length) {
      return { columns: [], rows: [] };
    }

    const cols = [
      { name: intl.formatMessage(messages.optimizationsNames, { value: 'container' }) },
      { name: intl.formatMessage(messages.optimizationsNames, { value: 'workload' }) },
      { name: intl.formatMessage(messages.optimizationsNames, { value: 'workload_type' }) },
      { name: intl.formatMessage(messages.optimizationsNames, { value: 'current' }) + ' (CPU)' },
      { name: intl.formatMessage(messages.optimizationsNames, { value: 'change' }) + ' (CPU)' },
      { name: intl.formatMessage(messages.optimizationsNames, { value: 'current' }) + ' (Mem)' },
      { name: intl.formatMessage(messages.optimizationsNames, { value: 'change' }) + ' (Mem)' },
      { name: intl.formatMessage(messages.optimizationsNames, { value: 'potential_savings' }) },
      { name: intl.formatMessage(messages.optimizationsNames, { value: 'last_reported' }) },
    ];

    const tableRows = report.data.map(item => {
      const container = item.container ?? '';
      const workload = item.workload ?? '';
      const workloadType = item.workload_type ?? '';
      const lastReported = getTimeFromNow(item.last_reported);

      const requestProps = getRequestProps(item, term, engine);
      const savings = item.recommendations?.estimated_monthly_savings;
      const savingsCell =
        savings?.value != null
          ? `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}`
          : '—';

      const containerLink = breakdownPath
        ? getOptimizationsBreakdownPath({
            basePath: breakdownPath,
            id: item.id,
            title: container,
          })
        : undefined;

      return {
        cells: [
          {
            value: containerLink ? (
              <Link to={containerLink} state={linkState}>
                {container}
              </Link>
            ) : (
              container
            ),
          },
          { value: workload },
          { value: workloadType },
          { value: requestProps?.cpuRequestCurrent },
          { value: requestProps?.cpuVariation },
          { value: requestProps?.memoryRequestCurrent },
          { value: requestProps?.memoryVariation },
          { value: savingsCell },
          { value: lastReported },
        ],
      };
    });

    return { columns: cols, rows: tableRows };
  }, [report, term, engine, breakdownPath, linkState, intl]);

  const getPagination = (isBottom = false) => (
    <Pagination
      isCompact={!isBottom}
      isDisabled={count === 0}
      itemCount={count}
      onPerPageSelect={handlePerPageSelect}
      onSetPage={handleSetPage}
      page={page}
      perPage={perPage}
      variant={isBottom ? PaginationVariant.bottom : PaginationVariant.top}
    />
  );

  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h2" size={TitleSizes.lg}>
          {intl.formatMessage(messages.namespaceContainerInventoryTitle)}{' '}
          <Popover
            bodyContent={intl.formatMessage(messages.namespaceContainerInventoryHelperText)}
            maxWidth="420px"
          >
            <Icon isInline status="info" style={{ cursor: 'pointer' }}>
              <OutlinedQuestionCircleIcon />
            </Icon>
          </Popover>
        </Title>
      </CardTitle>
      <CardBody>
        {isLoading ? (
          <LoadingState
            body={intl.formatMessage(messages.optimizationsLoadingStateDesc)}
            heading={intl.formatMessage(messages.optimizationsLoadingStateTitle)}
          />
        ) : count === 0 ? (
          <NoOptimizationsState />
        ) : (
          <>
            {getPagination()}
            <DataTable
              columns={columns}
              emptyState={<NoOptimizationsState />}
              rows={rows}
            />
            {getPagination(true)}
          </>
        )}
      </CardBody>
    </Card>
  );
};

export { NamespaceContainerInventory };
