import { fireEvent, render, screen } from '@testing-library/react';
import { HcpSummaryStrip } from './hcpSummaryStrip';

const groups = [
  {
    hosted_cluster_id: 'hc-1',
    count: 66,
    estimated_savings: { value: '8157.61', units: 'USD' },
  },
  {
    hosted_cluster_id: 'hc-2',
    count: 12,
    estimated_savings: null,
  },
];

describe('HcpSummaryStrip', () => {
  test('renders one chip per hosted cluster with count and savings', () => {
    render(<HcpSummaryStrip groups={groups} onSelect={() => undefined} />);

    expect(screen.getByText('hc-1')).toBeInTheDocument();
    expect(screen.getByText('hc-2')).toBeInTheDocument();
    expect(screen.getAllByText(/66/).length).toBeGreaterThan(0);
  });

  test('chip click selects the hosted cluster', () => {
    const onSelect = jest.fn();
    render(<HcpSummaryStrip groups={groups} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('hc-2'));
    expect(onSelect).toHaveBeenCalledWith('hc-2');
  });

  test('renders nothing without groups', () => {
    const { container } = render(<HcpSummaryStrip groups={[]} onSelect={() => undefined} />);

    expect(container).toBeEmptyDOMElement();
  });
});
