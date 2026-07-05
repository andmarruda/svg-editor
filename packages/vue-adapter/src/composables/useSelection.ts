import { computed } from 'vue';
import type { SvgNode } from '@andmarruda/svg-editor-core';
import { useEditorState } from './useEditorState';

export function useSelection() {
  const state = useEditorState();
  const selectedNodes = computed<SvgNode[]>(() => {
    const nodes: SvgNode[] = [];
    for (const id of state.value.selection.ids) {
      const node = state.value.document.nodes.get(id);
      if (node) nodes.push(node);
    }
    return nodes;
  });

  return {
    selection: computed(() => state.value.selection),
    selectedNodes,
    isSingle: computed(() => state.value.selection.ids.size === 1),
    isEmpty: computed(() => state.value.selection.ids.size === 0),
  };
}
