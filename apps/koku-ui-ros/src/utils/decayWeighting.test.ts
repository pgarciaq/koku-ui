import { decayWeight, generateDecayCurvePoints } from './decayWeighting';

describe('decayWeight', () => {
  it('returns 1 for day zero', () => {
    expect(decayWeight(0, 168)).toBe(1);
  });

  it('returns 1 when halfLifeHours is zero (uniform weighting)', () => {
    expect(decayWeight(5, 0)).toBe(1);
  });

  it('returns 1 when daysAgo is negative', () => {
    expect(decayWeight(-1, 168)).toBe(1);
  });

  it('returns 0.5 at the half-life point', () => {
    const halfLifeHours = 168; // 7 days
    const daysAgo = 7;
    expect(decayWeight(daysAgo, halfLifeHours)).toBeCloseTo(0.5, 10);
  });

  it('returns 0.25 at two half-lives', () => {
    const halfLifeHours = 168; // 7 days
    const daysAgo = 14;
    expect(decayWeight(daysAgo, halfLifeHours)).toBeCloseTo(0.25, 10);
  });

  it('returns close to 1 for small daysAgo relative to half-life', () => {
    expect(decayWeight(0.01, 8760)).toBeGreaterThan(0.999);
  });

  it('returns close to 0 for large daysAgo relative to half-life', () => {
    expect(decayWeight(365, 24)).toBeLessThan(0.001);
  });
});

describe('generateDecayCurvePoints', () => {
  it('returns empty array for zero windowDays', () => {
    expect(generateDecayCurvePoints(168, 0)).toEqual([]);
  });

  it('generates correct number of points', () => {
    const points = generateDecayCurvePoints(168, 15, 30);
    expect(points).toHaveLength(31); // 0..30 inclusive
  });

  it('starts with weight 1 at day 0', () => {
    const points = generateDecayCurvePoints(168, 15);
    expect(points[0].day).toBe(0);
    expect(points[0].weight).toBe(1);
  });

  it('has decreasing weights for positive half-life', () => {
    const points = generateDecayCurvePoints(168, 15, 10);
    for (let i = 1; i < points.length; i++) {
      expect(points[i].weight).toBeLessThanOrEqual(points[i - 1].weight);
    }
  });

  it('produces uniform weights (all 1) when halfLifeHours is 0', () => {
    const points = generateDecayCurvePoints(0, 15, 10);
    for (const point of points) {
      expect(point.weight).toBe(1);
    }
  });

  it('last point day is close to windowDays', () => {
    const points = generateDecayCurvePoints(168, 15, 60);
    const lastPoint = points[points.length - 1];
    expect(lastPoint.day).toBeCloseTo(15, 1);
  });
});
