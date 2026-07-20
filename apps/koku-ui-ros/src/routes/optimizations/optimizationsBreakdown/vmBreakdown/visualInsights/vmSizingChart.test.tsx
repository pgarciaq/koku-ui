import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { VmSizingChart } from './vmSizingChart';

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));

jest.mock('routes/components/charts/theme', () => ({}));

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('VmSizingChart', () => {
  it('renders nothing when current is undefined', () => {
    const { container } = render(
      <VmSizingChart current={undefined} recommended={{ vcpu: 2, memory_gib: 4 }} />,
      { wrapper }
    );
    expect(container.querySelector('[data-testid="vm-sizing-chart"]')).toBeNull();
  });

  it('renders nothing when recommended is undefined', () => {
    const { container } = render(
      <VmSizingChart current={{ vcpu: 4, memory_gib: 8 }} recommended={undefined} />,
      { wrapper }
    );
    expect(container.querySelector('[data-testid="vm-sizing-chart"]')).toBeNull();
  });

  it('renders nothing when vcpu or memory_gib is null', () => {
    const { container } = render(
      <VmSizingChart current={{ vcpu: 4 }} recommended={{ vcpu: 2, memory_gib: 4 }} />,
      { wrapper }
    );
    expect(container.querySelector('[data-testid="vm-sizing-chart"]')).toBeNull();
  });

  it('renders chart when current > recommended (oversized)', () => {
    const { container } = render(
      <VmSizingChart
        current={{ vcpu: 8, memory_gib: 16 }}
        recommended={{ vcpu: 4, memory_gib: 8 }}
        estimatedMonthlySavings={{ value: '25.00', units: 'USD' }}
      />,
      { wrapper }
    );
    expect(container.querySelector('[data-testid="vm-sizing-chart"]')).toBeTruthy();
  });

  it('renders chart when current < recommended (undersized)', () => {
    const { container } = render(
      <VmSizingChart
        current={{ vcpu: 2, memory_gib: 4 }}
        recommended={{ vcpu: 4, memory_gib: 8 }}
      />,
      { wrapper }
    );
    expect(container.querySelector('[data-testid="vm-sizing-chart"]')).toBeTruthy();
  });

  it('displays savings callout when savings are positive', () => {
    render(
      <VmSizingChart
        current={{ vcpu: 8, memory_gib: 16 }}
        recommended={{ vcpu: 4, memory_gib: 8 }}
        estimatedMonthlySavings={{ value: '12.50', units: 'USD' }}
      />,
      { wrapper }
    );
    const savings = screen.getByTestId('vm-sizing-savings');
    expect(savings).toBeTruthy();
    expect(savings.textContent).toContain('$12.50');
  });

  it('hides savings callout when savings value is zero', () => {
    const { container } = render(
      <VmSizingChart
        current={{ vcpu: 4, memory_gib: 8 }}
        recommended={{ vcpu: 4, memory_gib: 8 }}
        estimatedMonthlySavings={{ value: '0.00', units: 'USD' }}
      />,
      { wrapper }
    );
    expect(container.querySelector('[data-testid="vm-sizing-savings"]')).toBeNull();
  });

  it('hides savings callout when savings is undefined', () => {
    const { container } = render(
      <VmSizingChart
        current={{ vcpu: 8, memory_gib: 16 }}
        recommended={{ vcpu: 4, memory_gib: 8 }}
        estimatedMonthlySavings={undefined}
      />,
      { wrapper }
    );
    expect(container.querySelector('[data-testid="vm-sizing-savings"]')).toBeNull();
  });
});
