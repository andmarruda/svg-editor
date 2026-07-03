import type { Document } from '../aggregates/Document';
import type { SvgNode } from '../entities/SvgNode';
import type { NodeId } from '../value-objects/NodeId';
import { BoundingBox } from '../value-objects/BoundingBox';
import { BoundsCalculator } from './BoundsCalculator';
import { TransformService } from './TransformService';

export type AlignTarget = 'selection' | 'document';
export type HorizontalAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

export const LayoutService = {
  alignHorizontal(
    doc: Document,
    ids: readonly NodeId[],
    align: HorizontalAlign,
    target: AlignTarget,
  ): Map<NodeId, SvgNode> {
    const targetBox = getTargetBox(doc, ids, target);
    const updates = new Map<NodeId, SvgNode>();
    if (!targetBox) return updates;

    for (const id of ids) {
      const node = doc.nodes.get(id);
      if (!node) continue;
      const box = BoundsCalculator.forNode(node);
      const dx =
        align === 'left'
          ? targetBox.x - box.x
          : align === 'center'
            ? BoundingBox.center(targetBox).x - BoundingBox.center(box).x
            : targetBox.x + targetBox.width - (box.x + box.width);
      updates.set(id, TransformService.translateNode(node, dx, 0));
    }
    return updates;
  },

  alignVertical(
    doc: Document,
    ids: readonly NodeId[],
    align: VerticalAlign,
    target: AlignTarget,
  ): Map<NodeId, SvgNode> {
    const targetBox = getTargetBox(doc, ids, target);
    const updates = new Map<NodeId, SvgNode>();
    if (!targetBox) return updates;

    for (const id of ids) {
      const node = doc.nodes.get(id);
      if (!node) continue;
      const box = BoundsCalculator.forNode(node);
      const dy =
        align === 'top'
          ? targetBox.y - box.y
          : align === 'middle'
            ? BoundingBox.center(targetBox).y - BoundingBox.center(box).y
            : targetBox.y + targetBox.height - (box.y + box.height);
      updates.set(id, TransformService.translateNode(node, 0, dy));
    }
    return updates;
  },

  distribute(
    doc: Document,
    ids: readonly NodeId[],
    axis: 'horizontal' | 'vertical',
  ): Map<NodeId, SvgNode> {
    const entries = ids
      .map((id) => {
        const node = doc.nodes.get(id);
        return node ? { id, node, box: BoundsCalculator.forNode(node) } : null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => (axis === 'horizontal' ? a.box.x - b.box.x : a.box.y - b.box.y));

    const updates = new Map<NodeId, SvgNode>();
    if (entries.length < 3) return updates;
    const first = entries[0]!;
    const last = entries[entries.length - 1]!;
    const firstCenter = BoundingBox.center(first.box);
    const lastCenter = BoundingBox.center(last.box);
    const step =
      axis === 'horizontal'
        ? (lastCenter.x - firstCenter.x) / (entries.length - 1)
        : (lastCenter.y - firstCenter.y) / (entries.length - 1);

    entries.slice(1, -1).forEach((entry, index) => {
      const center = BoundingBox.center(entry.box);
      const desired =
        axis === 'horizontal'
          ? firstCenter.x + step * (index + 1)
          : firstCenter.y + step * (index + 1);
      const delta = desired - (axis === 'horizontal' ? center.x : center.y);
      updates.set(
        entry.id,
        TransformService.translateNode(
          entry.node,
          axis === 'horizontal' ? delta : 0,
          axis === 'vertical' ? delta : 0,
        ),
      );
    });

    return updates;
  },
} as const;

function getTargetBox(
  doc: Document,
  ids: readonly NodeId[],
  target: AlignTarget,
): BoundingBox | null {
  if (target === 'document') {
    return BoundingBox.of(
      doc.viewBox.minX,
      doc.viewBox.minY,
      doc.viewBox.width,
      doc.viewBox.height,
    );
  }
  return BoundsCalculator.forNodes(doc, ids);
}
