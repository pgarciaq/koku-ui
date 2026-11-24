import { render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

// eslint-disable-next-line no-restricted-imports
import messages from '../../../../../locales/data.json';

jest.mock('routes/components/dataTable', () => ({
  DataTable: ({ columns, rows }: { columns?: any[]; rows?: any[] }) => (
    <table data-testid="data-table">
      <thead>
        <tr>
          {columns?.map((col: { name: React.ReactNode }, i: number) => (
            <th key={i}>{col.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows?.map((row: { cells?: Array<{ value: React.ReactNode }> }, i: number) => (
          <tr key={i}>
            {row.cells?.map((cell, j) => (
              <td key={j}>{cell.value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

jest.mock('utils/dates', () => ({
  getTimeFromNow: jest.fn(() => 'recently'),
}));

import { OptimizationsHcpDataTable } from './optimizationsHcpDataTable';

// #930: `management` is the cluster-level topology class (#695), not a row
// flag. Hosted-scope rows on a management cluster carry management=true AND a
// populated hosted_cluster_id — the flat table's hosted cluster column must
// show the hosted cluster ID for those rows, and the management alias only
// for rows with no hosted association (management-overhead rows).

const renderTable = (data: any[]) =>
  render(
    <IntlProvider locale="en" messages={messages.en}>
      <MemoryRouter>
        <OptimizationsHcpDataTable
          breakdownPath="/optimizations/hcp-breakdown"
          onFilterAdded={jest.fn()}
          onSort={jest.fn()}
          report={{ meta: { count: data.length, limit: 10, offset: 0 }, data }}
          reportQueryString=""
        />
      </MemoryRouter>
    </IntlProvider>
  );

const baseItem = {
  cluster_uuid: 'mgmt-uuid',
  id: 'row-id',
  recommendations: {},
};

// The first body cell of the row identifiable by its namespace text.
const hostedCellOf = (namespaceText: string) => {
  const row = screen.getByText(namespaceText).closest('tr');
  const cells = within(row as HTMLElement).getAllByRole('cell');
  return cells[0];
};

describe('OptimizationsHcpDataTable flat view — the hosted cluster column (#930)', () => {
  test('hosted rows on a management cluster show the hosted cluster ID, not the management alias', async () => {
    renderTable([
      {
        ...baseItem,
        cluster_alias: 'demo-special',
        container: 'etcd',
        hosted_cluster_id: '8b4d1e72-6a55-4c3f-8b22-3c8d5e9f7a02',
        management: true,
        project: 'clusters-demo-hc2',
      },
    ]);
    await waitFor(() => screen.getByText('clusters-demo-hc2'));

    const cell = hostedCellOf('clusters-demo-hc2');
    const link = within(cell).getByRole('link');
    expect(link).toHaveTextContent('8b4d1e72-6a55-4c3f-8b22-3c8d5e9f7a02');
    expect(cell).not.toHaveTextContent('demo-special');
  });

  test('management-overhead rows (no hosted association) keep the management alias', async () => {
    renderTable([
      {
        ...baseItem,
        cluster_alias: 'demo-special',
        container: 'kube-apiserver',
        hosted_cluster_id: undefined,
        management: true,
        project: 'clusters-demo-mgmt',
      },
    ]);
    await waitFor(() => screen.getByText('clusters-demo-mgmt'));

    const cell = hostedCellOf('clusters-demo-mgmt');
    expect(cell).toHaveTextContent('demo-special');
    expect(within(cell).queryByRole('link')).toBeNull();
  });

  test('hosted rows on a non-management cluster keep showing the hosted cluster ID (regression)', async () => {
    renderTable([
      {
        ...baseItem,
        cluster_alias: 'other-cluster',
        container: 'etcd',
        hosted_cluster_id: '11111111-2222-3333-4444-555555555555',
        management: false,
        project: 'clusters-other-hc',
      },
    ]);
    await waitFor(() => screen.getByText('clusters-other-hc'));

    const cell = hostedCellOf('clusters-other-hc');
    const link = within(cell).getByRole('link');
    expect(link).toHaveTextContent('11111111-2222-3333-4444-555555555555');
  });
});
