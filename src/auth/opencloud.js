const { EmberError } = require('../http/errors');

class OpenCloud {
  constructor(requester, apiKey) {
    this.http = requester;
    this.apiKey = apiKey;
  }

  request(path, opts = {}) {
    if (!this.apiKey) throw new EmberError('No Open Cloud API key set');
    return this.http.request(`https://apis.roblox.com${path}`, {
      ...opts,
      auth: false,
      headers: { 'x-api-key': this.apiKey, ...(opts.headers || {}) },
    });
  }
}

module.exports = { OpenCloud };
