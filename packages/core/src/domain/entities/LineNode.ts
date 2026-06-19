import type { SvgNodeBase } from './SvgNodeBase';
import type { Point } from '../value-objects/Point';

export interface LineNode extends SvgNodeBase {
  readonly type: 'line';
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface PolylineNode extends SvgNodeBase {
  readonly type: 'polyline';
  readonly points: readonly Point[];
}

export interface PolygonNode extends SvgNodeBase {
  readonly type: 'polygon';
  readonly points: readonly Point[];
}
