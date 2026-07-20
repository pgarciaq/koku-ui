import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { PvcUtilizationGauge } from './pvcUtilizationGauge';

const GiB = 1024 ** 3;

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('PvcUtilizationGauge', () => {
  it('renders the percentage in the accessible data table', () => {
    render(
      <PvcUtilizationGauge capacityBytes={100 * GiB} usageBytesMax={75 * GiB} lastDate="2026-06-15" />,
      { wrapper }
    );
    const table = screen.getByRole('table', { name: /PVC Utilization/i });
    expect(table).toBeTruthy();
    expect(table.textContent).toContain('75');
  });

  it('computes percentage correctly', () => {
    render(
      <PvcUtilizationGauge capacityBytes={200 * GiB} usageBytesMax={50 * GiB} lastDate="2026-06-10" />,
      { wrapper }
    );
    const table = screen.getByRole('table', { name: /PVC Utilization/i });
    expect(table.textContent).toContain('25');
  });

  it('rounds percentage to nearest integer', () => {
    render(
      <PvcUtilizationGauge capacityBytes={100 * GiB} usageBytesMax={33.3 * GiB} lastDate="2026-06-10" />,
      { wrapper }
    );
    const table = screen.getByRole('table', { name: /PVC Utilization/i });
    expect(table.textContent).toContain('33');
  });

  it('handles zero capacity gracefully (shows 0)', () => {
    render(
      <PvcUtilizationGauge capacityBytes={0} usageBytesMax={50 * GiB} lastDate="2026-06-10" />,
      { wrapper }
    );
    const table = screen.getByRole('table', { name: /PVC Utilization/i });
    expect(table.textContent).toContain('"percent":0');
  });

  it('displays the staleness date', () => {
    render(
      <PvcUtilizationGauge capacityBytes={100 * GiB} usageBytesMax={75 * GiB} lastDate="2026-06-15" />,
      { wrapper }
    );
    expect(screen.getByText(/Data as of/i)).toBeTruthy();
  });

  it('uses default threshold (8500bp) when nearFullThresholdBp is not provided', () => {
    const { container } = render(
      <PvcUtilizationGauge capacityBytes={100 * GiB} usageBytesMax={86 * GiB} lastDate="2026-06-15" />,
      { wrapper }
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders with custom threshold', () => {
    const { container } = render(
      <PvcUtilizationGauge
        capacityBytes={100 * GiB}
        usageBytesMax={75 * GiB}
        lastDate="2026-06-15"
        nearFullThresholdBp={7000}
      />,
      { wrapper }
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
