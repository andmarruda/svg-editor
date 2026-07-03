import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { Color, Fill, Stroke } from '@svg-editor/core';
import { SvgEditorRoot } from '../components/SvgEditorRoot';
import { useEditor } from './useEditor';
import { useEditorCapabilities } from './useEditorCapabilities';
import { useNodeCapabilities } from './useNodeCapabilities';

function wrapper({ children }: { children: ReactNode }) {
  return <SvgEditorRoot>{children}</SvgEditorRoot>;
}

describe('React adapter capability hooks', () => {
  it('exposes core capability actions without escape hatches', () => {
    const { result } = renderHook(
      () => ({
        editor: useEditor(),
        actions: useEditorCapabilities(),
        capabilities: useNodeCapabilities(),
      }),
      { wrapper },
    );

    act(() => {
      const rect = result.current.editor.addRect(0, 0, 100, 50);
      const second = result.current.editor.addRect(120, 0, 40, 40);
      result.current.editor.selectNode(rect);
      result.current.editor.selectNode(second, true);
    });

    expect(result.current.capabilities.availableCommands).toContain('align');
    expect(result.current.capabilities.availableCommands).toContain('unionPaths');

    act(() => {
      result.current.actions.setSelectedFill(Fill.solid(Color.fromHex('#123456')));
      result.current.actions.setSelectedStroke(
        Stroke.of({ color: Color.fromHex('#654321'), width: 3 }),
      );
      result.current.actions.alignSelected('vertical', 'top');
      result.current.actions.distributeSelected('horizontal');
      result.current.actions.matchSelectedSize();
    });

    const nodes = [...result.current.editor.getState().document.nodes.values()];
    expect(nodes.every((node) => node.fill.kind === 'solid')).toBe(true);
    expect(nodes.every((node) => node.stroke.width === 3)).toBe(true);
  });

  it('creates images, shape presets, gradients and declarative demo designs', () => {
    const { result } = renderHook(
      () => ({
        editor: useEditor(),
        actions: useEditorCapabilities(),
      }),
      { wrapper },
    );

    act(() => {
      result.current.actions.createImage({
        href: 'data:image/png;base64,abc',
        x: 10,
        y: 10,
        width: 20,
        height: 20,
      });
      result.current.actions.createShapePreset('star', { x: 40, y: 40, width: 80, height: 80 });
    });

    expect(
      [...result.current.editor.getState().document.nodes.values()].map((node) => node.type),
    ).toEqual(expect.arrayContaining(['image', 'polygon']));

    act(() => {
      const shapeId = [...result.current.editor.getState().document.nodes.values()].find(
        (node) => node.type === 'polygon',
      )!.id;
      result.current.editor.selectNode(shapeId);
      result.current.actions.createLinearGradientForSelection('hook-gradient', [
        { offset: 0, color: Color.fromHex('#000000'), opacity: 1 },
        { offset: 1, color: Color.fromHex('#ffffff'), opacity: 1 },
      ]);
    });

    expect(result.current.editor.getState().document.defs.has('hook-gradient')).toBe(true);

    act(() => {
      result.current.actions.createDemoDesign();
    });

    expect(result.current.editor.findNodes({ metadata: { stableId: 'demo-title' } })).toHaveLength(
      1,
    );
  });
});
