import { useEffect, useRef } from 'react';
import { useEditor, useEditorCapabilities, useEditorState } from '@svg-editor/react';
import type { ToolType, ShapePreset } from '@svg-editor/core';

const TOOLS: Array<{ tool: ToolType; label: string; key: string; mark: string }> = [
  { tool: 'select', label: 'Select (V)', key: 'v', mark: 'V' },
  { tool: 'rect', label: 'Rect (R)', key: 'r', mark: '▭' },
  { tool: 'ellipse', label: 'Ellipse (E)', key: 'e', mark: '◯' },
  { tool: 'circle', label: 'Circle (C)', key: 'c', mark: '○' },
  { tool: 'line', label: 'Line (L)', key: 'l', mark: '╱' },
  { tool: 'polyline', label: 'Polyline (Y)', key: 'y', mark: '⌁' },
  { tool: 'polygon', label: 'Polygon (G)', key: 'g', mark: '⬠' },
  { tool: 'path', label: 'Path (P)', key: 'p', mark: '⌇' },
  { tool: 'text', label: 'Text (T)', key: 't', mark: 'T' },
  { tool: 'image', label: 'Image (I)', key: 'i', mark: 'Img' },
  { tool: 'shape', label: 'Shape preset (S)', key: 's', mark: '★' },
  { tool: 'pan', label: 'Pan (H)', key: 'h', mark: 'H' },
];

const QUICK_SHAPES: ShapePreset[] = ['triangle', 'diamond', 'star', 'arrow-right', 'speech-bubble'];

export function Toolbar() {
  const editor = useEditor();
  const actions = useEditorCapabilities();
  const { activeTool } = useEditorState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if ((ev.target as HTMLElement).tagName === 'INPUT') return;
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const found = TOOLS.find((t) => t.key === ev.key.toLowerCase());
      if (found) editor.setActiveTool(found.tool);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editor]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: 8,
        borderRight: '1px solid #ddd',
        background: 'white',
        width: 72,
      }}
    >
      {TOOLS.map(({ tool, label, mark }) => (
        <button
          key={tool}
          title={label}
          onClick={() => editor.setActiveTool(tool)}
          style={{
            width: 56,
            height: 32,
            fontSize: 11,
            lineHeight: 1.2,
            background: activeTool === tool ? '#0066FF' : 'transparent',
            color: activeTool === tool ? 'white' : 'inherit',
            border: '1px solid #ccc',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          {mark}
        </button>
      ))}
      <span style={{ height: 1, background: '#ddd', margin: '4px 0' }} />
      {QUICK_SHAPES.map((preset) => (
        <button
          key={preset}
          title={`Insert ${preset}`}
          onClick={() =>
            actions.createShapePreset(preset, { x: 120, y: 120, width: 120, height: 90 })
          }
          style={{ width: 56, height: 28, fontSize: 10, border: '1px solid #ccc', borderRadius: 4 }}
        >
          {preset.split('-')[0]}
        </button>
      ))}
      <button
        title="Import image"
        onClick={() => fileInputRef.current?.click()}
        style={{ width: 56, height: 32, fontSize: 10, border: '1px solid #ccc', borderRadius: 4 }}
      >
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            actions.createImage({
              href: String(reader.result),
              x: 140,
              y: 140,
              width: 240,
              height: 160,
              preserveAspectRatio: 'xMidYMid',
            });
          });
          reader.readAsDataURL(file);
          event.currentTarget.value = '';
        }}
      />
    </div>
  );
}
