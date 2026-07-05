import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { Color, Fill, Stroke } from '@andmarruda/svg-editor-core';
import SvgEditorRoot from '../components/SvgEditorRoot.vue';
import { useEditor } from './useEditor';
import { useEditorCapabilities } from './useEditorCapabilities';
import { useNodeCapabilities } from './useNodeCapabilities';

describe('Vue adapter capability composables', () => {
  it('exposes the same core capability surface used by the React adapter', async () => {
    let api: {
      editor: ReturnType<typeof useEditor>;
      actions: ReturnType<typeof useEditorCapabilities>;
      capabilities: ReturnType<typeof useNodeCapabilities>;
    } | null = null;

    const Probe = defineComponent({
      setup() {
        api = {
          editor: useEditor(),
          actions: useEditorCapabilities(),
          capabilities: useNodeCapabilities(),
        };
        return () => h('div');
      },
    });

    mount(SvgEditorRoot, { slots: { default: () => h(Probe) } });
    expect(api).not.toBeNull();
    const current = api!;
    const first = current.editor.addRect(0, 0, 100, 50);
    const second = current.editor.addRect(120, 0, 40, 40);
    current.editor.selectNode(first);
    current.editor.selectNode(second, true);

    expect(current.capabilities.availableCommands.value).toContain('align');
    current.actions.setSelectedFill(Fill.solid(Color.fromHex('#123456')));
    current.actions.setSelectedStroke(Stroke.of({ color: Color.fromHex('#654321'), width: 3 }));
    current.actions.alignSelected('vertical', 'top');
    current.actions.createLinearGradientForSelection('vue-gradient', [
      { offset: 0, color: Color.fromHex('#000000'), opacity: 1 },
      { offset: 1, color: Color.fromHex('#ffffff'), opacity: 1 },
    ]);

    expect(current.editor.getState().document.defs.has('vue-gradient')).toBe(true);
    expect(
      [...current.editor.getState().document.nodes.values()].every(
        (node) => node.stroke.width === 3,
      ),
    ).toBe(true);
  });
});
