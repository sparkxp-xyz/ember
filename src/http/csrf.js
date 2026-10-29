const CSRF_HEADER = 'x-csrf-token';

class CsrfManager {
  constructor(fetchFn = fetch) {
    this.fetch = fetchFn;
    this.token = null;
  }

  async refresh(cookie) {
    const res = await this.fetch('https://auth.roblox.com/v2/logout', {
      method: 'POST',
      headers: { Cookie: `.ROBLOSECURITY=${cookie}` },
    });
    this.token = res.headers.get(CSRF_HEADER) || null;
    return this.token;
  }

  update(res) {
    const t = res.headers.get(CSRF_HEADER);
    if (t) this.token = t;
    return !!t;
  }
}

module.exports = { CsrfManager, CSRF_HEADER };
