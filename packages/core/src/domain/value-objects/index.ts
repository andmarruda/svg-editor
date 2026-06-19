// Namespace pattern: `export { X }` exports both the type alias and the const object.
export { NodeId, DocumentId } from './NodeId';
export { Point } from './Point';
export { Size } from './Size';
export { BoundingBox } from './BoundingBox';
export { Transform } from './Transform';
export { Color } from './Color';
export { Fill } from './Fill';
export { Stroke } from './Stroke';

// Pure type exports (no runtime value with this name)
export type { TransformMatrix } from './Transform';
export type { GradientStop } from './Fill';
export type { LineCap, LineJoin } from './Stroke';
