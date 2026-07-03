import { useEditor, useNodeCapabilities, useSelection } from '@svg-editor/react';
import type { SvgNode } from '@svg-editor/core';
import { Fill, Color } from '@svg-editor/core';

export function PropertiesPanel() {
  const editor = useEditor();
  const { selectedNodes, isSingle, isEmpty } = useSelection();
  const capabilityInfo = useNodeCapabilities(selectedNodes);

  if (isEmpty) {
    return (
      <div style={{ padding: 12, fontSize: 12, color: '#888', borderBottom: '1px solid #ddd' }}>
        No selection
      </div>
    );
  }

  const node = isSingle ? selectedNodes[0] : null;

  return (
    <div
      style={{
        padding: 12,
        fontSize: 12,
        borderBottom: '1px solid #eee',
        overflowY: 'auto',
        maxHeight: 300,
      }}
    >
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
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={node.opacity}
              onChange={(e) => editor.setOpacity([node.id], Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </Field>

          {capabilityInfo.some('canFill') && (
            <Field label="Fill">
              <FillColorInput
                fill={node.fill}
                onSetFill={(fill) => editor.setFill([node.id], fill)}
              />
            </Field>
          )}

          {node.type === 'rect' && (
            <>
              <Field label="X">
                <NumberInput
                  value={node.x}
                  onChange={(v) => editor.setRectGeometry(node.id, { x: v })}
                />
              </Field>
              <Field label="Y">
                <NumberInput
                  value={node.y}
                  onChange={(v) => editor.setRectGeometry(node.id, { y: v })}
                />
              </Field>
              <Field label="W">
                <NumberInput
                  value={node.width}
                  onChange={(v) => editor.setRectGeometry(node.id, { width: v })}
                />
              </Field>
              <Field label="H">
                <NumberInput
                  value={node.height}
                  onChange={(v) => editor.setRectGeometry(node.id, { height: v })}
                />
              </Field>
              {capabilityInfo.some('canRoundCorners') && (
                <Field label="Rx">
                  <NumberInput
                    value={node.rx}
                    onChange={(v) => editor.setCornerRadii(node.id, { rx: v, ry: node.ry })}
                  />
                </Field>
              )}
            </>
          )}

          {node.type === 'ellipse' && (
            <>
              <Field label="Cx">
                <NumberInput
                  value={node.cx}
                  onChange={(v) => editor.setEllipseGeometry(node.id, { cx: v })}
                />
              </Field>
              <Field label="Cy">
                <NumberInput
                  value={node.cy}
                  onChange={(v) => editor.setEllipseGeometry(node.id, { cy: v })}
                />
              </Field>
              <Field label="Rx">
                <NumberInput
                  value={node.rx}
                  onChange={(v) => editor.setEllipseGeometry(node.id, { rx: v })}
                />
              </Field>
              <Field label="Ry">
                <NumberInput
                  value={node.ry}
                  onChange={(v) => editor.setEllipseGeometry(node.id, { ry: v })}
                />
              </Field>
            </>
          )}

          {capabilityInfo.some('canEditText') && node.type === 'text' && (
            <>
              <Field label="Content">
                <input
                  value={node.content}
                  onChange={(e) => editor.replaceTextContent(node.id, e.target.value)}
                  style={{ width: '100%' }}
                />
              </Field>
              <Field label="Size">
                <NumberInput
                  value={node.fontSize}
                  onChange={(v) => editor.setTextStyle(node.id, { fontSize: v })}
                />
              </Field>
            </>
          )}
        </>
      )}

      {!isSingle && <div style={{ color: '#666' }}>{selectedNodes.length} nodes selected</div>}
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

function FillColorInput({
  fill,
  onSetFill,
}: {
  fill: SvgNode['fill'];
  onSetFill: (fill: SvgNode['fill']) => void;
}) {
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
