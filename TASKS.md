# SVG Editor — Tasks

Status: `[x]` done · `[ ]` pending · `[-]` in progress

---

## Phase 0 — Foundation `DONE`

- [x] pnpm workspaces + Turborepo configurados
- [x] `tooling/tsconfig` — base.json (strict + exactOptionalPropertyTypes + noUncheckedIndexedAccess), library.json, react.json
- [x] `tooling/eslint-config` — typescript-eslint + unicorn
- [x] `tooling/vitest-config` — vitest shared config
- [x] `packages/core` scaffolded com package.json, tsconfig, vite.config, vitest.config
- [x] Value objects: `NodeId`, `DocumentId`, `Point`, `Size`, `BoundingBox`, `Transform`, `Color`, `Fill`, `Stroke`
- [x] 107 testes unitários passando (100% dos value objects)
- [x] Build sem erros (`vite` + `tsc`)
- [ ] CI — GitHub Actions (lint + typecheck + test em cada PR)

---

## Phase 1 — Document Model + Serialization `DONE`

- [x] Entidades SVG: `RectNode`, `EllipseNode`, `CircleNode`, `LineNode`, `PolylineNode`, `PolygonNode`, `PathNode`, `TextNode`, `ImageNode`, `GroupNode`, `UseNode`, `SvgNode` discriminated union
- [x] `PathCommand` — tipos M, L, H, V, C, S, Q, T, A, Z
- [x] `Document` aggregate (flat map + rootOrder), `DocumentMutations` (puras), `Selection`, `EditorState`
- [x] `SvgDefs` — LinearGradientDef, RadialGradientDef, RawXmlDef, SvgMetadata, ViewBox
- [x] Domain events: NodeAdded, NodeRemoved, NodeMutated, SelectionChanged
- [x] Domain services: BoundsCalculator, HitTesting, TransformService
- [x] `SvgAttributeMapper` — parse/serialize transform, fill, stroke, style inline, points
- [x] `PathParser` / `PathSerializer` — round-trip `d` string ↔ `PathCommand[]`
- [x] `SvgParser` — SVG string → Document (rect, circle, ellipse, line, polyline, polygon, path, text, image, g, use, linearGradient, radialGradient)
- [x] `SvgSerializer` — Document → valid SVG string com indentação
- [x] 153 testes passando, build limpo, typecheck sem erros

**Deliverable Phase 1:** `@svg-editor/core` parseia e serializa SVGs reais. Zero dependência de UI.

---

## Phase 2 — Application Layer + History `DONE`

### 2.1 Ports (`packages/core/src/application/ports/`)
- [x] `driving/IEditorApplication.ts` — interface primária completa
- [x] `driven/IRenderer.ts` — mount, unmount, render, hitTest, hitTestMarquee
- [x] `driven/ISerializer.ts` — parse, serialize
- [x] `driven/IStorage.ts` — saveFile, loadFile, listFiles
- [x] `driven/IClipboardAdapter.ts` — write, read
- [x] `driven/IEventBus.ts` — publish, subscribe
- [x] `driven/IIdGenerator.ts` — generate

### 2.2 Commands (`packages/core/src/application/commands/`)
- [x] `ICommand` interface — execute(doc): Document, undo(doc): Document, description: string
- [x] `MoveNodesCommand`
- [x] `ResizeNodeCommand`
- [x] `RotateNodesCommand`
- [x] `FlipNodesCommand`
- [x] `AddNodeCommand`
- [x] `RemoveNodesCommand`
- [x] `SetAttributeCommand`
- [x] `ReorderNodeCommand`
- [x] `GroupNodesCommand`
- [x] `UngroupNodesCommand`
- [x] `CompositeCommand` — agrupa múltiplos commands em um (para multi-select ops)

### 2.3 History (`packages/core/src/application/history/`)
- [x] `HistoryManager` — undo/redo stack snapshot-based, 100-deep limit

### 2.4 Infrastructure (`packages/core/src/infrastructure/`)
- [x] `InMemoryEventBus` — implementa `IEventBus`
- [x] `NanoIdGenerator` — implementa `IIdGenerator` usando nanoid

