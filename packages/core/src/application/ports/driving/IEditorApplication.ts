import type { EditorState, ToolType } from '../../../domain/aggregates/EditorState';
import type {
  GradientStopDef,
  LinearGradientDef,
  RadialGradientDef,
  RawXmlDef,
} from '../../../domain/aggregates/SvgDefs';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import type { Point } from '../../../domain/value-objects/Point';
import type { BoundingBox } from '../../../domain/value-objects/BoundingBox';
import type { Transform } from '../../../domain/value-objects/Transform';
import type { Fill } from '../../../domain/value-objects/Fill';
import type { Stroke } from '../../../domain/value-objects/Stroke';
import type { SvgNode } from '../../../domain/entities/SvgNode';
import type { PathCommand } from '../../../domain/entities/PathCommand';
import type { PreserveAspectRatio } from '../../../domain/entities/ImageNode';
import type {
  DominantBaseline,
  FontWeight,
  TextAnchor,
  TextDecoration,
  TextRun,
} from '../../../domain/entities/TextNode';
import type { ShapePreset } from '../../../domain/services/ShapeFactory';
import type {
  AlignTarget,
  HorizontalAlign,
  VerticalAlign,
} from '../../../domain/services/LayoutService';
import type { Unsubscribe } from '../driven/IEventBus';

export type ResizeHandle =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

export interface AddImageInput {
  readonly href: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly preserveAspectRatio?: PreserveAspectRatio;
}

export interface AddUseInput {
  readonly href: NodeId;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface TextStylePatch {
  readonly fill?: Fill;
  readonly stroke?: Stroke;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly fontWeight?: FontWeight;
  readonly fontStyle?: 'normal' | 'italic' | 'oblique';
  readonly textAnchor?: TextAnchor;
  readonly dominantBaseline?: DominantBaseline;
  readonly letterSpacing?: number;
  readonly wordSpacing?: number;
  readonly textDecoration?: TextDecoration;
  readonly lineHeight?: number;
}

export interface TextFontResolution {
  readonly requested: string;
  readonly available: boolean;
  readonly resolved: string;
  readonly fallback: string;
}

export interface CornerRadii {
  readonly rx: number;
  readonly ry: number;
}

export interface TextRange {
  readonly start: number;
  readonly end: number;
}

export interface NodeQuery {
  readonly ids?: readonly NodeId[];
  readonly type?: SvgNode['type'];
  readonly name?: string;
  readonly nameIncludes?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly within?: BoundingBox;
}

export type NodePatch = Partial<Omit<SvgNode, 'id' | 'type'>>;

export interface DocumentSummaryNode {
  readonly id: NodeId;
  readonly type: SvgNode['type'];
  readonly name: string;
  readonly bounds: BoundingBox;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface DocumentSummary {
  readonly width: number;
  readonly height: number;
  readonly nodeCount: number;
  readonly nodes: readonly DocumentSummaryNode[];
}

export type ImageFit = 'contain' | 'cover' | 'stretch';
export type ResizeConstraint = 'fixed' | 'hug' | 'fill';
export type BooleanOperation = 'union' | 'subtract' | 'intersect' | 'exclude';

export interface ResizeConstraints {
  readonly width?: ResizeConstraint;
  readonly height?: ResizeConstraint;
}

export type CreateLinearGradientInput = Omit<LinearGradientDef, 'kind' | 'id'> & {
  readonly id?: string;
};
export type CreateRadialGradientInput = Omit<RadialGradientDef, 'kind' | 'id'> & {
  readonly id?: string;
};
export type CreateRawDefInput = Omit<RawXmlDef, 'kind' | 'id'> & {
  readonly id?: string;
};

export interface DesignNodeBaseSpec {
  readonly stableId?: string;
  readonly name?: string;
  readonly fill?: Fill;
  readonly stroke?: Stroke;
  readonly opacity?: number;
  readonly metadata?: Readonly<Record<string, string>>;
}

export type DesignNodeSpec =
  | (DesignNodeBaseSpec & {
      readonly kind: 'rect';
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
    })
  | (DesignNodeBaseSpec & {
      readonly kind: 'ellipse';
      readonly cx: number;
      readonly cy: number;
      readonly rx: number;
      readonly ry: number;
    })
  | (DesignNodeBaseSpec & {
      readonly kind: 'circle';
      readonly cx: number;
      readonly cy: number;
      readonly r: number;
    })
  | (DesignNodeBaseSpec & {
      readonly kind: 'line';
      readonly x1: number;
      readonly y1: number;
      readonly x2: number;
      readonly y2: number;
    })
  | (DesignNodeBaseSpec & {
      readonly kind: 'text';
      readonly x: number;
      readonly y: number;
      readonly content: string;
      readonly textStyle?: TextStylePatch;
    })
  | (DesignNodeBaseSpec & { readonly kind: 'image'; readonly image: AddImageInput })
  | (DesignNodeBaseSpec & {
      readonly kind: 'shape';
      readonly preset: ShapePreset;
      readonly bounds: BoundingBox;
    })
  | (DesignNodeBaseSpec & {
      readonly kind: 'path';
      readonly commands: readonly PathCommand[] | string;
    });

export interface DesignSpec {
  readonly width: number;
  readonly height: number;
  readonly nodes: readonly DesignNodeSpec[];
}

export interface DesignPatch {
  readonly create?: readonly DesignNodeSpec[];
  readonly update?: readonly { readonly query: NodeQuery; readonly patch: NodePatch }[];
  readonly delete?: readonly NodeQuery[];
}

export interface RectGeometry {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly rx?: number;
  readonly ry?: number;
}

export interface EllipseGeometry {
  readonly cx?: number;
  readonly cy?: number;
  readonly rx?: number;
  readonly ry?: number;
}

export interface CircleGeometry {
  readonly cx?: number;
  readonly cy?: number;
  readonly r?: number;
}

export interface LineGeometry {
  readonly x1?: number;
  readonly y1?: number;
  readonly x2?: number;
  readonly y2?: number;
}

export interface BoxGeometry {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
}

export interface FrameLayout {
  readonly mode: 'none' | 'horizontal' | 'vertical';
  readonly padding: number;
  readonly gap: number;
}

export interface DesignTokens {
  readonly fillStyles: Readonly<Record<string, Fill>>;
  readonly strokeStyles: Readonly<Record<string, Stroke>>;
  readonly textStyles: Readonly<Record<string, TextStylePatch>>;
  readonly colorTokens: Readonly<Record<string, Fill>>;
  readonly radiusTokens: Readonly<Record<string, number>>;
  readonly spacingTokens: Readonly<Record<string, number>>;
}

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
  setRotation(ids: NodeId[], angleDeg: number, pivot?: Point): void;
  scaleNodes(ids: NodeId[], scaleX: number, scaleY: number, pivot?: Point): void;
  skewNodes(ids: NodeId[], skewXDeg: number, skewYDeg: number, pivot?: Point): void;
  resetTransform(ids: NodeId[]): void;
  bakeTransform(ids: NodeId[]): void;
  flipNodes(ids: NodeId[], axis: 'horizontal' | 'vertical'): void;

