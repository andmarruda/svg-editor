import { useRef, useEffect, useCallback, type PointerEvent } from 'react';
import type { NodeId, BoundingBox, ShapePreset } from '@andmarruda/svg-editor-core';
import {
  createNodeFromPointer,
  inlinePlaceholderImage,
  snapPointToGrid,
  snapPointToObjects,
  toDocCoords as toDocumentCoords,
} from '@andmarruda/svg-editor-adapter-utils';
import { useEditor } from '../hooks/useEditor';
import { useEditorState } from '../hooks/useEditorState';
import { SvgDomRenderer } from '../renderer/SvgDomRenderer';

interface CanvasProps {
  className?: string;
  style?: React.CSSProperties;
  imageHref?: string;
  shapePreset?: ShapePreset;
  snapToGrid?: boolean;
  snapToObjects?: boolean;
  gridSize?: number;
}

export function Canvas({
  className,
  style,
  imageHref = inlinePlaceholderImage(),
  shapePreset = 'star',
  snapToGrid = true,
  snapToObjects = true,
  gridSize = 10,
}: CanvasProps) {
  const editor = useEditor();
  const state = useEditorState();
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<SvgDomRenderer | null>(null);

  // Mount renderer once
  useEffect(() => {
    if (!containerRef.current) return;
    const renderer = new SvgDomRenderer();
    renderer.mount(containerRef.current);
    rendererRef.current = renderer;
    return () => {
      renderer.unmount();
      rendererRef.current = null;
    };
  }, []);

  // Re-render on state change
  useEffect(() => {
    rendererRef.current?.render(state);
  }, [state]);

  // ── Marquee selection state ──────────────────────────────────────────────
  const marqueeRef = useRef<{ startX: number; startY: number; active: boolean }>({
    startX: 0,
    startY: 0,
    active: false,
  });

  const toDocCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: clientX, y: clientY };
      const rect = containerRef.current.getBoundingClientRect();
      return toDocumentCoords(
        { x: clientX, y: clientY },
        rect,
        state.viewTransform.matrix,
        (point) =>
          snapPointToObjects(
            state.document,
            snapPointToGrid(point, gridSize, snapToGrid),
            snapToObjects ? 6 : 0,
          ),
      );
    },
    [gridSize, snapToGrid, snapToObjects, state.document, state.viewTransform],
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (state.activeTool !== 'select') return;
      const { x, y } = toDocCoords(e.clientX, e.clientY);
      marqueeRef.current = { startX: x, startY: y, active: true };
      (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    },
    [state.activeTool, toDocCoords],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!marqueeRef.current.active) return;
      marqueeRef.current.active = false;

      const { x, y } = toDocCoords(e.clientX, e.clientY);
      const { startX, startY } = marqueeRef.current;
      const dx = Math.abs(x - startX);
      const dy = Math.abs(y - startY);

      if (state.activeTool !== 'select') {
        createNodeFromPointer({
          editor,
          tool: state.activeTool,
          start: { x: startX, y: startY },
          end: { x, y },
          imageHref,
          shapePreset,
          snap: (point) =>
            snapPointToObjects(
              state.document,
              snapPointToGrid(point, gridSize, snapToGrid),
              snapToObjects ? 6 : 0,
            ),
        });
        editor.setActiveTool('select');
        return;
      }

      if (dx < 3 && dy < 3) {
        // Click — hit test
        const hitId = rendererRef.current?.hitTest({ x, y }, state) ?? null;
        if (hitId) {
          editor.selectNode(hitId, e.shiftKey);
        } else {
          editor.deselectAll();
        }
      } else {
        // Marquee
        const box: BoundingBox = {
          x: Math.min(startX, x),
          y: Math.min(startY, y),
          width: Math.abs(x - startX),
          height: Math.abs(y - startY),
        };
        editor.selectByMarquee(box, e.shiftKey);
      }
    },
    [editor, gridSize, imageHref, shapePreset, snapToGrid, snapToObjects, state, toDocCoords],
  );

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const scaleDelta = e.deltaY > 0 ? 0.9 : 1.1;
      const [a, b, c, d, et, f] = state.viewTransform.matrix;
      const newA = (a ?? 1) * scaleDelta;
      const newD = (d ?? 1) * scaleDelta;
      editor.setViewTransform({ matrix: [newA, b ?? 0, c ?? 0, newD, et ?? 0, f ?? 0] });
    },
    [editor, state.viewTransform],
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'default', ...style }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    />
  );
}
