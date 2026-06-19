import type { Selection, SvgNode } from '@svg-editor/core';
import { useEditorState } from './useEditorState';

export interface SelectionInfo {
  selection: Selection;
  selectedNodes: SvgNode[];
  isSingle: boolean;
  isEmpty: boolean;
}

export function useSelection(): SelectionInfo {
  const state = useEditorState();
  const { selection, document } = state;
  const selectedNodes: SvgNode[] = [];
  for (const id of selection.ids) {
    const node = document.nodes.get(id);
    if (node) selectedNodes.push(node);
  }
  return {
    selection,
    selectedNodes,
    isSingle: selection.ids.size === 1,
    isEmpty: selection.ids.size === 0,
  };
}
