import type { EditableAttribute, SvgNode } from '@andmarruda/svg-editor-core';
import { NodeCapabilities } from '@andmarruda/svg-editor-core';
import { useEditor } from './useEditor';
import { useSelection } from './useSelection';

export interface NodeCapabilitiesInfo {
  readonly nodes: readonly SvgNode[];
  readonly capabilities: readonly ReturnType<typeof NodeCapabilities.forNode>[];
  readonly editableAttributes: readonly EditableAttribute[];
  readonly availableCommands: readonly string[];
  readonly every: (capability: keyof ReturnType<typeof NodeCapabilities.forNode>) => boolean;
  readonly some: (capability: keyof ReturnType<typeof NodeCapabilities.forNode>) => boolean;
}

export function useNodeCapabilities(nodes?: readonly SvgNode[]): NodeCapabilitiesInfo {
  const editor = useEditor();
  const selection = useSelection();
  const selectedNodes = nodes ?? selection.selectedNodes;
  const capabilities = selectedNodes.map((node) => NodeCapabilities.forNode(node));
  const editableAttributes =
    selectedNodes.length === 1 ? NodeCapabilities.getEditableAttributes(selectedNodes[0]!) : [];
  const selectedIds = selectedNodes.map((node) => node.id);

  return {
    nodes: selectedNodes,
    capabilities,
    editableAttributes,
    availableCommands: editor.getAvailableCommands(selectedIds),
    every: (capability) =>
      capabilities.length > 0 && capabilities.every((item) => Boolean(item[capability])),
    some: (capability) => capabilities.some((item) => Boolean(item[capability])),
  };
}
