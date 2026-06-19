import type { SvgNode } from '../entities/SvgNode';
import type { PathCommand } from '../entities/PathCommand';
import { Transform } from '../value-objects/Transform';
import { Point } from '../value-objects/Point';

export const TransformService = {
  /**
   * Applies an additional transform on top of the node's existing transform.
   * Returns a new node with the composed transform.
   */
  applyToNode<T extends SvgNode>(node: T, t: Transform): T {
    return { ...node, transform: Transform.multiply(t, node.transform) };
  },

  /**
   * Translates a node by delta — updates position attributes directly for simple shapes,
   * or composes into the transform for complex ones.
   */
  translateNode<T extends SvgNode>(node: T, dx: number, dy: number): T {
    switch (node.type) {
      case 'rect':
      case 'image':
        return { ...node, x: node.x + dx, y: node.y + dy };
      case 'ellipse':
      case 'circle':
        return { ...node, cx: node.cx + dx, cy: node.cy + dy };
      case 'text':
        return { ...node, x: node.x + dx, y: node.y + dy };
      case 'line':
        return { ...node, x1: node.x1 + dx, y1: node.y1 + dy, x2: node.x2 + dx, y2: node.y2 + dy };
      case 'polyline':
      case 'polygon':
        return { ...node, points: node.points.map((p) => Point.of(p.x + dx, p.y + dy)) };
      case 'path':
        return { ...node, commands: translatePathCommands(node.commands, dx, dy) };
      case 'group':
      case 'use':
        return TransformService.applyToNode(node, Transform.translation(dx, dy));
      default:
        return TransformService.applyToNode(node, Transform.translation(dx, dy));
    }
  },

  applyToPathCommands(commands: readonly PathCommand[], t: Transform): PathCommand[] {
    return applyTransformToCommands(commands, t);
  },
} as const;

function translatePathCommands(commands: readonly PathCommand[], dx: number, dy: number): PathCommand[] {
  return commands.map((cmd) => {
    switch (cmd.type) {
      case 'M':
      case 'L':
      case 'T':
        return { ...cmd, point: Point.of(cmd.point.x + dx, cmd.point.y + dy) };
      case 'H':
        return { ...cmd, x: cmd.x + dx };
      case 'V':
        return { ...cmd, y: cmd.y + dy };
      case 'C':
        return {
          ...cmd,
          cp1: Point.of(cmd.cp1.x + dx, cmd.cp1.y + dy),
          cp2: Point.of(cmd.cp2.x + dx, cmd.cp2.y + dy),
          point: Point.of(cmd.point.x + dx, cmd.point.y + dy),
        };
      case 'S':
        return {
          ...cmd,
          cp2: Point.of(cmd.cp2.x + dx, cmd.cp2.y + dy),
          point: Point.of(cmd.point.x + dx, cmd.point.y + dy),
        };
      case 'Q':
        return {
          ...cmd,
          cp: Point.of(cmd.cp.x + dx, cmd.cp.y + dy),
          point: Point.of(cmd.point.x + dx, cmd.point.y + dy),
        };
      case 'A':
        return { ...cmd, point: Point.of(cmd.point.x + dx, cmd.point.y + dy) };
      case 'Z':
        return cmd;
    }
  });
}

function applyTransformToCommands(commands: readonly PathCommand[], t: Transform): PathCommand[] {
  return commands.map((cmd) => {
    switch (cmd.type) {
      case 'M':
      case 'L':
      case 'T':
        return { ...cmd, point: Transform.applyToPoint(t, cmd.point) };
      case 'H': {
        const transformed = Transform.applyToPoint(t, Point.of(cmd.x, 0));
        return { type: 'L', point: transformed };
      }
      case 'V': {
        const transformed = Transform.applyToPoint(t, Point.of(0, cmd.y));
        return { type: 'L', point: transformed };
      }
      case 'C':
        return {
          ...cmd,
          cp1: Transform.applyToPoint(t, cmd.cp1),
          cp2: Transform.applyToPoint(t, cmd.cp2),
          point: Transform.applyToPoint(t, cmd.point),
        };
      case 'S':
        return {
          ...cmd,
          cp2: Transform.applyToPoint(t, cmd.cp2),
          point: Transform.applyToPoint(t, cmd.point),
        };
      case 'Q':
        return {
          ...cmd,
          cp: Transform.applyToPoint(t, cmd.cp),
          point: Transform.applyToPoint(t, cmd.point),
        };
      case 'A':
        return { ...cmd, point: Transform.applyToPoint(t, cmd.point) };
      case 'Z':
        return cmd;
    }
  });
}
