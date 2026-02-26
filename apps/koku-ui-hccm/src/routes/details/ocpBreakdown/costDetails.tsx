import { Skeleton } from '@patternfly/react-core';
import ClusterIcon from '@patternfly/react-icons/dist/esm/icons/cluster-icon';
import CogsIcon from '@patternfly/react-icons/dist/esm/icons/cogs-icon';
import CreditCardIcon from '@patternfly/react-icons/dist/esm/icons/credit-card-icon';
import InfrastructureIcon from '@patternfly/react-icons/dist/esm/icons/infrastructure-icon';
import MicrochipIcon from '@patternfly/react-icons/dist/esm/icons/microchip-icon';
import MoneyBillIcon from '@patternfly/react-icons/dist/esm/icons/money-bill-icon';
import NetworkIcon from '@patternfly/react-icons/dist/esm/icons/network-icon';
import OpenshiftIcon from '@patternfly/react-icons/dist/esm/icons/openshift-icon';
import PercentIcon from '@patternfly/react-icons/dist/esm/icons/percent-icon';
import ServerIcon from '@patternfly/react-icons/dist/esm/icons/server-icon';
import StorageDomainIcon from '@patternfly/react-icons/dist/esm/icons/storage-domain-icon';
import TachometerAltIcon from '@patternfly/react-icons/dist/esm/icons/tachometer-alt-icon';
import { Table, Tbody, Td, Th, Thead, Tr, TreeRowWrapper } from '@patternfly/react-table';
import type { Report, ReportValue } from 'api/reports/report';
import messages from 'locales/messages';
import React from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import { ComputedReportItemValueType } from 'routes/components/charts/common';
import { skeletonWidth } from 'routes/utils/skeleton';
import { FetchStatus } from 'store/common';
import { formatCurrency } from 'utils/format';

interface TreeNode {
  id: string;
  name: string;
  value: number;
  icon?: React.ReactNode;
  children: TreeNode[];
}

interface FlatRow {
  id: string;
  name: string;
  value: number;
  icon?: React.ReactNode;
  level: number;
  setSize: number;
  posInSet: number;
  isExpanded: boolean;
  isHidden: boolean;
  childCount: number;
}

interface CostDetailsOwnProps {
  costDistribution?: string;
  currency?: string;
  report?: Report;
  reportFetchStatus?: FetchStatus;
}

type CostDetailsProps = CostDetailsOwnProps & WrappedComponentProps;

