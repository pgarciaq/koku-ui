import { render, screen } from '@testing-library/react';
import React from 'react';

jest.mock('@patternfly/react-charts/echarts', () => ({
  Charts: ({ id, option, height, width }: any) => (
    <div data-testid="echarts-chart" data-chart-id={id} data-width={width}>
      {JSON.stringify(option?.series)}
    </div>
  ),
  ThemeColor: { skeleton: 'skeleton', green: 'green' },
}));
jest.mock('echarts/core', () => ({ use: jest.fn() }));
jest.mock('echarts/charts', () => ({ SankeyChart: {} }));
jest.mock('echarts/components', () => ({ TitleComponent: {}, TooltipComponent: {} }));
jest.mock('echarts/renderers', () => ({ SVGRenderer: {} }));

jest.mock('routes/components/charts/common', () => ({
  ...jest.requireActual('routes/components/charts/common'),
  getResizeObserver: () => (_node: any, cb: any) => {
    cb?.({ clientWidth: 400 });
    return () => {};
  },
}));

import CostBreakdownChart from './costBreakdownChart';

const mockIntl = {
  formatMessage: jest.fn(({ defaultMessage }) => defaultMessage),
  formatDate: jest.fn(() => ''),
  formatNumber: jest.fn(v => v),
} as any;

// --- Mock data fixtures ---

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
      },
    },
  },
  data: [],
};

const MOCK_REPORT_WITH_BREAKDOWN = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 200, units: 'USD' },
        raw: { value: 0, units: 'USD' },
        markup: { value: 0, units: 'USD' },
        usage: {
          value: 100,
          units: 'USD',
          breakdown: [
            { name: 'CPU charge', source: 'rate', value: 60, units: 'USD' },
            { name: 'Memory charge', source: 'rate', value: 40, units: 'USD' },
          ],
        },
        platform_distributed: {
          value: 60,
          units: 'USD',
          breakdown: [{ name: 'Node monthly', source: 'rate', value: 60, units: 'USD' }],
        },
        worker_unallocated_distributed: {
          value: 40,
          units: 'USD',
          breakdown: [{ name: 'Node monthly', source: 'rate', value: 40, units: 'USD' }],
        },
        storage_unattributed_distributed: { value: 0, units: 'USD' },
        network_unattributed_distributed: { value: 0, units: 'USD' },
        gpu_unallocated_distributed: { value: 0, units: 'USD' },
      },
    },
  },
  data: [],
};

const MOCK_REPORT_WITH_OVERHEAD_BREAKDOWN = {
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
          breakdown: [
            { name: 'Node monthly', source: 'rate', value: 40, units: 'USD' },
            { name: 'Cloud cost', source: 'cloud', value: 30, units: 'USD' },
          ],
        },
        storage_unattributed_distributed: { value: 20, units: 'USD' },
        network_unattributed_distributed: { value: 10, units: 'USD' },
        gpu_unallocated_distributed: { value: 5, units: 'USD' },
      },
    },
  },
  data: [],
};

const MOCK_REPORT_MULTI_LINK = {
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
          breakdown: [
            { name: 'Node monthly', source: 'rate', value: 50, units: 'USD' },
            { name: 'CPU charge', source: 'rate', value: 50, units: 'USD' },
          ],
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

const MOCK_AWS_REPORT = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 500, units: 'USD' },
        raw: { value: 400, units: 'USD' },
        markup: { value: 40, units: 'USD' },
        usage: { value: 60, units: 'USD' },
      },
    },
  },
  data: [],
};

const MOCK_AZURE_REPORT = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 300, units: 'USD' },
        raw: { value: 200, units: 'USD' },
        markup: { value: 20, units: 'USD' },
        usage: { value: 80, units: 'USD' },
      },
    },
  },
  data: [],
};

const MOCK_GCP_REPORT = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 400, units: 'USD' },
        raw: { value: 300, units: 'USD' },
        markup: { value: 30, units: 'USD' },
        usage: { value: 70, units: 'USD' },
      },
    },
  },
  data: [],
};

const MOCK_REPORT_NON_DISTRIBUTED = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 200, units: 'USD' },
        raw: { value: 50, units: 'USD' },
        markup: { value: 5, units: 'USD' },
        usage: { value: 100, units: 'USD' },
        credit: { value: -10, units: 'USD' },
      },
    },
  },
  data: [],
};

