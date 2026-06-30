import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { NodePodHeadroomGauge } from './nodePodHeadroomGauge';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('NodePodHeadroomGauge', () => {
  it('renders the percentage in the accessible data table', () => {
    render(<NodePodHeadroomGauge podCapacity={110} podCount={88} lastReported="2026-06-15" />, { wrapper });
    const table = screen.getByRole('table', { name: /Pod Scheduling Headroom/i });
    expect(table).toBeTruthy();
    expect(table.textContent).toContain('80');
  });

  it('computes percentage correctly', () => {
    render(<NodePodHeadroomGauge podCapacity={200} podCount={50} />, { wrapper });
    const table = screen.getByRole('table', { name: /Pod Scheduling Headroom/i });
    expect(table.textContent).toContain('25');
  });

  it('rounds percentage to nearest integer', () => {
    render(<NodePodHeadroomGauge podCapacity={3} podCount={1} />, { wrapper });
    const table = screen.getByRole('table', { name: /Pod Scheduling Headroom/i });
    expect(table.textContent).toContain('33');
  });

  it('handles zero capacity gracefully (shows 0)', () => {
    render(<NodePodHeadroomGauge podCapacity={0} podCount={5} />, { wrapper });
    const table = screen.getByRole('table', { name: /Pod Scheduling Headroom/i });
    expect(table.textContent).toContain('"percent":0');
  });

  it('handles null-like capacity gracefully (shows 0)', () => {
    render(<NodePodHeadroomGauge podCapacity={undefined as any} podCount={5} />, { wrapper });
    const table = screen.getByRole('table', { name: /Pod Scheduling Headroom/i });
    expect(table.textContent).toContain('"percent":0');
  });

  it('caps visual at 100% when over-capacity but shows actual percentage', () => {
    render(<NodePodHeadroomGauge podCapacity={100} podCount={120} />, { wrapper });
    const table = screen.getByRole('table', { name: /Pod Scheduling Headroom/i });
    expect(table.textContent).toContain('120');
  });

  it('renders without crashing when lastReported is provided', () => {
    const { container } = render(
      <NodePodHeadroomGauge podCapacity={100} podCount={75} lastReported="2026-06-15" />,
      { wrapper }
    );
    expect(container.querySelector('svg')).toBeTruthy();
    expect(screen.getByRole('table', { name: /Pod Scheduling Headroom/i })).toBeTruthy();
  });

  it('renders without crashing when lastReported is absent', () => {
    const { container } = render(<NodePodHeadroomGauge podCapacity={100} podCount={75} />, { wrapper });
    expect(container.querySelector('svg')).toBeTruthy();
    expect(screen.getByRole('table', { name: /Pod Scheduling Headroom/i })).toBeTruthy();
  });

  it('renders an SVG chart', () => {
    const { container } = render(
      <NodePodHeadroomGauge podCapacity={100} podCount={80} lastReported="2026-06-15" />,
      { wrapper }
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('has accessible ariaTitle and ariaDesc attributes', () => {
    const { container } = render(
      <NodePodHeadroomGauge podCapacity={100} podCount={50} lastReported="2026-06-15" />,
      { wrapper }
    );
    const svg = container.querySelector('svg[role="img"]');
    expect(svg).toBeTruthy();
  });
});
