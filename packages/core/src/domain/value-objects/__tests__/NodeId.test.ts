import { describe, it, expect } from 'vitest';
import { NodeId, DocumentId } from '../NodeId';

describe('NodeId', () => {
  it('creates from a valid string', () => {
    const id = NodeId.from('abc-123');
    expect(id).toBe('abc-123');
  });

  it('throws on empty string', () => {
    expect(() => NodeId.from('')).toThrow('NodeId cannot be empty');
  });

  it('throws on whitespace-only string', () => {
    expect(() => NodeId.from('   ')).toThrow('NodeId cannot be empty');
  });

  it('compares equality correctly', () => {
    const a = NodeId.from('x');
    const b = NodeId.from('x');
    const c = NodeId.from('y');
    expect(NodeId.equals(a, b)).toBe(true);
    expect(NodeId.equals(a, c)).toBe(false);
  });
});

describe('DocumentId', () => {
  it('creates from a valid string', () => {
    const id = DocumentId.from('doc-1');
    expect(id).toBe('doc-1');
  });

  it('throws on empty string', () => {
    expect(() => DocumentId.from('')).toThrow('DocumentId cannot be empty');
  });
});
