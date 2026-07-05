import type { BoundingBox, Point, ResizeHandle } from '@andmarruda/svg-editor-core';
import { BoundingBox as BoundingBoxValue, BoundsCalculator } from '@andmarruda/svg-editor-core';
import { useEditorState } from '../hooks/useEditorState';
import { useEditor } from '../hooks/useEditor';

const HANDLE_SIZE = 8;
const ROTATE_HANDLE_OFFSET = 28;
const HANDLE_POSITIONS: Array<[number, number, ResizeHandle]> = [
  [0, 0, 'top-left'],
  [0.5, 0, 'top'],
  [1, 0, 'top-right'],
  [0, 0.5, 'left'],
  [1, 0.5, 'right'],
  [0, 1, 'bottom-left'],
  [0.5, 1, 'bottom'],
  [1, 1, 'bottom-right'],
];

export function SelectionOverlay() {
  const state = useEditorState();
  const editor = useEditor();
  const { document, selection, viewTransform } = state;

  if (selection.ids.size === 0) return null;

  const nodes = [...selection.ids].map((id) => document.nodes.get(id)).filter(Boolean);
  if (nodes.length === 0) return null;

  const boxes = nodes.map((n) => BoundsCalculator.forNode(n!));
  const union = boxes.reduce((acc, box) => BoundingBoxValue.union(acc, box));

  const [a, , , d, e, f] = viewTransform.matrix;
  const scale = a ?? 1;
  const tx = e ?? 0;
  const ty = f ?? 0;

  const sx = union.x * scale + tx;
  const sy = union.y * (d ?? 1) + ty;
  const sw = union.width * scale;
  const sh = union.height * (d ?? 1);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {/* Selection rect */}
      <rect
        x={sx - 1}
        y={sy - 1}
        width={sw + 2}
        height={sh + 2}
        fill="none"
        stroke="#0066FF"
        strokeWidth={1}
        strokeDasharray="4 2"
      />

      {/* Resize handles */}
      {HANDLE_POSITIONS.map(([hx, hy, handle]) => (
        <rect
          key={handle}
          x={sx + hx * sw - HANDLE_SIZE / 2}
          y={sy + hy * sh - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="white"
          stroke="#0066FF"
          strokeWidth={1}
          style={{ pointerEvents: 'all', cursor: getCursor(handle) }}
          onPointerDown={(e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const ids = [...selection.ids];
            const initialBounds = union;

            const onMove = (ev: MouseEvent) => {
              const delta = {
                x: (ev.clientX - startX) / scale,
                y: (ev.clientY - startY) / (d ?? 1),
              };
              const next = resizeBounds(initialBounds, handle, delta, ev.shiftKey);
              editor.resizeSelectionToBounds(ids, next);
            };
            const onUp = () => {
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
            };
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
          }}
        />
      ))}

      <line
        x1={sx + sw / 2}
        y1={sy}
        x2={sx + sw / 2}
        y2={sy - ROTATE_HANDLE_OFFSET}
        stroke="#0066FF"
        strokeWidth={1}
      />
      <circle
        cx={sx + sw / 2}
        cy={sy - ROTATE_HANDLE_OFFSET}
        r={HANDLE_SIZE / 2}
        fill="white"
        stroke="#0066FF"
        strokeWidth={1}
        style={{ pointerEvents: 'all', cursor: 'grab' }}
        onPointerDown={(e) => {
          e.stopPropagation();
          const ids = [...selection.ids];
          const pivot = BoundingBoxValue.center(union);
          const startAngle = pointerAngle(
            { x: e.clientX, y: e.clientY },
            toScreenPoint(pivot, scale, d ?? 1, tx, ty),
          );

          const onMove = (ev: MouseEvent) => {
            const angle = pointerAngle(
              { x: ev.clientX, y: ev.clientY },
              toScreenPoint(pivot, scale, d ?? 1, tx, ty),
            );
            editor.setRotation(ids, angle - startAngle, pivot);
          };
          const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        }}
      />
    </svg>
  );
}

function getCursor(handle: ResizeHandle): string {
  switch (handle) {
    case 'top-left':
    case 'bottom-right':
      return 'nwse-resize';
    case 'top-right':
    case 'bottom-left':
      return 'nesw-resize';
    case 'top':
    case 'bottom':
      return 'ns-resize';
    case 'left':
    case 'right':
      return 'ew-resize';
  }
}

function resizeBounds(
  bounds: BoundingBox,
  handle: ResizeHandle,
  delta: Point,
  keepAspectRatio: boolean,
): BoundingBox {
  let left = bounds.x;
  let top = bounds.y;
  let right = bounds.x + bounds.width;
  let bottom = bounds.y + bounds.height;

  if (handle.includes('left')) left += delta.x;
  if (handle.includes('right')) right += delta.x;
  if (handle.includes('top')) top += delta.y;
  if (handle.includes('bottom')) bottom += delta.y;

  let width = Math.max(1, right - left);
  let height = Math.max(1, bottom - top);
  if (keepAspectRatio && bounds.height > 0) {
    const ratio = bounds.width / bounds.height;
    if (width / height > ratio) width = height * ratio;
    else height = width / ratio;
    if (handle.includes('left')) left = right - width;
    else right = left + width;
    if (handle.includes('top')) top = bottom - height;
    else bottom = top + height;
  }

  return { x: left, y: top, width: right - left, height: bottom - top };
}

function pointerAngle(point: Point, pivot: Point): number {
  return (Math.atan2(point.y - pivot.y, point.x - pivot.x) * 180) / Math.PI;
}

function toScreenPoint(
  point: Point,
  scaleX: number,
  scaleY: number,
  tx: number,
  ty: number,
): Point {
  return { x: point.x * scaleX + tx, y: point.y * scaleY + ty };
}
