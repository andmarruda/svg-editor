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

## Phase 4 — SVG Editing Capabilities

Objetivo: transformar o `@svg-editor/core` em uma engine programática de edição SVG, capaz de criar e modificar designs completos sem depender de uma UI específica.

### 4.1 Node Creation API

- [x] `AddLineUseCase` + `addLine(x1, y1, x2, y2)`
- [x] `AddCircleUseCase` + `addCircle(cx, cy, r)`
- [x] `AddPolylineUseCase` + `addPolyline(points)`
- [x] `AddPolygonUseCase` + `addPolygon(points)`
- [x] `AddPathUseCase` + `addPath(commands | d)`
- [x] `AddImageUseCase` + `addImage({ href, x, y, width, height, preserveAspectRatio })`
- [x] `AddUseUseCase` + `addUse({ href, x, y, width, height })`
- [x] Garantir undo/redo, seleção automática e dirty state para todos os novos nós
- [x] Testes de round-trip parser/serializer para todos os tipos criados via API pública

### 4.2 Geometric Symbols

- [x] `ShapeFactory` no core para presets geométricos reutilizáveis
- [x] `addShapePreset('triangle', bounds)`
- [x] `addShapePreset('diamond', bounds)`
- [x] `addShapePreset('pentagon', bounds)`
- [x] `addShapePreset('hexagon', bounds)`
- [x] `addShapePreset('star', bounds)`
- [x] `addShapePreset('arrow-right' | 'arrow-left' | 'arrow-up' | 'arrow-down', bounds)`
- [x] `addShapePreset('speech-bubble', bounds)`
- [x] `addShapePreset('heart', bounds)`
- [x] `addShapePreset('badge' | 'ribbon', bounds)`
- [x] Cada preset deve gerar `PolygonNode` ou `PathNode` puro, sem dependência visual

### 4.3 Image Editing Capabilities

- [x] Inserir imagem por URL externa
- [x] Inserir imagem por data URI/base64
- [x] Atualizar `href` de `ImageNode`
- [x] Editar `preserveAspectRatio`
- [x] Fit image: contain, cover, stretch
- [x] Crop virtual por viewBox/clipPath, se necessário
- [x] Converter imagem importada em asset embutido no SVG quando solicitado
- [x] Validar dimensões mínimas e serialização de `<image>`

### 4.4 Editable SVG Attributes

- [x] API dedicada para editar `fill`
- [x] API dedicada para editar `stroke`
- [x] API dedicada para editar `opacity`
- [x] API dedicada para editar `visibility`
- [x] API dedicada para editar `locked`
- [x] API dedicada para editar `metadata`
- [x] Editar stroke width, linecap, linejoin, miterlimit, dasharray e dashoffset
- [x] Editar texto: content, fill/font color, fontFamily, fontSize, fontWeight, fontStyle, textAnchor, dominantBaseline, letterSpacing
- [x] Editar imagem: href, preserveAspectRatio, x, y, width, height
- [x] Editar geometria por tipo sem depender de escape hatch `any`

### 4.5 Text Editing Capabilities

- [x] Permitir escolher qualquer `fontFamily` por string, incluindo fontes locais, web fonts e fallback stack
- [x] API dedicada para cor do texto, mapeada para `fill` em `TextNode`
- [x] API dedicada para stroke de texto, quando o texto precisar de contorno
- [x] Suportar `fontWeight` numérico e nomeado
- [x] Suportar `fontStyle` e `letterSpacing`
- [x] Suportar `wordSpacing`, `textDecoration` e `lineHeight`
- [x] Suportar textos multi-linha com posicionamento SVG previsível
- [x] Suportar `TextRun`/rich text para trechos com estilos diferentes dentro do mesmo `TextNode`
- [x] Serializar rich text como `<text><tspan>...</tspan></text>`
- [x] Parsear `<text>` com múltiplos `<tspan>` preservando conteúdo e estilos por trecho
- [x] Permitir cores diferentes no mesmo texto via runs/tspans
- [x] Permitir fontes diferentes no mesmo texto via runs/tspans
- [x] Permitir tamanhos, pesos e estilos diferentes no mesmo texto via runs/tspans
- [x] API para aplicar estilo em intervalo de caracteres: `setTextRangeStyle(id, range, style)`
- [x] API para substituir conteúdo preservando estilos quando possível
- [x] BoundsCalculator confiável para texto simples, multi-linha e rich text
- [x] Fallback claro quando uma fonte solicitada não estiver disponível no ambiente de renderização

### 4.6 Corner Radius + Geometry Controls

- [x] `setCornerRadius(id, radius)` para `RectNode`
- [x] `setCornerRadii(id, { rx, ry })`
- [x] Normalizar `rx <= width / 2` e `ry <= height / 2`
- [x] Aplicar corner radius em múltiplos retângulos
- [x] Converter rect arredondado para path
- [x] Converter circle/ellipse/line/polygon/polyline para path

