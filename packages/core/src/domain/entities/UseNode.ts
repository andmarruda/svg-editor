import type { SvgNodeBase } from './SvgNodeBase';
import type { NodeId } from '../value-objects/NodeId';

export interface UseNode extends SvgNodeBase {
  readonly type: 'use';
  readonly href: NodeId;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}
