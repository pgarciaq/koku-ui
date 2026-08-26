import { render, screen, waitFor } from '@testing-library/react';
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

import {
  buildGpuTimeslicingBreakdownSearch,
  OptimizationsGpuTimeslicingDataTable,
} from './optimizationsGpuTimeslicingDataTable';

describe('buildGpuTimeslicingBreakdownSearch', () => {
  test('includes gpu_model and list term when the row has no term', () => {
    const qs = buildGpuTimeslicingBreakdownSearch(
      {
        cluster_uuid: 'abc-123',
        node_name: 'gpu-node-1',
        gpu_model: 'A100-SXM4-40GB',
      },
      'short_term'
    );
    const params = new URLSearchParams(qs);
    expect(params.get('cluster_uuid')).toBe('abc-123');
    expect(params.get('node_name')).toBe('gpu-node-1');
    expect(params.get('gpu_model')).toBe('A100-SXM4-40GB');
    expect(params.get('term')).toBe('short_term');
  });

  test('prefers the row term over listTerm', () => {
    const qs = buildGpuTimeslicingBreakdownSearch(
      {
        cluster_uuid: 'c',
        node_name: 'n',
        gpu_model: 'T4',
        term: 'medium_term',
      },
      'short_term'
    );
    expect(new URLSearchParams(qs).get('term')).toBe('medium_term');
  });
});

describe('OptimizationsGpuTimeslicingDataTable', () => {
  test('passes gpu_model and term on the breakdown link', async () => {
    render(
      <IntlProvider locale="en" messages={messages.en}>
        <MemoryRouter>
          <OptimizationsGpuTimeslicingDataTable
            breakdownPath="/optimizations/gpu-timeslicing-breakdown"
            listTerm="short_term"
            onSort={jest.fn()}
            report={{
              meta: { count: 1, limit: 10, offset: 0 },
              data: [
                {
                  cluster_uuid: 'abc-123',
                  node_name: 'gpu-node-1',
                  gpu_model: 'A100-SXM4-40GB',
                  recommended_replicas: 4,
                  classification: 'oversized',
                },
              ],
            }}
            reportQueryString=""
          />
        </MemoryRouter>
      </IntlProvider>
    );

    const link = await waitFor(() => screen.getByRole('link', { name: 'A100-SXM4-40GB' }));
    expect(link).toHaveAttribute('href', expect.stringContaining('gpu_model=A100-SXM4-40GB'));
    expect(link).toHaveAttribute('href', expect.stringContaining('term=short_term'));
    expect(link).toHaveAttribute('href', expect.stringContaining('node_name=gpu-node-1'));
  });
});