  // ── Layout ──────────────────────────────────────────────────────────────
  alignHorizontal(ids: NodeId[], align: HorizontalAlign, target?: AlignTarget): void;
  alignVertical(ids: NodeId[], align: VerticalAlign, target?: AlignTarget): void;
  distribute(ids: NodeId[], axis: 'horizontal' | 'vertical'): void;
  matchSize(ids: NodeId[], sourceId?: NodeId): void;
  arrangeAsRow(ids: NodeId[], gap?: number): void;
  arrangeAsColumn(ids: NodeId[], gap?: number): void;
  arrangeAsGrid(ids: NodeId[], columns: number, gapX?: number, gapY?: number): void;
  resizeSelectionToBounds(ids: NodeId[], bounds: BoundingBox): void;
  setResizeConstraints(ids: NodeId[], constraints: ResizeConstraints): void;
  applyResizeConstraints(ids: NodeId[], containerBounds?: BoundingBox): void;
  createFrame(bounds: BoundingBox, name?: string): NodeId;

  // ── Z-Order ────────────────────────────────────────────────────────────
  bringToFront(ids: NodeId[]): void;
  sendToBack(ids: NodeId[]): void;
  bringForward(ids: NodeId[]): void;
  sendBackward(ids: NodeId[]): void;

  // ── Defs ────────────────────────────────────────────────────────────────
  createLinearGradient(input: CreateLinearGradientInput): string;
  createRadialGradient(input: CreateRadialGradientInput): string;
  createRawDef(input: CreateRawDefInput): string;
  updateLinearGradient(id: string, stops: readonly GradientStopDef[]): void;
  applyFillDef(ids: NodeId[], defId: string): void;
  applyStrokeDef(ids: NodeId[], defId: string): void;
  removeDef(id: string): void;

  // ── Grouping ───────────────────────────────────────────────────────────
  groupNodes(ids: NodeId[]): NodeId;
  ungroupNodes(ids: NodeId[]): NodeId[];

