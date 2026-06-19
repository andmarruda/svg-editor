import { describe, it, expect } from 'vitest';
import { Transform } from '../Transform';
import { Point } from '../Point';

const EPSILON = 1e-9;

function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

function pointNearlyEqual(a: Point, b: Point): boolean {
  return nearlyEqual(a.x, b.x) && nearlyEqual(a.y, b.y);
}

describe('Transform', () => {
  it('identity leaves points unchanged', () => {
    const t = Transform.identity();
    const p = Point.of(5, 10);
    expect(pointNearlyEqual(Transform.applyToPoint(t, p), p)).toBe(true);
  });

  it('isIdentity returns true for identity matrix', () => {
    expect(Transform.isIdentity(Transform.identity())).toBe(true);
  });

  it('isIdentity returns false for non-identity', () => {
    expect(Transform.isIdentity(Transform.translation(1, 0))).toBe(false);
  });

  it('translation shifts a point', () => {
    const t = Transform.translation(3, 4);
    const p = Transform.applyToPoint(t, Point.of(1, 1));
    expect(pointNearlyEqual(p, Point.of(4, 5))).toBe(true);
  });

  it('scaling scales a point from origin', () => {
    const t = Transform.scaling(2, 3);
    const p = Transform.applyToPoint(t, Point.of(5, 4));
    expect(pointNearlyEqual(p, Point.of(10, 12))).toBe(true);
  });

  it('scaling around a center point', () => {
    const t = Transform.scaling(2, 2, 10, 10);
    const p = Transform.applyToPoint(t, Point.of(10, 10));
    expect(pointNearlyEqual(p, Point.of(10, 10))).toBe(true);
  });

  it('rotation by 90 degrees', () => {
    const t = Transform.rotation(90);
    const p = Transform.applyToPoint(t, Point.of(1, 0));
    expect(nearlyEqual(p.x, 0)).toBe(true);
    expect(nearlyEqual(p.y, 1)).toBe(true);
  });

  it('rotation by 180 degrees', () => {
    const t = Transform.rotation(180);
    const p = Transform.applyToPoint(t, Point.of(1, 0));
    expect(nearlyEqual(p.x, -1)).toBe(true);
    expect(nearlyEqual(p.y, 0)).toBe(true);
  });

  it('rotation around a center', () => {
    const t = Transform.rotation(90, 5, 5);
    const p = Transform.applyToPoint(t, Point.of(5, 5));
    expect(pointNearlyEqual(p, Point.of(5, 5))).toBe(true);
  });

  it('multiply combines two transforms', () => {
    const t1 = Transform.translation(5, 0);
    const t2 = Transform.translation(0, 3);
    const t = Transform.multiply(t1, t2);
    const p = Transform.applyToPoint(t, Point.of(0, 0));
    expect(pointNearlyEqual(p, Point.of(5, 3))).toBe(true);
  });

  it('multiply with identity is a no-op', () => {
    const t = Transform.translation(3, 4);
    expect(Transform.equals(Transform.multiply(t, Transform.identity()), t)).toBe(true);
    expect(Transform.equals(Transform.multiply(Transform.identity(), t), t)).toBe(true);
  });

  it('inverse of translation is negative translation', () => {
    const t = Transform.translation(5, 10);
    const inv = Transform.inverse(t);
    expect(inv).not.toBeNull();
    const p = Transform.applyToPoint(inv!, Point.of(5, 10));
    expect(pointNearlyEqual(p, Point.of(0, 0))).toBe(true);
  });

  it('inverse of identity is identity', () => {
    const inv = Transform.inverse(Transform.identity());
    expect(inv).not.toBeNull();
    expect(Transform.isIdentity(inv!)).toBe(true);
  });

  it('inverse of singular matrix returns null', () => {
    const t = Transform.of(0, 0, 0, 0, 0, 0);
    expect(Transform.inverse(t)).toBeNull();
  });

  it('round-trips through multiply and inverse', () => {
    const t = Transform.multiply(Transform.translation(3, 4), Transform.rotation(45));
    const inv = Transform.inverse(t);
    expect(inv).not.toBeNull();
    // Applying a transform and its inverse should return the original point
    const p = Point.of(7, 3);
    const forward = Transform.applyToPoint(t, p);
    const back = Transform.applyToPoint(inv!, forward);
    expect(nearlyEqual(back.x, p.x)).toBe(true);
    expect(nearlyEqual(back.y, p.y)).toBe(true);
  });

  it('decomposes translation', () => {
    const t = Transform.translation(5, 10);
    const d = Transform.decompose(t);
    expect(nearlyEqual(d.tx, 5)).toBe(true);
    expect(nearlyEqual(d.ty, 10)).toBe(true);
    expect(nearlyEqual(d.sx, 1)).toBe(true);
    expect(nearlyEqual(d.sy, 1)).toBe(true);
    expect(nearlyEqual(d.rotation, 0)).toBe(true);
  });

  it('toCssString produces correct format', () => {
    const t = Transform.identity();
    expect(Transform.toCssString(t)).toBe('matrix(1,0,0,1,0,0)');
  });

  it('equals compares matrices correctly', () => {
    const a = Transform.translation(3, 4);
    const b = Transform.translation(3, 4);
    const c = Transform.translation(3, 5);
    expect(Transform.equals(a, b)).toBe(true);
    expect(Transform.equals(a, c)).toBe(false);
  });
});
