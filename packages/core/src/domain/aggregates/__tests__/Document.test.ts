import { describe, it, expect } from 'vitest';
import { Document, DocumentMutations } from '../Document';
import { NodeId, DocumentId } from '../../value-objects/NodeId';
import { Transform } from '../../value-objects/Transform';
import { Fill } from '../../value-objects/Fill';
import { Stroke } from '../../value-objects/Stroke';
import type { RectNode } from '../../entities/RectNode';
import type { GroupNode } from '../../entities/GroupNode';

const docId = DocumentId.from('doc-1');

function makeRect(id: string, x = 0, y = 0, w = 100, h = 100): RectNode {
  return {
    id: NodeId.from(id),
    type: 'rect',
    name: id,
    x,
    y,
    width: w,
    height: h,
    rx: 0,
    ry: 0,
    transform: Transform.identity(),
    fill: Fill.solid({ r: 0, g: 0, b: 0, a: 1 }),
    stroke: Stroke.NONE,
    opacity: 1,
    visibility: true,
    locked: false,
    metadata: {},
  };
}

describe('Document.create', () => {
  it('creates an empty document', () => {
    const doc = Document.create(docId, 800, 600);
    expect(doc.nodes.size).toBe(0);
    expect(doc.rootOrder).toHaveLength(0);
    expect(doc.width).toBe(800);
    expect(doc.height).toBe(600);
  });

  it('sets viewBox from size when not provided', () => {
    const doc = Document.create(docId, 100, 200);
    expect(doc.viewBox).toEqual({ minX: 0, minY: 0, width: 100, height: 200 });
  });
});

describe('DocumentMutations.addNode', () => {
  it('adds a node to root', () => {
    const doc = Document.create(docId, 800, 600);
    const rect = makeRect('r1');
    const updated = DocumentMutations.addNode(doc, rect);
    expect(updated.nodes.size).toBe(1);
    expect(updated.rootOrder).toContain(rect.id);
  });

  it('adds multiple nodes in order', () => {
    let doc = Document.create(docId, 800, 600);
    doc = DocumentMutations.addNode(doc, makeRect('r1'));
    doc = DocumentMutations.addNode(doc, makeRect('r2'));
    expect(doc.rootOrder).toEqual([NodeId.from('r1'), NodeId.from('r2')]);
  });

  it('is immutable — original doc unchanged', () => {
    const doc = Document.create(docId, 800, 600);
    const updated = DocumentMutations.addNode(doc, makeRect('r1'));
    expect(doc.nodes.size).toBe(0);
    expect(updated.nodes.size).toBe(1);
  });

  it('adds a child node to a group', () => {
    const groupId = NodeId.from('g1');
    const group: GroupNode = {
      id: groupId,
      type: 'group',
      name: 'g1',
      children: [],
      transform: Transform.identity(),
      fill: Fill.NONE,
      stroke: Stroke.NONE,
      opacity: 1,
      visibility: true,
      locked: false,
      metadata: {},
    };
    let doc = Document.create(docId, 800, 600);
    doc = DocumentMutations.addNode(doc, group);
    doc = DocumentMutations.addNode(doc, makeRect('r1'), groupId);

    const updatedGroup = doc.nodes.get(groupId) as GroupNode;
    expect(updatedGroup.children).toContain(NodeId.from('r1'));
    expect(doc.rootOrder).not.toContain(NodeId.from('r1'));
  });
});

