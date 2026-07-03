# @svg-editor/core

Framework-agnostic SVG editor engine.

## Install

```bash
pnpm add @svg-editor/core
```

## Basic Usage

```ts
import {
  EditorApplication,
  InMemoryEventBus,
  NanoIdGenerator,
  parseSvg,
  serializeSvg,
} from '@svg-editor/core';

const app = new EditorApplication({
  serializer: { parse: parseSvg, serialize: serializeSvg },
  clipboard: { write: async () => {}, read: async () => null },
  eventBus: new InMemoryEventBus(),
  idGenerator: new NanoIdGenerator(),
});

app.newDocument(800, 600);
const rect = app.addRect(40, 40, 240, 120);
app.setCornerRadius(rect, 16);
app.addText(64, 112, 'Hello SVG');

const svg = app.exportSvg();
```

## Programmatic Design

```ts
app.createDesign({
  width: 960,
  height: 640,
  nodes: [
    { kind: 'rect', stableId: 'bg', x: 0, y: 0, width: 960, height: 640 },
    { kind: 'shape', preset: 'star', bounds: { x: 300, y: 160, width: 240, height: 240 } },
    { kind: 'text', x: 120, y: 520, content: 'Generated design' },
  ],
});
```

## Capabilities

The core supports shape creation, rich text runs, image embedding/crop, gradients/defs, styles/tokens, transforms, layout helpers, path editing and deterministic design patching.
