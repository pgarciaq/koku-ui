import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { GpuVramUtilizationGauge } from './gpuVramUtilizationGauge';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('GpuVramUtilizationGauge', () => {
  it('renders the percentage in the accessible data table', () => {
    render(<GpuVramUtilizationGauge fbUsageMaxMib={20480} totalFbMib={81920} />, { wrapper });
    const table = screen.getByRole('table', { name: /VRAM Utilization/i });
    expect(table).toBeTruthy();
    expect(table.textContent).toContain('25');
  });

  it('computes percentage correctly', () => {
    render(<GpuVramUtilizationGauge fbUsageMaxMib={40960} totalFbMib={81920} />, { wrapper });
    const table = screen.getByRole('table', { name: /VRAM Utilization/i });
    expect(table.textContent).toContain('50');
  });

  it('returns null when totalFbMib is undefined', () => {
    const { container } = render(<GpuVramUtilizationGauge fbUsageMaxMib={8192} totalFbMib={undefined} />, { wrapper });
    expect(container.innerHTML).toBe('');
  });

  it('returns null when totalFbMib is null', () => {
    const { container } = render(<GpuVramUtilizationGauge fbUsageMaxMib={8192} totalFbMib={null} />, { wrapper });
    expect(container.innerHTML).toBe('');
  });

  it('returns null when totalFbMib is zero', () => {
    const { container } = render(<GpuVramUtilizationGauge fbUsageMaxMib={8192} totalFbMib={0} />, { wrapper });
    expect(container.innerHTML).toBe('');
  });

  it('handles zero usage (shows 0%)', () => {
    render(<GpuVramUtilizationGauge fbUsageMaxMib={0} totalFbMib={81920} />, { wrapper });
    const table = screen.getByRole('table', { name: /VRAM Utilization/i });
    expect(table.textContent).toContain('0');
  });

  it('caps visual at 100% when usage exceeds capacity', () => {
    const { container } = render(<GpuVramUtilizationGauge fbUsageMaxMib={90000} totalFbMib={81920} />, { wrapper });
    expect(container.querySelector('svg')).toBeTruthy();
    const table = screen.getByRole('table', { name: /VRAM Utilization/i });
    expect(table.textContent).toContain('110');
  });

  it('renders the SVG chart', () => {
    const { container } = render(<GpuVramUtilizationGauge fbUsageMaxMib={69632} totalFbMib={81920} />, { wrapper });
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
