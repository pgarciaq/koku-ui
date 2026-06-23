import { TAB_KEY_TO_INDEX } from './useOptimizationsTabUrl';

describe('useOptimizationsTabUrl constants', () => {
  it('maps storage tab to index 4', () => {
    expect(TAB_KEY_TO_INDEX.storage).toBe(4);
  });

  it('maps quota tab to index 5', () => {
    expect(TAB_KEY_TO_INDEX.quota).toBe(5);
  });

  it('maps node tab to index 3', () => {
    expect(TAB_KEY_TO_INDEX.node).toBe(3);
  });
});
