import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const apps = [
  ['demo-react', 'apps/demo-react/dist'],
  ['demo-vue', 'apps/demo-vue/dist'],
];

for (const [name, directory] of apps) {
  if (!existsSync(join(directory, 'index.html'))) {
    throw new Error(`${name} is not built. Run pnpm build before pnpm test:browsers.`);
  }
}

const server = createStaticServer({
  '/react': 'apps/demo-react/dist',
  '/vue': 'apps/demo-vue/dist',
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const port = typeof address === 'object' && address ? address.port : 0;

try {
  for (const browserType of [chromium, firefox, webkit]) {
    const browser = await browserType.launch();
    const page = await browser.newPage();
    for (const [name, path] of [
      ['demo-react', '/react/'],
      ['demo-vue', '/vue/'],
    ]) {
      await page.goto(`http://127.0.0.1:${port}${path}`);
      await page.waitForSelector('button', { timeout: 5000 });
      const buttonCount = await page.locator('button').count();
      if (buttonCount === 0) {
        throw new Error(`${name} rendered without controls in ${browserType.name()}`);
      }
    }
    await browser.close();
  }
} finally {
  server.close();
}

console.log('Browser compatibility passed: Chromium, Firefox, WebKit loaded both demos.');

function createStaticServer(routes) {
  return createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const route = Object.entries(routes).find(([prefix]) => url.pathname.startsWith(prefix));
    if (!route) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    const [prefix, directory] = route;
    const relative = url.pathname.slice(prefix.length).replace(/^\/+/, '') || 'index.html';
    const file = join(directory, relative);
    const target =
      existsSync(file) && statSync(file).isFile() ? file : join(directory, 'index.html');
    response.setHeader('content-type', contentType(target));
    response.end(readFileSync(target));
  });
}

function contentType(file) {
  switch (extname(file)) {
    case '.html':
      return 'text/html';
    case '.js':
      return 'text/javascript';
    case '.css':
      return 'text/css';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}
