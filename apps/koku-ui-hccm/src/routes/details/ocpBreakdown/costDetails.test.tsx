import { render, screen, fireEvent } from '@testing-library/react';
import { FetchStatus } from 'store/common';
import React from 'react';

import { CostDetails } from './costDetails';

const mockIntl = {
  formatMessage: jest.fn(({ defaultMessage }, values) => {
    if (values?.count !== undefined) {
      return defaultMessage.replace(/\{count, plural, one \{(.*?)\} other \{(.*?)\}\}/, (_m: string, one: string, other: string) =>
        values.count === 1 ? one : other
      );
    }
    return defaultMessage;
  }),
  formatDate: jest.fn(() => ''),
  formatNumber: jest.fn((v: number) => v),
} as any;

const MOCK_REPORT_DISTRIBUTED = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 500, units: 'USD' },
        raw: { value: 150, units: 'USD' },
        markup: { value: 15, units: 'USD' },
        usage: {
          value: 100,
          units: 'USD',
          breakdown: [
            { name: 'CPU charge', source: 'rate', value: 60, units: 'USD' },
            { name: 'Memory charge', source: 'rate', value: 40, units: 'USD' },
          ],
        },
        platform_distributed: {
          value: 130,
          units: 'USD',
          breakdown: [
            { name: 'Node monthly', source: 'rate', value: 80, units: 'USD' },
            { name: 'Cloud cost', source: 'cloud', value: 50, units: 'USD' },
          ],
        },
        worker_unallocated_distributed: {
          value: 70,
          units: 'USD',
          breakdown: [{ name: 'Worker rate', source: 'rate', value: 70, units: 'USD' }],
        },
        storage_unattributed_distributed: { value: 20, units: 'USD' },
        network_unattributed_distributed: { value: 10, units: 'USD' },
        gpu_unallocated_distributed: { value: 5, units: 'USD' },
      },
    },
  },
  data: [],
};

const MOCK_REPORT_NO_BREAKDOWN = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 200, units: 'USD' },
        raw: { value: 50, units: 'USD' },
        markup: { value: 5, units: 'USD' },
        usage: { value: 100, units: 'USD' },
        platform_distributed: { value: 30, units: 'USD' },
        worker_unallocated_distributed: { value: 15, units: 'USD' },
        storage_unattributed_distributed: { value: 0, units: 'USD' },
        network_unattributed_distributed: { value: 0, units: 'USD' },
        gpu_unallocated_distributed: { value: 0, units: 'USD' },
      },
    },
  },
  data: [],
};

const MOCK_REPORT_WITH_CREDIT = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 190, units: 'USD' },
        raw: { value: 50, units: 'USD' },
        markup: { value: 5, units: 'USD' },
        usage: { value: 100, units: 'USD' },
        credit: { value: -10, units: 'USD' },
        platform_distributed: { value: 30, units: 'USD' },
        worker_unallocated_distributed: { value: 15, units: 'USD' },
        storage_unattributed_distributed: { value: 0, units: 'USD' },
        network_unattributed_distributed: { value: 0, units: 'USD' },
        gpu_unallocated_distributed: { value: 0, units: 'USD' },
      },
    },
  },
  data: [],
};

