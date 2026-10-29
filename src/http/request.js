const { HttpError, AuthError } = require('./errors');
const { CsrfManager } = require('./csrf');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class Requester {
  /**
   * @param {object} opts
   * @param {() => (string|null)} opts.getCookie
   * @param {number} [opts.maxRetries] 
   */
  constructor({ getCookie, maxRetries = 3, fetchFn = fetch } = {}) {
    this.getCookie = getCookie || (() => null);
    this.maxRetries = maxRetries;
    this.fetch = fetchFn;
    this.csrf = new CsrfManager(fetchFn);
  }

  
  async request(url, { method = 'GET', query, json, headers = {}, auth = true, raw = false } = {}) {
    if (query) {
      const u = new URL(url);
      for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null) u.searchParams.set(k, v);
      url = u.toString();
    }
    const cookie = auth ? this.getCookie() : null;

    let csrfRetried = false;
    for (let attempt = 0; ; attempt++) {
      const h = { Accept: 'application/json', ...headers };
      if (cookie) h.Cookie = `.ROBLOSECURITY=${cookie}`;
      if (json !== undefined) h['Content-Type'] = 'application/json';
      if (cookie && method !== 'GET' && this.csrf.token) h['x-csrf-token'] = this.csrf.token;

      const res = await this.fetch(url, { method, headers: h, body: json !== undefined ? JSON.stringify(json) : undefined });

      if (res.status === 403 && cookie && !csrfRetried && res.headers.get('x-csrf-token')) {
        this.csrf.update(res);
        csrfRetried = true;
        continue;
      }
      if ((res.status === 429 || res.status >= 500) && attempt < this.maxRetries) {
        const retryAfter = Number(res.headers.get('retry-after'));
        await sleep(retryAfter ? retryAfter * 1000 : 500 * 2 ** attempt);
        continue;
      }
      if (raw) return res;

      const text = await res.text();
      let body = text;
      try { body = text ? JSON.parse(text) : null; } catch { /* leave as text */ }
      if (!res.ok) {
        const msg = body && body.errors && body.errors[0] && body.errors[0].message;
        if (res.status === 401) throw new AuthError(msg || 'Unauthorized (invalid or expired cookie)', { status: 401, body });
        throw new HttpError(res.status, msg ? `${msg} (HTTP ${res.status})` : undefined, body);
      }
      return body;
    }
  }
}

module.exports = { Requester };
