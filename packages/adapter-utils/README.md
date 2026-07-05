# @andmarruda/svg-editor-adapter-utils

Shared UI adapter infrastructure for SVG Editor.

This package is primarily consumed by `@andmarruda/svg-editor-react` and `@andmarruda/svg-editor-vue`.

## Install

```bash
npm install @andmarruda/svg-editor-adapter-utils @andmarruda/svg-editor-core
pnpm add @andmarruda/svg-editor-adapter-utils @andmarruda/svg-editor-core
yarn add @andmarruda/svg-editor-adapter-utils @andmarruda/svg-editor-core
bun add @andmarruda/svg-editor-adapter-utils @andmarruda/svg-editor-core
```

## Exports

- `SvgDomRenderer` — DOM renderer for editor state.
- `createNodeFromPointer` — shared node creation behavior for canvas adapters.
- `snapPointToGrid` and `snapPointToObjects` — interaction helpers.
- `getCapabilityControlGroups` — shared capability-to-control metadata.

## Example

```ts
import { SvgDomRenderer, snapPointToGrid } from '@andmarruda/svg-editor-adapter-utils';

const renderer = new SvgDomRenderer();
renderer.mount(document.querySelector('#canvas')!);
renderer.render(editor.getState());

const snapped = snapPointToGrid({ x: 13, y: 28 }, 10);
```
