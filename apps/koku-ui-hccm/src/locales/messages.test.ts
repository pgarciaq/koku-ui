import messages from './messages';

describe('breakdown localization', () => {
  test('breakdown localization messages are defined', () => {
    expect(messages.breakdownOther).toBeDefined();
    expect(messages.breakdownCloudCost).toBeDefined();
    expect(messages.rateName).toBeDefined();
    expect(messages.rateNameRequired).toBeDefined();
    expect(messages.rateNameTooLong).toBeDefined();
    expect(messages.rateNameDuplicate).toBeDefined();
  });
});
