import { describe, it, expect } from 'vitest';
import { parseSvg } from '../SvgParser';
import { serializeSvg } from '../SvgSerializer';
import { DocumentId } from '../../../domain/value-objects/NodeId';
import { Transform } from '../../../domain/value-objects/Transform';

const docId = DocumentId.from('test');

const SIMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect x="10" y="10" width="80" height="60" fill="#ff0000"/>
  <circle cx="100" cy="100" r="40" fill="#0000ff"/>
</svg>`;

const GROUP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <g id="group1" transform="translate(10,20)">
    <rect x="0" y="0" width="50" height="50" fill="#00ff00"/>
    <ellipse cx="80" cy="25" rx="20" ry="10" fill="none" stroke="#000000" stroke-width="2"/>
  </g>
  <text x="50" y="200" font-size="16" font-family="Arial">Hello</text>
</svg>`;

const PATH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <path d="M 10,10 L 90,10 L 90,90 L 10,90 Z" fill="#ffff00" stroke="#000" stroke-width="1"/>
</svg>`;

describe('SvgParser + SvgSerializer round-trip', () => {
  it('parses a simple SVG with rect and circle', () => {
    const doc = parseSvg(SIMPLE_SVG, docId);
    expect(doc.nodes.size).toBe(2);
    expect(doc.width).toBe(200);
    expect(doc.height).toBe(200);
    expect(doc.viewBox).toEqual({ minX: 0, minY: 0, width: 200, height: 200 });
  });

  it('rect node has correct attributes', () => {
    const doc = parseSvg(SIMPLE_SVG, docId);
    const rect = [...doc.nodes.values()].find((n) => n.type === 'rect');
    expect(rect).toBeDefined();
    if (rect?.type === 'rect') {
      expect(rect.x).toBe(10);
      expect(rect.y).toBe(10);
      expect(rect.width).toBe(80);
      expect(rect.height).toBe(60);
    }
  });

  it('parses group with children', () => {
    const doc = parseSvg(GROUP_SVG, docId);
    const group = [...doc.nodes.values()].find((n) => n.type === 'group');
    expect(group).toBeDefined();
    if (group?.type === 'group') {
      expect(group.children).toHaveLength(2);
    }
  });

  it('parses path with commands', () => {
    const doc = parseSvg(PATH_SVG, docId);
    const path = [...doc.nodes.values()].find((n) => n.type === 'path');
    expect(path).toBeDefined();
    if (path?.type === 'path') {
      expect(path.commands.length).toBeGreaterThan(0);
      expect(path.commands[0]?.type).toBe('M');
      expect(path.commands.at(-1)?.type).toBe('Z');
    }
  });

  it('parses text node', () => {
    const doc = parseSvg(GROUP_SVG, docId);
    const text = [...doc.nodes.values()].find((n) => n.type === 'text');
    expect(text).toBeDefined();
    if (text?.type === 'text') {
      expect(text.content).toBe('Hello');
      expect(text.fontSize).toBe(16);
    }
  });

  it('parses transform attribute', () => {
    const doc = parseSvg(GROUP_SVG, docId);
    const group = [...doc.nodes.values()].find((n) => n.type === 'group');
    expect(group).toBeDefined();
    if (group) {
      const { tx, ty } = Transform.decompose(group.transform);
      expect(tx).toBeCloseTo(10);
      expect(ty).toBeCloseTo(20);
    }
  });

  it('serializes back to valid SVG string', () => {
    const doc = parseSvg(SIMPLE_SVG, docId);
    const svg = serializeSvg(doc);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('<rect');
    expect(svg).toContain('<circle');
  });

  it('serialized SVG can be re-parsed preserving node count', () => {
    const doc = parseSvg(SIMPLE_SVG, docId);
    const svg = serializeSvg(doc);
    const reparsed = parseSvg(svg, docId);
    expect(reparsed.nodes.size).toBe(doc.nodes.size);
  });

  it('throws on malformed SVG', () => {
    expect(() => parseSvg('<not valid xml>>><', docId)).toThrow();
  });
});
