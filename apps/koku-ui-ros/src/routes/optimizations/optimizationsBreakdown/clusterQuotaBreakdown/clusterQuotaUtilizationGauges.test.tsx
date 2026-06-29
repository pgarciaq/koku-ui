import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { ClusterQuotaUtilizationGauges } from './clusterQuotaUtilizationGauges';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('ClusterQuotaUtilizationGauges', () => {
  it('renders all three gauges when all resources have valid hard limits', () => {
    const { container } = render(
      <ClusterQuotaUtilizationGauges
        quotaHard={{ cpu_limit_millicores: 4000, memory_limit_bytes: 8 * 1024 ** 3, pods: 20 }}
        quotaUsed={{ cpu_limit_millicores: 2000, memory_limit_bytes: 4 * 1024 ** 3, pods: 10 }}
      />,
      { wrapper }
    );
    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(3);
    expect(container.querySelectorAll('svg[role="img"]')).toHaveLength(3);
  });

  it('renders two gauges when pods hard limit is missing', () => {
    render(
      <ClusterQuotaUtilizationGauges
        quotaHard={{ cpu_limit_millicores: 4000, memory_limit_bytes: 8 * 1024 ** 3 }}
        quotaUsed={{ cpu_limit_millicores: 2000, memory_limit_bytes: 4 * 1024 ** 3 }}
      />,
      { wrapper }
    );
    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(2);
  });

  it('renders one gauge when only CPU has a valid hard limit', () => {
    render(
      <ClusterQuotaUtilizationGauges
        quotaHard={{ cpu_limit_millicores: 4000 }}
        quotaUsed={{ cpu_limit_millicores: 3400 }}
      />,
      { wrapper }
    );
    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(1);
    expect(tables[0].textContent).toContain('85%');
  });

  it('renders nothing when no resources have valid hard limits', () => {
    const { container } = render(
      <ClusterQuotaUtilizationGauges
        quotaHard={{ cpu_limit_millicores: 0, memory_limit_bytes: 0, pods: 0 }}
        quotaUsed={{ cpu_limit_millicores: 100, memory_limit_bytes: 500, pods: 2 }}
      />,
      { wrapper }
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when quotaHard is undefined', () => {
    const { container } = render(<ClusterQuotaUtilizationGauges />, { wrapper });
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when quotaHard is null-ish', () => {
    const { container } = render(
      <ClusterQuotaUtilizationGauges quotaHard={undefined} quotaUsed={undefined} />,
      { wrapper }
    );
    expect(container.innerHTML).toBe('');
  });

  it('computes correct percentage from quotaHard and quotaUsed', () => {
    render(
      <ClusterQuotaUtilizationGauges
        quotaHard={{ cpu_limit_millicores: 1000 }}
        quotaUsed={{ cpu_limit_millicores: 500 }}
      />,
      { wrapper }
    );
    const table = screen.getByRole('table');
    expect(table.textContent).toContain('50%');
  });

  it('uses utilization percents when provided instead of computing', () => {
    render(
      <ClusterQuotaUtilizationGauges
        quotaHard={{ cpu_limit_millicores: 1000 }}
        quotaUsed={{ cpu_limit_millicores: 500 }}
        utilization={{ cpu_limit_percent: 77 }}
      />,
      { wrapper }
    );
    const table = screen.getByRole('table');
    expect(table.textContent).toContain('77%');
  });

  it('shows 0% when usage is zero', () => {
    render(
      <ClusterQuotaUtilizationGauges
        quotaHard={{ cpu_limit_millicores: 4000 }}
        quotaUsed={{ cpu_limit_millicores: 0 }}
      />,
      { wrapper }
    );
    const table = screen.getByRole('table');
    expect(table.textContent).toContain('0%');
  });

  it('shows over-100% label when usage exceeds hard limit', () => {
    render(
      <ClusterQuotaUtilizationGauges
        quotaHard={{ pods: 10 }}
        quotaUsed={{ pods: 12 }}
      />,
      { wrapper }
    );
    const table = screen.getByRole('table');
    expect(table.textContent).toContain('120%');
  });

  it('displays the subtitle with used/hard values', () => {
    const { container } = render(
      <ClusterQuotaUtilizationGauges
        quotaHard={{ pods: 20 }}
        quotaUsed={{ pods: 15 }}
      />,
      { wrapper }
    );
    expect(container.textContent).toContain('15');
    expect(container.textContent).toContain('20');
  });

  it('formats CPU in cores when >= 1000 millicores', () => {
    const { container } = render(
      <ClusterQuotaUtilizationGauges
        quotaHard={{ cpu_limit_millicores: 4000 }}
        quotaUsed={{ cpu_limit_millicores: 2000 }}
      />,
      { wrapper }
    );
    expect(container.textContent).toContain('2');
    expect(container.textContent).toContain('4');
  });

  it('formats CPU in millicores when < 1000', () => {
    const { container } = render(
      <ClusterQuotaUtilizationGauges
        quotaHard={{ cpu_limit_millicores: 500 }}
        quotaUsed={{ cpu_limit_millicores: 250 }}
      />,
      { wrapper }
    );
    expect(container.textContent).toContain('250m');
    expect(container.textContent).toContain('500m');
  });

  it('formats memory in GiB', () => {
    const { container } = render(
      <ClusterQuotaUtilizationGauges
        quotaHard={{ memory_limit_bytes: 8 * 1024 ** 3 }}
        quotaUsed={{ memory_limit_bytes: 6.5 * 1024 ** 3 }}
      />,
      { wrapper }
    );
    expect(container.textContent).toContain('6.5 GiB');
    expect(container.textContent).toContain('8 GiB');
  });
});
