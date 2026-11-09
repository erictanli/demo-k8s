import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from './server.mjs';

test('serves the release page, health, metadata, assets, and safe HTTP responses', async () => {
  const metadata = { tag: 'main-0000000042-001-sha-a1b2c3d4e5f6', commit: 'a1b2c3d4e5f6', builtAt: '2026-11-10T00:00:00Z' };
  const server = createApp(metadata);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(origin);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Release Desk/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await (await fetch(`${origin}/version`)).json(), metadata);
    assert.deepEqual(await (await fetch(`${origin}/healthz`)).json(), { status: 'ok' });
    for (const asset of ['style.css', 'client.js']) {
      assert.equal((await fetch(`${origin}/${asset}`)).status, 200);
    }
    assert.equal((await fetch(`${origin}/missing`)).status, 404);
    assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
    assert.equal(await (await fetch(origin, { method: 'HEAD' })).text(), '');
  } finally {
    await new Promise((resolveClose, rejectClose) => server.close(error => error ? rejectClose(error) : resolveClose()));
  }
});
