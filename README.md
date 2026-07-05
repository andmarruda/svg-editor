# SVG Editor

Framework-agnostic SVG editing engine with React and Vue adapters.

## Packages

- `@andmarruda/svg-editor-core` — document model, history, SVG parser/serializer, geometry, text, images, gradients, tokens, layout and programmatic design APIs.
- `@andmarruda/svg-editor-react` — React provider, hooks and canvas components.
- `@andmarruda/svg-editor-vue` — Vue provider, composables and canvas components.
- `@andmarruda/svg-editor-adapter-utils` — shared renderer and interaction helpers used by the UI adapters.

## Installation

Install the package that matches your application framework. The React and Vue adapters install the shared core package as a dependency, but the core package is listed explicitly so your app can import core APIs directly.

### React

```bash
npm install @andmarruda/svg-editor-core @andmarruda/svg-editor-react react react-dom
pnpm add @andmarruda/svg-editor-core @andmarruda/svg-editor-react react react-dom
yarn add @andmarruda/svg-editor-core @andmarruda/svg-editor-react react react-dom
bun add @andmarruda/svg-editor-core @andmarruda/svg-editor-react react react-dom
```

### Vue

```bash
npm install @andmarruda/svg-editor-core @andmarruda/svg-editor-vue vue
pnpm add @andmarruda/svg-editor-core @andmarruda/svg-editor-vue vue
yarn add @andmarruda/svg-editor-core @andmarruda/svg-editor-vue vue
bun add @andmarruda/svg-editor-core @andmarruda/svg-editor-vue vue
```

### Core Only

```bash
npm install @andmarruda/svg-editor-core
pnpm add @andmarruda/svg-editor-core
yarn add @andmarruda/svg-editor-core
bun add @andmarruda/svg-editor-core
```

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
```

Run demos:

```bash
pnpm --filter demo-react dev
pnpm --filter demo-vue dev
```

## Release

Changesets are configured for the public packages.

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

API docs:

```bash
pnpm docs:api
```
