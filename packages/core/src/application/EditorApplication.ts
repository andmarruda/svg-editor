import type { IEditorApplication, ResizeHandle } from './ports/driving/IEditorApplication';
import type { ISerializer } from './ports/driven/ISerializer';
import type { IClipboardAdapter } from './ports/driven/IClipboardAdapter';
import type { IEventBus, Unsubscribe } from './ports/driven/IEventBus';
import type { IIdGenerator } from './ports/driven/IIdGenerator';
import type { EditorState, ToolType } from '../domain/aggregates/EditorState';
import type { NodeId } from '../domain/value-objects/NodeId';
import type { Point } from '../domain/value-objects/Point';
import type { BoundingBox } from '../domain/value-objects/BoundingBox';
import type { Transform } from '../domain/value-objects/Transform';
import type { SvgNode } from '../domain/entities/SvgNode';
import { Document } from '../domain/aggregates/Document';
import { DocumentId } from '../domain/value-objects/NodeId';
import { Selection } from '../domain/aggregates/Selection';
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
import { AddTextUseCase } from './use-cases/node-creation/AddTextUseCase';
import { DeleteNodesUseCase } from './use-cases/node-creation/DeleteNodesUseCase';
import { SetAttributeUseCase } from './use-cases/node-creation/SetAttributeUseCase';

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
  private readonly _addTextUC: AddTextUseCase;
  private readonly _deleteUC: DeleteNodesUseCase;
  private readonly _setAttrUC: SetAttributeUseCase;

  constructor(deps: EditorApplicationDeps) {
    this._history = new HistoryManager();

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
    return () => { this._listeners.delete(listener); };
  }

  getState(): EditorState {
    return this._state;
  }

  // ── File ─────────────────────────────────────────────────────────────────

  openSvg(svgString: string, filename?: string): void {
    const document = this._openSvgUC.execute(svgString);
    this._history.clear();
    this._setState({ document, selection: Selection.EMPTY, isDirty: false, filename: filename ?? null });
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
    const selection = this._selectNodeUC.execute(this._state.selection, this._state.document, id, addToSelection);
    this._setState({ selection });
  }

  selectByMarquee(box: BoundingBox, addToSelection = false): void {
    const selection = this._selectMarqueeUC.execute(this._state.selection, this._state.document, box, addToSelection);
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
    this._setDocDirty(this._resizeUC.execute(this._state.document, id, handle, delta, keepAspectRatio));
  }

  rotateNodes(ids: NodeId[], angleDeg: number, pivot?: Point): void {
    this._setDocDirty(this._rotateUC.execute(this._state.document, ids, angleDeg, pivot));
  }

  flipNodes(ids: NodeId[], axis: 'horizontal' | 'vertical'): void {
    this._setDocDirty(this._flipUC.execute(this._state.document, ids, axis));
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

  // ── Private helpers ───────────────────────────────────────────────────────

  private _setDocDirty(document: Document): void {
    this._setState({ document, isDirty: true });
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
