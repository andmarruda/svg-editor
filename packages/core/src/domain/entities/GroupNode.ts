import type { SvgNodeBase } from './SvgNodeBase';
import type { NodeId } from '../value-objects/NodeId';

export interface GroupNode extends SvgNodeBase {
  readonly type: 'group';
  readonly children: readonly NodeId[];
}
