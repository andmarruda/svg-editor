# SVG Editor

Framework-agnostic SVG editing engine with React and Vue adapters.

## Packages

- `@svg-editor/core` — document model, history, SVG parser/serializer, geometry, text, images, gradients, tokens, layout and programmatic design APIs.
- `@svg-editor/react` — React provider, hooks and canvas components.
- `@svg-editor/vue` — Vue provider, composables and canvas components.
- `@svg-editor/adapter-utils` — shared renderer and interaction helpers used by the UI adapters.

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
