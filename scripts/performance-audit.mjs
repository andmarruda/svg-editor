import { performance } from 'node:perf_hooks';
import {
  Color,
  EditorApplication,
  Fill,
  InMemoryEventBus,
  NanoIdGenerator,
  Stroke,
  parseSvg,
  serializeSvg,
} from '../packages/core/dist/index.js';

const serializer = {
  parse: parseSvg,
  serialize: serializeSvg,
};

const clipboard = {
  async write() {},
  async read() {
    return null;
  },
};

const app = new EditorApplication({
  serializer,
  clipboard,
  eventBus: new InMemoryEventBus(),
  idGenerator: new NanoIdGenerator(),
});

app.newDocument(1600, 1200);
const ids = [];
for (let index = 0; index < 200; index += 1) {
  const col = index % 20;
  const row = Math.floor(index / 20);
  const id = app.addRect(col * 72, row * 72, 48, 48);
  ids.push(id);
}

const start = performance.now();
app.setFill(ids, Fill.solid(Color.fromHex('#3366ff')));
app.setStroke(ids, Stroke.of({ color: Color.fromHex('#111111'), width: 2 }));
app.alignVertical(ids.slice(0, 20), 'top');
app.distribute(ids.slice(0, 20), 'horizontal');
app.resizeSelectionToBounds(ids.slice(0, 8), { x: 100, y: 100, width: 600, height: 120 });
app.setRotation(ids.slice(0, 20), 15);
const svg = app.exportSvg();
const elapsed = performance.now() - start;

if (!svg.includes('<svg') || app.getState().document.nodes.size !== 200) {
  throw new Error('Performance audit produced an invalid document');
}

const budgetMs = 1000;
if (elapsed > budgetMs) {
  throw new Error(`Performance audit exceeded ${budgetMs}ms: ${elapsed.toFixed(1)}ms`);
}

console.log(`Performance audit passed: 200 nodes, ${elapsed.toFixed(1)}ms`);
