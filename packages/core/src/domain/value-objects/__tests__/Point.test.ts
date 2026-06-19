import { describe, it, expect } from 'vitest';
import { Point } from '../Point';

describe('Point', () => {
  it('creates a point with of()', () => {
    const p = Point.of(3, 4);
    expect(p).toEqual({ x: 3, y: 4 });
  });

  it('ORIGIN is (0, 0)', () => {
    expect(Point.ORIGIN).toEqual({ x: 0, y: 0 });
  });

  it('adds two points', () => {
    expect(Point.add(Point.of(1, 2), Point.of(3, 4))).toEqual({ x: 4, y: 6 });
  });

  it('subtracts two points', () => {
    expect(Point.subtract(Point.of(5, 3), Point.of(2, 1))).toEqual({ x: 3, y: 2 });
  });

  it('scales a point', () => {
    expect(Point.scale(Point.of(2, 3), 2)).toEqual({ x: 4, y: 6 });
  });

  it('negates a point', () => {
    expect(Point.negate(Point.of(3, -4))).toEqual({ x: -3, y: 4 });
  });

  it('calculates distance', () => {
    expect(Point.distanceTo(Point.of(0, 0), Point.of(3, 4))).toBe(5);
  });

  it('lerps between two points', () => {
    const result = Point.lerp(Point.of(0, 0), Point.of(10, 20), 0.5);
    expect(result).toEqual({ x: 5, y: 10 });
  });

  it('lerp at t=0 returns a', () => {
    const a = Point.of(1, 2);
    expect(Point.lerp(a, Point.of(10, 20), 0)).toEqual(a);
  });

  it('lerp at t=1 returns b', () => {
    const b = Point.of(10, 20);
    expect(Point.lerp(Point.of(1, 2), b, 1)).toEqual(b);
  });

  it('checks equality', () => {
    expect(Point.equals(Point.of(1, 2), Point.of(1, 2))).toBe(true);
    expect(Point.equals(Point.of(1, 2), Point.of(1, 3))).toBe(false);
  });

  it('rounds a point', () => {
    expect(Point.round(Point.of(1.4, 2.6))).toEqual({ x: 1, y: 3 });
  });
});
