import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { GpuUtilizationRadarChart } from './gpuUtilizationRadarChart';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('GpuUtilizationRadarChart', () => {
  it('renders all 4 data points in the accessibility table', () => {
    render(
      <GpuUtilizationRadarChart
        smActiveAvg={0.72}
        tensorPipeActiveAvg={0.45}
        dramActiveAvg={0.31}
        fbUsageMaxMib={61440}
        totalFbMib={81920}
      />,
      { wrapper }
    );
    const table = screen.getByRole('table', { name: /GPU Subsystem Utilization/i });
    expect(table).toBeTruthy();

    const rows = table.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(4);

    expect(rows[0].textContent).toContain('SM Activity');
    expect(rows[0].textContent).toContain('72%');
    expect(rows[1].textContent).toContain('Tensor Core');
    expect(rows[1].textContent).toContain('45%');
    expect(rows[2].textContent).toContain('DRAM Bandwidth');
    expect(rows[2].textContent).toContain('31%');
    expect(rows[3].textContent).toContain('VRAM Usage');
    expect(rows[3].textContent).toContain('75%');
  });

  it('handles zero values (all subsystems idle)', () => {
    render(
      <GpuUtilizationRadarChart
        smActiveAvg={0}
        tensorPipeActiveAvg={0}
        dramActiveAvg={0}
        fbUsageMaxMib={0}
        totalFbMib={81920}
      />,
      { wrapper }
    );
    const table = screen.getByRole('table', { name: /GPU Subsystem Utilization/i });
    const rows = table.querySelectorAll('tbody tr');
    for (const row of rows) {
      expect(row.textContent).toContain('0%');
    }
  });

  it('handles missing/null values gracefully (defaults to 0)', () => {
    render(
      <GpuUtilizationRadarChart
        smActiveAvg={0.5}
        tensorPipeActiveAvg={undefined}
        dramActiveAvg={undefined}
        fbUsageMaxMib={undefined}
        totalFbMib={undefined}
      />,
      { wrapper }
    );
    const table = screen.getByRole('table', { name: /GPU Subsystem Utilization/i });
    const rows = table.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('50%');
    expect(rows[1].textContent).toContain('0%');
    expect(rows[2].textContent).toContain('0%');
    expect(rows[3].textContent).toContain('0%');
  });

  it('handles totalFbMib=0 (no VRAM data)', () => {
    render(
      <GpuUtilizationRadarChart
        smActiveAvg={0.8}
        tensorPipeActiveAvg={0.6}
        dramActiveAvg={0.4}
        fbUsageMaxMib={40960}
        totalFbMib={0}
      />,
      { wrapper }
    );
    const table = screen.getByRole('table', { name: /GPU Subsystem Utilization/i });
    const rows = table.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('80%');
    expect(rows[1].textContent).toContain('60%');
    expect(rows[2].textContent).toContain('40%');
    expect(rows[3].textContent).toContain('0%');
  });

  it('clamps values greater than 1 to 100%', () => {
    render(
      <GpuUtilizationRadarChart
        smActiveAvg={1.5}
        tensorPipeActiveAvg={0.3}
        dramActiveAvg={0.2}
        fbUsageMaxMib={90000}
        totalFbMib={81920}
      />,
      { wrapper }
    );
    const table = screen.getByRole('table', { name: /GPU Subsystem Utilization/i });
    const rows = table.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('100%');
    expect(rows[3].textContent).toContain('100%');
  });

  it('renders the SVG chart', () => {
    const { container } = render(
      <GpuUtilizationRadarChart
        smActiveAvg={0.5}
        tensorPipeActiveAvg={0.5}
        dramActiveAvg={0.5}
        fbUsageMaxMib={40960}
        totalFbMib={81920}
      />,
      { wrapper }
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders correct percentage labels in the accessibility table', () => {
    render(
      <GpuUtilizationRadarChart
        smActiveAvg={0.123}
        tensorPipeActiveAvg={0.999}
        dramActiveAvg={0.001}
        fbUsageMaxMib={1}
        totalFbMib={100}
      />,
      { wrapper }
    );
    const table = screen.getByRole('table', { name: /GPU Subsystem Utilization/i });
    const rows = table.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('12%');
    expect(rows[1].textContent).toContain('100%');
    expect(rows[2].textContent).toContain('0%');
    expect(rows[3].textContent).toContain('1%');
  });
});
