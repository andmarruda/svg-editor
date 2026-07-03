import type {
  AddImageInput,
  AddUseInput,
  BooleanOperation,
  CornerRadii,
  CreateLinearGradientInput,
  CreateRawDefInput,
  CreateRadialGradientInput,
  DesignNodeSpec,
  DesignPatch,
  DesignSpec,
  DesignTokens,
  DocumentSummary,
  BoxGeometry,
  CircleGeometry,
  EllipseGeometry,
  FrameLayout,
  ImageFit,
  IEditorApplication,
  LineGeometry,
  NodePatch,
  NodeQuery,
  RectGeometry,
  ResizeConstraints,
  ResizeHandle,
  TextRange,
  TextFontResolution,
  TextStylePatch,
} from './ports/driving/IEditorApplication';
import type { ISerializer } from './ports/driven/ISerializer';
import type { IClipboardAdapter } from './ports/driven/IClipboardAdapter';
import type { IEventBus, Unsubscribe } from './ports/driven/IEventBus';
import type { IIdGenerator } from './ports/driven/IIdGenerator';
import type {
  GradientStopDef,
  LinearGradientDef,
  RadialGradientDef,
} from '../domain/aggregates/SvgDefs';
import type { EditorState, ToolType } from '../domain/aggregates/EditorState';
import type { NodeId } from '../domain/value-objects/NodeId';
import type { Stroke } from '../domain/value-objects/Stroke';
import type { SvgNode } from '../domain/entities/SvgNode';
import type { PathCommand } from '../domain/entities/PathCommand';
import type { PreserveAspectRatio } from '../domain/entities/ImageNode';
import type { PathNode } from '../domain/entities/PathNode';
import type { TextRun, TextRunStyle } from '../domain/entities/TextNode';
import type { ShapePreset } from '../domain/services/ShapeFactory';
import { Document } from '../domain/aggregates/Document';
import { DocumentId } from '../domain/value-objects/NodeId';
import { BoundingBox } from '../domain/value-objects/BoundingBox';
import { Fill } from '../domain/value-objects/Fill';
import { Point } from '../domain/value-objects/Point';
import { Transform } from '../domain/value-objects/Transform';
import { Selection } from '../domain/aggregates/Selection';
import { BoundsCalculator } from '../domain/services/BoundsCalculator';
import { GeometryService } from '../domain/services/GeometryService';
import { LayoutService } from '../domain/services/LayoutService';
import { NodeCapabilities } from '../domain/services/NodeCapabilities';
import { TransformService } from '../domain/services/TransformService';
import { parsePath } from '../infrastructure/serialization/PathParser';
import { HistoryManager } from './history/HistoryManager';
import { OpenSvgUseCase } from './use-cases/file/OpenSvgUseCase';
import { NewDocumentUseCase } from './use-cases/file/NewDocumentUseCase';
import { ExportSvgUseCase } from './use-cases/file/ExportSvgUseCase';
import { SelectNodeUseCase } from './use-cases/selection/SelectNodeUseCase';
import { SelectByMarqueeUseCase } from './use-cases/selection/SelectByMarqueeUseCase';
import { SelectAllUseCase } from './use-cases/selection/SelectAllUseCase';
import { MoveNodesUseCase } from './use-cases/transform/MoveNodesUseCase';
import { ResizeNodeUseCase } from './use-cases/transform/ResizeNodeUseCase';
import { RotateNodesUseCase } from './use-cases/transform/RotateNodesUseCase';
import { FlipNodesUseCase } from './use-cases/transform/FlipNodesUseCase';
import { BringToFrontUseCase } from './use-cases/z-order/BringToFrontUseCase';
import { SendToBackUseCase } from './use-cases/z-order/SendToBackUseCase';
import { BringForwardUseCase } from './use-cases/z-order/BringForwardUseCase';
import { SendBackwardUseCase } from './use-cases/z-order/SendBackwardUseCase';
import { GroupNodesUseCase } from './use-cases/grouping/GroupNodesUseCase';
import { UngroupNodesUseCase } from './use-cases/grouping/UngroupNodesUseCase';
import { CopyUseCase } from './use-cases/clipboard/CopyUseCase';
import { CutUseCase } from './use-cases/clipboard/CutUseCase';
import { PasteUseCase } from './use-cases/clipboard/PasteUseCase';
import { DuplicateUseCase } from './use-cases/clipboard/DuplicateUseCase';
import { AddRectUseCase } from './use-cases/node-creation/AddRectUseCase';
import { AddEllipseUseCase } from './use-cases/node-creation/AddEllipseUseCase';
import { AddCircleUseCase } from './use-cases/node-creation/AddCircleUseCase';
import { AddLineUseCase } from './use-cases/node-creation/AddLineUseCase';
import { AddPolylineUseCase } from './use-cases/node-creation/AddPolylineUseCase';
import { AddPolygonUseCase } from './use-cases/node-creation/AddPolygonUseCase';
import { AddPathUseCase } from './use-cases/node-creation/AddPathUseCase';
import { AddImageUseCase } from './use-cases/node-creation/AddImageUseCase';
import { AddUseUseCase } from './use-cases/node-creation/AddUseUseCase';
import { AddShapePresetUseCase } from './use-cases/node-creation/AddShapePresetUseCase';
import { AddTextUseCase } from './use-cases/node-creation/AddTextUseCase';
import { DeleteNodesUseCase } from './use-cases/node-creation/DeleteNodesUseCase';
import { SetAttributeUseCase } from './use-cases/node-creation/SetAttributeUseCase';
import { RemoveDefCommand, SetDefCommand } from './commands/SetDefCommand';
import { UpdateDocumentCommand } from './commands/UpdateDocumentCommand';
import { UpdateNodesCommand } from './commands/UpdateNodesCommand';

export interface EditorApplicationDeps {
  serializer: ISerializer;
  clipboard: IClipboardAdapter;
  eventBus: IEventBus;
  idGenerator: IIdGenerator;
}

export class EditorApplication implements IEditorApplication {
  private _state: EditorState;
  private readonly _listeners = new Set<(state: EditorState) => void>();
  private readonly _history: HistoryManager;
  private readonly _idGenerator: IIdGenerator;

  private readonly _openSvgUC: OpenSvgUseCase;
  private readonly _newDocUC: NewDocumentUseCase;
  private readonly _exportUC: ExportSvgUseCase;
  private readonly _selectNodeUC: SelectNodeUseCase;
  private readonly _selectMarqueeUC: SelectByMarqueeUseCase;
  private readonly _selectAllUC: SelectAllUseCase;
  private readonly _moveUC: MoveNodesUseCase;
  private readonly _resizeUC: ResizeNodeUseCase;
  private readonly _rotateUC: RotateNodesUseCase;
  private readonly _flipUC: FlipNodesUseCase;
  private readonly _bringFrontUC: BringToFrontUseCase;
  private readonly _sendBackUC: SendToBackUseCase;
  private readonly _bringFwdUC: BringForwardUseCase;
  private readonly _sendBwdUC: SendBackwardUseCase;
  private readonly _groupUC: GroupNodesUseCase;
  private readonly _ungroupUC: UngroupNodesUseCase;
  private readonly _copyUC: CopyUseCase;
  private readonly _cutUC: CutUseCase;
  private readonly _pasteUC: PasteUseCase;
  private readonly _dupUC: DuplicateUseCase;
  private readonly _addRectUC: AddRectUseCase;
  private readonly _addEllipseUC: AddEllipseUseCase;
  private readonly _addCircleUC: AddCircleUseCase;
  private readonly _addLineUC: AddLineUseCase;
  private readonly _addPolylineUC: AddPolylineUseCase;
  private readonly _addPolygonUC: AddPolygonUseCase;
  private readonly _addPathUC: AddPathUseCase;
  private readonly _addImageUC: AddImageUseCase;
  private readonly _addUseUC: AddUseUseCase;
  private readonly _addShapePresetUC: AddShapePresetUseCase;
  private readonly _addTextUC: AddTextUseCase;
  private readonly _deleteUC: DeleteNodesUseCase;
  private readonly _setAttrUC: SetAttributeUseCase;

