import { useEditor, useEditorState } from '@andmarruda/svg-editor-react';
import type { NodeId } from '@andmarruda/svg-editor-core';

export function LayersPanel() {
  const editor = useEditor();
  const { document, selection } = useEditorState();

  const rootIds = [...document.rootOrder].reverse();

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 8, fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Layers</div>
      {rootIds.length === 0 && <div style={{ color: '#888' }}>No layers</div>}
      {rootIds.map((id) => {
        const node = document.nodes.get(id);
        if (!node) return null;
        const isSelected = selection.ids.has(id);
        return (
          <LayerRow
            key={id}
            id={id}
            name={node.name}
            type={node.type}
            isSelected={isSelected}
            isVisible={node.visibility}
            isLocked={node.locked}
            onSelect={(addTo) => editor.selectNode(id, addTo)}
            onToggleVisibility={() => editor.setNodeAttribute(id, 'visibility', !node.visibility)}
            onToggleLock={() => editor.setNodeAttribute(id, 'locked', !node.locked)}
          />
        );
      })}
    </div>
  );
}

interface LayerRowProps {
  id: NodeId;
  name: string;
  type: string;
  isSelected: boolean;
  isVisible: boolean;
  isLocked: boolean;
  onSelect: (addTo: boolean) => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
}

function LayerRow({
  name,
  type,
  isSelected,
  isVisible,
  isLocked,
  onSelect,
  onToggleVisibility,
  onToggleLock,
}: LayerRowProps) {
  return (
    <div
      onClick={(e) => onSelect(e.shiftKey)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 4px',
        borderRadius: 3,
        marginBottom: 1,
        cursor: 'pointer',
        background: isSelected ? '#e0eaff' : 'transparent',
      }}
    >
      <span style={{ fontSize: 10, color: '#888', minWidth: 32 }}>{type}</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        title={isVisible ? 'Hide' : 'Show'}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontSize: 12,
          opacity: isVisible ? 1 : 0.4,
        }}
      >
        👁
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleLock();
        }}
        title={isLocked ? 'Unlock' : 'Lock'}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12 }}
      >
        {isLocked ? '🔒' : '🔓'}
      </button>
    </div>
  );
}
