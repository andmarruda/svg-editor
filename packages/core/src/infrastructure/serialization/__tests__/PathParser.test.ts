import { describe, it, expect } from 'vitest';
import { parsePath, serializePath } from '../PathParser';

describe('parsePath', () => {
  it('parses M and L commands', () => {
    const cmds = parsePath('M 10,20 L 30,40');
    expect(cmds).toHaveLength(2);
    expect(cmds[0]).toEqual({ type: 'M', point: { x: 10, y: 20 } });
    expect(cmds[1]).toEqual({ type: 'L', point: { x: 30, y: 40 } });
  });

  it('parses Z command', () => {
    const cmds = parsePath('M 0,0 L 10,0 Z');
    expect(cmds.at(-1)).toEqual({ type: 'Z' });
  });

  it('parses H and V commands', () => {
    const cmds = parsePath('M 0,0 H 100 V 50');
    expect(cmds[1]).toEqual({ type: 'H', x: 100 });
    expect(cmds[2]).toEqual({ type: 'V', y: 50 });
  });

  it('parses C (cubic bezier)', () => {
    const cmds = parsePath('M 0,0 C 10,20 30,40 50,60');
    expect(cmds[1]).toEqual({
      type: 'C',
      cp1: { x: 10, y: 20 },
      cp2: { x: 30, y: 40 },
      point: { x: 50, y: 60 },
    });
  });

  it('parses A (arc)', () => {
    const cmds = parsePath('M 0,0 A 10,20 45 0,1 30,40');
    expect(cmds[1]).toMatchObject({
      type: 'A',
      rx: 10, ry: 20,
      xRotation: 45,
      largeArc: false,
      sweep: true,
      point: { x: 30, y: 40 },
    });
  });

  it('handles empty path', () => {
    expect(parsePath('')).toHaveLength(0);
  });

  it('handles multiple implicit L after M', () => {
    const cmds = parsePath('M 0,0 10,10 20,20');
    expect(cmds[0]?.type).toBe('M');
    expect(cmds[1]?.type).toBe('L');
    expect(cmds[2]?.type).toBe('L');
  });
});

describe('serializePath', () => {
  it('round-trips M/L/Z', () => {
    const original = 'M0,0 L10,20 Z';
    const cmds = parsePath(original);
    const result = serializePath(cmds);
    // Re-parse to verify semantic equivalence
    const reparsed = parsePath(result);
    expect(reparsed).toHaveLength(cmds.length);
    expect(reparsed[0]).toEqual(cmds[0]);
  });

  it('serializes H as H', () => {
    const cmds = parsePath('M 0,0 H 100');
    const result = serializePath(cmds);
    expect(result).toContain('H');
  });
});
