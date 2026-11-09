import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const page = await readFile(new URL('./public/index.html', import.meta.url));
const stylesheet = await readFile(new URL('./public/style.css', import.meta.url));

export function createApp(metadata = {}) {
  const version = {
    tag: process.env.BUILD_TAG || 'local',
    commit: process.env.BUILD_SHA || 'uncommitted',
    builtAt: process.env.BUILD_TIME || 'local development',
    ...metadata,
  };

  return createServer((request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'");
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      return response.end();
    }
    const routes = {
      '/': ['text/html; charset=utf-8', page],
      '/style.css': ['text/css; charset=utf-8', stylesheet],
      '/client.js': ['text/javascript; charset=utf-8', clientScript],
      '/healthz': ['application/json', JSON.stringify({ status: 'ok' })],
      '/version': ['application/json', JSON.stringify(version)],
    };
    const route = routes[request.url];
    if (!route) {
      response.writeHead(404);
      return response.end('Not found');
    }
    response.writeHead(200, { 'Content-Type': route[0] });
    response.end(request.method === 'HEAD' ? undefined : route[1]);
  });
}

const clientScript = `
fetch('/version').then(response => response.json()).then(version => {
  for (const field of ['tag', 'commit', 'builtAt']) {
    document.getElementById(field).textContent = version[field];
  }
}).catch(() => {
  document.getElementById('tag').textContent = 'Version unavailable';
});
`;

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createApp();
  server.listen(Number(process.env.PORT || 8080), '0.0.0.0');
  process.on('SIGTERM', () => server.close());
  process.on('SIGINT', () => server.close());
}
