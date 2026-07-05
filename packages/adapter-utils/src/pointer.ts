import type {
  BoundingBox,
  IEditorApplication,
  Point,
  ShapePreset,
  ToolType,
} from '@andmarruda/svg-editor-core';

export interface CreateNodeFromPointerInput {
  readonly editor: IEditorApplication;
  readonly tool: ToolType;
  readonly start: Point;
  readonly end: Point;
  readonly imageHref: string;
  readonly shapePreset: ShapePreset;
  readonly snap?: (point: Point) => Point;
}

export function createNodeFromPointer(input: CreateNodeFromPointerInput): void {
  const start = input.snap ? input.snap(input.start) : input.start;
  const end = input.snap ? input.snap(input.end) : input.end;
  const bounds = normalizeBounds(start, end, 120, 80);

  switch (input.tool) {
    case 'rect':
      input.editor.addRect(bounds.x, bounds.y, bounds.width, bounds.height);
      return;
    case 'ellipse':
      input.editor.addEllipse(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
        bounds.width / 2,
        bounds.height / 2,
      );
      return;
    case 'circle':
      input.editor.addCircle(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
        Math.min(bounds.width, bounds.height) / 2,
      );
      return;
    case 'line':
      input.editor.addLine(start.x, start.y, end.x, end.y);
      return;
    case 'polyline':
      input.editor.addPolyline([
        { x: bounds.x, y: bounds.y + bounds.height },
        { x: bounds.x + bounds.width / 2, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      ]);
      return;
    case 'polygon':
      input.editor.addPolygon([
        { x: bounds.x + bounds.width / 2, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height },
      ]);
      return;
    case 'path':
      input.editor.addPath([
        { type: 'M', point: { x: bounds.x, y: bounds.y + bounds.height } },
        {
          type: 'C',
          cp1: { x: bounds.x + bounds.width * 0.25, y: bounds.y },
          cp2: { x: bounds.x + bounds.width * 0.75, y: bounds.y + bounds.height * 2 },
          point: { x: bounds.x + bounds.width, y: bounds.y },
        },
      ]);
      return;
    case 'text':
      input.editor.addText(bounds.x, bounds.y + 32, 'Text');
      return;
    case 'image':
      input.editor.addImage({ href: input.imageHref, ...bounds, preserveAspectRatio: 'xMidYMid' });
      return;
    case 'shape':
      input.editor.addShapePreset(input.shapePreset, bounds);
      return;
    case 'select':
    case 'pan':
      return;
  }
}

export function normalizeBounds(
  start: Point,
  end: Point,
  fallbackWidth: number,
  fallbackHeight: number,
): BoundingBox {
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  if (width < 3 && height < 3) {
    return { x: start.x, y: start.y, width: fallbackWidth, height: fallbackHeight };
  }
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

export function toDocCoords(
  client: Point,
  rect: DOMRect,
  matrix: readonly number[],
  snap?: (point: Point) => Point,
): Point {
  const [a, , , d, e, f] = matrix;
  const local = {
    x: (client.x - rect.left - (e ?? 0)) / (a ?? 1),
    y: (client.y - rect.top - (f ?? 0)) / (d ?? 1),
  };
  return snap ? snap(local) : local;
}

export function inlinePlaceholderImage(): string {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="#e8eef8"/><path d="M32 126 92 66l38 38 28-30 50 52Z" fill="#7d9acc"/><circle cx="172" cy="46" r="18" fill="#f4b860"/></svg>',
    )
  );
}
