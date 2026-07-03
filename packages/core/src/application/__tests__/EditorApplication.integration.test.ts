import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EditorApplication } from '../EditorApplication';
import type { EditorApplicationDeps } from '../EditorApplication';
import type { ISerializer } from '../ports/driven/ISerializer';
import type { IClipboardAdapter } from '../ports/driven/IClipboardAdapter';
import { InMemoryEventBus } from '../../infrastructure/event-bus/InMemoryEventBus';
import { parseSvg, serializeSvg } from '../../infrastructure/serialization';
import type { SvgNode } from '../../domain/entities/SvgNode';
import type { DocumentId } from '../../domain/value-objects/NodeId';
import { Color, Fill, Stroke } from '../../domain/value-objects';
import { NodeCapabilities } from '../../domain/services';

// ── Minimal serializer adapter ─────────────────────────────────────────────

const serializer: ISerializer = {
  parse: (svgString, docId) => parseSvg(svgString, docId),
  serialize: (doc) => serializeSvg(doc),
};

// ── Minimal clipboard adapter ──────────────────────────────────────────────

class InMemoryClipboard implements IClipboardAdapter {
  private _items: SvgNode[] | null = null;
  async write(nodes: SvgNode[]): Promise<void> {
    this._items = nodes;
  }
  async read(): Promise<SvgNode[] | null> {
    return this._items;
  }
}

// ── Simple sequential ID generator ────────────────────────────────────────

class SequentialIdGenerator {
  private _counter = 0;
  generate(): string {
    return `id-${++this._counter}`;
  }
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