### 2.5 Use Cases (`packages/core/src/application/use-cases/`)
- [x] **file/** — OpenSvgUseCase, ExportSvgUseCase, NewDocumentUseCase
- [x] **selection/** — SelectNodeUseCase, SelectByMarqueeUseCase, SelectAllUseCase
- [x] **transform/** — MoveNodesUseCase, ResizeNodeUseCase, RotateNodesUseCase, FlipNodesUseCase
- [x] **z-order/** — BringToFrontUseCase, SendToBackUseCase, BringForwardUseCase, SendBackwardUseCase
- [x] **grouping/** — GroupNodesUseCase, UngroupNodesUseCase
- [x] **clipboard/** — CopyUseCase, CutUseCase, PasteUseCase, DuplicateUseCase
- [x] **node-creation/** — AddRectUseCase, AddEllipseUseCase, AddTextUseCase, DeleteNodesUseCase, SetAttributeUseCase

### 2.6 EditorApplication (`packages/core/src/application/`)
- [x] `EditorApplication` — implementa `IEditorApplication`, wira todos os use cases e history
- [x] 27 testes de integração passando: open → select → move → undo → assert pre-move state
- [x] 180 testes totais passando, build limpo, typecheck sem erros

**Deliverable Phase 2:** Core 100% funcional como TS puro. `EditorApplication` consumível via `IEditorApplication`. Nenhuma UI necessária para testar.

---

## Phase 3 — React Adapter + Demo App `DONE`

### 3.1 Renderer (`packages/react-adapter/src/renderer/`)
- [x] `SvgDomRenderer` — implementa `IRenderer`
  - [x] Duas camadas SVG: content layer + overlay layer
  - [x] `render(state)` — atualiza content layer reativamente via DOMParser
  - [x] `hitTest(point, state)` — usa SVGGeometryElement.isPointInFill
  - [x] `hitTestMarquee(box, state)` — usa getBBox() para containment test
  - [x] Viewport pan/zoom via CSS transform no wrapper div

### 3.2 Adapters do Browser (`packages/react-adapter/src/adapters/`)
- [x] `BrowserClipboardAdapter` — Web Clipboard API com fallback in-memory
- [x] `BrowserStorageAdapter` — File System Access API com fallback `<input type=file>`
- [x] `SvgSerializer` — wrapper ISerializer usando parseSvg/serializeSvg do core

### 3.3 Context + Hooks (`packages/react-adapter/src/`)
- [x] `EditorContext` — React context com `IEditorApplication`
- [x] `useEditor()` — retorna instância de `IEditorApplication` do context
- [x] `useEditorState()` — `useSyncExternalStore` wrapper (concurrent-safe)
- [x] `useSelection()` — nós selecionados derivados do estado
- [x] `useHistory()` — canUndo, canRedo, undo, redo
- [x] `useViewport()` — viewTransform + setViewTransform + resetView

### 3.4 Componentes (`packages/react-adapter/src/components/`)
- [x] `SvgEditorRoot` — cria EditorApplication e fornece context
- [x] `Canvas` — pointer events, hit test, marquee selection, wheel zoom
- [x] `SelectionOverlay` — 8 grips de resize em SVG overlay
- [x] `MarqueeRect` — retângulo de seleção por arrasto

### 3.5 Package Setup (`packages/react-adapter/`)
- [x] package.json com `@svg-editor/core` como dep, react como peer
- [x] tsconfig estendendo `@svg-editor/tsconfig/react.json`
- [x] vite.config em library mode (ES + CJS)

### 3.6 Demo App (`apps/demo-react/`)
- [x] Vite + React app scaffolded e buildando
- [x] **Toolbar** — Select (V), Rect (R), Ellipse (E), Text (T), Pan (H)
- [x] **Canvas** — zoom por scroll, seleção por clique e marquee
- [x] **Properties Panel** — name, opacity, fill color, x/y/w/h para rect, cx/cy/rx/ry para ellipse, content/fontSize para text
- [x] **Layers Panel** — lista z-order reversa, show/hide, lock
- [x] **Menubar** — New, Open, Save, Undo, Redo, Group, Ungroup, z-order
- [x] **Keyboard shortcuts:** Ctrl+Z/Y, Ctrl+A, Ctrl+C/V/X, Ctrl+D, Ctrl+G/Shift+G, Delete, Escape, V/R/E/T/H

**Deliverable Phase 3:** `pnpm build` e `pnpm test` passando em todos os pacotes. Demo deployável.

---

## Phase 4 — Vue Adapter + Polish

### 4.1 Vue Adapter (`packages/vue-adapter/`)
- [ ] package.json, tsconfig, vite.config
- [ ] `useEditor()` composable
- [ ] `useEditorState()` — `readonly(ref(app.getState()))` via `app.subscribe`
- [ ] `useSelection()`, `useHistory()`, `useViewport()` composables
- [ ] `SvgEditorRoot.vue`, `Canvas.vue`, `SelectionOverlay.vue`, `MarqueeRect.vue`
- [ ] `SvgDomRenderer` (mesmo da react-adapter, extraído para pacote compartilhado se necessário)
- [ ] Testes com `@vue/test-utils`

### 4.2 Demo Vue (`apps/demo-vue/`)
- [ ] Paridade completa com `apps/demo-react`

### 4.3 Features de Polish (ambas as demos)
- [ ] Snap-to-grid (overlay layer, sem mudanças no domínio)
- [ ] Snap-to-object guides (linhas de alinhamento inteligentes)
- [ ] Multi-select resize — resize da bounding box de todos selecionados
- [ ] Rotation handle na selection overlay
- [ ] Color picker para fill e stroke
- [ ] Zoom controls (botões +/- + % display)

**Deliverable Phase 4:** Ambos os adapters publicados no npm (canary). Ambas as demos deployadas.

---

## Phase 5 — V1 Stable

- [ ] `@changeset/cli` configurado — CHANGELOG automático
- [ ] TypeDoc — documentação da API pública de `@svg-editor/core`
- [ ] README de cada package: instalação, uso básico, exemplos
- [ ] Performance audit — SVG com 200 nós, todas as interações a 60fps
- [ ] Accessibility pass — keyboard navigation, ARIA labels nos panels
- [ ] Browser compatibility test — Chrome, Firefox, Safari, Edge
- [ ] Publicar `@svg-editor/core@1.0.0`, `@svg-editor/react@1.0.0`, `@svg-editor/vue@1.0.0`
- [ ] GitHub Pages — demo-react deployada
- [ ] GitHub Release com changelog

**Deliverable Phase 5:** V1 estável no npm. Pronto para produção.

---

## Resumo

| Phase | Descrição | Entregável |
|-------|-----------|------------|
| ~~0~~ | ~~Foundation~~ | ~~107 testes, build limpo~~ |
| 1 | Document Model + Serialização | `parse()` e `serialize()` de SVGs reais |
| 2 | Application Layer + History | Core 100% funcional como TS puro |
| 3 | React Adapter + Demo | Editor funcionando no browser |
| 4 | Vue Adapter + Polish | Ambos adapters no npm (canary) |
| 5 | V1 Stable | `1.0.0` no npm, docs, performance |