  constructor(deps: EditorApplicationDeps) {
    this._history = new HistoryManager();
    this._idGenerator = deps.idGenerator;

    this._openSvgUC = new OpenSvgUseCase(deps.serializer, deps.idGenerator);
    this._newDocUC = new NewDocumentUseCase(deps.idGenerator);
    this._exportUC = new ExportSvgUseCase(deps.serializer);
    this._selectNodeUC = new SelectNodeUseCase();
    this._selectMarqueeUC = new SelectByMarqueeUseCase();
    this._selectAllUC = new SelectAllUseCase();
    this._moveUC = new MoveNodesUseCase(this._history);
    this._resizeUC = new ResizeNodeUseCase(this._history);
    this._rotateUC = new RotateNodesUseCase(this._history);
    this._flipUC = new FlipNodesUseCase(this._history);
    this._bringFrontUC = new BringToFrontUseCase(this._history);
    this._sendBackUC = new SendToBackUseCase(this._history);
    this._bringFwdUC = new BringForwardUseCase(this._history);
    this._sendBwdUC = new SendBackwardUseCase(this._history);
    this._groupUC = new GroupNodesUseCase(this._history, deps.idGenerator);
    this._ungroupUC = new UngroupNodesUseCase(this._history);
    this._copyUC = new CopyUseCase(deps.clipboard);
    this._cutUC = new CutUseCase(deps.clipboard, this._history);
    this._pasteUC = new PasteUseCase(deps.clipboard, this._history, deps.idGenerator);
    this._dupUC = new DuplicateUseCase(this._history, deps.idGenerator);
    this._addRectUC = new AddRectUseCase(this._history, deps.idGenerator);
    this._addEllipseUC = new AddEllipseUseCase(this._history, deps.idGenerator);
    this._addCircleUC = new AddCircleUseCase(this._history, deps.idGenerator);
    this._addLineUC = new AddLineUseCase(this._history, deps.idGenerator);
    this._addPolylineUC = new AddPolylineUseCase(this._history, deps.idGenerator);
    this._addPolygonUC = new AddPolygonUseCase(this._history, deps.idGenerator);
    this._addPathUC = new AddPathUseCase(this._history, deps.idGenerator);
    this._addImageUC = new AddImageUseCase(this._history, deps.idGenerator);
    this._addUseUC = new AddUseUseCase(this._history, deps.idGenerator);
    this._addShapePresetUC = new AddShapePresetUseCase(this._history, deps.idGenerator);
    this._addTextUC = new AddTextUseCase(this._history, deps.idGenerator);
    this._deleteUC = new DeleteNodesUseCase(this._history);
    this._setAttrUC = new SetAttributeUseCase(this._history);

    this._state = {
      document: Document.create(DocumentId.from('initial'), 800, 600),
      selection: Selection.EMPTY,
      viewTransform: { matrix: [1, 0, 0, 1, 0, 0] },
      activeTool: 'select',
      isDirty: false,
      canUndo: false,
      canRedo: false,
      filename: null,
    };
  }

  // ── State subscription ───────────────────────────────────────────────────

