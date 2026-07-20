import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { DecayInfoCard } from './decayInfoCard';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('DecayInfoCard', () => {
  it('renders the card with decay info', () => {
    render(<DecayInfoCard halfLifeHours={168} termName="medium" windowDays={7} />, { wrapper });
    expect(screen.getByTestId('decay-info-card')).toBeTruthy();
    expect(screen.getByText(/Decay weighting/i)).toBeTruthy();
  });

  it('displays half-life value', () => {
    render(<DecayInfoCard halfLifeHours={168} termName="medium" windowDays={7} />, { wrapper });
    expect(screen.getByText(/168h/)).toBeTruthy();
  });

  it('displays the term name', () => {
    render(<DecayInfoCard halfLifeHours={360} termName="long" windowDays={15} />, { wrapper });
    expect(screen.getByText(/long/)).toBeTruthy();
  });

  it('does not show tooltip icon when halfLifeHours is 0 (uniform)', () => {
    const { container } = render(
      <DecayInfoCard halfLifeHours={0} termName="short" windowDays={1} />,
      { wrapper }
    );
    const svgIcons = container.querySelectorAll('svg[data-testid]');
    expect(svgIcons.length).toBe(0);
  });

  it('renders with zero half-life hours', () => {
    render(<DecayInfoCard halfLifeHours={0} termName="short" windowDays={1} />, { wrapper });
    expect(screen.getByTestId('decay-info-card')).toBeTruthy();
    expect(screen.getByText(/0h/)).toBeTruthy();
  });
});
