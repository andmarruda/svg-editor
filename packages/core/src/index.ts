// ── Value Objects ──────────────────────────────────────────────────────────
export { NodeId, DocumentId, Point, Size, BoundingBox, Transform, Color, Fill, Stroke } from './domain/value-objects';
export type { TransformMatrix, GradientStop, LineCap, LineJoin } from './domain/value-objects';

// ── Entities ───────────────────────────────────────────────────────────────
export type {
  SvgNodeType, SvgNodeBase,
  PathCommand, PathCommandType,
  RectNode, EllipseNode, CircleNode,
  LineNode, PolylineNode, PolygonNode,
  PathNode, TextNode, TextAnchor, FontWeight,
  ImageNode, PreserveAspectRatio,
  GroupNode, UseNode, SvgNode,
} from './domain/entities';

// ── Aggregates ─────────────────────────────────────────────────────────────
export { Document, DocumentMutations, Selection, ViewBox, DEFAULT_METADATA } from './domain/aggregates';
export type { EditorState, ToolType, SvgDef, SvgMetadata, LinearGradientDef, RadialGradientDef, RawXmlDef, GradientStopDef } from './domain/aggregates';

// ── Domain Events ──────────────────────────────────────────────────────────
export type { DomainEvent, NodeAddedEvent, NodeRemovedEvent, NodeMutatedEvent, SelectionChangedEvent, EditorDomainEvent } from './domain/events';

// ── Domain Services ────────────────────────────────────────────────────────
export { BoundsCalculator, HitTesting, TransformService } from './domain/services';

// ── Serialization ──────────────────────────────────────────────────────────
export { parseSvg, serializeSvg, parsePath, serializePath } from './infrastructure/serialization';

// ── Application Ports ──────────────────────────────────────────────────────
export type { IEditorApplication, ResizeHandle } from './application/ports/driving';
export type { IRenderer, ISerializer, IStorage, IClipboardAdapter, IEventBus, Unsubscribe, IIdGenerator } from './application/ports/driven';

// ── Application ────────────────────────────────────────────────────────────
export { EditorApplication } from './application/EditorApplication';
export type { EditorApplicationDeps } from './application/EditorApplication';

// ── Commands ───────────────────────────────────────────────────────────────
export type { ICommand } from './application/commands';

// ── Infrastructure ─────────────────────────────────────────────────────────
export { InMemoryEventBus } from './infrastructure/event-bus/InMemoryEventBus';
export { NanoIdGenerator } from './infrastructure/id/NanoIdGenerator';
