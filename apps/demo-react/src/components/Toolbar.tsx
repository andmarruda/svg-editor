import { useEffect } from 'react';
import { useEditor, useEditorState } from '@svg-editor/react';
import type { ToolType } from '@svg-editor/core';

const TOOLS: Array<{ tool: ToolType; label: string; key: string }> = [
  { tool: 'select', label: 'Select (V)', key: 'v' },
  { tool: 'rect', label: 'Rect (R)', key: 'r' },
  { tool: 'ellipse', label: 'Ellipse (E)', key: 'e' },
  { tool: 'text', label: 'Text (T)', key: 't' },
  { tool: 'pan', label: 'Pan (H)', key: 'h' },
];

export function Toolbar() {
  const editor = useEditor();
  const { activeTool } = useEditorState();

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 8, borderRight: '1px solid #ddd', background: 'white', width: 56 }}>
      {TOOLS.map(({ tool, label }) => (
        <button
          key={tool}
          title={label}
          onClick={() => editor.setActiveTool(tool)}
          style={{
            width: 40, height: 40, fontSize: 11, lineHeight: 1.2,
            background: activeTool === tool ? '#0066FF' : 'transparent',
            color: activeTool === tool ? 'white' : 'inherit',
            border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer',
          }}
        >
          {tool[0]?.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
