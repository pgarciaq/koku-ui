import { handleOnSetPage } from './query';

describe('handleOnSetPage', () => {
  const baseQuery = {
    limit: 10,
    offset: 0,
    order_by: { last_reported: 'desc' },
  };

  const reportWithCursor = {
    meta: {
      count: 100,
      limit: 10,
      offset: 0,
      has_next: true,
      next_cursor: 'opaque-cursor-token',
    },
  } as any;

  it('prefers next_cursor when advancing to the next page', () => {
    const result = handleOnSetPage(baseQuery, reportWithCursor, 2, true);
    expect(result.after).toBe('opaque-cursor-token');
    expect(result.offset).toBeUndefined();
    expect(result.limit).toBe(10);
  });

  it('clears cursor when returning to the first page', () => {
    const pagedQuery = { ...baseQuery, after: 'opaque-cursor-token' };
    const result = handleOnSetPage(pagedQuery, reportWithCursor, 1, true);
    expect(result.after).toBeUndefined();
    expect(result.offset).toBe(0);
  });

  it('falls back to offset for backward navigation without a cursor stack', () => {
    const pagedQuery = { ...baseQuery, offset: 10 };
    const result = handleOnSetPage(pagedQuery, { meta: { ...reportWithCursor.meta, offset: 10 } }, 1, true);
    expect(result.after).toBeUndefined();
    expect(result.offset).toBe(0);
  });
});
