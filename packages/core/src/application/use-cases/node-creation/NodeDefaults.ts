import type { SvgNodeBase } from '../../../domain/entities/SvgNodeBase';
import type { NodeId } from '../../../domain/value-objects/NodeId';
import { Transform } from '../../../domain/value-objects/Transform';
import { Fill } from '../../../domain/value-objects/Fill';
import { Stroke } from '../../../domain/value-objects/Stroke';
import { Color } from '../../../domain/value-objects/Color';

export function createNodeBase(
  id: NodeId,
  name: string,
  options: Partial<SvgNodeBase> = {},
): Omit<SvgNodeBase, 'type'> {
  return {
    id,
    name,
    transform: options.transform ?? Transform.identity(),
    fill: options.fill ?? Fill.solid(Color.BLACK),
    stroke: options.stroke ?? Stroke.NONE,
    opacity: options.opacity ?? 1,
    visibility: options.visibility ?? true,
    locked: options.locked ?? false,
    metadata: options.metadata ?? {},
  };
}
