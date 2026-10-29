const { AuthError } = require('../http/errors');

const WARNING_PREFIX = '_|WARNING:-DO-NOT-SHARE-THIS';

function sanitizeCookie(input) {
  if (typeof input !== 'string') throw new AuthError('Cookie must be a string');
  let c = input.trim();
  const m = c.match(/\.ROBLOSECURITY=([^;]+)/);
  if (m) c = m[1];
  c = c.replace(/^["']|["']$/g, '').trim();
  if (!c) throw new AuthError('Cookie is empty');
  if (!c.startsWith(WARNING_PREFIX) && c.length < 100) throw new AuthError('Cookie does not look like a .ROBLOSECURITY value');
  return c;
}

function extractRoblosecurity(res) {
  const list = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [res.headers.get('set-cookie') || ''];
  for (const line of list) {
    const m = /\.ROBLOSECURITY=([^;]+)/.exec(line);
    if (m && m[1]) return m[1];
  }
  return null;
}

class CookieAuth {
  constructor(requester) {
    this.http = requester;
  }

  getAuthenticatedUser() {
    return this.http.request('https://users.roblox.com/v1/users/authenticated');
  }

  async validate() {
    try {
      await this.getAuthenticatedUser();
      return true;
    } catch (e) {
      if (e instanceof AuthError) return false;
      throw e;
    }
  }

  async refresh() {
    const ticketRes = await this.http.request('https://auth.roblox.com/v1/authentication-ticket', {
      method: 'POST',
      headers: { Referer: 'https://www.roblox.com/games/4924922222/Brookhaven' },
      json: {},
      raw: true,
    });
    const ticket = ticketRes.headers.get('rbx-authentication-ticket');
    if (!ticket) throw new AuthError('Could not obtain authentication ticket (cookie invalid?)');

    const redeem = await this.http.request('https://auth.roblox.com/v1/authentication-ticket/redeem', {
      method: 'POST',
      json: { authenticationTicket: ticket },
      headers: { RBXAuthenticationNegotiation: '1' },
      auth: false,
      raw: true,
    });
    const fresh = extractRoblosecurity(redeem);
    if (!fresh) throw new AuthError('Ticket redemption did not return a cookie');
    return fresh;
  }
}

module.exports = { CookieAuth, sanitizeCookie, extractRoblosecurity };
