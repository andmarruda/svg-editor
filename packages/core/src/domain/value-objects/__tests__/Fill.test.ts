import { describe, it, expect } from 'vitest';
import { Fill } from '../Fill';
import { Color } from '../Color';
import { Point } from '../Point';

describe('Fill', () => {
  it('creates none fill', () => {
    expect(Fill.none()).toEqual({ kind: 'none' });
  });

  it('creates solid fill', () => {
    expect(Fill.solid(Color.BLACK)).toEqual({ kind: 'solid', color: Color.BLACK });
  });

  it('creates linear gradient fill', () => {
    const stops = [
      { offset: 0, color: Color.BLACK },
      { offset: 1, color: Color.WHITE },
    ];
    const f = Fill.linearGradient(stops, 90);
    expect(f.kind).toBe('linear-gradient');
    if (f.kind === 'linear-gradient') {
      expect(f.angleDeg).toBe(90);
      expect(f.stops).toHaveLength(2);
    }
  });

  it('creates radial gradient fill', () => {
    const stops = [{ offset: 0, color: Color.BLACK }];
    const f = Fill.radialGradient(stops, Point.ORIGIN, 50);
    expect(f.kind).toBe('radial-gradient');
  });

  it('creates pattern fill', () => {
    const f = Fill.pattern('pat-1');
    expect(f).toEqual({ kind: 'pattern', patternId: 'pat-1' });
  });

  it('NONE is a none fill', () => {
    expect(Fill.NONE.kind).toBe('none');
  });

  it('isNone returns true for none fill', () => {
    expect(Fill.isNone(Fill.none())).toBe(true);
    expect(Fill.isNone(Fill.solid(Color.BLACK))).toBe(false);
  });

  it('isSolid type guard works', () => {
    const solid = Fill.solid(Color.BLACK);
    expect(Fill.isSolid(solid)).toBe(true);
    expect(Fill.isSolid(Fill.none())).toBe(false);
  });

  it('equals for none fills', () => {
    expect(Fill.equals(Fill.none(), Fill.none())).toBe(true);
  });

  it('equals for solid fills with same color', () => {
    expect(Fill.equals(Fill.solid(Color.BLACK), Fill.solid(Color.BLACK))).toBe(true);
  });

  it('not equal when kinds differ', () => {
    expect(Fill.equals(Fill.none(), Fill.solid(Color.BLACK))).toBe(false);
  });

  it('not equal when solid colors differ', () => {
    expect(Fill.equals(Fill.solid(Color.BLACK), Fill.solid(Color.WHITE))).toBe(false);
  });

  it('equals for pattern fills', () => {
    expect(Fill.equals(Fill.pattern('a'), Fill.pattern('a'))).toBe(true);
    expect(Fill.equals(Fill.pattern('a'), Fill.pattern('b'))).toBe(false);
  });
});