describe('DocumentMutations.removeNode', () => {
  it('removes a root node', () => {
    let doc = Document.create(docId, 800, 600);
    const rect = makeRect('r1');
    doc = DocumentMutations.addNode(doc, rect);
    doc = DocumentMutations.removeNode(doc, rect.id);
    expect(doc.nodes.size).toBe(0);
    expect(doc.rootOrder).not.toContain(rect.id);
  });

  it('no-op when node does not exist', () => {
    const doc = Document.create(docId, 800, 600);
    const result = DocumentMutations.removeNode(doc, NodeId.from('nonexistent'));
    expect(result).toBe(doc);
  });

  it('removes children when removing a group', () => {
    const groupId = NodeId.from('g1');
    const group: GroupNode = {
      id: groupId,
      type: 'group',
      name: 'g1',
      children: [NodeId.from('r1')],
      transform: Transform.identity(),
      fill: Fill.NONE,
      stroke: Stroke.NONE,
      opacity: 1,
      visibility: true,
      locked: false,
      metadata: {},
    };
    let doc = Document.create(docId, 800, 600);
    doc = DocumentMutations.addNode(doc, group);
    doc = DocumentMutations.addNode(doc, makeRect('r1'), groupId);
    doc = DocumentMutations.removeNode(doc, groupId);
    expect(doc.nodes.has(groupId)).toBe(false);
    expect(doc.nodes.has(NodeId.from('r1'))).toBe(false);
  });
});

describe('DocumentMutations.updateNode', () => {
  it('updates a node attribute', () => {
    let doc = Document.create(docId, 800, 600);
    doc = DocumentMutations.addNode(doc, makeRect('r1', 0, 0, 100, 100));
    doc = DocumentMutations.updateNode(doc, NodeId.from('r1'), { x: 50 } as Partial<
      import('../../entities/SvgNode').SvgNode
    >);
    const node = doc.nodes.get(NodeId.from('r1')) as RectNode;
    expect(node.x).toBe(50);
  });
});

describe('DocumentMutations.reorderInRoot', () => {
  it('moves a node to a new index', () => {
    let doc = Document.create(docId, 800, 600);
    doc = DocumentMutations.addNode(doc, makeRect('r1'));
    doc = DocumentMutations.addNode(doc, makeRect('r2'));
    doc = DocumentMutations.addNode(doc, makeRect('r3'));
    doc = DocumentMutations.reorderInRoot(doc, NodeId.from('r1'), 2);
    expect(doc.rootOrder).toEqual([NodeId.from('r2'), NodeId.from('r3'), NodeId.from('r1')]);
  });
});

describe('DocumentMutations.traverseDepthFirst', () => {
  it('traverses all nodes in depth-first order', () => {
    const groupId = NodeId.from('g1');
    const group: GroupNode = {
      id: groupId,
      type: 'group',
      name: 'g1',
      children: [NodeId.from('r1'), NodeId.from('r2')],
      transform: Transform.identity(),
      fill: Fill.NONE,
      stroke: Stroke.NONE,
      opacity: 1,
      visibility: true,
      locked: false,
      metadata: {},
    };
    let doc = Document.create(docId, 800, 600);
    doc = DocumentMutations.addNode(doc, makeRect('r0'));
    doc = DocumentMutations.addNode(doc, group);
    doc = DocumentMutations.addNode(doc, makeRect('r1'), groupId);
    doc = DocumentMutations.addNode(doc, makeRect('r2'), groupId);
    const order = DocumentMutations.traverseDepthFirst(doc);
    expect(order[0]).toBe(NodeId.from('r0'));
    expect(order[1]).toBe(groupId);
    expect(order).toContain(NodeId.from('r1'));
    expect(order).toContain(NodeId.from('r2'));
  });
});

describe('DocumentMutations.findParentId', () => {
  it('finds parent of a child node', () => {
    const groupId = NodeId.from('g1');
    const group: GroupNode = {
      id: groupId,
      type: 'group',
      name: 'g1',
      children: [],
      transform: Transform.identity(),
      fill: Fill.NONE,
      stroke: Stroke.NONE,
      opacity: 1,
      visibility: true,
      locked: false,
      metadata: {},
    };
    let doc = Document.create(docId, 800, 600);
    doc = DocumentMutations.addNode(doc, group);
    doc = DocumentMutations.addNode(doc, makeRect('r1'), groupId);
    expect(DocumentMutations.findParentId(doc, NodeId.from('r1'))).toBe(groupId);
  });

  it('returns null for root nodes', () => {
    let doc = Document.create(docId, 800, 600);
    doc = DocumentMutations.addNode(doc, makeRect('r1'));
    expect(DocumentMutations.findParentId(doc, NodeId.from('r1'))).toBeNull();
  });
});
