import { describe, it, expect } from 'vitest';
import { Size } from '../Size';

describe('Size', () => {
  it('creates a size with of()', () => {
    expect(Size.of(100, 200)).toEqual({ width: 100, height: 200 });
  });

  it('throws on negative width', () => {
    expect(() => Size.of(-1, 10)).toThrow();
  });

  it('throws on negative height', () => {
    expect(() => Size.of(10, -1)).toThrow();
  });

  it('allows zero dimensions', () => {
    expect(Size.of(0, 0)).toEqual({ width: 0, height: 0 });
  });

  it('ZERO is (0, 0)', () => {
    expect(Size.ZERO).toEqual({ width: 0, height: 0 });
  });

  it('scales uniformly', () => {
    expect(Size.scale(Size.of(10, 20), 2)).toEqual({ width: 20, height: 40 });
  });

  it('scales with separate X and Y factors', () => {
    expect(Size.scaleXY(Size.of(10, 20), 2, 3)).toEqual({ width: 20, height: 60 });
  });

  it('calculates aspect ratio', () => {
    expect(Size.aspectRatio(Size.of(16, 9))).toBeCloseTo(16 / 9);
  });

  it('aspect ratio of zero height is 0', () => {
    expect(Size.aspectRatio(Size.of(10, 0))).toBe(0);
  });

  it('checks equality', () => {
    expect(Size.equals(Size.of(1, 2), Size.of(1, 2))).toBe(true);
    expect(Size.equals(Size.of(1, 2), Size.of(1, 3))).toBe(false);
  });

  it('isEmpty returns true when either dimension is 0', () => {
    expect(Size.isEmpty(Size.of(0, 10))).toBe(true);
    expect(Size.isEmpty(Size.of(10, 0))).toBe(true);
    expect(Size.isEmpty(Size.of(1, 1))).toBe(false);
  });
});
