import type { PvcHistoricalUsagePoint } from 'api/ros/recommendations';

import { computeProjectionPoints } from './pvcBreakdownUsageChart';

const GiB = 1024 ** 3;

const makeHistory = (days: number, baseAvg = 10 * GiB, capacity = 100 * GiB): PvcHistoricalUsagePoint[] =>
  Array.from({ length: days }, (_, i) => {
    const d = new Date('2026-06-01');
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      capacity_bytes: capacity,
      usage_bytes_avg: baseAvg + i * 0.1 * GiB,
      usage_bytes_max: baseAvg + i * 0.2 * GiB,
    };
  });

describe('computeProjectionPoints', () => {
  it('returns empty when historicalUsage is empty', () => {
    expect(computeProjectionPoints([], 1024, 30)).toEqual([]);
  });

  it('returns empty when growthBytesPerDay is zero', () => {
    expect(computeProjectionPoints(makeHistory(7), 0, 60)).toEqual([]);
  });

  it('returns empty when growthBytesPerDay is negative', () => {
    expect(computeProjectionPoints(makeHistory(7), -500, 60)).toEqual([]);
  });

  it('starts from the last historical average', () => {
    const history = makeHistory(7);
    const lastAvg = history[history.length - 1].usage_bytes_avg!;
    const points = computeProjectionPoints(history, 1 * GiB, 30);

    expect(points[0].y).toBeCloseTo(lastAvg / GiB, 5);
    expect(points[0].x).toBe(history[history.length - 1].date);
  });

  it('increments by growth rate per day', () => {
    const history = makeHistory(7);
    const growthBytes = 0.5 * GiB;
    const points = computeProjectionPoints(history, growthBytes, 10);

    for (let i = 1; i < points.length; i++) {
      const diff = points[i].y - points[i - 1].y;
      expect(diff).toBeCloseTo(0.5, 5);
    }
  });

  it('caps projection at 90 days when daysToFull exceeds horizon', () => {
    const history = makeHistory(7);
    const points = computeProjectionPoints(history, 0.1 * GiB, 500);
    expect(points.length).toBe(91); // 0..90 inclusive
  });

  it('uses daysToFull when it is within the horizon', () => {
    const history = makeHistory(7);
    const points = computeProjectionPoints(history, 0.1 * GiB, 20);
    expect(points.length).toBe(21); // 0..20 inclusive
  });

  it('uses 90-day horizon when daysToFull is null', () => {
    const history = makeHistory(7);
    const points = computeProjectionPoints(history, 0.1 * GiB, null);
    expect(points.length).toBe(91);
  });

  it('generates correct dates', () => {
    const history = makeHistory(3);
    const lastDate = history[history.length - 1].date;
    const points = computeProjectionPoints(history, 0.1 * GiB, 3);

    expect(points[0].x).toBe(lastDate);

    const expected = new Date(lastDate);
    expected.setDate(expected.getDate() + 1);
    expect(points[1].x).toBe(expected.toISOString().slice(0, 10));
  });
});
