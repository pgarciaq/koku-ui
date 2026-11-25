import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { NotificationWarningIcon } from '.';
import { Recommendations } from 'api/ros/recommendations';

// The compiled catalog the production provider loads — the tested path is
// the real one (defaultMessage fallback only fires for locales missing ids).
import catalog from '../../../locales/data.json';

const enMessages = (catalog as { en: Record<string, unknown> }).en;

const recsWithCodes = (codes: number[]): Recommendations =>
  ({ notification_codes: codes } as unknown as Recommendations);

const recsWithNested = (codes: number[]): Recommendations =>
  ({
    recommendation_terms: {
      short_term: {
        recommendation_engines: {
          cost: {
            notifications: Object.fromEntries(
              codes.map(code => [
                String(code),
                { code, type: 'WARNING', message: `nested ${code}` },
              ])
            ),
          },
        },
      },
    },
  } as unknown as Recommendations);

const renderIcon = (props: Parameters<typeof NotificationWarningIcon>[0]) =>
  render(
    <IntlProvider locale="en" messages={enMessages}>
      <NotificationWarningIcon {...props} />
    </IntlProvider>
  );

const hover = () => {
  fireEvent.mouseEnter(screen.getByTestId('notification-warning-icon'));
  // PatternFly Tooltip shows its content after the default 300ms entry delay.
  act(() => {
    jest.advanceTimersByTime(350);
  });
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('DEBUG-DUMP dom', () => {
    const { container } = renderIcon({ recommendations: recsWithCodes([7]) });
    hover();
    // eslint-disable-next-line no-console
    console.log('BODYLEN:', document.body.innerHTML.length, 'HAS_TOOLTIP_DIV:', document.body.innerHTML.includes('pf-v6-c-tooltip'), 'HAS_TEXT:', document.body.innerHTML.includes('Less than'), document.body.innerHTML);
  });
// DEBUG-DUMP
describe('NotificationWarningIcon', () => {
  it('renders no icon when there are no notifications', () => {
    const { container } = renderIcon({ recommendations: recsWithCodes([]) });
    expect(container.querySelector('[data-testid="notification-warning-icon"]')).toBeNull();
  });

  it('renders no icon for optimized-only codes when filtering (#879 close criterion)', () => {
    const { container } = renderIcon({
      recommendations: recsWithCodes([323004, 324003]),
      isFilterNotifications: true,
    });
    expect(container.querySelector('[data-testid="notification-warning-icon"]')).toBeNull();
  });

  it('tooltip lists the meanings of the non-benign codes (#879 close criterion)', () => {
    renderIcon({
      recommendations: recsWithCodes([323004, 7, 86]),
      isFilterNotifications: true,
    });
    hover();
    // The optimized-only code is not listed; the non-benign ones are.
    expect(screen.getByText('< 24h of data')).not.toBeNull();
    expect(screen.getByText('Unstable container (frequent restarts)')).not.toBeNull();
    expect(screen.queryByText(/optimised/i)).toBeNull();
  });

  it('falls back to a generic message for codes missing from the map', () => {
    renderIcon({ recommendations: recsWithCodes([9999]) });
    hover();
    expect(
      screen.getByText((_, el) => el?.textContent === 'Notification code: 9999')
    ).not.toBeNull();
  });

  it('collects codes from nested engine notifications when the array is absent', () => {
    renderIcon({ recommendations: recsWithNested([7]) });
    hover();
    expect(screen.getByText('< 24h of data')).not.toBeNull();
  });
});