const CostDetailsBase: React.FC<CostDetailsProps> = ({ costDistribution, currency, intl, report, reportFetchStatus }) => {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [initialized, setInitialized] = React.useState(false);

  const cost = report?.meta?.total?.cost;
  const isDistributed = costDistribution === ComputedReportItemValueType.distributed;
  const hasCredit = cost?.credit !== undefined;

  const reportItemValue = costDistribution ? costDistribution : 'total';
  const units = cost?.[reportItemValue]?.units || currency || 'USD';

  const getVal = (rv: ReportValue | undefined): number => rv?.value ?? 0;

  const buildBreakdownChildren = (parentId: string, rv: ReportValue | undefined): TreeNode[] => {
    if (!rv?.breakdown?.length) {
      return [];
    }
    return rv.breakdown.map((entry, idx) => ({
      id: `${parentId}--${entry.name}-${idx}`,
      name: entry.name,
      value: entry.value,
      children: [],
    }));
  };

  const rawValue = getVal(cost?.raw);
  const markupValue = getVal(cost?.markup);
  const usageValue = getVal(cost?.usage);
  const creditValue = hasCredit ? getVal(cost?.credit) : 0;
  const gpuValue = isDistributed ? getVal(cost?.gpu_unallocated_distributed) : 0;
  const networkValue = isDistributed ? getVal(cost?.network_unattributed_distributed) : 0;
  const platformValue = isDistributed ? getVal(cost?.platform_distributed) : 0;
  const storageValue = isDistributed ? getVal(cost?.storage_unattributed_distributed) : 0;
  const workerValue = isDistributed ? getVal(cost?.worker_unallocated_distributed) : 0;

  const workloadValue = rawValue + markupValue + usageValue + creditValue;
  const overheadValue = gpuValue + networkValue + platformValue + storageValue + workerValue;
  const totalValue = workloadValue + overheadValue;

  const tree = React.useMemo<TreeNode[]>(() => {
    if (!cost) {
      return [];
    }

    const leafCategories: TreeNode[] = [
      {
        id: 'raw',
        name: intl.formatMessage(messages.rawCostTitle),
        value: rawValue,
        icon: <CogsIcon />,
        children: [],
      },
      {
        id: 'markup',
        name: intl.formatMessage(messages.markupTitle),
        value: markupValue,
        icon: <PercentIcon />,
        children: [],
      },
      {
        id: 'usage',
        name: intl.formatMessage(messages.usageCostTitle),
        value: usageValue,
        icon: <TachometerAltIcon />,
        children: isDistributed ? buildBreakdownChildren('usage', cost.usage) : [],
      },
    ];
    if (hasCredit) {
      leafCategories.push({
        id: 'credit',
        name: intl.formatMessage(messages.credit),
        value: creditValue,
        icon: <CreditCardIcon />,
        children: [],
      });
    }

    let rootChildren: TreeNode[];

    if (isDistributed) {
      const overheadChildren: TreeNode[] = [
        {
          id: 'gpu-unallocated',
          name: intl.formatMessage(messages.gpuUnallocated),
          value: gpuValue,
          icon: <MicrochipIcon />,
          children: buildBreakdownChildren('gpu-unallocated', cost.gpu_unallocated_distributed),
        },
        {
          id: 'network-unattributed',
          name: intl.formatMessage(messages.networkUnattributedDistributed),
          value: networkValue,
          icon: <NetworkIcon />,
          children: buildBreakdownChildren('network-unattributed', cost.network_unattributed_distributed),
        },
        {
          id: 'platform-distributed',
          name: intl.formatMessage(messages.platformDistributed),
          value: platformValue,
          icon: <ClusterIcon />,
          children: buildBreakdownChildren('platform-distributed', cost.platform_distributed),
        },
        {
          id: 'storage-unattributed',
          name: intl.formatMessage(messages.storageUnattributedDistributed),
          value: storageValue,
          icon: <StorageDomainIcon />,
          children: buildBreakdownChildren('storage-unattributed', cost.storage_unattributed_distributed),
        },
        {
          id: 'worker-unallocated',
          name: intl.formatMessage(messages.workerUnallocated),
          value: workerValue,
          icon: <ServerIcon />,
          children: buildBreakdownChildren('worker-unallocated', cost.worker_unallocated_distributed),
        },
      ];

      rootChildren = [
        {
          id: 'workload',
          name: intl.formatMessage(messages.allOtherProjectCosts),
          value: workloadValue,
          icon: <OpenshiftIcon />,
          children: leafCategories,
        },
        {
          id: 'overhead',
          name: intl.formatMessage(messages.costDistributionLabel),
          value: overheadValue,
          icon: <InfrastructureIcon />,
          children: overheadChildren,
        },
      ];
    } else {
      rootChildren = leafCategories;
    }

    const root: TreeNode = {
      id: 'total',
      name: intl.formatMessage(messages.totalCost),
      value: totalValue,
      icon: <MoneyBillIcon />,
      children: rootChildren,
    };

    return [root];
  }, [cost, costDistribution, intl]);

  // Expand all nodes on first render
  React.useEffect(() => {
    if (!initialized && tree.length > 0) {
      const ids = new Set<string>();
      const collect = (nodes: TreeNode[]) => {
        for (const node of nodes) {
          if (node.children.length > 0) {
            ids.add(node.id);
          }
          collect(node.children);
        }
      };
      collect(tree);
      setExpandedIds(ids);
      setInitialized(true);
    }
  }, [tree, initialized]);

  const flatRows = React.useMemo<FlatRow[]>(() => {
    const rows: FlatRow[] = [];
    const flatten = (nodes: TreeNode[], level: number, parentHidden: boolean) => {
      const setSize = nodes.length;
      nodes.forEach((node, idx) => {
        const isExpanded = expandedIds.has(node.id);
        const isHidden = parentHidden;
        rows.push({
          id: node.id,
          name: node.name,
          value: node.value,
          icon: node.icon,
          level,
          setSize,
          posInSet: idx + 1,
          isExpanded,
          isHidden,
          childCount: node.children.length,
        });
        if (node.children.length > 0) {
          flatten(node.children, level + 1, isHidden || !isExpanded);
        }
      });
    };
    flatten(tree, 1, false);
    return rows;
  }, [tree, expandedIds]);

  const handleCollapse = (_event: React.MouseEvent, rowIndex: number) => {
    const row = flatRows[rowIndex];
    if (!row) {
      return;
    }
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(row.id)) {
        next.delete(row.id);
      } else {
        next.add(row.id);
      }
      return next;
    });
  };

  const formatPercent = (value: number): string => {
    if (totalValue === 0) {
      return '0.00%';
    }
    return `${((value / totalValue) * 100).toFixed(2)}%`;
  };

  const isLoading = reportFetchStatus === FetchStatus.inProgress;

  if (isLoading || !cost) {
    return (
      <div>
        <Skeleton width={skeletonWidth.lg} />
        <Skeleton width={skeletonWidth.lg} style={{ marginTop: 8 }} />
        <Skeleton width={skeletonWidth.md} style={{ marginTop: 8 }} />
        <Skeleton width={skeletonWidth.md} style={{ marginTop: 8 }} />
        <Skeleton width={skeletonWidth.sm} style={{ marginTop: 8 }} />
        <Skeleton width={skeletonWidth.sm} style={{ marginTop: 8 }} />
        <Skeleton width={skeletonWidth.sm} style={{ marginTop: 8 }} />
      </div>
    );
  }

  return (
    <Table isTreeTable aria-label={intl.formatMessage(messages.breakdownCostDetailsTitle)}>
      <Thead>
        <Tr>
          <Th width={50}>{intl.formatMessage(messages.names, { count: 1 })}</Th>
          <Th width={25}>{intl.formatMessage(messages.cost)}</Th>
          <Th width={25}>{intl.formatMessage(messages.breakdownCostDetailsPercentColumn)}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {flatRows.map((row, rowIndex) => {
          const treeRowProps = {
            'aria-level': row.level,
            'aria-posinset': row.posInSet,
            'aria-setsize': row.childCount,
            isExpanded: row.isExpanded,
            isHidden: row.isHidden,
            icon: row.icon,
            toggleAriaLabel: row.name,
          };
          return (
            <TreeRowWrapper key={row.id} row={{ props: treeRowProps }}>
              <Td
                dataLabel={intl.formatMessage(messages.names, { count: 1 })}
                treeRow={{
                  onCollapse: handleCollapse,
                  props: treeRowProps,
                  rowIndex,
                }}
              >
                {row.name}
              </Td>
              <Td dataLabel={intl.formatMessage(messages.cost)}>{formatCurrency(row.value, units)}</Td>
              <Td dataLabel={intl.formatMessage(messages.breakdownCostDetailsPercentColumn)}>
                {formatPercent(row.value)}
              </Td>
            </TreeRowWrapper>
          );
        })}
      </Tbody>
    </Table>
  );
};

const CostDetails = injectIntl(CostDetailsBase);

export { CostDetails };
