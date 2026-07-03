import { useMemo } from 'react';
import type {
  AddImageInput,
  BoundingBox,
  DesignSpec,
  Fill,
  GradientStopDef,
  NodeId,
  ShapePreset,
  Stroke,
  TextStylePatch,
} from '@svg-editor/core';
import { Color, Stroke as StrokeValue } from '@svg-editor/core';
import { useEditor } from './useEditor';
import { useSelection } from './useSelection';

export interface EditorCapabilityActions {
  readonly createImage: (input: AddImageInput) => NodeId;
  readonly createShapePreset: (preset: ShapePreset, bounds: BoundingBox) => NodeId;
  readonly createDemoDesign: () => NodeId[];
  readonly setSelectedFill: (fill: Fill) => void;
  readonly setSelectedStroke: (stroke: Stroke) => void;
  readonly setSelectedTextStyle: (style: TextStylePatch) => void;
  readonly createLinearGradientForSelection: (
    id: string,
    stops: readonly GradientStopDef[],
  ) => string | null;
  readonly alignSelected: (axis: 'horizontal' | 'vertical', value: string) => void;
  readonly distributeSelected: (axis: 'horizontal' | 'vertical') => void;
  readonly arrangeSelected: (mode: 'row' | 'column' | 'grid') => void;
  readonly matchSelectedSize: () => void;
}

export function useEditorCapabilities(): EditorCapabilityActions {
  const editor = useEditor();
  const { selection } = useSelection();

  return useMemo(() => {
    const selectedIds = () => [...selection.ids];
    const demoSpec: DesignSpec = {
      width: 960,
      height: 640,
      nodes: [
        {
          kind: 'rect',
          stableId: 'demo-bg',
          name: 'Background',
          x: 0,
          y: 0,
          width: 960,
          height: 640,
          fill: { kind: 'solid', color: Color.fromHex('#f7f7f2') },
        },
        {
          kind: 'shape',
          stableId: 'demo-badge',
          name: 'Badge',
          preset: 'badge',
          bounds: { x: 340, y: 120, width: 280, height: 280 },
          fill: { kind: 'solid', color: Color.fromHex('#ffcc33') },
          stroke: StrokeValue.of({ color: Color.fromHex('#1a1a1a'), width: 4 }),
        },
        {
          kind: 'text',
          stableId: 'demo-title',
          name: 'Title',
          x: 250,
          y: 470,
          content: 'Programmatic SVG',
          textStyle: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 52,
            fontWeight: 800,
            fill: { kind: 'solid', color: Color.fromHex('#1a1a1a') },
          },
        },
      ],
    };

    return {
      createImage: (input) => editor.addImage(input),
      createShapePreset: (preset, bounds) => editor.addShapePreset(preset, bounds),
      createDemoDesign: () => editor.createDesign(demoSpec),
      setSelectedFill: (fill) => editor.setFill(selectedIds(), fill),
      setSelectedStroke: (stroke) => editor.setStroke(selectedIds(), stroke),
      setSelectedTextStyle: (style) => {
        for (const id of selectedIds()) editor.setTextStyle(id, style);
      },
      createLinearGradientForSelection: (id, stops) => {
        const ids = selectedIds();
        if (ids.length === 0) return null;
        const gradientId = editor.createLinearGradient({
          id,
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 1,
          gradientUnits: 'objectBoundingBox',
          stops,
        });
        editor.applyFillDef(ids, gradientId);
        return gradientId;
      },
      alignSelected: (axis, value) => {
        const ids = selectedIds();
        if (
          axis === 'horizontal' &&
          (value === 'left' || value === 'center' || value === 'right')
        ) {
          editor.alignHorizontal(ids, value);
        }
        if (axis === 'vertical' && (value === 'top' || value === 'middle' || value === 'bottom')) {
          editor.alignVertical(ids, value);
        }
      },
      distributeSelected: (axis) => editor.distribute(selectedIds(), axis),
      arrangeSelected: (mode) => {
        const ids = selectedIds();
        if (mode === 'row') editor.arrangeAsRow(ids, 12);
        if (mode === 'column') editor.arrangeAsColumn(ids, 12);
        if (mode === 'grid') editor.arrangeAsGrid(ids, 3, 12, 12);
      },
      matchSelectedSize: () => editor.matchSize(selectedIds()),
    };
  }, [editor, selection.ids]);
}