    it('creates every concrete SVG node exposed by the public API', () => {
      const circleId = app.addCircle(100, 100, 50);
      const lineId = app.addLine(0, 0, 100, 100);
      const polylineId = app.addPolyline([
        { x: 0, y: 0 },
        { x: 50, y: 20 },
      ]);
      const polygonId = app.addPolygon([
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 25, y: 40 },
      ]);
      const pathId = app.addPath('M 0 0 L 20 20 Z');
      const imageId = app.addImage({
        href: 'data:image/png;base64,abc',
        x: 10,
        y: 20,
        width: 30,
        height: 40,
      });
      const useId = app.addUse({ href: circleId, x: 5, y: 6, width: 50, height: 50 });

      const nodes = app.getState().document.nodes;
      expect(nodes.get(circleId)?.type).toBe('circle');
      expect(nodes.get(lineId)?.type).toBe('line');
      expect(nodes.get(polylineId)?.type).toBe('polyline');
      expect(nodes.get(polygonId)?.type).toBe('polygon');
      expect(nodes.get(pathId)?.type).toBe('path');
      expect(nodes.get(imageId)?.type).toBe('image');
      expect(nodes.get(useId)?.type).toBe('use');
      expect(app.getState().selection.ids.has(useId)).toBe(true);
      expect(app.getState().canUndo).toBe(true);
    });

    it('addShapePreset creates deterministic preset geometry', () => {
      const triangleId = app.addShapePreset('triangle', { x: 0, y: 0, width: 100, height: 80 });
      const heartId = app.addShapePreset('heart', { x: 0, y: 0, width: 100, height: 80 });

      const triangle = app.getState().document.nodes.get(triangleId);
      const heart = app.getState().document.nodes.get(heartId);

      expect(triangle?.type).toBe('polygon');
      expect(triangle?.type === 'polygon' && triangle.points).toHaveLength(3);
      expect(heart?.type).toBe('path');
      expect(heart?.type === 'path' && heart.commands.length).toBeGreaterThan(1);
    });

    it('addText creates a text node', () => {
      const id = app.addText(0, 0, 'Hello');
      const node = app.getState().document.nodes.get(id);
      expect(node?.type).toBe('text');
      if (node?.type === 'text') {
        expect(node.content).toBe('Hello');
      }
    });

    it('round-trips newly created SVG node types through export and parse', () => {
      const circleId = app.addCircle(20, 20, 10);
      app.addLine(0, 0, 40, 40);
      app.addPolyline([
        { x: 0, y: 0 },
        { x: 10, y: 20 },
        { x: 20, y: 0 },
      ]);
      app.addPolygon([
        { x: 0, y: 0 },
        { x: 30, y: 0 },
        { x: 15, y: 30 },
      ]);
      app.addPath('M 0 0 L 20 20 Z');
      app.addImage({ href: 'https://example.com/image.png', x: 0, y: 0, width: 100, height: 60 });
      app.addUse({ href: circleId, x: 5, y: 5, width: 20, height: 20 });

      const svg = app.exportSvg();
      app.openSvg(svg, 'round-trip.svg');
      const types = [...app.getState().document.nodes.values()].map((node) => node.type);

      expect(types).toEqual(
        expect.arrayContaining(['circle', 'line', 'polyline', 'polygon', 'path', 'image', 'use']),
      );
      expect(svg).toContain('href="https://example.com/image.png"');
    });
  });

  describe('capability-driven property editing', () => {
    it('sets fill, stroke, opacity, visibility and locked via dedicated API', () => {
      const id = app.addRect(10, 20, 100, 50);
      const fill = Fill.solid(Color.fromHex('#336699'));
      const stroke = Stroke.of({ color: Color.fromHex('#ff00aa'), width: 3 });

      app.setFill([id], fill);
      app.setStroke([id], stroke);
      app.setOpacity([id], 2);
      app.setVisibility([id], false);
      app.setLocked([id], true);

      const node = app.getState().document.nodes.get(id);
      expect(node?.fill).toEqual(fill);
      expect(node?.stroke).toEqual(stroke);
      expect(node?.opacity).toBe(1);
      expect(node?.visibility).toBe(false);
      expect(node?.locked).toBe(true);
    });

    it('sets text style through the public text API', () => {
      const id = app.addText(0, 0, 'Hello');
      app.setTextStyle(id, {
        fill: Fill.solid(Color.fromHex('#ff0000')),
        fontFamily: 'Inter, sans-serif',
        fontSize: 32,
        fontWeight: 700,
        fontStyle: 'italic',
        letterSpacing: 1.5,
      });

      const node = app.getState().document.nodes.get(id);
      expect(node?.type).toBe('text');
      if (node?.type === 'text') {
        expect(node.fontFamily).toBe('Inter, sans-serif');
        expect(node.fontSize).toBe(32);
        expect(node.fontWeight).toBe(700);
        expect(node.fontStyle).toBe('italic');
        expect(node.letterSpacing).toBe(1.5);
        expect(node.fill).toEqual(Fill.solid(Color.fromHex('#ff0000')));
      }
    });

    it('resolves unavailable text fonts to an explicit fallback', () => {
      const id = app.addText(0, 0, 'Hello');
      app.setTextStyle(id, { fontFamily: '"Missing Display", Inter, sans-serif' });

      const resolution = app.resolveTextFont(id, ['Inter'], 'Arial');

      expect(resolution).toEqual({
        requested: '"Missing Display", Inter, sans-serif',
        available: true,
        resolved: 'Inter',
        fallback: 'Arial',
      });

      app.setTextStyle(id, { fontFamily: 'Missing Display' });
      expect(app.resolveTextFont(id, ['Inter'], 'Arial')?.resolved).toBe('Arial');
    });

    it('serializes and parses rich text runs as tspans', () => {
      const id = app.addText(0, 20, 'Hello World');
      app.setTextRangeStyle(
        id,
        { start: 6, end: 11 },
        {
          fill: Fill.solid(Color.fromHex('#0000ff')),
          fontFamily: 'Georgia',
          fontSize: 24,
        },
      );

      const svg = app.exportSvg();
      expect(svg).toContain('<tspan');
      expect(svg).toContain('font-family="Georgia"');
      expect(svg).toContain('fill="#0000ff"');

      app.openSvg(svg, 'rich.svg');
      const parsed = [...app.getState().document.nodes.values()].find(
        (node) => node.type === 'text',
      );
      expect(parsed?.type).toBe('text');
      expect(parsed?.type === 'text' && parsed.runs.length).toBeGreaterThan(1);
    });

    it('sets image href and preserveAspectRatio through image-specific APIs', () => {
      const id = app.addImage({ href: 'old.png', x: 0, y: 0, width: 100, height: 50 });

      app.setImageHref(id, 'new.png');
      app.setImagePreserveAspectRatio(id, 'none');

      const node = app.getState().document.nodes.get(id);
      expect(node?.type).toBe('image');
      if (node?.type === 'image') {
        expect(node.href).toBe('new.png');
        expect(node.preserveAspectRatio).toBe('none');
      }
    });

    it('embeds image data as data URI', () => {
      const id = app.addImage({ href: 'old.png', x: 0, y: 0, width: 10, height: 10 });
      app.embedImageData(id, 'image/png', 'abc123');
      const node = app.getState().document.nodes.get(id);
      expect(node?.type === 'image' && node.href).toBe('data:image/png;base64,abc123');
    });

    it('reports node capabilities and editable attributes', () => {
      const rectId = app.addRect(0, 0, 100, 50);
      const imageId = app.addImage({ href: 'image.png', x: 0, y: 0, width: 100, height: 50 });
      const textId = app.addText(0, 0, 'Hello');

      const rect = app.getState().document.nodes.get(rectId)!;
      const image = app.getState().document.nodes.get(imageId)!;
      const text = app.getState().document.nodes.get(textId)!;

      expect(NodeCapabilities.forNode(rect).canRoundCorners).toBe(true);
      expect(NodeCapabilities.forNode(image).canCrop).toBe(true);
      expect(NodeCapabilities.forNode(text).canUseRichText).toBe(true);
      expect(NodeCapabilities.getEditableAttributes(text).map((attr) => attr.key)).toContain(
        'fontFamily',
      );
    });

    it('sets corner radii and converts shapes to paths', () => {
      const rectId = app.addRect(0, 0, 100, 50);
      app.setCornerRadius(rectId, 999);
      let node = app.getState().document.nodes.get(rectId);
      expect(node?.type === 'rect' && node.rx).toBe(50);
      expect(node?.type === 'rect' && node.ry).toBe(25);

      app.convertToPath([rectId]);
      node = app.getState().document.nodes.get(rectId);
      expect(node?.type).toBe('path');
      expect(node?.type === 'path' && node.commands.length).toBeGreaterThan(4);
    });

    it('edits geometry through typed geometry APIs', () => {
      const rectId = app.addRect(0, 0, 10, 10);
      const circleId = app.addCircle(10, 10, 5);
      const lineId = app.addLine(0, 0, 10, 10);

      app.setRectGeometry(rectId, { x: 5, width: 40, rx: 999 });
      app.setCircleGeometry(circleId, { r: 20 });
      app.setLineGeometry(lineId, { x2: 50 });

      const rect = app.getState().document.nodes.get(rectId);
      const circle = app.getState().document.nodes.get(circleId);
      const line = app.getState().document.nodes.get(lineId);

      expect(rect?.type === 'rect' && rect.x).toBe(5);
      expect(rect?.type === 'rect' && rect.rx).toBe(20);
      expect(circle?.type === 'circle' && circle.r).toBe(20);
      expect(line?.type === 'line' && line.x2).toBe(50);
    });

    it('creates gradients, applies fill refs and serializes defs', () => {
      const rectId = app.addRect(0, 0, 100, 50);
      const gradientId = app.createLinearGradient({
        id: 'brand-gradient',
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 0,
        gradientUnits: 'objectBoundingBox',
        stops: [
          { offset: 0, color: Color.fromHex('#ff0000'), opacity: 1 },
          { offset: 1, color: Color.fromHex('#0000ff'), opacity: 1 },
        ],
      });

      app.applyFillDef([rectId], gradientId);
      const svg = app.exportSvg();

      expect(svg).toContain('<linearGradient id="brand-gradient"');
      expect(svg).toContain('fill="url(#brand-gradient)"');
    });

    it('applies stroke defs and image crop clip paths', () => {
      const rectId = app.addRect(0, 0, 100, 50);
      const imageId = app.addImage({ href: 'image.png', x: 0, y: 0, width: 100, height: 80 });
      const gradientId = app.createLinearGradient({
        id: 'stroke-gradient',
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 0,
        gradientUnits: 'objectBoundingBox',
        stops: [
          { offset: 0, color: Color.fromHex('#111111'), opacity: 1 },
          { offset: 1, color: Color.fromHex('#eeeeee'), opacity: 1 },
        ],
      });

      app.applyStrokeDef([rectId], gradientId);
      const clipId = app.setImageCrop(imageId, { x: 10, y: 10, width: 40, height: 40 });
      const svg = app.exportSvg();

      expect(svg).toContain(`stroke="url(#${gradientId})"`);
      expect(svg).toContain(`<clipPath id="${clipId}"`);
      expect(svg).toContain(`clip-path="url(#${clipId})"`);
    });

    it('aligns, distributes and arranges nodes through layout APIs', () => {
      const a = app.addRect(0, 0, 10, 10);
      const b = app.addRect(40, 20, 10, 10);
      const c = app.addRect(100, 40, 10, 10);

      app.alignVertical([a, b, c], 'top');
      const topValues = [a, b, c].map((id) => {
        const node = app.getState().document.nodes.get(id);
        return node?.type === 'rect' ? node.y : null;
      });
      expect(new Set(topValues).size).toBe(1);

      app.arrangeAsRow([a, b, c], 5);
      const nodes = [a, b, c].map((id) => app.getState().document.nodes.get(id));
      expect(nodes[0]?.type === 'rect' && nodes[0].x).toBe(0);
      expect(nodes[1]?.type === 'rect' && nodes[1].x).toBe(15);
      expect(nodes[2]?.type === 'rect' && nodes[2].x).toBe(30);
    });

    it('resizes multi-selection and creates frame nodes', () => {
      const a = app.addRect(0, 0, 10, 10);
      const b = app.addRect(20, 0, 10, 10);
      app.resizeSelectionToBounds([a, b], { x: 10, y: 10, width: 60, height: 20 });

      const summary = app.getDocumentSummary();
      expect(summary.nodes.find((node) => node.id === a)?.bounds.x).toBeCloseTo(10);
      expect(summary.nodes.find((node) => node.id === b)?.bounds.x).toBeGreaterThan(40);

      const frame = app.createFrame({ x: 0, y: 0, width: 100, height: 80 }, 'Card Frame');
      const frameNode = app.getState().document.nodes.get(frame);
      expect(frameNode?.name).toBe('Card Frame');
      expect(frameNode?.metadata.frame).toBe('true');
    });

    it('applies fixed, hug and fill resize constraints', () => {
      const frame = app.createFrame({ x: 0, y: 0, width: 40, height: 40 }, 'Frame');
      const child = app.addRect(10, 12, 30, 20);
      const fill = app.addRect(0, 0, 10, 10);

      app.setFrameLayout(frame, { mode: 'none', padding: 0, gap: 0 }, [child]);
      app.setResizeConstraints([frame], { width: 'hug', height: 'hug' });
      app.applyResizeConstraints([frame]);

      let frameNode = app.getState().document.nodes.get(frame);
      expect(frameNode?.type === 'rect' && frameNode.x).toBe(10);
      expect(frameNode?.type === 'rect' && frameNode.width).toBe(30);

      app.setResizeConstraints([fill], { width: 'fill', height: 'fill' });
      app.applyResizeConstraints([fill], { x: 5, y: 6, width: 70, height: 80 });
      const fillNode = app.getState().document.nodes.get(fill);
      expect(fillNode?.type === 'rect' && fillNode.x).toBe(5);
      expect(fillNode?.type === 'rect' && fillNode.height).toBe(80);
    });

    it('applies frame layout and fits frame to content', () => {
      const frame = app.createFrame({ x: 0, y: 0, width: 200, height: 100 }, 'Frame');
      const a = app.addRect(80, 80, 20, 10);
      const b = app.addRect(120, 80, 20, 10);

      app.setFrameLayout(frame, { mode: 'horizontal', padding: 10, gap: 5 }, [a, b]);
      app.applyFrameLayout(frame);

      let first = app.getState().document.nodes.get(a);
      let second = app.getState().document.nodes.get(b);
      expect(first?.type === 'rect' && first.x).toBe(10);
      expect(second?.type === 'rect' && second.x).toBe(35);

      app.fitFrameToContent(frame);
      const frameNode = app.getState().document.nodes.get(frame);
      expect(frameNode?.type === 'rect' && frameNode.width).toBe(65);
    });

    it('creates, applies, updates and exports design styles', () => {
      const rectId = app.addRect(0, 0, 20, 20);
      const textId = app.addText(0, 20, 'Styled');
      const fillStyle = app.createFillStyle('Brand Fill', Fill.solid(Color.fromHex('#123456')));
      const textStyle = app.createTextStyle('Headline', { fontFamily: 'Inter', fontSize: 42 });

      app.applyStyle([rectId], fillStyle);
      app.applyStyle([textId], textStyle);
      app.updateFillStyle(fillStyle, Fill.solid(Color.fromHex('#654321')));

      const rect = app.getState().document.nodes.get(rectId);
      const text = app.getState().document.nodes.get(textId);
      const tokens = app.exportDesignTokens();

      expect(rect?.fill).toEqual(Fill.solid(Color.fromHex('#654321')));
      expect(text?.type === 'text' && text.fontSize).toBe(42);
      expect(tokens.fillStyles[fillStyle]).toEqual(Fill.solid(Color.fromHex('#654321')));
      expect(tokens.textStyles[textStyle]?.fontFamily).toBe('Inter');
    });

    it('supports transform utilities with undoable updates', () => {
      const id = app.addRect(0, 0, 100, 50);
      app.scaleNodes([id], 2, 2);
      let node = app.getState().document.nodes.get(id);
      expect(node?.transform.matrix[0]).toBeCloseTo(2);

      app.resetTransform([id]);
      node = app.getState().document.nodes.get(id);
      expect(node?.transform.matrix).toEqual([1, 0, 0, 1, 0, 0]);

      app.undo();
      node = app.getState().document.nodes.get(id);
      expect(node?.transform.matrix[0]).toBeCloseTo(2);
    });

    it('opens, closes, simplifies and compounds paths', () => {
      const pathId = app.addPath('M 0 0 L 10 10 L 10 10 Z');
      app.simplifyPath(pathId);
      let node = app.getState().document.nodes.get(pathId);
      expect(node?.type === 'path' && node.commands).toHaveLength(3);

      app.openPath(pathId);
      node = app.getState().document.nodes.get(pathId);
      expect(node?.type === 'path' && node.commands.at(-1)?.type).not.toBe('Z');

      app.closePath(pathId);
      node = app.getState().document.nodes.get(pathId);
      expect(node?.type === 'path' && node.commands.at(-1)?.type).toBe('Z');

      const rectId = app.addRect(20, 20, 30, 30);
      const compoundId = app.createCompoundPath([pathId, rectId], 'Combined');
      const compound = compoundId ? app.getState().document.nodes.get(compoundId) : null;
      expect(compound?.type).toBe('path');
      expect(compound?.metadata.compoundPath).toBe('true');
    });

    it('converts path segments between lines and cubic curves', () => {
      const pathId = app.addPath('M 0 0 L 30 0');

      app.convertPathSegmentToCurve(pathId, 1);
      let node = app.getState().document.nodes.get(pathId);
      expect(node?.type === 'path' && node.commands[1]?.type).toBe('C');

      app.convertPathSegmentToLine(pathId, 1);
      node = app.getState().document.nodes.get(pathId);
      expect(node?.type === 'path' && node.commands[1]).toEqual({
        type: 'L',
        point: { x: 30, y: 0 },
      });
    });

    it('creates boolean composition paths and outlines strokes', () => {
      const a = app.addRect(0, 0, 40, 40);
      const b = app.addRect(20, 20, 40, 40);
      app.setStroke([a], Stroke.of({ width: 8 }));

      const union = app.unionPaths([a, b], 'Union');
      const intersection = app.intersectPaths([a, b], 'Intersection');
      const subtract = app.subtractPaths([a, b], 'Subtract');
      const exclude = app.excludePaths([a, b], 'Exclude');
      const outline = app.outlineStroke([a], 'Outline');

      const nodes = app.getState().document.nodes;
      expect(nodes.get(union!)?.metadata.booleanOperation).toBe('union');
      expect(nodes.get(intersection!)?.metadata.booleanOperation).toBe('intersect');
      expect(nodes.get(subtract!)?.metadata.booleanOperation).toBe('subtract');
      expect(nodes.get(exclude!)?.metadata.booleanOperation).toBe('exclude');
      expect(nodes.get(outline!)?.metadata.outlinedStroke).toBe('true');
    });

    it('finds, patches and summarizes nodes for programmatic design', () => {
      const rectId = app.addRect(0, 0, 100, 50);
      app.patchMetadata([rectId], { role: 'hero' });

      const found = app.findNodes({ metadata: { role: 'hero' } });
      expect(found).toEqual([rectId]);

      const updated = app.updateNodes({ metadata: { role: 'hero' } }, { name: 'Hero Shape' });
      const summary = app.getDocumentSummary();

      expect(updated).toEqual([rectId]);
      expect(summary.nodeCount).toBe(1);
      expect(summary.nodes[0]?.name).toBe('Hero Shape');
      expect(summary.nodes[0]?.bounds.width).toBe(100);
    });

    it('creates and patches designs declaratively', () => {
      const ids = app.createDesign({
        width: 320,
        height: 200,
        nodes: [
          {
            kind: 'rect',
            x: 0,
            y: 0,
            width: 320,
            height: 200,
            name: 'Background',
            metadata: { role: 'bg' },
          },
          { kind: 'text', x: 20, y: 40, content: 'Title', name: 'Title', stableId: 'title' },
        ],
      });

      expect(ids).toHaveLength(2);
      expect(app.getState().document.width).toBe(320);
      expect(app.findNodes({ metadata: { stableId: 'title' } })).toHaveLength(1);
      expect(app.getAvailableCommands([ids[1]!])).toContain('setTextRuns');

      const changed = app.applyDesignPatch({
        update: [{ query: { metadata: { role: 'bg' } }, patch: { name: 'Updated Background' } }],
        create: [
          {
            kind: 'shape',
            preset: 'star',
            bounds: { x: 100, y: 60, width: 50, height: 50 },
            name: 'Star',
          },
        ],
      });

      expect(changed.length).toBe(2);
      expect(app.findNodes({ name: 'Updated Background' })).toHaveLength(1);
      expect(app.findNodes({ name: 'Star' })).toHaveLength(1);
    });

    it('reuses stable IDs when applying declarative design patches repeatedly', () => {
      app.createDesign({
        width: 200,
        height: 100,
        nodes: [
          {
            kind: 'rect',
            stableId: 'hero-bg',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            name: 'Hero',
          },
        ],
      });

      const firstId = app.findNodes({ metadata: { stableId: 'hero-bg' } })[0]!;
      app.applyDesignPatch({
        create: [
          {
            kind: 'rect',
            stableId: 'hero-bg',
            x: 10,
            y: 20,
            width: 120,
            height: 60,
            name: 'Hero Updated',
          },
        ],
      });

      const ids = app.findNodes({ metadata: { stableId: 'hero-bg' } });
      const node = app.getState().document.nodes.get(firstId);

      expect(ids).toEqual([firstId]);
      expect(node?.name).toBe('Hero Updated');
      expect(node?.type === 'rect' && node.x).toBe(10);
      expect(node?.type === 'rect' && node.width).toBe(120);
    });
  });

  describe('selection', () => {
    beforeEach(() => {
      app.openSvg(SIMPLE_SVG);
    });

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
      app.selectNode(
        a as ReturnType<typeof import('../../domain/value-objects/NodeId').NodeId.from>,
      );
      app.selectNode(
        b as ReturnType<typeof import('../../domain/value-objects/NodeId').NodeId.from>,
        true,
      );
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
      const unknownId = 'unknown-id' as ReturnType<
        typeof import('../../domain/value-objects/NodeId').NodeId.from
      >;
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