  subscribe(listener: (state: EditorState) => void): Unsubscribe {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  getState(): EditorState {
    return this._state;
  }

  // ── File ─────────────────────────────────────────────────────────────────

  openSvg(svgString: string, filename?: string): void {
    const document = this._openSvgUC.execute(svgString);
    this._history.clear();
    this._setState({
      document,
      selection: Selection.EMPTY,
      isDirty: false,
      filename: filename ?? null,
    });
  }

  newDocument(width: number, height: number): void {
    const document = this._newDocUC.execute(width, height);
    this._history.clear();
    this._setState({ document, selection: Selection.EMPTY, isDirty: false, filename: null });
  }

  exportSvg(): string {
    return this._exportUC.execute(this._state.document);
  }

  markClean(): void {
    this._setState({ isDirty: false });
  }

  // ── Selection ────────────────────────────────────────────────────────────

  selectNode(id: NodeId, addToSelection = false): void {
    const selection = this._selectNodeUC.execute(
      this._state.selection,
      this._state.document,
      id,
      addToSelection,
    );
    this._setState({ selection });
  }

  selectByMarquee(box: BoundingBox, addToSelection = false): void {
    const selection = this._selectMarqueeUC.execute(
      this._state.selection,
      this._state.document,
      box,
      addToSelection,
    );
    this._setState({ selection });
  }

  selectAll(): void {
    const selection = this._selectAllUC.execute(this._state.document);
    this._setState({ selection });
  }

  deselectAll(): void {
    this._setState({ selection: Selection.EMPTY });
  }

  // ── Transform ────────────────────────────────────────────────────────────

  moveNodes(ids: NodeId[], delta: Point): void {
    this._setDocDirty(this._moveUC.execute(this._state.document, ids, delta));
  }

  resizeNode(id: NodeId, handle: ResizeHandle, delta: Point, keepAspectRatio = false): void {
    this._setDocDirty(
      this._resizeUC.execute(this._state.document, id, handle, delta, keepAspectRatio),
    );
  }

  rotateNodes(ids: NodeId[], angleDeg: number, pivot?: Point): void {
    this._setDocDirty(this._rotateUC.execute(this._state.document, ids, angleDeg, pivot));
  }

  setRotation(ids: NodeId[], angleDeg: number, pivot?: Point): void {
    const doc = this._state.document;
    const targetPivot = pivot ?? centerOfNodes(doc, ids);
    this._setDocDirty(
      this._executeNodeUpdates(doc, ids, 'Set rotation', (node) => {
        const current = Transform.decompose(node.transform).rotation;
        const rotationPivot = targetPivot ?? BoundingBox.center(BoundsCalculator.forNode(node));
        return TransformService.applyToNode(
          node,
          Transform.rotation(angleDeg - current, rotationPivot.x, rotationPivot.y),
        );
      }),
    );
  }

  scaleNodes(ids: NodeId[], scaleX: number, scaleY: number, pivot?: Point): void {
    const doc = this._state.document;
    const computedPivot = pivot ?? centerOfNodes(doc, ids);
    this._setDocDirty(
      this._executeNodeUpdates(doc, ids, 'Scale nodes', (node) =>
        TransformService.applyToNode(
          node,
          Transform.scaling(scaleX, scaleY, computedPivot.x, computedPivot.y),
        ),
      ),
    );
  }

  skewNodes(ids: NodeId[], skewXDeg: number, skewYDeg: number, pivot?: Point): void {
    const doc = this._state.document;
    const computedPivot = pivot ?? centerOfNodes(doc, ids);
    const skew = createSkewTransform(skewXDeg, skewYDeg, computedPivot);
    this._setDocDirty(
      this._executeNodeUpdates(doc, ids, 'Skew nodes', (node) =>
        TransformService.applyToNode(node, skew),
      ),
    );
  }

  resetTransform(ids: NodeId[]): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, ids, 'Reset transform', (node) => ({
        ...node,
        transform: Transform.identity(),
      })),
    );
  }

  bakeTransform(ids: NodeId[]): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, ids, 'Bake transform', (node) =>
        GeometryService.bakeTransform(node),
      ),
    );
  }

  flipNodes(ids: NodeId[], axis: 'horizontal' | 'vertical'): void {
    this._setDocDirty(this._flipUC.execute(this._state.document, ids, axis));
  }

  // ── Layout ───────────────────────────────────────────────────────────────

  alignHorizontal(
    ids: NodeId[],
    align: Parameters<typeof LayoutService.alignHorizontal>[2],
    target: Parameters<typeof LayoutService.alignHorizontal>[3] = 'selection',
  ): void {
    const updates = LayoutService.alignHorizontal(this._state.document, ids, align, target);
    this._setDocDirty(this._applyPreparedUpdates(ids, 'Align horizontal', updates));
  }

  alignVertical(
    ids: NodeId[],
    align: Parameters<typeof LayoutService.alignVertical>[2],
    target: Parameters<typeof LayoutService.alignVertical>[3] = 'selection',
  ): void {
    const updates = LayoutService.alignVertical(this._state.document, ids, align, target);
    this._setDocDirty(this._applyPreparedUpdates(ids, 'Align vertical', updates));
  }

  distribute(ids: NodeId[], axis: 'horizontal' | 'vertical'): void {
    const updates = LayoutService.distribute(this._state.document, ids, axis);
    this._setDocDirty(this._applyPreparedUpdates(ids, 'Distribute nodes', updates));
  }

  matchSize(ids: NodeId[], sourceId?: NodeId): void {
    const source = sourceId ?? ids[0];
    if (!source) return;
    const sourceNode = this._state.document.nodes.get(source);
    if (!sourceNode) return;
    const sourceBounds = BoundsCalculator.forNode(sourceNode);
    this._setDocDirty(
      this._executeNodeUpdates(
        this._state.document,
        ids.filter((id) => id !== source),
        'Match size',
        (node) => {
          const bounds = BoundsCalculator.forNode(node);
          return GeometryService.fitBounds(node, {
            ...bounds,
            width: sourceBounds.width,
            height: sourceBounds.height,
          });
        },
      ),
    );
  }

  arrangeAsRow(ids: NodeId[], gap = 0): void {
    this._arrange(ids, Math.max(0, gap), 0, Number.POSITIVE_INFINITY);
  }

  arrangeAsColumn(ids: NodeId[], gap = 0): void {
    this._arrange(ids, 0, Math.max(0, gap), 1);
  }

  arrangeAsGrid(ids: NodeId[], columns: number, gapX = 0, gapY = 0): void {
    this._arrange(ids, Math.max(0, gapX), Math.max(0, gapY), Math.max(1, columns));
  }

  resizeSelectionToBounds(ids: NodeId[], bounds: BoundingBox): void {
    const current = BoundsCalculator.forNodes(this._state.document, ids);
    if (!current || current.width === 0 || current.height === 0) return;
    const sx = bounds.width / current.width;
    const sy = bounds.height / current.height;
    this.scaleNodes(ids, sx, sy, BoundingBox.topLeft(current));
    const scaled = BoundsCalculator.forNodes(this._state.document, ids);
    if (scaled) {
      const translation = Transform.translation(bounds.x - scaled.x, bounds.y - scaled.y);
      this._setDocDirty(
        this._executeNodeUpdates(this._state.document, ids, 'Position resized selection', (node) =>
          TransformService.applyToNode(node, translation),
        ),
      );
    }
  }

  setResizeConstraints(ids: NodeId[], constraints: ResizeConstraints): void {
    this.patchMetadata(ids, {
      ...(constraints.width ? { resizeWidth: constraints.width } : {}),
      ...(constraints.height ? { resizeHeight: constraints.height } : {}),
    });
  }

  applyResizeConstraints(ids: NodeId[], containerBounds?: BoundingBox): void {
    const updates = new Map<NodeId, SvgNode>();

    for (const id of ids) {
      const node = this._state.document.nodes.get(id);
      if (!node) continue;
      const bounds = BoundsCalculator.forNode(node);
      const widthConstraint = node.metadata.resizeWidth;
      const heightConstraint = node.metadata.resizeHeight;

      let target = bounds;
      if (widthConstraint === 'fill' && containerBounds) {
        target = { ...target, x: containerBounds.x, width: containerBounds.width };
      }
      if (heightConstraint === 'fill' && containerBounds) {
        target = { ...target, y: containerBounds.y, height: containerBounds.height };
      }

      if (widthConstraint === 'hug' || heightConstraint === 'hug') {
        const childBounds = BoundsCalculator.forNodes(
          this._state.document,
          parseNodeIds(node.metadata.layoutChildren),
        );
        if (childBounds) {
          target = {
            ...target,
            ...(widthConstraint === 'hug' ? { x: childBounds.x, width: childBounds.width } : {}),
            ...(heightConstraint === 'hug' ? { y: childBounds.y, height: childBounds.height } : {}),
          };
        }
      }

      if (!BoundingBox.equals(bounds, target))
        updates.set(id, GeometryService.fitBounds(node, target));
    }

    this._setDocDirty(this._applyPreparedUpdates(ids, 'Apply resize constraints', updates));
  }

  createFrame(bounds: BoundingBox, name = 'Frame'): NodeId {
    const id = this.addRect(bounds.x, bounds.y, bounds.width, bounds.height);
    this.setNodeAttribute(id, 'name', name);
    this.setFill([id], Fill.NONE);
    this.patchMetadata([id], { frame: 'true', layoutMode: 'none' });
    return id;
  }

  // ── Z-Order ──────────────────────────────────────────────────────────────

  bringToFront(ids: NodeId[]): void {
    this._setDocDirty(this._bringFrontUC.execute(this._state.document, ids));
  }

  sendToBack(ids: NodeId[]): void {
    this._setDocDirty(this._sendBackUC.execute(this._state.document, ids));
  }

  bringForward(ids: NodeId[]): void {
    this._setDocDirty(this._bringFwdUC.execute(this._state.document, ids));
  }

  sendBackward(ids: NodeId[]): void {
    this._setDocDirty(this._sendBwdUC.execute(this._state.document, ids));
  }

  // ── Defs ────────────────────────────────────────────────────────────────

  createLinearGradient(input: CreateLinearGradientInput): string {
    const id = input.id ?? `linear-gradient-${this._idGenerator.generate()}`;
    const def: LinearGradientDef = {
      kind: 'linear-gradient',
      id,
      x1: input.x1,
      y1: input.y1,
      x2: input.x2,
      y2: input.y2,
      stops: input.stops,
      gradientUnits: input.gradientUnits,
    };
    this._setDocDirty(this._history.execute(new SetDefCommand(def), this._state.document));
    return id;
  }

  createRadialGradient(input: CreateRadialGradientInput): string {
    const id = input.id ?? `radial-gradient-${this._idGenerator.generate()}`;
    const def: RadialGradientDef = {
      kind: 'radial-gradient',
      id,
      cx: input.cx,
      cy: input.cy,
      r: input.r,
      fx: input.fx,
      fy: input.fy,
      stops: input.stops,
      gradientUnits: input.gradientUnits,
    };
    this._setDocDirty(this._history.execute(new SetDefCommand(def), this._state.document));
    return id;
  }

  createRawDef(input: CreateRawDefInput): string {
    const id = input.id ?? `raw-def-${this._idGenerator.generate()}`;
    const rawXml = input.rawXml.includes(`id="${id}"`)
      ? input.rawXml
      : input.rawXml.replace(/^<([\w:-]+)/, `<$1 id="${id}"`);
    this._setDocDirty(
      this._history.execute(
        new SetDefCommand({
          kind: 'raw-xml',
          id,
          tagName: input.tagName,
          rawXml,
        }),
        this._state.document,
      ),
    );
    return id;
  }

  updateLinearGradient(id: string, stops: readonly GradientStopDef[]): void {
    const existing = this._state.document.defs.get(id);
    if (!existing || existing.kind !== 'linear-gradient') return;
    this._setDocDirty(
      this._history.execute(new SetDefCommand({ ...existing, stops }), this._state.document),
    );
  }

  applyFillDef(ids: NodeId[], defId: string): void {
    if (!this._state.document.defs.has(defId)) return;
    this.setFill(ids, Fill.pattern(defId));
  }

  applyStrokeDef(ids: NodeId[], defId: string): void {
    if (!this._state.document.defs.has(defId)) return;
    this.patchMetadata(ids, { strokeDefId: defId });
  }

  removeDef(id: string): void {
    this._setDocDirty(this._history.execute(new RemoveDefCommand(id), this._state.document));
  }

  // ── Grouping ─────────────────────────────────────────────────────────────

  groupNodes(ids: NodeId[]): NodeId {
    const { doc, groupId } = this._groupUC.execute(this._state.document, ids);
    this._setState({ document: doc, selection: Selection.of([groupId]), isDirty: true });
    return groupId;
  }

  ungroupNodes(ids: NodeId[]): NodeId[] {
    const { doc, ungroupedIds } = this._ungroupUC.execute(this._state.document, ids);
    this._setState({ document: doc, selection: Selection.of(ungroupedIds), isDirty: true });
    return ungroupedIds;
  }

  // ── Node creation ────────────────────────────────────────────────────────

  addRect(x: number, y: number, width: number, height: number): NodeId {
    const { doc, id } = this._addRectUC.execute(this._state.document, x, y, width, height);
    this._setState({ document: doc, selection: Selection.of([id]), isDirty: true });
    return id;
  }

  addEllipse(cx: number, cy: number, rx: number, ry: number): NodeId {
    const { doc, id } = this._addEllipseUC.execute(this._state.document, cx, cy, rx, ry);
    this._setState({ document: doc, selection: Selection.of([id]), isDirty: true });
    return id;
  }

  addCircle(cx: number, cy: number, r: number): NodeId {
    const { doc, id } = this._addCircleUC.execute(this._state.document, cx, cy, r);
    this._setState({ document: doc, selection: Selection.of([id]), isDirty: true });
    return id;
  }

  addLine(x1: number, y1: number, x2: number, y2: number): NodeId {
    const { doc, id } = this._addLineUC.execute(this._state.document, x1, y1, x2, y2);
    this._setState({ document: doc, selection: Selection.of([id]), isDirty: true });
    return id;
  }

  addPolyline(points: readonly Point[]): NodeId {
    const { doc, id } = this._addPolylineUC.execute(this._state.document, points);
    this._setState({ document: doc, selection: Selection.of([id]), isDirty: true });
    return id;
  }

  addPolygon(points: readonly Point[]): NodeId {
    const { doc, id } = this._addPolygonUC.execute(this._state.document, points);
    this._setState({ document: doc, selection: Selection.of([id]), isDirty: true });
    return id;
  }

  addPath(commandsOrD: readonly PathCommand[] | string): NodeId {
    const { doc, id } = this._addPathUC.execute(this._state.document, commandsOrD);
    this._setState({ document: doc, selection: Selection.of([id]), isDirty: true });
    return id;
  }

  addImage(input: AddImageInput): NodeId {
    const { doc, id } = this._addImageUC.execute(this._state.document, input);
    this._setState({ document: doc, selection: Selection.of([id]), isDirty: true });
    return id;
  }

  addUse(input: AddUseInput): NodeId {
    const { doc, id } = this._addUseUC.execute(this._state.document, input);
    this._setState({ document: doc, selection: Selection.of([id]), isDirty: true });
    return id;
  }

  addShapePreset(preset: ShapePreset, bounds: BoundingBox): NodeId {
    const { doc, id } = this._addShapePresetUC.execute(this._state.document, preset, bounds);
    this._setState({ document: doc, selection: Selection.of([id]), isDirty: true });
    return id;
  }

  addText(x: number, y: number, content: string): NodeId {
    const { doc, id } = this._addTextUC.execute(this._state.document, x, y, content);
    this._setState({ document: doc, selection: Selection.of([id]), isDirty: true });
    return id;
  }

  // ── Clipboard ────────────────────────────────────────────────────────────

  copy(): void {
    this._copyUC.execute(this._state.document, this._state.selection);
  }

  cut(): void {
    const document = this._cutUC.execute(this._state.document, this._state.selection);
    this._setState({ document, selection: Selection.EMPTY, isDirty: true });
  }

  paste(): void {
    void this._pasteUC.execute(this._state.document).then(({ doc, pastedIds }) => {
      this._setState({ document: doc, selection: Selection.of(pastedIds), isDirty: true });
    });
  }

  duplicate(): void {
    const { doc, duplicatedIds } = this._dupUC.execute(this._state.document, this._state.selection);
    this._setState({ document: doc, selection: Selection.of(duplicatedIds), isDirty: true });
  }

  deleteSelected(): void {
    const ids = [...this._state.selection.ids];
    const document = this._deleteUC.execute(this._state.document, ids);
    this._setState({ document, selection: Selection.EMPTY, isDirty: true });
  }

  // ── History ──────────────────────────────────────────────────────────────

  undo(): void {
    const document = this._history.undo(this._state.document);
    this._setState({ document, isDirty: true });
  }

  redo(): void {
    const document = this._history.redo(this._state.document);
    this._setState({ document, isDirty: true });
  }

  // ── Viewport ─────────────────────────────────────────────────────────────

  setViewTransform(t: Transform): void {
    this._setState({ viewTransform: t });
  }

  setActiveTool(tool: ToolType): void {
    this._setState({ activeTool: tool });
  }

  // ── Property editing ──────────────────────────────────────────────────────

  setNodeAttribute<K extends keyof SvgNode>(id: NodeId, key: K, value: SvgNode[K]): void {
    this._setDocDirty(this._setAttrUC.execute(this._state.document, [id], key, value));
  }

  setNodesAttribute<K extends keyof SvgNode>(ids: NodeId[], key: K, value: SvgNode[K]): void {
    this._setDocDirty(this._setAttrUC.execute(this._state.document, ids, key, value));
  }

  setFill(ids: NodeId[], fill: Fill): void {
    this.setNodesAttribute(ids, 'fill', fill);
  }

  setStroke(ids: NodeId[], stroke: Stroke): void {
    this.setNodesAttribute(ids, 'stroke', stroke);
  }

  setOpacity(ids: NodeId[], opacity: number): void {
    this.setNodesAttribute(ids, 'opacity', Math.min(1, Math.max(0, opacity)));
  }

  setVisibility(ids: NodeId[], visibility: boolean): void {
    this.setNodesAttribute(ids, 'visibility', visibility);
  }

  setLocked(ids: NodeId[], locked: boolean): void {
    this.setNodesAttribute(ids, 'locked', locked);
  }

  setTextStyle(id: NodeId, patch: TextStylePatch): void {
    const node = this._state.document.nodes.get(id);
    if (!node || node.type !== 'text') return;
    let doc = this._state.document;
    const keys = Object.keys(patch) as Array<keyof TextStylePatch>;
    for (const key of keys) {
      const value = patch[key];
      if (value !== undefined) {
        doc = this._setAttrUC.execute(
          doc,
          [id],
          key as keyof SvgNode,
          value as SvgNode[keyof SvgNode],
        );
      }
    }
    this._setDocDirty(doc);
  }

  resolveTextFont(
    id: NodeId,
    availableFonts: readonly string[],
    fallback = 'sans-serif',
  ): TextFontResolution | null {
    const node = this._state.document.nodes.get(id);
    if (node?.type !== 'text') return null;
    const requested = node.fontFamily;
    const availableSet = new Set(availableFonts.map(normalizeFontName));
    const requestedFamilies = requested
      .split(',')
      .map((family) => family.trim())
      .filter(Boolean);
    const availableFamily = requestedFamilies.find((family) =>
      availableSet.has(normalizeFontName(family)),
    );
    const resolved = availableFamily ?? fallback;
    return {
      requested,
      available: availableFamily !== undefined,
      resolved,
      fallback,
    };
  }

  setImageHref(id: NodeId, href: string): void {
    const node = this._state.document.nodes.get(id);
    if (node?.type === 'image') {
      this._setDocDirty(
        this._setAttrUC.execute(
          this._state.document,
          [id],
          'href' as keyof SvgNode,
          href as SvgNode[keyof SvgNode],
        ),
      );
    }
  }

  embedImageData(id: NodeId, mediaType: string, base64: string): void {
    if (!mediaType.trim() || !base64.trim())
      throw new Error('Image mediaType and base64 are required');
    this.setImageHref(id, `data:${mediaType};base64,${base64}`);
  }

  setImagePreserveAspectRatio(id: NodeId, preserveAspectRatio: PreserveAspectRatio): void {
    const node = this._state.document.nodes.get(id);
    if (node?.type === 'image') {
      this._setDocDirty(
        this._setAttrUC.execute(
          this._state.document,
          [id],
          'preserveAspectRatio' as keyof SvgNode,
          preserveAspectRatio as SvgNode[keyof SvgNode],
        ),
      );
    }
  }

  setImageFit(id: NodeId, fit: ImageFit): void {
    const node = this._state.document.nodes.get(id);
    if (node?.type !== 'image') return;
    const preserveAspectRatio = fit === 'stretch' ? 'none' : 'xMidYMid';
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Set image fit', (image) => {
        if (image.type !== 'image') return image;
        return { ...image, preserveAspectRatio, metadata: { ...image.metadata, imageFit: fit } };
      }),
    );
  }

  setImageCrop(id: NodeId, crop: BoundingBox): string {
    const node = this._state.document.nodes.get(id);
    if (node?.type !== 'image') return '';
    const clipId = `clip-${this._idGenerator.generate()}`;
    const rawXml =
      `<clipPath id="${clipId}"><rect x="${crop.x}" y="${crop.y}" ` +
      `width="${crop.width}" height="${crop.height}"/></clipPath>`;
    this.createRawDef({ id: clipId, tagName: 'clipPath', rawXml });
    this.patchMetadata([id], { clipPathId: clipId });
    return clipId;
  }

  setMetadata(ids: NodeId[], metadata: Readonly<Record<string, string>>): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, ids, 'Set metadata', (node) => ({
        ...node,
        metadata,
      })),
    );
  }

  patchMetadata(ids: NodeId[], metadataPatch: Readonly<Record<string, string>>): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, ids, 'Patch metadata', (node) => ({
        ...node,
        metadata: { ...node.metadata, ...metadataPatch },
      })),
    );
  }

  setCornerRadius(id: NodeId, radius: number): void {
    this.setCornerRadii(id, { rx: radius, ry: radius });
  }

  setCornerRadiusForNodes(ids: NodeId[], radius: number): void {
    for (const id of ids) this.setCornerRadius(id, radius);
  }

  setCornerRadii(id: NodeId, radii: CornerRadii): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Set corner radii', (node) => {
        if (node.type !== 'rect') return node;
        return {
          ...node,
          rx: Math.min(Math.max(0, radii.rx), node.width / 2),
          ry: Math.min(Math.max(0, radii.ry), node.height / 2),
        };
      }),
    );
  }

  setRectGeometry(id: NodeId, geometry: RectGeometry): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Set rect geometry', (node) => {
        if (node.type !== 'rect') return node;
        const width = geometry.width ?? node.width;
        const height = geometry.height ?? node.height;
        return {
          ...node,
          ...definedPatch(geometry),
          width: Math.max(0, width),
          height: Math.max(0, height),
          rx: Math.min(Math.max(0, geometry.rx ?? node.rx), Math.max(0, width) / 2),
          ry: Math.min(Math.max(0, geometry.ry ?? node.ry), Math.max(0, height) / 2),
        };
      }),
    );
  }

  setEllipseGeometry(id: NodeId, geometry: EllipseGeometry): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Set ellipse geometry', (node) =>
        node.type === 'ellipse'
          ? {
              ...node,
              ...definedPatch(geometry),
              rx: Math.max(0, geometry.rx ?? node.rx),
              ry: Math.max(0, geometry.ry ?? node.ry),
            }
          : node,
      ),
    );
  }

  setCircleGeometry(id: NodeId, geometry: CircleGeometry): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Set circle geometry', (node) =>
        node.type === 'circle'
          ? { ...node, ...definedPatch(geometry), r: Math.max(0, geometry.r ?? node.r) }
          : node,
      ),
    );
  }

  setLineGeometry(id: NodeId, geometry: LineGeometry): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Set line geometry', (node) =>
        node.type === 'line' ? { ...node, ...definedPatch(geometry) } : node,
      ),
    );
  }

  setBoxGeometry(id: NodeId, geometry: BoxGeometry): void {
    const node = this._state.document.nodes.get(id);
    if (node?.type === 'rect') this.setRectGeometry(id, geometry);
    if (node?.type === 'image') {
      this._setDocDirty(
        this._executeNodeUpdates(this._state.document, [id], 'Set box geometry', (image) =>
          image.type === 'image'
            ? {
                ...image,
                ...definedPatch(geometry),
                width: Math.max(0, geometry.width ?? image.width),
                height: Math.max(0, geometry.height ?? image.height),
              }
            : image,
        ),
      );
    }
  }

  convertToPath(ids: NodeId[]): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, ids, 'Convert to path', (node) => {
        const commands = GeometryService.toPathCommands(node);
        if (!commands) return node;
        const path: PathNode = {
          id: node.id,
          type: 'path',
          name: node.name,
          transform: node.transform,
          fill: node.fill,
          stroke: node.stroke,
          opacity: node.opacity,
          visibility: node.visibility,
          locked: node.locked,
          metadata: node.metadata,
          commands,
        };
        return path;
      }),
    );
  }

  updatePathCommand(id: NodeId, index: number, command: PathCommand): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Update path command', (node) => {
        if (node.type !== 'path' || index < 0 || index >= node.commands.length) return node;
        const commands = [...node.commands];
        commands[index] = command;
        return { ...node, commands };
      }),
    );
  }

  addPathCommand(id: NodeId, command: PathCommand, index?: number): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Add path command', (node) => {
        if (node.type !== 'path') return node;
        const commands = [...node.commands];
        commands.splice(clampIndex(index ?? commands.length, commands.length), 0, command);
        return { ...node, commands };
      }),
    );
  }

  removePathCommand(id: NodeId, index: number): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Remove path command', (node) => {
        if (node.type !== 'path' || index < 0 || index >= node.commands.length) return node;
        return { ...node, commands: node.commands.filter((_, i) => i !== index) };
      }),
    );
  }

  movePathPoint(id: NodeId, commandIndex: number, delta: Point): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Move path point', (node) => {
        if (node.type !== 'path') return node;
        const command = node.commands[commandIndex];
        if (!command) return node;
        const commands = [...node.commands];
        commands[commandIndex] = moveCommandPoint(command, delta);
        return { ...node, commands };
      }),
    );
  }

  convertPathSegmentToLine(id: NodeId, commandIndex: number): void {
    this._setDocDirty(
      this._executeNodeUpdates(
        this._state.document,
        [id],
        'Convert path segment to line',
        (node) => {
          if (node.type !== 'path') return node;
          const command = node.commands[commandIndex];
          if (!command || command.type === 'M' || command.type === 'Z') return node;
          const point = commandEndPoint(command, previousPathPoint(node.commands, commandIndex));
          if (!point) return node;
          const commands = [...node.commands];
          commands[commandIndex] = { type: 'L', point };
          return { ...node, commands };
        },
      ),
    );
  }

  convertPathSegmentToCurve(id: NodeId, commandIndex: number): void {
    this._setDocDirty(
      this._executeNodeUpdates(
        this._state.document,
        [id],
        'Convert path segment to curve',
        (node) => {
          if (node.type !== 'path') return node;
          const command = node.commands[commandIndex];
          if (!command || command.type === 'M' || command.type === 'Z') return node;
          const previous = previousPathPoint(node.commands, commandIndex);
          const point = commandEndPoint(command, previous);
          if (!point) return node;
          const start = previous ?? point;
          const commands = [...node.commands];
          commands[commandIndex] = {
            type: 'C',
            cp1: Point.lerp(start, point, 1 / 3),
            cp2: Point.lerp(start, point, 2 / 3),
            point,
          };
          return { ...node, commands };
        },
      ),
    );
  }

  openPath(id: NodeId): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Open path', (node) => {
        if (node.type !== 'path') return node;
        return { ...node, commands: node.commands.filter((command) => command.type !== 'Z') };
      }),
    );
  }

  closePath(id: NodeId): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Close path', (node) => {
        if (node.type !== 'path' || node.commands.at(-1)?.type === 'Z') return node;
        return { ...node, commands: [...node.commands, { type: 'Z' }] };
      }),
    );
  }

  simplifyPath(id: NodeId): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Simplify path', (node) => {
        if (node.type !== 'path') return node;
        return { ...node, commands: simplifyCommands(node.commands) };
      }),
    );
  }

  createCompoundPath(ids: NodeId[], name = 'Compound Path'): NodeId | null {
    const commands = ids.flatMap((id) => {
      const node = this._state.document.nodes.get(id);
      return node ? (GeometryService.toPathCommands(node) ?? []) : [];
    });
    if (commands.length === 0) return null;
    const id = this.addPath(commands);
    this.setNodeAttribute(id, 'name', name);
    this.patchMetadata([id], { compoundPath: 'true', sourceIds: ids.join(',') });
    return id;
  }

  unionPaths(ids: NodeId[], name = 'Union Path'): NodeId | null {
    return this._createBooleanPath(ids, 'union', name);
  }

  subtractPaths(ids: NodeId[], name = 'Subtract Path'): NodeId | null {
    return this._createBooleanPath(ids, 'subtract', name);
  }

  intersectPaths(ids: NodeId[], name = 'Intersect Path'): NodeId | null {
    return this._createBooleanPath(ids, 'intersect', name);
  }

  excludePaths(ids: NodeId[], name = 'Exclude Path'): NodeId | null {
    return this._createBooleanPath(ids, 'exclude', name);
  }

  outlineStroke(ids: NodeId[], name = 'Outlined Stroke'): NodeId | null {
    const commands = ids.flatMap((id) => {
      const node = this._state.document.nodes.get(id);
      if (!node || !node.stroke) return [];
      const width = node.stroke.width ?? 1;
      return boxToPath(BoundingBox.expand(BoundsCalculator.forNode(node), width / 2));
    });
    if (commands.length === 0) return null;
    const id = this.addPath(commands);
    this.setNodeAttribute(id, 'name', name);
    this.patchMetadata([id], { outlinedStroke: 'true', sourceIds: ids.join(',') });
    return id;
  }

  setTextRangeStyle(id: NodeId, range: TextRange, style: TextStylePatch): void {
    const node = this._state.document.nodes.get(id);
    if (node?.type !== 'text') return;
    if (range.start <= 0 && range.end >= node.content.length) {
      this.setTextStyle(id, style);
      return;
    }
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Set text range style', (current) => {
        if (current.type !== 'text') return current;
        return {
          ...current,
          runs: applyRangeStyle(current.content, current.runs, range, textRunStyleFromPatch(style)),
        };
      }),
    );
  }

  setTextRuns(id: NodeId, runs: readonly TextRun[]): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Set text runs', (node) => {
        if (node.type !== 'text') return node;
        return { ...node, content: runs.map((run) => run.content).join(''), runs: [...runs] };
      }),
    );
  }

  replaceTextContent(id: NodeId, content: string, preserveRuns = true): void {
    this._setDocDirty(
      this._executeNodeUpdates(this._state.document, [id], 'Replace text content', (node) => {
        if (node.type !== 'text') return node;
        if (!preserveRuns || node.runs.length === 0) return { ...node, content, runs: [] };
        const firstStyle = node.runs[0]?.style ?? {};
        return { ...node, content, runs: [{ content, style: firstStyle }] };
      }),
    );
  }

  setFrameLayout(frameId: NodeId, layout: FrameLayout, childIds?: readonly NodeId[]): void {
    const metadata: Record<string, string> = {
      frame: 'true',
      layoutMode: layout.mode,
      layoutPadding: String(Math.max(0, layout.padding)),
      layoutGap: String(Math.max(0, layout.gap)),
    };
    if (childIds) metadata.layoutChildren = childIds.join(',');
    this.patchMetadata([frameId], metadata);
  }

  applyFrameLayout(frameId: NodeId): void {
    const frame = this._state.document.nodes.get(frameId);
    if (!frame) return;
    const childIds = parseNodeIds(frame.metadata.layoutChildren);
    const mode = frame.metadata.layoutMode;
    const gap = parseFloat(frame.metadata.layoutGap ?? '0') || 0;
    const padding = parseFloat(frame.metadata.layoutPadding ?? '0') || 0;
    if (childIds.length === 0 || (mode !== 'horizontal' && mode !== 'vertical')) return;
    const frameBounds = BoundsCalculator.forNode(frame);
    const updates = new Map<NodeId, SvgNode>();
    let cursorX = frameBounds.x + padding;
    let cursorY = frameBounds.y + padding;
    for (const childId of childIds) {
      const child = this._state.document.nodes.get(childId);
      if (!child) continue;
      const box = BoundsCalculator.forNode(child);
      updates.set(childId, TransformService.translateNode(child, cursorX - box.x, cursorY - box.y));
      if (mode === 'horizontal') cursorX += box.width + gap;
      else cursorY += box.height + gap;
    }
    this._setDocDirty(this._applyPreparedUpdates(childIds, 'Apply frame layout', updates));
  }

  fitFrameToContent(frameId: NodeId): void {
    const frame = this._state.document.nodes.get(frameId);
    if (!frame || frame.type !== 'rect') return;
    const childIds = parseNodeIds(frame.metadata.layoutChildren);
    const content = BoundsCalculator.forNodes(this._state.document, childIds);
    if (!content) return;
    const padding = parseFloat(frame.metadata.layoutPadding ?? '0') || 0;
    this.setRectGeometry(frameId, {
      x: content.x - padding,
      y: content.y - padding,
      width: content.width + padding * 2,
      height: content.height + padding * 2,
    });
  }

  // ── Styles and tokens ──────────────────────────────────────────────────

  createFillStyle(name: string, fill: Fill): string {
    const tokens = this.exportDesignTokens();
    const id = styleId('fill', name);
    this.importDesignTokens({ ...tokens, fillStyles: { ...tokens.fillStyles, [id]: fill } });
    return id;
  }

  createStrokeStyle(name: string, stroke: Stroke): string {
    const tokens = this.exportDesignTokens();
    const id = styleId('stroke', name);
    this.importDesignTokens({ ...tokens, strokeStyles: { ...tokens.strokeStyles, [id]: stroke } });
    return id;
  }

  createTextStyle(name: string, style: TextStylePatch): string {
    const tokens = this.exportDesignTokens();
    const id = styleId('text', name);
    this.importDesignTokens({ ...tokens, textStyles: { ...tokens.textStyles, [id]: style } });
    return id;
  }

  applyStyle(ids: NodeId[], styleIdValue: string): void {
    const tokens = this.exportDesignTokens();
    if (tokens.fillStyles[styleIdValue]) {
      this.setFill(ids, tokens.fillStyles[styleIdValue]);
      this.patchMetadata(ids, { styleId: styleIdValue });
      return;
    }
    if (tokens.strokeStyles[styleIdValue]) {
      this.setStroke(ids, tokens.strokeStyles[styleIdValue]);
      this.patchMetadata(ids, { styleId: styleIdValue });
      return;
    }
    if (tokens.textStyles[styleIdValue]) {
      for (const id of ids) this.setTextStyle(id, tokens.textStyles[styleIdValue]);
      this.patchMetadata(ids, { styleId: styleIdValue });
    }
  }

  updateFillStyle(styleIdValue: string, fill: Fill): void {
    const tokens = this.exportDesignTokens();
    this.importDesignTokens({
      ...tokens,
      fillStyles: { ...tokens.fillStyles, [styleIdValue]: fill },
    });
    this.setFill(this.findNodes({ metadata: { styleId: styleIdValue } }), fill);
  }

  updateStrokeStyle(styleIdValue: string, stroke: Stroke): void {
    const tokens = this.exportDesignTokens();
    this.importDesignTokens({
      ...tokens,
      strokeStyles: { ...tokens.strokeStyles, [styleIdValue]: stroke },
    });
    this.setStroke(this.findNodes({ metadata: { styleId: styleIdValue } }), stroke);
  }

  updateTextStyle(styleIdValue: string, style: TextStylePatch): void {
    const tokens = this.exportDesignTokens();
    this.importDesignTokens({
      ...tokens,
      textStyles: { ...tokens.textStyles, [styleIdValue]: style },
    });
    for (const id of this.findNodes({ metadata: { styleId: styleIdValue } }))
      this.setTextStyle(id, style);
  }

  exportDesignTokens(): DesignTokens {
    return readDesignTokens(this._state.document.metadata.extraAttributes['designTokens']);
  }

  importDesignTokens(tokens: DesignTokens): void {
    this._setDocDirty(
      this._history.execute(
        new UpdateDocumentCommand('Import design tokens', (doc) => ({
          ...doc,
          metadata: {
            ...doc.metadata,
            extraAttributes: {
              ...doc.metadata.extraAttributes,
              designTokens: JSON.stringify(tokens),
            },
          },
        })),
        this._state.document,
      ),
    );
  }

  // ── Programmatic design ─────────────────────────────────────────────────

  findNodes(query: NodeQuery): NodeId[] {
    return [...this._state.document.nodes.values()]
      .filter((node) => matchesQuery(node, query))
      .map((node) => node.id);
  }

  updateNodes(query: NodeQuery, patch: NodePatch): NodeId[] {
    const ids = this.findNodes(query);
    this._setDocDirty(
      this._executeNodeUpdates(
        this._state.document,
        ids,
        'Update nodes by query',
        (node) => ({ ...node, ...patch }) as SvgNode,
      ),
    );
    return ids;
  }

  getAvailableCommands(ids: readonly NodeId[]): string[] {
    const nodes = ids
      .map((id) => this._state.document.nodes.get(id))
      .filter((node): node is SvgNode => node !== undefined);
    if (nodes.length === 0)
      return ['selectAll', 'addRect', 'addText', 'addImage', 'addShapePreset'];

    const capabilities = nodes.map((node) => NodeCapabilities.forNode(node));
    const every = (key: keyof ReturnType<typeof NodeCapabilities.forNode>) =>
      capabilities.every((capability) => Boolean(capability[key]));

    return [
      'copy',
      'cut',
      'duplicate',
      'delete',
      'group',
      'bringToFront',
      'sendToBack',
      'align',
      'distribute',
      'setResizeConstraints',
      'applyResizeConstraints',
      ...(every('canResize') ? ['resize', 'matchSize'] : []),
      ...(every('canRotate') ? ['rotate'] : []),
      ...(every('canFlip') ? ['flip'] : []),
      ...(every('canFill') ? ['setFill', 'applyFillDef'] : []),
      ...(every('canStroke') ? ['setStroke', 'applyStrokeDef'] : []),
      ...(every('canRoundCorners') ? ['setCornerRadius'] : []),
      ...(every('canEditText') ? ['setTextStyle', 'setTextRuns', 'setTextRangeStyle'] : []),
      ...(every('canEditPath')
        ? ['editPathCommands', 'convertPathSegmentToLine', 'convertPathSegmentToCurve']
        : []),
      ...(every('canCrop') ? ['setImageCrop', 'setImageFit'] : []),
      ...(nodes.length > 1
        ? ['unionPaths', 'subtractPaths', 'intersectPaths', 'excludePaths']
        : []),
      'outlineStroke',
    ];
  }

  createDesign(spec: DesignSpec): NodeId[] {
    this.newDocument(spec.width, spec.height);
    return spec.nodes.map((nodeSpec) => this._createDesignNode(nodeSpec));
  }

  applyDesignPatch(patch: DesignPatch): NodeId[] {
    const changed: NodeId[] = [];
    for (const spec of patch.create ?? []) changed.push(this._createDesignNode(spec));
    for (const update of patch.update ?? [])
      changed.push(...this.updateNodes(update.query, update.patch));
    for (const query of patch.delete ?? []) {
      const ids = this.findNodes(query);
      const document = this._deleteUC.execute(this._state.document, ids);
      this._setState({ document, selection: Selection.EMPTY, isDirty: true });
      changed.push(...ids);
    }
    return changed;
  }

  getDocumentSummary(): DocumentSummary {
    const nodes = [...this._state.document.nodes.values()].map((node) => ({
      id: node.id,
      type: node.type,
      name: node.name,
      bounds: BoundsCalculator.forNode(node),
      metadata: node.metadata,
    }));
    return {
      width: this._state.document.width,
      height: this._state.document.height,
      nodeCount: nodes.length,
      nodes,
    };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _setDocDirty(document: Document): void {
    this._setState({ document, isDirty: true });
  }

  private _executeNodeUpdates(
    doc: Document,
    ids: readonly NodeId[],
    description: string,
    updater: (node: SvgNode, doc: Document) => SvgNode | null | undefined,
  ): Document {
    if (ids.length === 0) return doc;
    return this._history.execute(new UpdateNodesCommand(description, ids, updater), doc);
  }

  private _applyPreparedUpdates(
    ids: readonly NodeId[],
    description: string,
    updates: ReadonlyMap<NodeId, SvgNode>,
  ): Document {
    return this._executeNodeUpdates(
      this._state.document,
      ids,
      description,
      (node) => updates.get(node.id) ?? node,
    );
  }

  private _arrange(ids: NodeId[], gapX: number, gapY: number, columns: number): void {
    const doc = this._state.document;
    const entries = ids
      .map((id) => {
        const node = doc.nodes.get(id);
        return node ? { id, node, bounds: BoundsCalculator.forNode(node) } : null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    if (entries.length === 0) return;
    const first = entries[0]!;
    const cellWidth = Math.max(...entries.map((entry) => entry.bounds.width));
    const cellHeight = Math.max(...entries.map((entry) => entry.bounds.height));
    const updates = new Map<NodeId, SvgNode>();
    entries.forEach((entry, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      updates.set(
        entry.id,
        GeometryService.fitBounds(entry.node, {
          x: first.bounds.x + col * (cellWidth + gapX),
          y: first.bounds.y + row * (cellHeight + gapY),
          width: entry.bounds.width,
          height: entry.bounds.height,
        }),
      );
    });
    this._setDocDirty(this._applyPreparedUpdates(ids, 'Arrange nodes', updates));
  }

  private _createBooleanPath(
    ids: NodeId[],
    operation: BooleanOperation,
    name: string,
  ): NodeId | null {
    const boxes = ids
      .map((id) => this._state.document.nodes.get(id))
      .filter((node): node is SvgNode => node !== undefined)
      .map((node) => BoundsCalculator.forNode(node));
    if (boxes.length === 0) return null;

    const commands = booleanBoxesToPath(boxes, operation);
    if (commands.length === 0) return null;

    const id = this.addPath(commands);
    this.setNodeAttribute(id, 'name', name);
    this.patchMetadata([id], { booleanOperation: operation, sourceIds: ids.join(',') });
    return id;
  }

  private _createDesignNode(spec: DesignNodeSpec): NodeId {
    const existingId = spec.stableId
      ? this.findNodes({ metadata: { stableId: spec.stableId } })[0]
      : undefined;
    const id = existingId ?? createNodeFromSpec(this, spec);
    const metadata = {
      ...(spec.metadata ?? {}),
      ...(spec.stableId ? { stableId: spec.stableId } : {}),
    };
    if (existingId) applyDesignGeometry(this, existingId, spec);
    if (spec.name) this.setNodeAttribute(id, 'name', spec.name);
    if (spec.fill) this.setFill([id], spec.fill);
    if (spec.stroke) this.setStroke([id], spec.stroke);
    if (spec.opacity !== undefined) this.setOpacity([id], spec.opacity);
    if (Object.keys(metadata).length > 0) this.patchMetadata([id], metadata);
    return id;
  }

  private _setState(partial: Partial<EditorState>): void {
    this._state = {
      ...this._state,
      ...partial,
      canUndo: this._history.canUndo,
      canRedo: this._history.canRedo,
    };
    for (const listener of this._listeners) {
      listener(this._state);
    }
  }
}

function centerOfNodes(doc: Document, ids: readonly NodeId[]): Point {
  const bounds = BoundsCalculator.forNodes(doc, ids);
  return bounds ? BoundingBox.center(bounds) : Point.ORIGIN;
}

function createSkewTransform(skewXDeg: number, skewYDeg: number, pivot: Point): Transform {
  const skew = Transform.of(
    1,
    Math.tan((skewYDeg * Math.PI) / 180),
    Math.tan((skewXDeg * Math.PI) / 180),
    1,
    0,
    0,
  );
  return Transform.multiply(
    Transform.multiply(Transform.translation(pivot.x, pivot.y), skew),
    Transform.translation(-pivot.x, -pivot.y),
  );
}

function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(index, length));
}

