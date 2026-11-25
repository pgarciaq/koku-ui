// These tests run UNDER the automatic src/__mocks__/react-intl.ts — like
// every component test in this app — and pin the mock's contract (#938):
// formatMessage must behave like the real implementation (interpolation,
// missing-value errors), while the date methods stay stubbed for snapshot
// stability.
//
// Real missing-value behavior (probed against requireActual react-intl,
// 2026-11-25): a placeholder without a value raises MissingValueError ->
// FORMAT_ERROR via onError; the app's runtime (src/components/i18n/intl.ts)
// rethrows non-MISSING_TRANSLATION errors, and the mock mirrors that — so a
// broken placeholder fails the test instead of silently rendering the
// message with raw placeholders plus a params-JSON suffix (the old mock's
// behavior, which masked such bugs).
import { render } from '@testing-library/react';
import React from 'react';
import { useIntl } from 'react-intl';

interface ProbeProps {
  id: string;
  defaultMessage: string;
  values?: Record<string, React.ReactNode>;
}

const Probe = ({ id, defaultMessage, values }: ProbeProps) => {
  const intl = useIntl();
  try {
    return (
      <div data-testid="probe">{String(intl.formatMessage({ id, defaultMessage }, values))}</div>
    );
  } catch (e) {
    return <div data-testid="probe">THREW: {String(e)}</div>;
  }
};

const DateProbe = () => {
  const intl = useIntl();
  return <div data-testid="probe">{String(intl.formatDate(new Date()))}</div>;
};

describe('react-intl automatic mock (#938)', () => {
  it('formatMessage interpolates ICU placeholders like the real implementation', () => {
    const { getByTestId } = render(
      <Probe id="a" defaultMessage="Value {value} of {total}" values={{ value: 42, total: 100 }} />
    );
    expect(getByTestId('probe').textContent).toBe('Value 42 of 100');
  });

  it('a broken placeholder (missing value) fails instead of silently appending params JSON', () => {
    const { getByTestId } = render(
      <Probe id="b" defaultMessage="Hello {name} and {other}" values={{ name: 'X' }} />
    );
    expect(getByTestId('probe').textContent?.startsWith('THREW:')).toBe(true);
  });

  it('date formatting stays stubbed for snapshot stability (close criterion 3)', () => {
    const { getByTestId } = render(<DateProbe />);
    expect(getByTestId('probe').textContent).toBe('');
  });
});
