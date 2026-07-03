import { useEditor, useEditorState } from '@svg-editor/react';

export function ZoomControls() {
  const editor = useEditor();
  const state = useEditorState();
  const zoom = Math.round((state.viewTransform.matrix[0] ?? 1) * 100);

  const zoomBy = (factor: number) => {
    const [a, b, c, d, e, f] = state.viewTransform.matrix;
    editor.setViewTransform({
      matrix: [(a ?? 1) * factor, b ?? 0, c ?? 0, (d ?? 1) * factor, e ?? 0, f ?? 0],
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: 12,
        bottom: 12,
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        background: 'white',
        border: '1px solid #ddd',
        padding: 4,
        fontSize: 12,
      }}
    >
      <button onClick={() => zoomBy(0.9)}>-</button>
      <span style={{ minWidth: 44, textAlign: 'center' }}>{zoom}%</span>
      <button onClick={() => zoomBy(1.1)}>+</button>
    </div>
  );
}