### 4.7 Transform Capabilities

- [x] `setRotation(ids, angleDeg, pivot?)`
- [x] `scaleNodes(ids, scaleX, scaleY, pivot?)`
- [x] `skewNodes(ids, skewX, skewY, pivot?)`
- [x] `resetTransform(ids)`
- [x] `bakeTransform(ids)` para aplicar transform na geometria
- [x] Multi-select resize usando bounding box comum
- [x] Transformações absolutas e relativas devem entrar no histórico

### 4.8 Alignment + Distribution

- [x] Align left, center, right
- [x] Align top, middle, bottom
- [x] Distribute horizontal spacing
- [x] Distribute vertical spacing
- [x] Match width, match height, match size
- [x] Arrange as row, column e grid
- [x] Normalize spacing entre elementos selecionados

### 4.9 Fills, Gradients + Defs

- [x] Criar linear gradient via API pública
- [x] Criar radial gradient via API pública
- [x] Editar gradient stops
- [x] Aplicar fill por referência a def
- [x] Aplicar stroke por referência a def
- [x] Remover defs órfãos
- [x] Preservar `RawXmlDef` quando abrir e salvar SVGs existentes
- [x] Suportar patterns básicos se o modelo de defs permitir

### 4.10 Path Editing

- [x] Criar path por string `d` validada
- [x] Criar path por `PathCommand[]`
- [x] Atualizar comando de path por índice
- [x] Mover ponto de path
- [x] Adicionar ponto em path
- [x] Remover ponto de path
- [x] Abrir/fechar path
- [x] Converter segmento line/curve
- [x] Simplificar path
- [x] Calcular bounds confiável para path editado

### 4.11 Boolean + Composition Operations

- [x] Compound path básico
- [x] Union de paths/shapes
- [x] Subtract de paths/shapes
- [x] Intersect de paths/shapes
- [x] Exclude de paths/shapes
- [x] Outline stroke para converter stroke em path preenchido
- [x] Avaliar biblioteca geométrica robusta antes de implementar operações booleanas manualmente

Nota: candidatas avaliadas para boolean ops: `polygon-clipping@0.15.7` e `martinez-polygon-clipping@0.8.1`, ambas MIT. A implementação atual é determinística baseada em bounds/paths simples; um motor de clipping robusto pode substituir internamente a mesma API depois.

### 4.12 Constraints + Layout Helpers

- [x] `createFrame` ou grupo com bounds explícito
- [x] Auto-layout horizontal simples
- [x] Auto-layout vertical simples
- [x] Padding e gap em grupos layoutáveis
- [x] Resize com constraints: fixed, hug, fill
- [x] Fit content para grupo/frame
- [x] APIs determinísticas para gerar layouts consistentes por código

### 4.13 Design Tokens + Styles

- [x] Criar estilos nomeados para fill
- [x] Criar estilos nomeados para stroke
- [x] Criar estilos nomeados para texto
- [x] Aplicar style por referência
- [x] Atualizar todos os nós que usam um style
- [x] Exportar/importar tokens de cor, tipografia, radius e spacing
- [x] Resolver tokens para SVG puro na exportação

### 4.14 Capability Manifest

- [x] `NodeCapabilities` para descobrir o que cada node suporta
- [x] `canFill`, `canStroke`, `canRoundCorners`, `canEditText`, `canEditPath`
- [x] `canResize`, `canRotate`, `canFlip`, `canCrop`, `canUseGradient`, `canUseRichText`
- [x] `getEditableAttributes(node)` com metadados de tipo, limites e defaults
- [x] `getAvailableCommands(selection)` para automações e adapters
- [x] Remover lógica de capability espalhada por componentes/adapters

### 4.15 AI-Ready Programmatic Design

- [x] API de alto nível para criar cena completa a partir de comandos estruturados
- [x] Operações idempotentes por nome/id estável quando possível
- [x] `findNodes(query)` por tipo, nome, metadata, bounds e atributos
- [x] `updateNodes(query, patch)` para edição em massa
- [x] `createDesign(spec)` para montar documentos a partir de uma especificação declarativa
- [x] `applyDesignPatch(patch)` para mudanças incrementais
- [x] Validação clara de entrada com erros legíveis para agentes e scripts
- [x] Exportar resumo estrutural do documento para inspeção por automação
- [x] Garantir que toda capability importante seja testável sem browser

**Deliverable Phase 4:** `@svg-editor/core` expõe uma API rica e testável para criação, composição, transformação e customização de SVGs. A UI vira apenas uma cliente dessas capacidades.

---

## Phase 5 — React + Vue Adapters + Demos + Polish

### 5.1 React Adapter Capability Sync (`packages/react-adapter/`)

