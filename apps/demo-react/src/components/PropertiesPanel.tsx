import { useEditor, useSelection } from '@svg-editor/react';
import type { SvgNode, NodeId } from '@svg-editor/core';
import { Fill, Color } from '@svg-editor/core';
import type { IEditorApplication } from '@svg-editor/core';

// Escape hatch for shape-specific attribute keys not in the union intersection
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setAttr(editor: IEditorApplication, id: NodeId, key: string, value: unknown): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (editor as any).setNodeAttribute(id, key, value);
}

export function PropertiesPanel() {
  const editor = useEditor();
  const { selectedNodes, isSingle, isEmpty } = useSelection();

  if (isEmpty) {
    return (
      <div style={{ padding: 12, fontSize: 12, color: '#888', borderBottom: '1px solid #ddd' }}>
        No selection
      </div>
    );
  }

  const node = isSingle ? selectedNodes[0] : null;

  return (
    <div style={{ padding: 12, fontSize: 12, borderBottom: '1px solid #eee', overflowY: 'auto', maxHeight: 300 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Properties</div>

      {node && (
        <>
          <Field label="Name">
            <input
              value={node.name}
              onChange={(e) => editor.setNodeAttribute(node.id, 'name', e.target.value)}
              style={{ width: '100%' }}
            />
          </Field>

          <Field label="Opacity">
            <input
              type="number" min={0} max={1} step={0.1}
              value={node.opacity}
              onChange={(e) => editor.setNodeAttribute(node.id, 'opacity', Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </Field>

          <Field label="Fill">
            <FillColorInput
              fill={node.fill}
              onSetFill={(fill) => editor.setNodeAttribute(node.id, 'fill', fill)}
            />
          </Field>

          {node.type === 'rect' && (
            <>
              <Field label="X"><NumberInput value={node.x} onChange={(v) => setAttr(editor, node.id, 'x', v)} /></Field>
              <Field label="Y"><NumberInput value={node.y} onChange={(v) => setAttr(editor, node.id, 'y', v)} /></Field>
              <Field label="W"><NumberInput value={node.width} onChange={(v) => setAttr(editor, node.id, 'width', v)} /></Field>
              <Field label="H"><NumberInput value={node.height} onChange={(v) => setAttr(editor, node.id, 'height', v)} /></Field>
              <Field label="Rx"><NumberInput value={node.rx} onChange={(v) => setAttr(editor, node.id, 'rx', v)} /></Field>
            </>
          )}

          {node.type === 'ellipse' && (
            <>
              <Field label="Cx"><NumberInput value={node.cx} onChange={(v) => setAttr(editor, node.id, 'cx', v)} /></Field>
              <Field label="Cy"><NumberInput value={node.cy} onChange={(v) => setAttr(editor, node.id, 'cy', v)} /></Field>
              <Field label="Rx"><NumberInput value={node.rx} onChange={(v) => setAttr(editor, node.id, 'rx', v)} /></Field>
              <Field label="Ry"><NumberInput value={node.ry} onChange={(v) => setAttr(editor, node.id, 'ry', v)} /></Field>
            </>
          )}

          {node.type === 'text' && (
            <>
              <Field label="Content">
                <input
                  value={node.content}
                  onChange={(e) => setAttr(editor, node.id, 'content', e.target.value)}
                  style={{ width: '100%' }}
                />
              </Field>
              <Field label="Size"><NumberInput value={node.fontSize} onChange={(v) => setAttr(editor, node.id, 'fontSize', v)} /></Field>
            </>
          )}
        </>
      )}

      {!isSingle && (
        <div style={{ color: '#666' }}>{selectedNodes.length} nodes selected</div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
      <span style={{ minWidth: 40, color: '#666' }}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%' }}
    />
  );
}

function FillColorInput({ fill, onSetFill }: { fill: SvgNode['fill']; onSetFill: (fill: SvgNode['fill']) => void }) {
  if (fill.kind === 'none') {
    return <button onClick={() => onSetFill(Fill.solid(Color.BLACK))}>Add fill</button>;
  }
  if (fill.kind === 'solid') {
    const hex = Color.toHex(fill.color);
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        <input
          type="color"
          value={hex.slice(0, 7)}
          onChange={(e) => {
            const c = Color.fromHex(e.target.value);
            onSetFill(Fill.solid(c));
          }}
        />
        <button onClick={() => onSetFill(Fill.NONE)}>✕</button>
      </div>
    );
  }
  return <span style={{ color: '#888' }}>{fill.kind}</span>;
}
