import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { UtilizationHeatmap } from './utilizationHeatmap';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

const makeSampleData = () => [
  { report_date: '2026-06-22', hour: 0, value: 100 },
  { report_date: '2026-06-22', hour: 12, value: 500 },
  { report_date: '2026-06-22', hour: 23, value: 250 },
  { report_date: '2026-06-23', hour: 9, value: 800 },
  { report_date: '2026-06-23', hour: 17, value: 300 },
  { report_date: '2026-06-24', hour: 14, value: 600 },
  { report_date: '2026-06-25', hour: 3, value: 50 },
  { report_date: '2026-06-26', hour: 10, value: 400 },
  { report_date: '2026-06-27', hour: 20, value: 700 },
  { report_date: '2026-06-28', hour: 6, value: 150 },
];

describe('UtilizationHeatmap', () => {
  it('renders the empty state when data is empty', () => {
    render(
      <UtilizationHeatmap data={[]} maxValue={0} metricLabel="mCPU" entityLabel="test-vm" />,
      { wrapper }
    );
    expect(screen.getByText(/no hourly activity data/i)).toBeTruthy();
  });

  it('renders day-of-week labels', () => {
    render(
      <UtilizationHeatmap data={makeSampleData()} maxValue={800} metricLabel="mCPU" entityLabel="test-vm" />,
      { wrapper }
    );
    expect(screen.getAllByText('Mon').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Tue').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Wed').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Thu').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Fri').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Sat').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Sun').length).toBeGreaterThanOrEqual(1);
  });

  it('renders gridcells for data points', () => {
    const data = makeSampleData();
    render(
      <UtilizationHeatmap data={data} maxValue={800} metricLabel="mCPU" entityLabel="test-vm" />,
      { wrapper }
    );
    const gridcells = screen.getAllByRole('gridcell');
    expect(gridcells.length).toBe(data.length);
  });

  it('renders accessibility table with correct row count', () => {
    const data = makeSampleData();
    render(
      <UtilizationHeatmap data={data} maxValue={800} metricLabel="mCPU" entityLabel="test-vm" />,
      { wrapper }
    );
    const table = screen.getByRole('table', { hidden: true });
    expect(table).toBeTruthy();
    const rows = table.querySelectorAll('tbody tr');
    expect(rows.length).toBe(data.length);
  });

  it('applies valueFormatter to gridcell aria-labels', () => {
    const data = [
      { report_date: '2026-06-23', hour: 9, value: 1234 },
    ];
    const formatter = (v: number) => `${(v / 1000).toFixed(1)} cores`;
    render(
      <UtilizationHeatmap
        data={data}
        maxValue={1234}
        metricLabel="CPU"
        entityLabel="vm-1"
        valueFormatter={formatter}
      />,
      { wrapper }
    );
    const cell = screen.getByRole('gridcell');
    expect(cell.getAttribute('aria-label')).toContain('1.2 cores');
  });

  it('handles sparse data gracefully (missing hours shown as empty)', () => {
    const data = [
      { report_date: '2026-06-23', hour: 12, value: 500 },
    ];
    const { container } = render(
      <UtilizationHeatmap data={data} maxValue={500} metricLabel="mCPU" entityLabel="test-vm" />,
      { wrapper }
    );
    const gridcells = screen.getAllByRole('gridcell');
    expect(gridcells.length).toBe(1);
    const allDivs = container.querySelectorAll('div[style]');
    expect(allDivs.length).toBeGreaterThan(1);
  });
});
