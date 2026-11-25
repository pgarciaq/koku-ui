/**
 * jest's automatic react-intl mock (#938).
 *
 * formatMessage delegates to a REAL react-intl instance so ICU placeholders
 * interpolate exactly like production, and missing placeholder values fail
 * tests (MissingValueError -> FORMAT_ERROR; the app's runtime rethrows
 * non-MISSING_TRANSLATION errors — src/components/i18n/intl.ts — and this
 * mock mirrors that). The previous implementation returned
 * `defaultMessage + JSON.stringify(params)`, which masked broken
 * placeholders and made catalog lookups appear dead (see #938).
 *
 * Known limitation: useIntl/createIntl return this fixed instance, so
 * messages passed to IntlProvider are not visible in tests — components
 * under test render via descriptor defaultMessages (the English catalog
 * text), which is what the assertions validate.
 *
 #939: hccm's __mocks__/react-intl.ts adopts this mechanism (preserving its
 * extra formatNumberToParts handling).
 */
const reactIntl = jest.requireActual('react-intl');

// Real formatting, no messages: components pass descriptors carrying
// defaultMessage — the path they actually use (#938 D2). Identical
// semantics to the compiled catalog for English, without coupling test
// output to locales/data.json freshness. MISSING_TRANSLATION is expected
// without messages and filtered, like the app's runtime.
const realIntl = reactIntl.createIntl(
  {
    locale: 'en',
    defaultLocale: 'en',
    onError: error => {
      if (error?.code === 'MISSING_TRANSLATION') {
        return;
      }
      throw error;
    },
  },
  reactIntl.createIntlCache()
);

const intl = {
  ...realIntl,
  formatDate: jest.fn(() => ''), // Dates won't match snapshots during PR builds
  formatDateTimeRange: jest.fn(() => ''), // Dates won't match snapshots during PR builds
  formatNumber: jest.fn(v => v),
};

module.exports = {
  ...reactIntl,
  createIntl: () => intl,
  defineMessages: jest.fn(v => v),
  // Real injectIntl (#938): the old jest.fn(v => v) silently unwrapped the
  // HOC, leaving injectIntl components (pageTitle, permissionsWrapper)
  // without an intl prop under test.
  injectIntl: reactIntl.injectIntl,
  useIntl: () => intl,
};
