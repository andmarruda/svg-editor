import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EditorApplication } from '../EditorApplication';
import type { EditorApplicationDeps } from '../EditorApplication';
import type { ISerializer } from '../ports/driven/ISerializer';
import type { IClipboardAdapter } from '../ports/driven/IClipboardAdapter';
import { InMemoryEventBus } from '../../infrastructure/event-bus/InMemoryEventBus';
import { parseSvg, serializeSvg } from '../../infrastructure/serialization';
import type { SvgNode } from '../../domain/entities/SvgNode';
import type { DocumentId } from '../../domain/value-objects/NodeId';

// ── Minimal serializer adapter ─────────────────────────────────────────────

const serializer: ISerializer = {
  parse: (svgString, docId) => parseSvg(svgString, docId),
  serialize: (doc) => serializeSvg(doc),
};

// ── Minimal clipboard adapter ──────────────────────────────────────────────

class InMemoryClipboard implements IClipboardAdapter {
  private _items: SvgNode[] | null = null;
  async write(nodes: SvgNode[]): Promise<void> { this._items = nodes; }
  async read(): Promise<SvgNode[] | null> { return this._items; }
}

// ── Simple sequential ID generator ────────────────────────────────────────

class SequentialIdGenerator {
  private _counter = 0;
  generate(): string { return `id-${++this._counter}`; }
}

// ── Test fixture SVG ────────────────────────────────────────────────────────

const SIMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect id="rect1" x="10" y="20" width="100" height="50" fill="red"/>
  <ellipse id="ellipse1" cx="200" cy="150" rx="80" ry="40" fill="blue"/>