- [ ] Expor hooks/helpers para todas as capabilities novas do core
- [ ] Atualizar `Canvas` para criação de line, circle, polyline, polygon, path, image e presets geométricos
- [ ] Atualizar `SelectionOverlay` com rotation handle, multi-select resize e transformações absolutas
- [ ] Atualizar propriedades derivadas de `NodeCapabilities`
- [ ] Suportar edição de imagem: href, preserveAspectRatio, fit/crop e dimensões
- [ ] Suportar edição de texto rico com runs/tspans quando disponível no core
- [ ] Suportar edição de gradients, defs, stroke avançado e styles/tokens
- [ ] Expor comandos de align, distribute, arrange, match size e layout helpers
- [ ] Testes de adapter para garantir que as novas APIs do core chegam ao React sem escape hatch

### 5.2 Demo React (`apps/demo-react/`)

- [ ] Toolbar com todas as ferramentas de criação suportadas pelo core
- [ ] Inserção/importação de imagem
- [ ] Painel de propriedades orientado por `NodeCapabilities`
- [ ] Controles de texto: fonte, cor, rich text, peso, estilo, spacing e multi-linha
- [ ] Controles de stroke avançado
- [ ] Controles de gradients, styles e tokens
- [ ] Comandos de alignment/distribution no menubar
- [ ] Demo de criação programática a partir de uma spec declarativa

### 5.3 Vue Adapter (`packages/vue-adapter/`)

- [ ] package.json, tsconfig, vite.config
- [ ] `useEditor()` composable
- [ ] `useEditorState()` — `readonly(ref(app.getState()))` via `app.subscribe`
- [ ] `useSelection()`, `useHistory()`, `useViewport()` composables
- [ ] Composables para capabilities novas: node creation, image, rich text, gradients, styles, layout helpers
- [ ] `SvgEditorRoot.vue`, `Canvas.vue`, `SelectionOverlay.vue`, `MarqueeRect.vue`
- [ ] `SvgDomRenderer` (mesmo da react-adapter, extraído para pacote compartilhado se necessário)
- [ ] Paridade de capability surface com `packages/react-adapter`
- [ ] Testes com `@vue/test-utils`

### 5.4 Demo Vue (`apps/demo-vue/`)

- [ ] Paridade completa com `apps/demo-react`

### 5.5 Shared Adapter Infrastructure

- [ ] Extrair renderer DOM compartilhado se React e Vue divergirem
- [ ] Extrair helpers de pointer/keyboard interaction reutilizáveis
- [ ] Extrair mapeamento de capability → controls para reduzir duplicação entre demos
- [ ] Garantir que React e Vue consumam o mesmo contrato público do core
- [ ] Testes de compatibilidade entre adapters para fluxos principais

### 5.6 Features de Polish (React e Vue)

- [ ] Snap-to-grid (overlay layer, sem mudanças no domínio)
- [ ] Snap-to-object guides (linhas de alinhamento inteligentes)
- [ ] Multi-select resize — resize da bounding box de todos selecionados
- [ ] Rotation handle na selection overlay
- [ ] Color picker para fill e stroke
- [ ] Zoom controls (botões +/- + % display)

**Deliverable Phase 5:** React e Vue consomem a mesma superfície de capabilities do core. `apps/demo-react` e `apps/demo-vue` demonstram todas as capabilities principais. Ambos os adapters publicados no npm (canary). Ambas as demos deployadas.

---

## Phase 6 — V1 Stable

- [ ] `@changeset/cli` configurado — CHANGELOG automático
- [ ] TypeDoc — documentação da API pública de `@svg-editor/core`
- [ ] README de cada package: instalação, uso básico, exemplos
- [ ] Performance audit — SVG com 200 nós, todas as interações a 60fps
- [ ] Accessibility pass — keyboard navigation, ARIA labels nos panels
- [ ] Browser compatibility test — Chrome, Firefox, Safari, Edge
- [ ] Publicar `@svg-editor/core@1.0.0`, `@svg-editor/react@1.0.0`, `@svg-editor/vue@1.0.0`
- [ ] GitHub Pages — demo-react deployada
- [ ] GitHub Release com changelog

**Deliverable Phase 6:** V1 estável no npm. Pronto para produção.

---

## Resumo

| Phase | Descrição                             | Entregável                                            |
| ----- | ------------------------------------- | ----------------------------------------------------- |
| ~~0~~ | ~~Foundation~~                        | ~~107 testes, build limpo~~                           |
| 1     | Document Model + Serialização         | `parse()` e `serialize()` de SVGs reais               |
| 2     | Application Layer + History           | Core 100% funcional como TS puro                      |
| 3     | React Adapter + Demo                  | Editor funcionando no browser                         |
| 4     | SVG Editing Capabilities              | Engine programática completa para criar e editar SVGs |
| 5     | React + Vue Adapters + Demos + Polish | Ambos adapters e demos com paridade de capabilities   |
| 6     | V1 Stable                             | `1.0.0` no npm, docs, performance                     |
