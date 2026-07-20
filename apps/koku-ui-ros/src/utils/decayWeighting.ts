/**
 * Exponential decay weighting utilities for recommendation term settings.
 *
 * The decay curve follows: weight = 2^(-daysAgo / halfLifeDays)
 * where halfLifeDays = halfLifeHours / 24.
 *
 * A halfLifeHours of 0 means no decay (uniform weighting).
 */

export interface DecayCurvePoint {
  day: number;
  weight: number;
}

/**
 * Compute the decay weight for a data point `daysAgo` days in the past.
 *
 * @returns A value in [0, 1]. Returns 1 for all inputs when halfLifeHours is 0.
 */
export function decayWeight(daysAgo: number, halfLifeHours: number): number {
  if (halfLifeHours <= 0 || daysAgo <= 0) {
    return 1;
  }
  const halfLifeDays = halfLifeHours / 24;
  return Math.pow(2, -daysAgo / halfLifeDays);
}

/**
 * Generate an array of points suitable for rendering a decay curve chart.
 *
 * X-axis: days ago (0 → windowDays), Y-axis: weight (0 → 1).
 * Produces `numPoints` evenly-spaced samples plus the exact 0 and windowDays endpoints.
 */
export function generateDecayCurvePoints(
  halfLifeHours: number,
  windowDays: number,
  numPoints = 60
): DecayCurvePoint[] {
  if (windowDays <= 0) {
    return [];
  }

  const points: DecayCurvePoint[] = [];
  const step = windowDays / numPoints;

  for (let i = 0; i <= numPoints; i++) {
    const day = parseFloat((i * step).toFixed(4));
    points.push({ day, weight: decayWeight(day, halfLifeHours) });
  }

  return points;
}
