import { TAB_KEY_TO_INDEX } from './useOptimizationsTabUrl';

describe('useOptimizationsTabUrl constants', () => {
  it('maps fleetSummary tab to index 0', () => {
    expect(TAB_KEY_TO_INDEX.fleetSummary).toBe(0);
  });

  it('maps storage tab to index 5', () => {
    expect(TAB_KEY_TO_INDEX.storage).toBe(5);
  });

  it('maps quota tab to index 7', () => {
    expect(TAB_KEY_TO_INDEX.quota).toBe(7);
  });

  it('maps node tab to index 4', () => {
    expect(TAB_KEY_TO_INDEX.node).toBe(4);
  });

  it('maps gpu tab to index 8', () => {
    expect(TAB_KEY_TO_INDEX.gpu).toBe(8);
  });
});
