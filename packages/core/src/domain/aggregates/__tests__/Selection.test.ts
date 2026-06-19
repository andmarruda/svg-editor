import { describe, it, expect } from 'vitest';
import { Selection } from '../Selection';
import { NodeId } from '../../value-objects/NodeId';

const a = NodeId.from('a');
const b = NodeId.from('b');
const c = NodeId.from('c');

describe('Selection', () => {
  it('EMPTY has no ids and null anchor', () => {
    expect(Selection.isEmpty(Selection.EMPTY)).toBe(true);
    expect(Selection.EMPTY.anchor).toBeNull();
  });

  it('of() creates selection from array', () => {
    const sel = Selection.of([a, b]);
    expect(Selection.has(sel, a)).toBe(true);
    expect(Selection.has(sel, b)).toBe(true);
    expect(sel.anchor).toBe(b);
  });

  it('add() adds a node', () => {
    const sel = Selection.add(Selection.EMPTY, a);
    expect(Selection.has(sel, a)).toBe(true);
    expect(sel.anchor).toBe(a);
  });

  it('remove() removes a node', () => {
    const sel = Selection.of([a, b]);
    const updated = Selection.remove(sel, a);
    expect(Selection.has(updated, a)).toBe(false);
    expect(Selection.has(updated, b)).toBe(true);
  });

  it('remove() clears anchor if it was the removed node', () => {
    const sel = Selection.of([a, b], b);
    const updated = Selection.remove(sel, b);
    expect(updated.anchor).toBeNull();
  });

  it('toggle() adds when not present', () => {
    const sel = Selection.toggle(Selection.EMPTY, a);
    expect(Selection.has(sel, a)).toBe(true);
  });

  it('toggle() removes when present', () => {
    const sel = Selection.of([a]);
    const updated = Selection.toggle(sel, a);
    expect(Selection.has(updated, a)).toBe(false);
  });

  it('size() returns count', () => {
    expect(Selection.size(Selection.of([a, b, c]))).toBe(3);
  });

  it('isSingle() true when one item', () => {
    expect(Selection.isSingle(Selection.of([a]))).toBe(true);
    expect(Selection.isSingle(Selection.of([a, b]))).toBe(false);
  });

  it('single() returns the sole id', () => {
    expect(Selection.single(Selection.of([a]))).toBe(a);
    expect(Selection.single(Selection.of([a, b]))).toBeNull();
  });

  it('toArray() returns all ids', () => {
    const arr = Selection.toArray(Selection.of([a, b]));
    expect(arr).toContain(a);
    expect(arr).toContain(b);
    expect(arr).toHaveLength(2);
  });
});
