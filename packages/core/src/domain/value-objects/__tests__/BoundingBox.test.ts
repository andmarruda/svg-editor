import { describe, it, expect } from 'vitest';
import { BoundingBox } from '../BoundingBox';
import { Point } from '../Point';

describe('BoundingBox', () => {
  it('creates with of()', () => {
    expect(BoundingBox.of(1, 2, 10, 20)).toEqual({ x: 1, y: 2, width: 10, height: 20 });
  });

  it('throws on negative dimensions', () => {
    expect(() => BoundingBox.of(0, 0, -1, 10)).toThrow();
  });

  it('creates from two points', () => {
    const box = BoundingBox.fromPoints(Point.of(3, 7), Point.of(1, 2));
    expect(box).toEqual({ x: 1, y: 2, width: 2, height: 5 });
  });

  it('creates from LTRB', () => {
    expect(BoundingBox.fromLTRB(1, 2, 5, 8)).toEqual({ x: 1, y: 2, width: 4, height: 6 });
  });

  it('computes derived edges', () => {
    const b = BoundingBox.of(10, 20, 30, 40);
    expect(BoundingBox.left(b)).toBe(10);
    expect(BoundingBox.top(b)).toBe(20);
    expect(BoundingBox.right(b)).toBe(40);
    expect(BoundingBox.bottom(b)).toBe(60);
  });

  it('computes center', () => {
    const b = BoundingBox.of(0, 0, 10, 20);
    expect(BoundingBox.center(b)).toEqual({ x: 5, y: 10 });
  });

  it('computes corners', () => {
    const b = BoundingBox.of(1, 2, 4, 6);
    expect(BoundingBox.topLeft(b)).toEqual({ x: 1, y: 2 });
    expect(BoundingBox.topRight(b)).toEqual({ x: 5, y: 2 });
    expect(BoundingBox.bottomLeft(b)).toEqual({ x: 1, y: 8 });
    expect(BoundingBox.bottomRight(b)).toEqual({ x: 5, y: 8 });
  });

  it('unions two boxes', () => {
    const a = BoundingBox.of(0, 0, 10, 10);
    const b = BoundingBox.of(5, 5, 10, 10);
    expect(BoundingBox.union(a, b)).toEqual({ x: 0, y: 0, width: 15, height: 15 });
  });

  it('unionAll returns null for empty array', () => {
    expect(BoundingBox.unionAll([])).toBeNull();
  });

  it('unionAll of one returns itself', () => {
    const b = BoundingBox.of(1, 2, 3, 4);
    expect(BoundingBox.unionAll([b])).toEqual(b);
  });

  it('intersects overlapping boxes', () => {
    const a = BoundingBox.of(0, 0, 10, 10);
    const b = BoundingBox.of(5, 5, 10, 10);
    expect(BoundingBox.intersect(a, b)).toEqual({ x: 5, y: 5, width: 5, height: 5 });
  });

  it('intersect returns null for non-overlapping boxes', () => {
    const a = BoundingBox.of(0, 0, 5, 5);
    const b = BoundingBox.of(10, 10, 5, 5);
    expect(BoundingBox.intersect(a, b)).toBeNull();
  });

  it('containsPoint', () => {
    const b = BoundingBox.of(0, 0, 10, 10);
    expect(BoundingBox.containsPoint(b, Point.of(5, 5))).toBe(true);
    expect(BoundingBox.containsPoint(b, Point.of(11, 5))).toBe(false);
  });

  it('intersects returns bool', () => {
    const a = BoundingBox.of(0, 0, 10, 10);
    const b = BoundingBox.of(5, 5, 10, 10);
    const c = BoundingBox.of(20, 20, 5, 5);
    expect(BoundingBox.intersects(a, b)).toBe(true);
    expect(BoundingBox.intersects(a, c)).toBe(false);
  });

  it('contains checks if outer fully contains inner', () => {
    const outer = BoundingBox.of(0, 0, 20, 20);
    const inner = BoundingBox.of(5, 5, 10, 10);
    const outside = BoundingBox.of(15, 15, 10, 10);
    expect(BoundingBox.contains(outer, inner)).toBe(true);
    expect(BoundingBox.contains(outer, outside)).toBe(false);
  });

  it('expands by margin', () => {
    const b = BoundingBox.of(5, 5, 10, 10);
    expect(BoundingBox.expand(b, 2)).toEqual({ x: 3, y: 3, width: 14, height: 14 });
  });

  it('translates', () => {
    const b = BoundingBox.of(1, 2, 10, 10);
    expect(BoundingBox.translate(b, Point.of(3, 4))).toEqual({ x: 4, y: 6, width: 10, height: 10 });
  });

  it('checks equality', () => {
    const a = BoundingBox.of(1, 2, 3, 4);
    expect(BoundingBox.equals(a, { ...a })).toBe(true);
    expect(BoundingBox.equals(a, BoundingBox.of(1, 2, 3, 5))).toBe(false);
  });

  it('isEmpty when zero dimension', () => {
    expect(BoundingBox.isEmpty(BoundingBox.of(0, 0, 0, 10))).toBe(true);
    expect(BoundingBox.isEmpty(BoundingBox.of(0, 0, 10, 0))).toBe(true);
    expect(BoundingBox.isEmpty(BoundingBox.of(0, 0, 1, 1))).toBe(false);
  });
});
