import type { ResizeHandle } from '@svg-editor/core';
import { BoundsCalculator } from '@svg-editor/core';
import { useEditorState } from '../hooks/useEditorState';
import { useEditor } from '../hooks/useEditor';

const HANDLE_SIZE = 8;
const HANDLE_POSITIONS: Array<[number, number, ResizeHandle]> = [
  [0, 0, 'top-left'], [0.5, 0, 'top'], [1, 0, 'top-right'],
  [0, 0.5, 'left'], [1, 0.5, 'right'],
  [0, 1, 'bottom-left'], [0.5, 1, 'bottom'], [1, 1, 'bottom-right'],
];

export function SelectionOverlay() {
  const state = useEditorState();
  const editor = useEditor();
  const { document, selection, viewTransform } = state;

  if (selection.ids.size === 0) return null;

  const nodes = [...selection.ids].map((id) => document.nodes.get(id)).filter(Boolean);
  if (nodes.length === 0) return null;

  const boxes = nodes.map((n) => BoundsCalculator.forNode(n!));
  const union = boxes.reduce((acc, box) => ({
    x: Math.min(acc.x, box.x),
    y: Math.min(acc.y, box.y),
    width: Math.max(acc.x + acc.width, box.x + box.width) - Math.min(acc.x, box.x),
    height: Math.max(acc.y + acc.height, box.y + box.height) - Math.min(acc.y, box.y),
  }));

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
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
    >
      {/* Selection rect */}
      <rect
        x={sx - 1} y={sy - 1} width={sw + 2} height={sh + 2}
        fill="none" stroke="#0066FF" strokeWidth={1} strokeDasharray="4 2"
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

            const onMove = (ev: MouseEvent) => {
              const delta = {
                x: (ev.clientX - startX) / scale,
                y: (ev.clientY - startY) / (d ?? 1),
              };
              if (ids.length === 1 && ids[0]) {
                editor.resizeNode(ids[0], handle, delta, ev.shiftKey);
              }
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
    </svg>
  );
}

function getCursor(handle: ResizeHandle): string {
  switch (handle) {
    case 'top-left': case 'bottom-right': return 'nwse-resize';
    case 'top-right': case 'bottom-left': return 'nesw-resize';
    case 'top': case 'bottom': return 'ns-resize';
    case 'left': case 'right': return 'ew-resize';
  }
}
