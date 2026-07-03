// ── Value Objects ──────────────────────────────────────────────────────────
export {
  NodeId,
  DocumentId,
  Point,
  Size,
  BoundingBox,
  Transform,
  Color,
  Fill,
  Stroke,
} from './domain/value-objects';
export type { TransformMatrix, GradientStop, LineCap, LineJoin } from './domain/value-objects';

// ── Entities ───────────────────────────────────────────────────────────────
export type {
  SvgNodeType,
  SvgNodeBase,
  PathCommand,
  PathCommandType,
  RectNode,
  EllipseNode,
  CircleNode,
  LineNode,
  PolylineNode,
  PolygonNode,
  PathNode,
  TextNode,
  TextAnchor,
  FontWeight,
  TextDecoration,
  DominantBaseline,
  TextRun,
  TextRunStyle,
  ImageNode,
  PreserveAspectRatio,
  GroupNode,
  UseNode,
  SvgNode,
} from './domain/entities';

// ── Aggregates ─────────────────────────────────────────────────────────────
export {
  Document,
  DocumentMutations,
  Selection,
  ViewBox,
  DEFAULT_METADATA,
} from './domain/aggregates';
export type {
  EditorState,
  ToolType,
  SvgDef,
  SvgMetadata,
  LinearGradientDef,
  RadialGradientDef,
  RawXmlDef,
  GradientStopDef,
} from './domain/aggregates';

// ── Domain Events ──────────────────────────────────────────────────────────
export type {
  DomainEvent,
  NodeAddedEvent,
  NodeRemovedEvent,
  NodeMutatedEvent,
  SelectionChangedEvent,
  EditorDomainEvent,
} from './domain/events';

// ── Domain Services ────────────────────────────────────────────────────────
export {
  BoundsCalculator,
  GeometryService,
  HitTesting,
  LayoutService,
  NodeCapabilities,
  ShapeFactory,
  TransformService,
} from './domain/services';
export type {
  AlignTarget,
  EditableAttribute,
  EditableAttributeKind,
  HorizontalAlign,
  ShapePreset,
  ShapePresetGeometry,
  VerticalAlign,
} from './domain/services';

// ── Serialization ──────────────────────────────────────────────────────────
export { parseSvg, serializeSvg, parsePath, serializePath } from './infrastructure/serialization';

// ── Application Ports ──────────────────────────────────────────────────────
export type {
  AddImageInput,
  AddUseInput,
  BooleanOperation,
  BoxGeometry,
  CircleGeometry,
  CornerRadii,
  CreateLinearGradientInput,
  CreateRawDefInput,
  CreateRadialGradientInput,
  DesignNodeBaseSpec,
  DesignNodeSpec,
  DesignPatch,
  DesignSpec,
  DesignTokens,
  DocumentSummary,
  DocumentSummaryNode,
  EllipseGeometry,
  FrameLayout,
  ImageFit,
  IEditorApplication,
  LineGeometry,
  NodePatch,
  NodeQuery,
  RectGeometry,
  ResizeConstraint,
  ResizeConstraints,
  ResizeHandle,
  TextFontResolution,
  TextRange,
  TextStylePatch,
} from './application/ports/driving';
export type {
  IRenderer,
  ISerializer,
  IStorage,
  IClipboardAdapter,
  IEventBus,
  Unsubscribe,
  IIdGenerator,
} from './application/ports/driven';

// ── Application ────────────────────────────────────────────────────────────
export { EditorApplication } from './application/EditorApplication';
export type { EditorApplicationDeps } from './application/EditorApplication';

// ── Commands ───────────────────────────────────────────────────────────────
export type { ICommand, NodeUpdater } from './application/commands';

// ── Infrastructure ─────────────────────────────────────────────────────────
export { InMemoryEventBus } from './infrastructure/event-bus/InMemoryEventBus';
export { NanoIdGenerator } from './infrastructure/id/NanoIdGenerator';
