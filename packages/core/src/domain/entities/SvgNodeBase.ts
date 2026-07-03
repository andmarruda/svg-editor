import type { NodeId } from '../value-objects/NodeId';
import type { Transform } from '../value-objects/Transform';
import type { Fill } from '../value-objects/Fill';
import type { Stroke } from '../value-objects/Stroke';

export type SvgNodeType =
  | 'rect'
  | 'ellipse'
  | 'circle'
  | 'line'
  | 'polyline'
  | 'polygon'
  | 'path'
  | 'text'
  | 'image'
  | 'group'
  | 'use';

export interface SvgNodeBase {
  readonly id: NodeId;
  readonly type: SvgNodeType;
  readonly name: string;
  readonly transform: Transform;
  readonly fill: Fill;
  readonly stroke: Stroke;
  readonly opacity: number; // 0–1
  readonly visibility: boolean;
  readonly locked: boolean;
  readonly metadata: Readonly<Record<string, string>>;
}
