import { describe, it, expect } from 'vitest';
import { Stroke } from '../Stroke';
import { Color } from '../Color';

describe('Stroke', () => {
  it('DEFAULT has sensible values', () => {
    expect(Stroke.DEFAULT.width).toBe(1);
    expect(Stroke.DEFAULT.opacity).toBe(1);
    expect(Stroke.DEFAULT.lineCap).toBe('butt');
    expect(Stroke.DEFAULT.lineJoin).toBe('miter');
  });

  it('NONE has zero width and opacity', () => {
    expect(Stroke.NONE.width).toBe(0);
    expect(Stroke.NONE.opacity).toBe(0);
  });

  it('of() merges with DEFAULT', () => {
    const s = Stroke.of({ width: 3, lineCap: 'round' });
    expect(s.width).toBe(3);
    expect(s.lineCap).toBe('round');
    expect(s.lineJoin).toBe('miter'); // from DEFAULT
  });

  it('withColor changes color', () => {
    const s = Stroke.withColor(Stroke.DEFAULT, Color.WHITE);
    expect(Color.equals(s.color, Color.WHITE)).toBe(true);
    expect(s.width).toBe(Stroke.DEFAULT.width);
  });

  it('withWidth changes width', () => {
    const s = Stroke.withWidth(Stroke.DEFAULT, 5);
    expect(s.width).toBe(5);
  });

  it('withWidth throws on negative', () => {
    expect(() => Stroke.withWidth(Stroke.DEFAULT, -1)).toThrow();
  });

  it('withOpacity clamps to [0, 1]', () => {
    expect(Stroke.withOpacity(Stroke.DEFAULT, 2).opacity).toBe(1);
    expect(Stroke.withOpacity(Stroke.DEFAULT, -1).opacity).toBe(0);
  });

  it('isDashed returns true when dashArray is non-empty', () => {
    const dashed = Stroke.of({ dashArray: [4, 2] });
    expect(Stroke.isDashed(dashed)).toBe(true);
    expect(Stroke.isDashed(Stroke.DEFAULT)).toBe(false);
  });

  it('isVisible returns false for NONE', () => {
    expect(Stroke.isVisible(Stroke.NONE)).toBe(false);
  });

  it('isVisible returns true for DEFAULT', () => {
    expect(Stroke.isVisible(Stroke.DEFAULT)).toBe(true);
  });

  it('equals for identical strokes', () => {
    expect(Stroke.equals(Stroke.DEFAULT, { ...Stroke.DEFAULT })).toBe(true);
  });

  it('not equal when width differs', () => {
    const a = Stroke.DEFAULT;
    const b = Stroke.withWidth(Stroke.DEFAULT, 2);
    expect(Stroke.equals(a, b)).toBe(false);
  });

  it('not equal when dashArray differs', () => {
    const a = Stroke.of({ dashArray: [4, 2] });
    const b = Stroke.of({ dashArray: [4, 3] });
    expect(Stroke.equals(a, b)).toBe(false);
  });
});
