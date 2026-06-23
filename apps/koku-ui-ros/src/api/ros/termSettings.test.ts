import { axiosInstance } from 'api';

import { fetchRecommendationTermSettings } from './termSettings';

jest.mock('api', () => ({
  axiosInstance: {
    get: jest.fn(),
  },
}));

describe('termSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches recommendation term settings for a plugin type', async () => {
    await fetchRecommendationTermSettings('pvc');
    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/recommendations/openshift/settings/terms?recommendation_type=pvc'
    );
  });
});
