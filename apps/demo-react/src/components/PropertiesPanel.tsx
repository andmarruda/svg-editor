import {
  useEditor,
  useEditorCapabilities,
  useNodeCapabilities,
  useSelection,
} from '@svg-editor/react';
import type { FontWeight, SvgNode } from '@svg-editor/core';
import { Fill, Color, Stroke } from '@svg-editor/core';

export function PropertiesPanel() {
  const editor = useEditor();
  const actions = useEditorCapabilities();
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

          {capabilityInfo.some('canStroke') && (
            <StrokeControls
              node={node}
              onChange={(stroke) => editor.setStroke([node.id], stroke)}
            />
          )}

          {capabilityInfo.some('canUseGradient') && (
            <Field label="Gradient">
              <button
                onClick={() =>
                  actions.createLinearGradientForSelection(`gradient-${Date.now()}`, [
                    { offset: 0, color: Color.fromHex('#00a6ff'), opacity: 1 },
                    { offset: 1, color: Color.fromHex('#ff5c8a'), opacity: 1 },
                  ])
                }
              >
                Apply
              </button>
              <button
                onClick={() => {
                  const styleId = editor.createFillStyle('Saved Fill', node.fill);
                  editor.applyStyle([node.id], styleId);
                }}
              >
                Style
              </button>
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

          {node.type === 'circle' && (
            <>
              <Field label="Cx">
                <NumberInput
                  value={node.cx}
                  onChange={(v) => editor.setCircleGeometry(node.id, { cx: v })}
                />
              </Field>
              <Field label="Cy">
                <NumberInput
                  value={node.cy}
                  onChange={(v) => editor.setCircleGeometry(node.id, { cy: v })}
                />
              </Field>
              <Field label="R">
                <NumberInput
                  value={node.r}
                  onChange={(v) => editor.setCircleGeometry(node.id, { r: v })}
                />
              </Field>
            </>
          )}

          {node.type === 'line' && (
            <>
              <Field label="X1">
                <NumberInput
                  value={node.x1}
                  onChange={(v) => editor.setLineGeometry(node.id, { x1: v })}
                />
              </Field>
              <Field label="Y1">
                <NumberInput
                  value={node.y1}
                  onChange={(v) => editor.setLineGeometry(node.id, { y1: v })}
                />
              </Field>
              <Field label="X2">
                <NumberInput
                  value={node.x2}
                  onChange={(v) => editor.setLineGeometry(node.id, { x2: v })}
                />
              </Field>
              <Field label="Y2">
                <NumberInput
                  value={node.y2}
                  onChange={(v) => editor.setLineGeometry(node.id, { y2: v })}
                />
              </Field>
            </>
          )}

          {capabilityInfo.some('canCrop') && node.type === 'image' && (
            <>
              <Field label="Href">
                <input
                  value={node.href}
                  onChange={(e) => editor.setImageHref(node.id, e.target.value)}
                  style={{ width: '100%' }}
                />
              </Field>
              <Field label="Fit">
                <select
                  value={node.metadata.imageFit ?? 'contain'}
                  onChange={(e) =>
                    editor.setImageFit(node.id, e.target.value as 'contain' | 'cover' | 'stretch')
                  }
                  style={{ width: '100%' }}
                >
                  <option value="contain">contain</option>
                  <option value="cover">cover</option>
                  <option value="stretch">stretch</option>
                </select>
              </Field>
              <Field label="W">
                <NumberInput
                  value={node.width}
                  onChange={(v) => editor.setBoxGeometry(node.id, { width: v })}
                />
              </Field>
              <Field label="H">
                <NumberInput
                  value={node.height}
                  onChange={(v) => editor.setBoxGeometry(node.id, { height: v })}
                />
              </Field>
              <Field label="Crop">
                <button
                  onClick={() =>
                    editor.setImageCrop(node.id, {
                      x: node.x + node.width * 0.1,
                      y: node.y + node.height * 0.1,
                      width: node.width * 0.8,
                      height: node.height * 0.8,
                    })
                  }
                >
                  Center
                </button>
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
              <Field label="Font">
                <input
                  value={node.fontFamily}
                  onChange={(e) => editor.setTextStyle(node.id, { fontFamily: e.target.value })}
                  style={{ width: '100%' }}
                />
              </Field>
              <Field label="Weight">
                <input
                  value={node.fontWeight}
                  onChange={(e) =>
                    editor.setTextStyle(node.id, {
                      fontWeight: numericOrString(e.target.value) as FontWeight,
                    })
                  }
                  style={{ width: '100%' }}
                />
              </Field>
              <Field label="Space">
                <NumberInput
                  value={node.letterSpacing}
                  onChange={(v) => editor.setTextStyle(node.id, { letterSpacing: v })}
                />
              </Field>
              <Field label="Line">
                <NumberInput
                  value={node.lineHeight}
                  onChange={(v) => editor.setTextStyle(node.id, { lineHeight: v })}
                />
              </Field>
              <Field label="Rich">
                <button
                  onClick={() =>
                    editor.setTextRangeStyle(
                      node.id,
                      { start: 0, end: Math.max(1, Math.min(5, node.content.length)) },
                      { fill: Fill.solid(Color.fromHex('#ff3366')), fontWeight: 800 },
                    )
                  }
                >
                  Accent
                </button>
              </Field>
            </>
          )}
        </>
      )}

      {!isSingle && <div style={{ color: '#666' }}>{selectedNodes.length} nodes selected</div>}
    </div>
  );
}

function StrokeControls({
  node,
  onChange,
}: {
  node: SvgNode;
  onChange: (stroke: NonNullable<SvgNode['stroke']>) => void;
}) {
  const stroke = node.stroke ?? Stroke.DEFAULT;
  return (
    <>
      <Field label="Stroke">
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            type="color"
            value={Color.toHex(stroke.color).slice(0, 7)}
            onChange={(e) => onChange({ ...stroke, color: Color.fromHex(e.target.value) })}
          />
          <button onClick={() => onChange(Stroke.NONE)}>None</button>
        </div>
      </Field>
      <Field label="Sw">
        <NumberInput value={stroke.width} onChange={(v) => onChange(Stroke.withWidth(stroke, v))} />
      </Field>
      <Field label="Cap">
        <select
          value={stroke.lineCap}
          onChange={(e) =>
            onChange({ ...stroke, lineCap: e.target.value as typeof stroke.lineCap })
          }
          style={{ width: '100%' }}
        >
          <option value="butt">butt</option>
          <option value="round">round</option>
          <option value="square">square</option>
        </select>
      </Field>
      <Field label="Join">
        <select
          value={stroke.lineJoin}
          onChange={(e) =>
            onChange({ ...stroke, lineJoin: e.target.value as typeof stroke.lineJoin })
          }
          style={{ width: '100%' }}
        >
          <option value="miter">miter</option>
          <option value="round">round</option>
          <option value="bevel">bevel</option>
        </select>
      </Field>
      <Field label="Dash">
        <input
          value={stroke.dashArray.join(' ')}
          onChange={(e) =>
            onChange({
              ...stroke,
              dashArray: e.target.value
                .split(/[,\s]+/)
                .map(Number)
                .filter((value) => Number.isFinite(value) && value >= 0),
            })
          }
          style={{ width: '100%' }}
        />
      </Field>
    </>
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

function numericOrString(value: string): string | number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && value.trim() !== '' ? numeric : value;
}
