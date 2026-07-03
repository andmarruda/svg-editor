import type { NodeId, DocumentId } from '../value-objects/NodeId';
import type { SvgNode } from '../entities/SvgNode';
import type { SvgDef, SvgMetadata, ViewBox } from './SvgDefs';
import { DEFAULT_METADATA } from './SvgDefs';
import { Transform } from '../value-objects/Transform';

export interface Document {
  readonly id: DocumentId;
  readonly title: string;
  readonly width: number;
  readonly height: number;
  readonly viewBox: ViewBox;
  readonly nodes: ReadonlyMap<NodeId, SvgNode>;
  readonly rootOrder: readonly NodeId[];
  readonly defs: ReadonlyMap<string, SvgDef>;
  readonly metadata: SvgMetadata;
}

export const Document = {
  create(id: DocumentId, width: number, height: number, viewBox?: ViewBox): Document {
    const vb = viewBox ?? { minX: 0, minY: 0, width, height };
    return {
      id,
      title: 'Untitled',
      width,
      height,
      viewBox: vb,
      nodes: new Map(),
      rootOrder: [],
      defs: new Map(),
      metadata: DEFAULT_METADATA,
    };
  },
} as const;

export const DocumentMutations = {
  addNode(doc: Document, node: SvgNode, parentId?: NodeId): Document {
    const updatedNodes = new Map(doc.nodes);
    updatedNodes.set(node.id, node);

    if (parentId !== undefined) {
      const parent = doc.nodes.get(parentId);
      if (!parent || parent.type !== 'group') {
        throw new Error(`Parent ${parentId} is not a group`);
      }
      const updatedParent = { ...parent, children: [...parent.children, node.id] };
      updatedNodes.set(parentId, updatedParent);
      return { ...doc, nodes: updatedNodes };
    }

    return { ...doc, nodes: updatedNodes, rootOrder: [...doc.rootOrder, node.id] };
  },

  removeNode(doc: Document, id: NodeId): Document {
    const node = doc.nodes.get(id);
    if (!node) return doc;

    const updatedNodes = new Map(doc.nodes);
    removeSubtree(updatedNodes, id);

    const updatedRoot = doc.rootOrder.filter((nid) => nid !== id);
    const updatedNodes2 = removeFromAllGroups(updatedNodes, id);

    return { ...doc, nodes: updatedNodes2, rootOrder: updatedRoot };
  },

  removeNodes(doc: Document, ids: readonly NodeId[]): Document {
    return ids.reduce((d, id) => DocumentMutations.removeNode(d, id), doc);
  },

  updateNode(doc: Document, id: NodeId, patch: Partial<SvgNode>): Document {
    const existing = doc.nodes.get(id);
    if (!existing) return doc;
    const updated = { ...existing, ...patch } as SvgNode;
    const updatedNodes = new Map(doc.nodes);
    updatedNodes.set(id, updated);
    return { ...doc, nodes: updatedNodes };
  },

  reorderInRoot(doc: Document, id: NodeId, toIndex: number): Document {
    const filtered = doc.rootOrder.filter((nid) => nid !== id);
    const clamped = Math.max(0, Math.min(toIndex, filtered.length));
    const newOrder = [...filtered.slice(0, clamped), id, ...filtered.slice(clamped)];
    return { ...doc, rootOrder: newOrder };
  },

  reorderInGroup(doc: Document, groupId: NodeId, id: NodeId, toIndex: number): Document {
    const group = doc.nodes.get(groupId);
    if (!group || group.type !== 'group') return doc;
    const filtered = group.children.filter((nid) => nid !== id);
    const clamped = Math.max(0, Math.min(toIndex, filtered.length));
    const newChildren = [...filtered.slice(0, clamped), id, ...filtered.slice(clamped)];
    const updatedGroup = { ...group, children: newChildren };
    const updatedNodes = new Map(doc.nodes);
    updatedNodes.set(groupId, updatedGroup);
    return { ...doc, nodes: updatedNodes };
  },

  addDef(doc: Document, def: SvgDef): Document {
    const updatedDefs = new Map(doc.defs);
    updatedDefs.set(def.id, def);
    return { ...doc, defs: updatedDefs };
  },

  removeDef(doc: Document, id: string): Document {
    const updatedDefs = new Map(doc.defs);
    updatedDefs.delete(id);
    return { ...doc, defs: updatedDefs };
  },

  setTitle(doc: Document, title: string): Document {
    return { ...doc, title };
  },

  setViewBox(doc: Document, viewBox: ViewBox): Document {
    return { ...doc, viewBox };
  },

  setSize(doc: Document, width: number, height: number): Document {
    return { ...doc, width, height };
  },

  findParentId(doc: Document, id: NodeId): NodeId | null {
    for (const [nid, node] of doc.nodes) {
      if (node.type === 'group' && node.children.includes(id)) return nid;
    }
    return null;
  },

  traverseDepthFirst(doc: Document): NodeId[] {
    const result: NodeId[] = [];
    const visit = (ids: readonly NodeId[]) => {
      for (const id of ids) {
        result.push(id);
        const node = doc.nodes.get(id);
        if (node?.type === 'group') visit(node.children);
      }
    };
    visit(doc.rootOrder);
    return result;
  },

  getAncestors(doc: Document, id: NodeId): NodeId[] {
    const ancestors: NodeId[] = [];
    let current: NodeId | null = id;
    while (current !== null) {
      const parentId = DocumentMutations.findParentId(doc, current);
      if (parentId !== null) ancestors.unshift(parentId);
      current = parentId;
    }
    return ancestors;
  },
} as const;

function removeSubtree(nodes: Map<NodeId, SvgNode>, id: NodeId): void {
  const node = nodes.get(id);
  if (!node) return;
  if (node.type === 'group') {
    for (const childId of node.children) removeSubtree(nodes, childId);
  }
  nodes.delete(id);
}

function removeFromAllGroups(nodes: Map<NodeId, SvgNode>, id: NodeId): Map<NodeId, SvgNode> {
  const result = new Map(nodes);
  for (const [nid, node] of result) {
    if (node.type === 'group' && node.children.includes(id)) {
      result.set(nid, { ...node, children: node.children.filter((c) => c !== id) });
    }
  }
  return result;
}