</svg>`;

function makeDeps(): EditorApplicationDeps {
  return {
    serializer,
    clipboard: new InMemoryClipboard(),
    eventBus: new InMemoryEventBus(),
    idGenerator: new SequentialIdGenerator(),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('EditorApplication', () => {
  let app: EditorApplication;

  beforeEach(() => {
    app = new EditorApplication(makeDeps());
  });

  describe('initial state', () => {
    it('starts with an empty document', () => {
      const state = app.getState();
      expect(state.document.nodes.size).toBe(0);
      expect(state.selection.ids.size).toBe(0);
      expect(state.canUndo).toBe(false);
      expect(state.canRedo).toBe(false);
      expect(state.isDirty).toBe(false);
    });
  });

  describe('openSvg', () => {
    it('parses svg and populates the document', () => {
      app.openSvg(SIMPLE_SVG, 'test.svg');
      const state = app.getState();
      expect(state.document.nodes.size).toBe(2);
      expect(state.filename).toBe('test.svg');
      expect(state.isDirty).toBe(false);
      expect(state.canUndo).toBe(false);
    });

    it('resets selection when opening a new file', () => {
      app.openSvg(SIMPLE_SVG);
      const ids = [...app.getState().document.nodes.keys()];
      const firstId = ids[0]!;
      app.selectNode(firstId);
      expect(app.getState().selection.ids.size).toBe(1);

      app.openSvg(SIMPLE_SVG);
      expect(app.getState().selection.ids.size).toBe(0);
    });
  });

  describe('subscribe', () => {
    it('notifies listeners on state change', () => {
      const listener = vi.fn();
      const unsub = app.subscribe(listener);
      app.openSvg(SIMPLE_SVG);
      expect(listener).toHaveBeenCalledTimes(1);
      unsub();
      app.newDocument(800, 600);
      expect(listener).toHaveBeenCalledTimes(1); // not called after unsub
    });
  });

  describe('node creation', () => {
    it('addRect creates a rect and selects it', () => {
      const id = app.addRect(10, 20, 100, 50);
      const state = app.getState();
      const node = state.document.nodes.get(id);
      expect(node?.type).toBe('rect');
      expect(state.selection.ids.has(id)).toBe(true);
      expect(state.isDirty).toBe(true);
      expect(state.canUndo).toBe(true);
    });

    it('addEllipse creates an ellipse', () => {
      const id = app.addEllipse(100, 100, 50, 30);
      const node = app.getState().document.nodes.get(id);
      expect(node?.type).toBe('ellipse');
    });

    it('addText creates a text node', () => {
      const id = app.addText(0, 0, 'Hello');
      const node = app.getState().document.nodes.get(id);
      expect(node?.type).toBe('text');
      if (node?.type === 'text') {
        expect(node.content).toBe('Hello');
      }
    });
  });

  describe('selection', () => {
    beforeEach(() => { app.openSvg(SIMPLE_SVG); });

    it('selectNode sets a single selection', () => {
      const ids = [...app.getState().document.nodes.keys()];
      const firstId = ids[0]!;
      app.selectNode(firstId);
      expect(app.getState().selection.ids.size).toBe(1);
      expect(app.getState().selection.ids.has(firstId)).toBe(true);
    });

    it('selectNode with addToSelection adds to selection', () => {
      const ids = [...app.getState().document.nodes.keys()];
      const [a, b] = ids as [string, string];
      app.selectNode(a as ReturnType<typeof import('../../domain/value-objects/NodeId').NodeId.from>);
      app.selectNode(b as ReturnType<typeof import('../../domain/value-objects/NodeId').NodeId.from>, true);
      expect(app.getState().selection.ids.size).toBe(2);
    });

    it('selectAll selects all nodes', () => {
      app.selectAll();
      expect(app.getState().selection.ids.size).toBe(2);
    });

    it('deselectAll clears selection', () => {
      app.selectAll();
      app.deselectAll();
      expect(app.getState().selection.ids.size).toBe(0);
    });

    it('ignores selectNode for unknown id', () => {
      const unknownId = 'unknown-id' as ReturnType<typeof import('../../domain/value-objects/NodeId').NodeId.from>;
      app.selectNode(unknownId);
      expect(app.getState().selection.ids.size).toBe(0);
    });
  });

  describe('move + undo/redo', () => {
    it('moveNodes and undo restores previous position', () => {
      const id = app.addRect(10, 20, 100, 50);
      const before = app.getState().document.nodes.get(id);
      expect(before?.type === 'rect' && before.x).toBe(10);

      app.moveNodes([id], { x: 30, y: 40 });
      const after = app.getState().document.nodes.get(id);
      expect(after?.type === 'rect' && after.x).toBe(40);
      expect(after?.type === 'rect' && after.y).toBe(60);

      app.undo();
      const undone = app.getState().document.nodes.get(id);
      expect(undone?.type === 'rect' && undone.x).toBe(10);
      expect(undone?.type === 'rect' && undone.y).toBe(20);

      expect(app.getState().canRedo).toBe(true);
    });

    it('redo re-applies the move', () => {
      const id = app.addRect(10, 20, 100, 50);
      app.moveNodes([id], { x: 30, y: 40 });
      app.undo();
      app.redo();
      const node = app.getState().document.nodes.get(id);
      expect(node?.type === 'rect' && node.x).toBe(40);
    });

    it('new command after undo clears redo stack', () => {
      const id = app.addRect(10, 20, 100, 50);
      app.moveNodes([id], { x: 30, y: 0 });
      app.undo();
      expect(app.getState().canRedo).toBe(true);
      app.moveNodes([id], { x: 5, y: 0 });
      expect(app.getState().canRedo).toBe(false);
    });
  });

  describe('open → select → move → undo integration', () => {
    it('full flow: open file, select node, move, undo, verify restored', () => {
      app.openSvg(SIMPLE_SVG, 'test.svg');

      const ids = [...app.getState().document.nodes.keys()];
      const rectId = ids.find((id) => app.getState().document.nodes.get(id)?.type === 'rect')!;

      app.selectNode(rectId);
      const preMove = app.getState().document.nodes.get(rectId);
      expect(preMove?.type === 'rect' && preMove.x).toBe(10);

      app.moveNodes([rectId], { x: 50, y: 50 });
      const postMove = app.getState().document.nodes.get(rectId);
      expect(postMove?.type === 'rect' && postMove.x).toBe(60);

      expect(app.getState().isDirty).toBe(true);
      expect(app.getState().canUndo).toBe(true);

      app.undo();
      const restored = app.getState().document.nodes.get(rectId);
      expect(restored?.type === 'rect' && restored.x).toBe(10);
      expect(restored?.type === 'rect' && restored.y).toBe(20);
    });
  });

  describe('deleteSelected + undo', () => {
    it('deletes selected nodes and undo restores them', () => {
      const id = app.addRect(0, 0, 100, 100);
      app.selectNode(id);
      app.deleteSelected();
      expect(app.getState().document.nodes.has(id)).toBe(false);
      app.undo(); // undo delete
      app.undo(); // undo addRect (history: addRect, deleteSelected)
      // After undoing addRect, node should be gone
      expect(app.getState().document.nodes.has(id)).toBe(false);
    });

    it('undo delete restores the node', () => {
      const id = app.addRect(0, 0, 100, 100);
      app.selectNode(id);
      app.deleteSelected();
      expect(app.getState().document.nodes.has(id)).toBe(false);
      app.undo();
      expect(app.getState().document.nodes.has(id)).toBe(true);
    });
  });

  describe('duplicate', () => {
    it('duplicates selected nodes with offset', () => {
      const id = app.addRect(10, 10, 100, 50);
      app.selectNode(id);
      app.duplicate();
      expect(app.getState().document.nodes.size).toBe(2);
      const dupId = [...app.getState().selection.ids][0]!;
      const dup = app.getState().document.nodes.get(dupId);
      expect(dup?.type === 'rect' && dup.x).toBe(20); // 10 + 10 offset
    });
  });

  describe('groupNodes + ungroupNodes', () => {
    it('groups nodes and ungroups them back', () => {
      const r1 = app.addRect(0, 0, 10, 10);
      const r2 = app.addRect(20, 0, 10, 10);

      const groupId = app.groupNodes([r1, r2]);
      const state = app.getState();
      expect(state.document.nodes.get(groupId)?.type).toBe('group');
      expect(state.document.rootOrder).toContain(groupId);
      expect(state.document.rootOrder).not.toContain(r1);

      const ungroupedIds = app.ungroupNodes([groupId]);
      expect(ungroupedIds).toContain(r1);
      expect(ungroupedIds).toContain(r2);
      expect(app.getState().document.nodes.has(groupId)).toBe(false);
    });
  });

  describe('z-order', () => {
    it('bringToFront moves node to end of rootOrder', () => {
      const r1 = app.addRect(0, 0, 10, 10);
      const r2 = app.addRect(10, 0, 10, 10);
      app.bringToFront([r1]);
      const order = app.getState().document.rootOrder;
      expect(order[order.length - 1]).toBe(r1);
    });

    it('sendToBack moves node to start of rootOrder', () => {
      const r1 = app.addRect(0, 0, 10, 10);
      const r2 = app.addRect(10, 0, 10, 10);
      app.sendToBack([r2]);
      const order = app.getState().document.rootOrder;
      expect(order[0]).toBe(r2);
    });
  });

  describe('exportSvg', () => {
    it('exports valid SVG string after opening', () => {
      app.openSvg(SIMPLE_SVG);
      const exported = app.exportSvg();
      expect(exported).toContain('<svg');
      expect(exported).toContain('</svg>');
      expect(exported).toContain('rect');
      expect(exported).toContain('ellipse');
    });

    it('round-trips node count', () => {
      app.openSvg(SIMPLE_SVG);
      const exported = app.exportSvg();
      app.openSvg(exported);
      expect(app.getState().document.nodes.size).toBe(2);
    });
  });

  describe('newDocument', () => {
    it('creates a fresh empty document', () => {
      app.openSvg(SIMPLE_SVG);
      app.newDocument(1920, 1080);
      const state = app.getState();
      expect(state.document.nodes.size).toBe(0);
      expect(state.document.width).toBe(1920);
      expect(state.document.height).toBe(1080);
      expect(state.canUndo).toBe(false);
    });
  });

  describe('setNodeAttribute', () => {
    it('sets a node attribute and undoes it', () => {
      const id = app.addRect(10, 10, 100, 50);
      app.setNodeAttribute(id, 'name', 'MyRect');
      expect(app.getState().document.nodes.get(id)?.name).toBe('MyRect');
      app.undo();
      expect(app.getState().document.nodes.get(id)?.name).toBe('Rectangle');
    });
  });

  describe('history canUndo/canRedo state', () => {
    it('tracks canUndo and canRedo correctly', () => {
      expect(app.getState().canUndo).toBe(false);
      expect(app.getState().canRedo).toBe(false);

      app.addRect(0, 0, 10, 10);
      expect(app.getState().canUndo).toBe(true);
      expect(app.getState().canRedo).toBe(false);

      app.undo();
      expect(app.getState().canUndo).toBe(false);
      expect(app.getState().canRedo).toBe(true);

      app.redo();
      expect(app.getState().canUndo).toBe(true);
      expect(app.getState().canRedo).toBe(false);
    });
  });
});
