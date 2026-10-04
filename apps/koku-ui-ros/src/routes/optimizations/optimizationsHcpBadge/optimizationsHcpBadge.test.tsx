import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { FetchStatus } from 'store/common';

import OptimizationsHcpBadge from './optimizationsHcpBadge';

const mockUseSelector = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector: any) => mockUseSelector(selector),
}));

jest.mock('store/ros', () => ({
  rosActions: {
    fetchRosReport: jest.fn(),
  },
  rosSelectors: {
    selectRos: jest.fn(),
    selectRosFetchStatus: jest.fn(),
    selectRosError: jest.fn(),
  },
}));

describe('OptimizationsHcpBadge', () => {
  beforeEach(() => {
    mockUseSelector.mockImplementation(() => undefined);
  });

  test('renders the HCP recommendation count', () => {
    mockUseSelector
      .mockImplementationOnce(() => ({ meta: { count: 3 } }))
      .mockImplementationOnce(() => FetchStatus.complete)
      .mockImplementationOnce(() => undefined);

    render(
      <IntlProvider locale="en">
        <OptimizationsHcpBadge cluster="cluster-a" />
      </IntlProvider>
    );

    expect(screen.getByText('3')).toBeTruthy();
  });

  test('renders nothing when count is zero', () => {
    mockUseSelector
      .mockImplementationOnce(() => ({ meta: { count: 0 } }))
      .mockImplementationOnce(() => FetchStatus.complete)
      .mockImplementationOnce(() => undefined);

    const { container } = render(
      <IntlProvider locale="en">
        <OptimizationsHcpBadge cluster="cluster-a" />
      </IntlProvider>
    );

    expect(container.textContent).toBe('');
  });
});