function moveCommandPoint(command: PathCommand, delta: Point): PathCommand {
  const move = (point: Point): Point => Point.of(point.x + delta.x, point.y + delta.y);
  switch (command.type) {
    case 'M':
    case 'L':
    case 'T':
      return { ...command, point: move(command.point) };
    case 'H':
      return { ...command, x: command.x + delta.x };
    case 'V':
      return { ...command, y: command.y + delta.y };
    case 'C':
      return {
        ...command,
        cp1: move(command.cp1),
        cp2: move(command.cp2),
        point: move(command.point),
      };
    case 'S':
      return { ...command, cp2: move(command.cp2), point: move(command.point) };
    case 'Q':
      return { ...command, cp: move(command.cp), point: move(command.point) };
    case 'A':
      return { ...command, point: move(command.point) };
    case 'Z':
      return command;
  }
}

function simplifyCommands(commands: readonly PathCommand[]): PathCommand[] {
  const simplified: PathCommand[] = [];
  let previousPoint: Point | null = null;

  for (const command of commands) {
    if ('point' in command) {
      if (
        previousPoint &&
        Point.equals(previousPoint, command.point) &&
        (command.type === 'L' || command.type === 'T')
      ) {
        continue;
      }
      previousPoint = command.point;
    }
    if (command.type === 'Z' && simplified.at(-1)?.type === 'Z') continue;
    simplified.push(command);
  }

  return simplified;
}

