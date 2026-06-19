import type { EditorState, ToolType } from '../../../domain/aggregates/EditorState';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { Point } from '../../../domain/value-objects/Point';
import type { BoundingBox } from '../../../domain/value-objects/BoundingBox';
import type { Transform } from '../../../domain/value-objects/Transform';
import type { SvgNode } from '../../../domain/entities/SvgNode';
import type { Unsubscribe } from '../driven/IEventBus';

export type ResizeHandle =
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right';

export interface IEditorApplication {
  // ── State subscription ─────────────────────────────────────────────────
  subscribe(listener: (state: EditorState) => void): Unsubscribe;
  getState(): EditorState;

  // ── File ───────────────────────────────────────────────────────────────
  openSvg(svgString: string, filename?: string): void;
  newDocument(width: number, height: number): void;
  exportSvg(): string;
  markClean(): void;

  // ── Selection ──────────────────────────────────────────────────────────
  selectNode(id: NodeId, addToSelection?: boolean): void;
  selectByMarquee(box: BoundingBox, addToSelection?: boolean): void;
  selectAll(): void;
  deselectAll(): void;

  // ── Transform ──────────────────────────────────────────────────────────
  moveNodes(ids: NodeId[], delta: Point): void;
  resizeNode(id: NodeId, handle: ResizeHandle, delta: Point, keepAspectRatio?: boolean): void;
  rotateNodes(ids: NodeId[], angleDeg: number, pivot?: Point): void;
  flipNodes(ids: NodeId[], axis: 'horizontal' | 'vertical'): void;

  // ── Z-Order ────────────────────────────────────────────────────────────
  bringToFront(ids: NodeId[]): void;
  sendToBack(ids: NodeId[]): void;
  bringForward(ids: NodeId[]): void;
  sendBackward(ids: NodeId[]): void;

  // ── Grouping ───────────────────────────────────────────────────────────
  groupNodes(ids: NodeId[]): NodeId;
  ungroupNodes(ids: NodeId[]): NodeId[];

  // ── Node creation ──────────────────────────────────────────────────────
  addRect(x: number, y: number, width: number, height: number): NodeId;
  addEllipse(cx: number, cy: number, rx: number, ry: number): NodeId;
  addText(x: number, y: number, content: string): NodeId;

  // ── Clipboard ──────────────────────────────────────────────────────────
  copy(): void;
  cut(): void;
  paste(): void;
  duplicate(): void;
  deleteSelected(): void;

  // ── History ────────────────────────────────────────────────────────────
  undo(): void;
  redo(): void;

  // ── Viewport (not in history) ──────────────────────────────────────────
  setViewTransform(t: Transform): void;
  setActiveTool(tool: ToolType): void;

  // ── Property editing ───────────────────────────────────────────────────
  setNodeAttribute<K extends keyof SvgNode>(id: NodeId, key: K, value: SvgNode[K]): void;
  setNodesAttribute<K extends keyof SvgNode>(ids: NodeId[], key: K, value: SvgNode[K]): void;
}
