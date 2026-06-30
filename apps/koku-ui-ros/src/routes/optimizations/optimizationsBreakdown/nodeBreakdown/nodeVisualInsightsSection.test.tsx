import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { NodeVisualInsightsSection } from './nodeVisualInsightsSection';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('NodeVisualInsightsSection', () => {
  it('renders the Visual Insights card with valid data', () => {
    render(<NodeVisualInsightsSection podCapacity={110} podCount={88} lastReported="2026-06-15" />, { wrapper });
    expect(screen.getByText('Visual Insights')).toBeTruthy();
    expect(screen.getByRole('table', { name: /Pod Scheduling Headroom/i })).toBeTruthy();
  });

  it('does not render when podCapacity is 0', () => {
    const { container } = render(<NodeVisualInsightsSection podCapacity={0} podCount={5} />, { wrapper });
    expect(container.innerHTML).toBe('');
  });

  it('does not render when podCapacity is negative', () => {
    const { container } = render(<NodeVisualInsightsSection podCapacity={-1} podCount={5} />, { wrapper });
    expect(container.innerHTML).toBe('');
  });

  it('renders gauge when podCount is 0 (empty node)', () => {
    render(<NodeVisualInsightsSection podCapacity={110} podCount={0} />, { wrapper });
    expect(screen.getByText('Visual Insights')).toBeTruthy();
    const table = screen.getByRole('table', { name: /Pod Scheduling Headroom/i });
    expect(table.textContent).toContain('"percent":0');
  });
});