function matchesQuery(node: SvgNode, query: NodeQuery): boolean {
  if (query.ids && !query.ids.includes(node.id)) return false;
  if (query.type && node.type !== query.type) return false;
  if (query.name && node.name !== query.name) return false;
  if (query.nameIncludes && !node.name.toLowerCase().includes(query.nameIncludes.toLowerCase()))
    return false;
  if (query.metadata) {
    for (const [key, value] of Object.entries(query.metadata)) {
      if (node.metadata[key] !== value) return false;
    }
  }
  if (query.within && !BoundsCalculator.forNode(node)) return false;
  if (query.within && !BoundingBox.contains(query.within, BoundsCalculator.forNode(node)))
    return false;
  return true;
}

function normalizeFontName(fontFamily: string): string {
  return fontFamily
    .trim()
    .replace(/^["']|["']$/g, '')
    .toLowerCase();
}

function previousPathPoint(commands: readonly PathCommand[], commandIndex: number): Point | null {
  let current: Point | null = null;
  for (let index = 0; index < commandIndex; index += 1) {
    current = commandEndPoint(commands[index]!, current) ?? current;
  }
  return current;
}

function commandEndPoint(command: PathCommand, previous: Point | null): Point | null {
  switch (command.type) {
    case 'M':
    case 'L':
    case 'C':
    case 'S':
    case 'Q':
    case 'T':
    case 'A':
      return command.point;
    case 'H':
      return previous ? Point.of(command.x, previous.y) : null;
    case 'V':
      return previous ? Point.of(previous.x, command.y) : null;
    case 'Z':
      return null;
  }
}

function booleanBoxesToPath(
  boxes: readonly BoundingBox[],
  operation: BooleanOperation,
): PathCommand[] {
  const [first, ...rest] = boxes;
  if (!first) return [];

  switch (operation) {
    case 'union': {
      const union = BoundingBox.unionAll(boxes);
      return union ? boxToPath(union) : [];
    }
    case 'intersect': {
      const intersection = rest.reduce<BoundingBox | null>(
        (current, box) => (current ? BoundingBox.intersect(current, box) : null),
        first,
      );
      return intersection ? boxToPath(intersection) : [];
    }
    case 'subtract':
      return subtractBox(first, rest[0]) ?? boxToPath(first);
    case 'exclude': {
      const union = BoundingBox.unionAll(boxes);
      const intersection = rest.reduce<BoundingBox | null>(
        (current, box) => (current ? BoundingBox.intersect(current, box) : null),
        first,
      );
      return [...(union ? boxToPath(union) : []), ...(intersection ? boxToPath(intersection) : [])];
    }
  }
}

function boxToPath(box: BoundingBox): PathCommand[] {
  return [
    { type: 'M', point: Point.of(box.x, box.y) },
    { type: 'L', point: Point.of(box.x + box.width, box.y) },
    { type: 'L', point: Point.of(box.x + box.width, box.y + box.height) },
    { type: 'L', point: Point.of(box.x, box.y + box.height) },
    { type: 'Z' },
  ];
}

function subtractBox(base: BoundingBox, cutter: BoundingBox | undefined): PathCommand[] | null {
  if (!cutter) return null;
  const intersection = BoundingBox.intersect(base, cutter);
  if (!intersection || BoundingBox.isEmpty(intersection)) return null;

  const pieces: BoundingBox[] = [];
  const baseRight = base.x + base.width;
  const baseBottom = base.y + base.height;
  const cutRight = intersection.x + intersection.width;
  const cutBottom = intersection.y + intersection.height;

  if (intersection.y > base.y)
    pieces.push(BoundingBox.fromLTRB(base.x, base.y, baseRight, intersection.y));
  if (cutBottom < baseBottom)
    pieces.push(BoundingBox.fromLTRB(base.x, cutBottom, baseRight, baseBottom));
  if (intersection.x > base.x)
    pieces.push(BoundingBox.fromLTRB(base.x, intersection.y, intersection.x, cutBottom));
  if (cutRight < baseRight)
    pieces.push(BoundingBox.fromLTRB(cutRight, intersection.y, baseRight, cutBottom));

  const nonEmpty = pieces.filter((piece) => !BoundingBox.isEmpty(piece));
  return nonEmpty.length > 0 ? nonEmpty.flatMap(boxToPath) : [];
}

function createNodeFromSpec(app: EditorApplication, spec: DesignNodeSpec): NodeId {
  switch (spec.kind) {
    case 'rect':
      return app.addRect(spec.x, spec.y, spec.width, spec.height);
    case 'ellipse':
      return app.addEllipse(spec.cx, spec.cy, spec.rx, spec.ry);
    case 'circle':
      return app.addCircle(spec.cx, spec.cy, spec.r);
    case 'line':
      return app.addLine(spec.x1, spec.y1, spec.x2, spec.y2);
    case 'text': {
      const id = app.addText(spec.x, spec.y, spec.content);
      if (spec.textStyle) app.setTextStyle(id, spec.textStyle);
      return id;
    }
    case 'image':
      return app.addImage(spec.image);
    case 'shape':
      return app.addShapePreset(spec.preset, spec.bounds);
    case 'path':
      return app.addPath(spec.commands);
  }
}

function applyDesignGeometry(app: EditorApplication, id: NodeId, spec: DesignNodeSpec): void {
  switch (spec.kind) {
    case 'rect':
      app.setRectGeometry(id, {
        x: spec.x,
        y: spec.y,
        width: spec.width,
        height: spec.height,
      });
      break;
    case 'ellipse':
      app.setEllipseGeometry(id, { cx: spec.cx, cy: spec.cy, rx: spec.rx, ry: spec.ry });
      break;
    case 'circle':
      app.setCircleGeometry(id, { cx: spec.cx, cy: spec.cy, r: spec.r });
      break;
    case 'line':
      app.setLineGeometry(id, { x1: spec.x1, y1: spec.y1, x2: spec.x2, y2: spec.y2 });
      break;
    case 'text':
      app.updateNodes({ ids: [id] }, { x: spec.x, y: spec.y } as NodePatch);
      app.replaceTextContent(id, spec.content);
      if (spec.textStyle) app.setTextStyle(id, spec.textStyle);
      break;
    case 'image':
      app.setBoxGeometry(id, spec.image);
      app.setImageHref(id, spec.image.href);
      if (spec.image.preserveAspectRatio) {
        app.setImagePreserveAspectRatio(id, spec.image.preserveAspectRatio);
      }
      break;
    case 'shape':
      app.setBoxGeometry(id, spec.bounds);
      break;
    case 'path':
      app.updateNodes({ ids: [id] }, {
        commands: typeof spec.commands === 'string' ? parsePath(spec.commands) : [...spec.commands],
      } as NodePatch);
      break;
  }
}

function definedPatch<T extends object>(patch: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function parseNodeIds(value: string | undefined): NodeId[] {
  if (!value?.trim()) return [];
  return value.split(',').filter(Boolean) as NodeId[];
}

function styleId(kind: 'fill' | 'stroke' | 'text', name: string): string {
  return `${kind}:${name.trim().toLowerCase().replace(/\s+/g, '-')}`;
}

function readDesignTokens(value: string | undefined): DesignTokens {
  const empty: DesignTokens = {
    fillStyles: {},
    strokeStyles: {},
    textStyles: {},
    colorTokens: {},
    radiusTokens: {},
    spacingTokens: {},
  };
  if (!value) return empty;
  try {
    return { ...empty, ...(JSON.parse(value) as Partial<DesignTokens>) };
  } catch {
    return empty;
  }
}

function applyRangeStyle(
  content: string,
  existingRuns: readonly TextRun[],
  range: TextRange,
  style: TextRunStyle,
): TextRun[] {
  const start = Math.max(0, Math.min(range.start, content.length));
  const end = Math.max(start, Math.min(range.end, content.length));
  const baseRuns = existingRuns.length > 0 ? existingRuns : [{ content, style: {} }];
  const result: TextRun[] = [];
  let cursor = 0;

  for (const run of baseRuns) {
    const runStart = cursor;
    const runEnd = cursor + run.content.length;
    cursor = runEnd;

    if (runEnd <= start || runStart >= end) {
      result.push(run);
      continue;
    }

    const beforeCount = Math.max(0, start - runStart);
    const styledStart = Math.max(runStart, start);
    const styledEnd = Math.min(runEnd, end);
    const styledOffset = styledStart - runStart;
    const styledCount = styledEnd - styledStart;
    const afterOffset = styledOffset + styledCount;

    if (beforeCount > 0) {
      result.push({ content: run.content.slice(0, beforeCount), style: run.style });
    }
    if (styledCount > 0) {
      result.push({
        content: run.content.slice(styledOffset, afterOffset),
        style: { ...run.style, ...style },
      });
    }
    if (afterOffset < run.content.length) {
      result.push({ content: run.content.slice(afterOffset), style: run.style });
    }
  }

  return mergeAdjacentRuns(result);
}

function mergeAdjacentRuns(runs: readonly TextRun[]): TextRun[] {
  const merged: TextRun[] = [];
  for (const run of runs) {
    const previous = merged.at(-1);
    if (previous && JSON.stringify(previous.style) === JSON.stringify(run.style)) {
      merged[merged.length - 1] = {
        content: previous.content + run.content,
        style: previous.style,
      };
    } else if (run.content.length > 0) {
      merged.push(run);
    }
  }
  return merged;
}

function textRunStyleFromPatch(patch: TextStylePatch): TextRunStyle {
  const style: TextRunStyle = {};
  if (patch.fill !== undefined) returnWith(style, 'fill', patch.fill);
  if (patch.stroke !== undefined) returnWith(style, 'stroke', patch.stroke);
  if (patch.fontFamily !== undefined) returnWith(style, 'fontFamily', patch.fontFamily);
  if (patch.fontSize !== undefined) returnWith(style, 'fontSize', patch.fontSize);
  if (patch.fontWeight !== undefined) returnWith(style, 'fontWeight', patch.fontWeight);
  if (patch.fontStyle !== undefined) returnWith(style, 'fontStyle', patch.fontStyle);
  if (patch.letterSpacing !== undefined) returnWith(style, 'letterSpacing', patch.letterSpacing);
  if (patch.wordSpacing !== undefined) returnWith(style, 'wordSpacing', patch.wordSpacing);
  if (patch.textDecoration !== undefined) returnWith(style, 'textDecoration', patch.textDecoration);
  return style;
}

function returnWith<K extends keyof TextRunStyle>(
  target: TextRunStyle,
  key: K,
  value: TextRunStyle[K],
): void {
  Object.assign(target, { [key]: value });
}
