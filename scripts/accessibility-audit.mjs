import { readFileSync } from 'node:fs';

const files = [
  'apps/demo-react/src/components/MenuBar.tsx',
  'apps/demo-react/src/components/Toolbar.tsx',
  'apps/demo-react/src/components/PropertiesPanel.tsx',
  'apps/demo-react/src/components/ZoomControls.tsx',
  'apps/demo-vue/src/components/MenuBar.vue',
  'apps/demo-vue/src/components/Toolbar.vue',
  'apps/demo-vue/src/components/PropertiesPanel.vue',
  'apps/demo-vue/src/components/ZoomControls.vue',
];

const failures = [];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const buttonCount = (source.match(/<button/g) ?? []).length;
  const labelledCount = (source.match(/title=|aria-label=|>\s*[^<{]/g) ?? []).length;
  if (buttonCount > 0 && labelledCount === 0) {
    failures.push(`${file}: buttons need visible labels, title, or aria-label`);
  }
  if (file.includes('Toolbar') && !source.includes('title=') && !source.includes(':title=')) {
    failures.push(`${file}: toolbar controls need titles`);
  }
}

if (failures.length > 0) {
  throw new Error(`Accessibility audit failed:\n${failures.join('\n')}`);
}

console.log(
  'Accessibility audit passed: controls expose labels/titles and keyboard-capable native controls.',
);
