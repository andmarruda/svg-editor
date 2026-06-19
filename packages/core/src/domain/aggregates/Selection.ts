import type { NodeId } from '../value-objects/NodeId';

export interface Selection {
  readonly ids: ReadonlySet<NodeId>;
  readonly anchor: NodeId | null;
}

export const Selection = {
  EMPTY: { ids: new Set<NodeId>(), anchor: null } as Selection,

  of(ids: readonly NodeId[], anchor?: NodeId): Selection {
    return { ids: new Set(ids), anchor: anchor ?? ids[ids.length - 1] ?? null };
  },

  add(sel: Selection, id: NodeId): Selection {
    const ids = new Set(sel.ids);
    ids.add(id);
    return { ids, anchor: id };
  },

  remove(sel: Selection, id: NodeId): Selection {
    const ids = new Set(sel.ids);
    ids.delete(id);
    const anchor = sel.anchor === id ? null : sel.anchor;
    return { ids, anchor };
  },

  toggle(sel: Selection, id: NodeId): Selection {
    return sel.ids.has(id) ? Selection.remove(sel, id) : Selection.add(sel, id);
  },

  has(sel: Selection, id: NodeId): boolean {
    return sel.ids.has(id);
  },

  isEmpty(sel: Selection): boolean {
    return sel.ids.size === 0;
  },

  size(sel: Selection): number {
    return sel.ids.size;
  },

  toArray(sel: Selection): NodeId[] {
    return [...sel.ids];
  },

  isSingle(sel: Selection): boolean {
    return sel.ids.size === 1;
  },

  single(sel: Selection): NodeId | null {
    if (sel.ids.size !== 1) return null;
    return [...sel.ids][0] ?? null;
  },
} as const;