  // ── Node creation ──────────────────────────────────────────────────────
  addRect(x: number, y: number, width: number, height: number): NodeId;
  addEllipse(cx: number, cy: number, rx: number, ry: number): NodeId;
  addCircle(cx: number, cy: number, r: number): NodeId;
  addLine(x1: number, y1: number, x2: number, y2: number): NodeId;
  addPolyline(points: readonly Point[]): NodeId;
  addPolygon(points: readonly Point[]): NodeId;
  addPath(commandsOrD: readonly PathCommand[] | string): NodeId;
  addImage(input: AddImageInput): NodeId;
  addUse(input: AddUseInput): NodeId;
  addShapePreset(preset: ShapePreset, bounds: BoundingBox): NodeId;
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
  setFill(ids: NodeId[], fill: Fill): void;
  setStroke(ids: NodeId[], stroke: Stroke): void;
  setOpacity(ids: NodeId[], opacity: number): void;
  setVisibility(ids: NodeId[], visibility: boolean): void;
  setLocked(ids: NodeId[], locked: boolean): void;
  setTextStyle(id: NodeId, patch: TextStylePatch): void;
  resolveTextFont(
    id: NodeId,
    availableFonts: readonly string[],
    fallback?: string,
  ): TextFontResolution | null;
  setImageHref(id: NodeId, href: string): void;
  embedImageData(id: NodeId, mediaType: string, base64: string): void;
  setImagePreserveAspectRatio(id: NodeId, preserveAspectRatio: PreserveAspectRatio): void;
  setImageFit(id: NodeId, fit: ImageFit): void;
  setImageCrop(id: NodeId, crop: BoundingBox): string;
  setMetadata(ids: NodeId[], metadata: Readonly<Record<string, string>>): void;
  patchMetadata(ids: NodeId[], metadataPatch: Readonly<Record<string, string>>): void;
  setCornerRadius(id: NodeId, radius: number): void;
  setCornerRadiusForNodes(ids: NodeId[], radius: number): void;
  setCornerRadii(id: NodeId, radii: CornerRadii): void;
  setRectGeometry(id: NodeId, geometry: RectGeometry): void;
  setEllipseGeometry(id: NodeId, geometry: EllipseGeometry): void;
  setCircleGeometry(id: NodeId, geometry: CircleGeometry): void;
  setLineGeometry(id: NodeId, geometry: LineGeometry): void;
  setBoxGeometry(id: NodeId, geometry: BoxGeometry): void;
  convertToPath(ids: NodeId[]): void;
  updatePathCommand(id: NodeId, index: number, command: PathCommand): void;
  addPathCommand(id: NodeId, command: PathCommand, index?: number): void;
  removePathCommand(id: NodeId, index: number): void;
  movePathPoint(id: NodeId, commandIndex: number, delta: Point): void;
  convertPathSegmentToLine(id: NodeId, commandIndex: number): void;
  convertPathSegmentToCurve(id: NodeId, commandIndex: number): void;
  openPath(id: NodeId): void;
  closePath(id: NodeId): void;
  simplifyPath(id: NodeId): void;
  createCompoundPath(ids: NodeId[], name?: string): NodeId | null;
  unionPaths(ids: NodeId[], name?: string): NodeId | null;
  subtractPaths(ids: NodeId[], name?: string): NodeId | null;
  intersectPaths(ids: NodeId[], name?: string): NodeId | null;
  excludePaths(ids: NodeId[], name?: string): NodeId | null;
  outlineStroke(ids: NodeId[], name?: string): NodeId | null;
  setTextRangeStyle(id: NodeId, range: TextRange, style: TextStylePatch): void;
  setTextRuns(id: NodeId, runs: readonly TextRun[]): void;
  replaceTextContent(id: NodeId, content: string, preserveRuns?: boolean): void;
  setFrameLayout(frameId: NodeId, layout: FrameLayout, childIds?: readonly NodeId[]): void;
  applyFrameLayout(frameId: NodeId): void;
  fitFrameToContent(frameId: NodeId): void;

  // ── Styles and tokens ──────────────────────────────────────────────────
  createFillStyle(name: string, fill: Fill): string;
  createStrokeStyle(name: string, stroke: Stroke): string;
  createTextStyle(name: string, style: TextStylePatch): string;
  applyStyle(ids: NodeId[], styleId: string): void;
  updateFillStyle(styleId: string, fill: Fill): void;
  updateStrokeStyle(styleId: string, stroke: Stroke): void;
  updateTextStyle(styleId: string, style: TextStylePatch): void;
  exportDesignTokens(): DesignTokens;
  importDesignTokens(tokens: DesignTokens): void;

  // ── Programmatic design ─────────────────────────────────────────────────
  findNodes(query: NodeQuery): NodeId[];
  updateNodes(query: NodeQuery, patch: NodePatch): NodeId[];
  getAvailableCommands(ids: readonly NodeId[]): string[];
  createDesign(spec: DesignSpec): NodeId[];
  applyDesignPatch(patch: DesignPatch): NodeId[];
  getDocumentSummary(): DocumentSummary;
}
