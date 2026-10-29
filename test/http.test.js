const test = require('node:test');
const assert = require('node:assert');
const { Ember, AuthError } = require('../src');

const COOKIE = '_|WARNING:-DO-NOT-SHARE-THIS.--' + 'x'.repeat(50);
const res = (status, body, headers = {}) => new Response(body === undefined ? null : JSON.stringify(body), { status, headers });

test('retries once with a CSRF token on 403', async () => {
  const calls = [];
  const fetchFn = async (url, opts) => {
    calls.push({ url, opts });
    if (opts.method === 'PATCH' && !opts.headers['x-csrf-token']) return res(403, {}, { 'x-csrf-token': 'tok' });
    return res(200, {});
  };
  const e = new Ember({ cookie: COOKIE, fetchFn });
  await e.groups.setRole(1, 2, 3);
  assert.strictEqual(calls.length, 2);
  assert.strictEqual(calls[1].opts.headers['x-csrf-token'], 'tok');
  assert.match(calls[1].opts.headers.Cookie, /^\.ROBLOSECURITY=/);
});

test('setCookie rejects invalid cookie and keeps previous state', async () => {
  const e = new Ember({ fetchFn: async () => res(401, { errors: [{ message: 'Unauthorized' }] }) });
  await assert.rejects(e.setCookie(`.ROBLOSECURITY=${COOKIE};`), AuthError);
  assert.strictEqual(e.getCookie(), null);
});

test('setCookie sanitizes, validates and stores user', async () => {
  const e = new Ember({ fetchFn: async () => res(200, { id: 5, name: 'a' }) });
  const u = await e.setCookie(`.ROBLOSECURITY=${COOKIE};`);
  assert.strictEqual(u.id, 5);
  assert.strictEqual(e.getCookie(), COOKIE);
});
