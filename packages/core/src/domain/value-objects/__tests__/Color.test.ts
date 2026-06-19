import { describe, it, expect } from 'vitest';
import { Color } from '../Color';

describe('Color', () => {
  it('creates with of()', () => {
    expect(Color.of(255, 128, 0)).toEqual({ r: 255, g: 128, b: 0, a: 1 });
  });

  it('clamps channel values', () => {
    const c = Color.of(300, -10, 128, 2);
    expect(c.r).toBe(255);
    expect(c.g).toBe(0);
    expect(c.b).toBe(128);
    expect(c.a).toBe(1);
  });

  it('has static constants', () => {
    expect(Color.BLACK).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(Color.WHITE).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(Color.TRANSPARENT).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it('parses 6-digit hex', () => {
    expect(Color.fromHex('#ff8000')).toEqual({ r: 255, g: 128, b: 0, a: 1 });
  });

  it('parses 3-digit hex', () => {
    const c = Color.fromHex('#f80');
    expect(c.r).toBe(255);
    expect(c.g).toBe(136); // 0x88
    expect(c.b).toBe(0);
  });

  it('parses 8-digit hex with alpha', () => {
    const c = Color.fromHex('#ff000080');
    expect(c.r).toBe(255);
    expect(c.g).toBe(0);
    expect(c.b).toBe(0);
    expect(c.a).toBeCloseTo(128 / 255);
  });

  it('throws on invalid hex', () => {
    expect(() => Color.fromHex('#gg0000')).toThrow();
    expect(() => Color.fromHex('notahex')).toThrow();
  });

  it('parses rgb css string', () => {
    expect(Color.fromCssRgb('rgb(255, 128, 0)')).toEqual({ r: 255, g: 128, b: 0, a: 1 });
  });

  it('parses rgba css string', () => {
    const c = Color.fromCssRgb('rgba(255, 0, 0, 0.5)');
    expect(c.r).toBe(255);
    expect(c.a).toBe(0.5);
  });

  it('throws on invalid css rgb', () => {
    expect(() => Color.fromCssRgb('hsl(0, 100%, 50%)')).toThrow();
  });

  it('converts to hex', () => {
    expect(Color.toHex(Color.of(255, 0, 0))).toBe('#ff0000');
    expect(Color.toHex(Color.of(0, 128, 0))).toBe('#008000');
  });

  it('converts to rgba string', () => {
    expect(Color.toRgba(Color.of(255, 0, 0, 0.5))).toBe('rgba(255,0,0,0.5)');
  });

  it('withAlpha changes alpha', () => {
    const c = Color.withAlpha(Color.BLACK, 0.5);
    expect(c.a).toBe(0.5);
    expect(c.r).toBe(0);
  });

  it('withAlpha clamps to [0, 1]', () => {
    expect(Color.withAlpha(Color.BLACK, 2).a).toBe(1);
    expect(Color.withAlpha(Color.BLACK, -1).a).toBe(0);
  });

  it('equals compares correctly', () => {
    expect(Color.equals(Color.BLACK, Color.BLACK)).toBe(true);
    expect(Color.equals(Color.BLACK, Color.WHITE)).toBe(false);
  });
});
