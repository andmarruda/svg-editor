import type { SvgNodeBase } from './SvgNodeBase';
import type { PathCommand } from './PathCommand';

export interface PathNode extends SvgNodeBase {
  readonly type: 'path';
  readonly commands: readonly PathCommand[];
}
