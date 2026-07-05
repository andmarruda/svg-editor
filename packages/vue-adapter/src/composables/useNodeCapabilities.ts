import { computed } from 'vue';
import type { SvgNode } from '@andmarruda/svg-editor-core';
import { NodeCapabilities } from '@andmarruda/svg-editor-core';
import { useEditor } from './useEditor';
import { useSelection } from './useSelection';

export function useNodeCapabilities(nodes?: readonly SvgNode[]) {
  const editor = useEditor();
  const selection = useSelection();
  const selectedNodes = computed(() => nodes ?? selection.selectedNodes.value);
  const capabilities = computed(() =>
    selectedNodes.value.map((node) => NodeCapabilities.forNode(node)),
  );

  return {
    nodes: selectedNodes,
    capabilities,
    editableAttributes: computed(() =>
      selectedNodes.value.length === 1
        ? NodeCapabilities.getEditableAttributes(selectedNodes.value[0]!)
        : [],
    ),
    availableCommands: computed(() =>
      editor.getAvailableCommands(selectedNodes.value.map((node) => node.id)),
    ),
    every: (capability: keyof ReturnType<typeof NodeCapabilities.forNode>) =>
      capabilities.value.length > 0 &&
      capabilities.value.every((item) => Boolean(item[capability])),
    some: (capability: keyof ReturnType<typeof NodeCapabilities.forNode>) =>
      capabilities.value.some((item) => Boolean(item[capability])),
  };
}
