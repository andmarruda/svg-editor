import type { SvgNode } from '@andmarruda/svg-editor-core';
import { NodeCapabilities } from '@andmarruda/svg-editor-core';

export interface CapabilityControlGroup {
  readonly id: string;
  readonly label: string;
  readonly visible: boolean;
}

export function getCapabilityControlGroups(
  nodes: readonly SvgNode[],
): readonly CapabilityControlGroup[] {
  const capabilities = nodes.map((node) => NodeCapabilities.forNode(node));
  const some = (key: keyof ReturnType<typeof NodeCapabilities.forNode>) =>
    capabilities.some((capability) => Boolean(capability[key]));

  return [
    { id: 'fill', label: 'Fill', visible: some('canFill') },
    { id: 'stroke', label: 'Stroke', visible: some('canStroke') },
    { id: 'text', label: 'Text', visible: some('canEditText') },
    { id: 'image', label: 'Image', visible: some('canCrop') },
    { id: 'path', label: 'Path', visible: some('canEditPath') },
    { id: 'layout', label: 'Layout', visible: nodes.length > 1 },
    { id: 'gradient', label: 'Gradient', visible: some('canUseGradient') },
  ];
}