function createReportWithBreakdown(costOverrides: Record<string, any>) {
  return {
    meta: {
      count: 1,
      total: {
        cost: {
          total: { value: 200, units: 'USD' },
          raw: { value: 0, units: 'USD' },
          markup: { value: 0, units: 'USD' },
          usage: { value: 100, units: 'USD' },
          platform_distributed: { value: 0, units: 'USD' },
          worker_unallocated_distributed: { value: 0, units: 'USD' },
          storage_unattributed_distributed: { value: 0, units: 'USD' },
          network_unattributed_distributed: { value: 0, units: 'USD' },
          gpu_unallocated_distributed: { value: 0, units: 'USD' },
          ...costOverrides,
        },
      },
    },
    data: [],
  };
}

// --- Tests ---

describe('CostBreakdownChart', () => {
  describe('backward compatibility', () => {
    test('renders chart with no breakdown arrays', () => {
      render(
        <CostBreakdownChart report={MOCK_REPORT_NO_BREAKDOWN as any} costDistribution="distributed" intl={mockIntl} />
      );
      const wrapper = screen.getByTestId('cost-breakdown-chart-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('usage breakdown', () => {
    test('renders usage breakdown entries as Sankey nodes on the left', () => {
      render(
        <CostBreakdownChart report={MOCK_REPORT_WITH_BREAKDOWN as any} costDistribution="distributed" intl={mockIntl} />
      );
      const wrapper = screen.getByTestId('cost-breakdown-chart-wrapper');
      expect(screen.getByText(/CPU charge/)).toBeInTheDocument();
      expect(screen.getByText(/Memory charge/)).toBeInTheDocument();
      expect(wrapper).toMatchSnapshot();
    });

    test('renders overhead breakdown entries flowing to overhead nodes', () => {
      render(
        <CostBreakdownChart report={MOCK_REPORT_WITH_OVERHEAD_BREAKDOWN as any} costDistribution="distributed" intl={mockIntl} />
      );
      expect(screen.getByText(/Node monthly/)).toBeInTheDocument();
      expect(screen.getByText(/Cloud cost/)).toBeInTheDocument();
    });

    test('rate name node has outgoing links to multiple categories', () => {
      render(
        <CostBreakdownChart report={MOCK_REPORT_MULTI_LINK as any} costDistribution="distributed" intl={mockIntl} />
      );
      const nodeMonthlyElements = screen.getAllByText(/Node monthly/);
      expect(nodeMonthlyElements).toHaveLength(1);
    });

    test('raw, markup, and credit remain as leaf nodes without breakdown', () => {
      render(
        <CostBreakdownChart report={MOCK_REPORT_WITH_BREAKDOWN as any} costDistribution="distributed" intl={mockIntl} />
      );
      const wrapper = screen.getByTestId('cost-breakdown-chart-wrapper');
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('edge cases', () => {
    test('handles empty breakdown array gracefully', () => {
      const report = {
        ...MOCK_REPORT_WITH_BREAKDOWN,
        meta: {
          ...MOCK_REPORT_WITH_BREAKDOWN.meta,
          total: {
            ...MOCK_REPORT_WITH_BREAKDOWN.meta.total,
            cost: {
              ...MOCK_REPORT_WITH_BREAKDOWN.meta.total.cost,
              usage: { value: 100, units: 'USD', breakdown: [] },
            },
          },
        },
      };
      render(<CostBreakdownChart report={report as any} costDistribution="distributed" intl={mockIntl} />);
      const wrapper = screen.getByTestId('cost-breakdown-chart-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toMatchSnapshot();
    });

    test('handles zero-value breakdown entry', () => {
      const report = createReportWithBreakdown({
        usage: {
          value: 42.5,
          units: 'USD',
          breakdown: [
            { name: 'CPU charge', source: 'rate', value: 42.5, units: 'USD' },
            { name: 'Unused rate', source: 'rate', value: 0, units: 'USD' },
          ],
        },
      });
      render(<CostBreakdownChart report={report as any} costDistribution="distributed" intl={mockIntl} />);
      expect(screen.getByText(/CPU charge/)).toBeInTheDocument();
    });

    test('handles single-entry breakdown', () => {
      const report = createReportWithBreakdown({
        usage: {
          value: 42.5,
          units: 'USD',
          breakdown: [{ name: 'CPU charge', source: 'rate', value: 42.5, units: 'USD' }],
        },
      });
      render(<CostBreakdownChart report={report as any} costDistribution="distributed" intl={mockIntl} />);
      expect(screen.getByText(/CPU charge/)).toBeInTheDocument();
    });

    test('renders "Other" aggregation entry from breakdown_limit', () => {
      const report = createReportWithBreakdown({
        usage: {
          value: 100,
          units: 'USD',
          breakdown: [
            { name: 'CPU charge', source: 'rate', value: 60, units: 'USD' },
            { name: 'Memory charge', source: 'rate', value: 30, units: 'USD' },
            { name: 'Other', source: 'other', value: 10, units: 'USD' },
          ],
        },
      });
      render(<CostBreakdownChart report={report as any} costDistribution="distributed" intl={mockIntl} />);
      expect(screen.getByText(/CPU charge/)).toBeInTheDocument();
      expect(screen.getByText(/Memory charge/)).toBeInTheDocument();
      expect(screen.getByText(/Other/)).toBeInTheDocument();
    });

    test('handles long rate name (50 chars)', () => {
      const longName = 'A'.repeat(50);
      const report = createReportWithBreakdown({
        usage: {
          value: 42.5,
          units: 'USD',
          breakdown: [{ name: longName, source: 'rate', value: 42.5, units: 'USD' }],
        },
      });
      render(<CostBreakdownChart report={report as any} costDistribution="distributed" intl={mockIntl} />);
      expect(screen.getByText(new RegExp(longName))).toBeInTheDocument();
    });

    test('overhead breakdown with only rate entries (no cloud)', () => {
      const report = createReportWithBreakdown({
        usage: {
          value: 42.5,
          units: 'USD',
          breakdown: [{ name: 'CPU charge', source: 'rate', value: 42.5, units: 'USD' }],
        },
        platform_distributed: {
          value: 20.0,
          units: 'USD',
          breakdown: [{ name: 'Node monthly', source: 'rate', value: 20.0, units: 'USD' }],
        },
      });
      render(<CostBreakdownChart report={report as any} costDistribution="distributed" intl={mockIntl} />);
      expect(screen.getByText(/Node monthly/)).toBeInTheDocument();
      expect(screen.queryByText(/Cloud cost/)).not.toBeInTheDocument();
    });
  });

  describe('dynamic height', () => {
    test('chart height scales with number of breakdown entries', () => {
      const manyEntries = Array.from({ length: 10 }, (_, i) => ({
        name: `Rate ${i}`,
        source: 'rate' as const,
        value: 10,
        units: 'USD',
      }));
      const report = createReportWithBreakdown({
        usage: { value: 100, units: 'USD', breakdown: manyEntries },
      });
      render(<CostBreakdownChart report={report as any} costDistribution="distributed" intl={mockIntl} />);
      const wrapper = screen.getByTestId('cost-breakdown-chart-wrapper');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('cloud views backward compatibility', () => {
    test('chart renders AWS report (no breakdown arrays) without crash', () => {
      render(<CostBreakdownChart report={MOCK_AWS_REPORT as any} costDistribution="distributed" intl={mockIntl} />);
      const wrapper = screen.getByTestId('cost-breakdown-chart-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toMatchSnapshot();
    });

    test('chart renders Azure report (no breakdown arrays) without crash', () => {
      render(<CostBreakdownChart report={MOCK_AZURE_REPORT as any} costDistribution="distributed" intl={mockIntl} />);
      expect(screen.getByTestId('cost-breakdown-chart-wrapper')).toBeInTheDocument();
    });

    test('chart renders GCP report (no breakdown arrays) without crash', () => {
      render(<CostBreakdownChart report={MOCK_GCP_REPORT as any} costDistribution="distributed" intl={mockIntl} />);
      expect(screen.getByTestId('cost-breakdown-chart-wrapper')).toBeInTheDocument();
    });
  });

  describe('OCP views', () => {
    test('OCP report with breakdown renders 5-layer Sankey', () => {
      render(
        <CostBreakdownChart report={MOCK_REPORT_WITH_BREAKDOWN as any} costDistribution="distributed" intl={mockIntl} />
      );
      expect(screen.getByText(/CPU charge/)).toBeInTheDocument();
      expect(screen.getByTestId('cost-breakdown-chart-wrapper')).toMatchSnapshot();
    });

    test('OCP report without cost model (no breakdown) renders 4-layer Sankey', () => {
      render(
        <CostBreakdownChart report={MOCK_REPORT_NO_BREAKDOWN as any} costDistribution="distributed" intl={mockIntl} />
      );
      expect(screen.queryByText(/CPU charge/)).not.toBeInTheDocument();
    });
  });

  describe('non-distributed mode', () => {
    test('non-distributed mode (simple Sankey) does not show breakdown', () => {
      render(<CostBreakdownChart report={MOCK_REPORT_NON_DISTRIBUTED as any} intl={mockIntl} />);
      expect(screen.queryByText(/CPU charge/)).not.toBeInTheDocument();
    });
  });
});