describe('CostDetails', () => {
  beforeEach(() => {
    mockIntl.formatMessage.mockClear();
  });

  describe('loading state', () => {
    test('renders skeleton when fetch is in progress', () => {
      const { container } = render(
        <CostDetails reportFetchStatus={FetchStatus.inProgress} intl={mockIntl} />
      );
      const skeletons = container.querySelectorAll('.pf-v6-c-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    test('renders skeleton when report is undefined', () => {
      const { container } = render(
        <CostDetails reportFetchStatus={FetchStatus.complete} intl={mockIntl} />
      );
      const skeletons = container.querySelectorAll('.pf-v6-c-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('tree structure', () => {
    test('renders table when data is loaded', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_DISTRIBUTED as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      expect(screen.getByRole('treegrid')).toBeInTheDocument();
    });

    test('renders Total cost root node', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_DISTRIBUTED as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      expect(screen.getByText('Total cost')).toBeInTheDocument();
    });

    test('renders workload and overhead grouping nodes', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_DISTRIBUTED as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      expect(screen.getByText('Project (All other costs)')).toBeInTheDocument();
      expect(screen.getByText('Overhead cost')).toBeInTheDocument();
    });

    test('renders cost category nodes', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_DISTRIBUTED as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      expect(screen.getByText('Raw cost')).toBeInTheDocument();
      expect(screen.getByText('Markup')).toBeInTheDocument();
      expect(screen.getByText('Usage cost')).toBeInTheDocument();
      expect(screen.getByText('GPU unallocated')).toBeInTheDocument();
      expect(screen.getByText('Network unattributed')).toBeInTheDocument();
      expect(screen.getByText('Platform distributed')).toBeInTheDocument();
      expect(screen.getByText('Storage unattributed')).toBeInTheDocument();
      expect(screen.getByText('Worker unallocated')).toBeInTheDocument();
    });

    test('renders per-rate breakdown entries', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_DISTRIBUTED as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      expect(screen.getByText('CPU charge')).toBeInTheDocument();
      expect(screen.getByText('Memory charge')).toBeInTheDocument();
      expect(screen.getByText('Node monthly')).toBeInTheDocument();
      expect(screen.getByText('Cloud cost')).toBeInTheDocument();
      expect(screen.getByText('Worker rate')).toBeInTheDocument();
    });

    test('renders Credit node when credit is present', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_WITH_CREDIT as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      expect(screen.getByText('Credit')).toBeInTheDocument();
    });

    test('does not render Credit node when credit is absent', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_NO_BREAKDOWN as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      expect(screen.queryByText('Credit')).not.toBeInTheDocument();
    });
  });

  describe('zero-value rows', () => {
    test('renders rows with zero values', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_NO_BREAKDOWN as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      expect(screen.getByText('GPU unallocated')).toBeInTheDocument();
      expect(screen.getByText('Storage unattributed')).toBeInTheDocument();
      expect(screen.getByText('Network unattributed')).toBeInTheDocument();
    });
  });

  describe('percentage column', () => {
    test('displays 100.00% for total cost row', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_DISTRIBUTED as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      expect(screen.getByText('100.00%')).toBeInTheDocument();
    });

    test('displays 0.00% when total cost is zero', () => {
      const zeroReport = {
        meta: {
          count: 1,
          total: {
            cost: {
              total: { value: 0, units: 'USD' },
              raw: { value: 0, units: 'USD' },
              markup: { value: 0, units: 'USD' },
              usage: { value: 0, units: 'USD' },
              platform_distributed: { value: 0, units: 'USD' },
              worker_unallocated_distributed: { value: 0, units: 'USD' },
              storage_unattributed_distributed: { value: 0, units: 'USD' },
              network_unattributed_distributed: { value: 0, units: 'USD' },
              gpu_unallocated_distributed: { value: 0, units: 'USD' },
            },
          },
        },
        data: [],
      };
      render(
        <CostDetails report={zeroReport as any} reportFetchStatus={FetchStatus.complete} intl={mockIntl} />
      );
      const zeroPcts = screen.getAllByText('0.00%');
      expect(zeroPcts.length).toBeGreaterThan(0);
    });
  });

  describe('expand and collapse', () => {
    test('all parent nodes are expanded by default', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_DISTRIBUTED as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      expect(screen.getByText('CPU charge')).toBeInTheDocument();
      expect(screen.getByText('Memory charge')).toBeInTheDocument();
      expect(screen.getByText('Node monthly')).toBeInTheDocument();
    });

    test('collapsing a parent hides its children', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_DISTRIBUTED as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      const usageToggle = screen.getByLabelText('Usage cost');
      fireEvent.click(usageToggle);

      const cpuRow = screen.getByText('CPU charge').closest('tr');
      expect(cpuRow).toHaveAttribute('hidden');
    });

    test('re-expanding a collapsed parent shows its children', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_DISTRIBUTED as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      const usageToggle = screen.getByLabelText('Usage cost');

      fireEvent.click(usageToggle);
      expect(screen.getByText('CPU charge').closest('tr')).toHaveAttribute('hidden');

      fireEvent.click(usageToggle);
      expect(screen.getByText('CPU charge').closest('tr')).not.toHaveAttribute('hidden');
    });
  });

  describe('no breakdown entries', () => {
    test('renders without breakdown leaf nodes when no breakdown data', () => {
      render(
        <CostDetails
          report={MOCK_REPORT_NO_BREAKDOWN as any}
          reportFetchStatus={FetchStatus.complete}
          intl={mockIntl}
        />
      );
      expect(screen.getByText('Total cost')).toBeInTheDocument();
      expect(screen.getByText('Usage cost')).toBeInTheDocument();
      expect(screen.queryByText('CPU charge')).not.toBeInTheDocument();
    });
  });

  describe('duplicate rate names across categories', () => {
    test('same rate name under different categories renders as separate rows', () => {
      const report = {
        meta: {
          count: 1,
          total: {
            cost: {
              total: { value: 300, units: 'USD' },
              raw: { value: 0, units: 'USD' },
              markup: { value: 0, units: 'USD' },
              usage: {
                value: 100,
                units: 'USD',
                breakdown: [{ name: 'Node monthly', source: 'rate', value: 100, units: 'USD' }],
              },
              platform_distributed: {
                value: 120,
                units: 'USD',
                breakdown: [{ name: 'Node monthly', source: 'rate', value: 120, units: 'USD' }],
              },
              worker_unallocated_distributed: {
                value: 80,
                units: 'USD',
                breakdown: [{ name: 'Node monthly', source: 'rate', value: 80, units: 'USD' }],
              },
              storage_unattributed_distributed: { value: 0, units: 'USD' },
              network_unattributed_distributed: { value: 0, units: 'USD' },
              gpu_unallocated_distributed: { value: 0, units: 'USD' },
            },
          },
        },
        data: [],
      };
      render(
        <CostDetails report={report as any} reportFetchStatus={FetchStatus.complete} intl={mockIntl} />
      );
      const nodeMonthlyElements = screen.getAllByText('Node monthly');
      expect(nodeMonthlyElements).toHaveLength(3);
    });
  });
});
