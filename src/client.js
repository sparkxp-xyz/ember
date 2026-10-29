const { Requester } = require('./http/request');
const { CookieAuth, sanitizeCookie } = require('./auth/cookie');
const { OpenCloud } = require('./auth/opencloud');
const users = require('./api/users');
const groups = require('./api/groups');
const thumbnails = require('./api/thumbnails');
const rankings = require('./api/rankings');

class Ember {
  /**
   * @param {object} [opts]
   * @param {string} [opts.cookie] 
   * @param {string} [opts.apiKey] 
   * @param {number} [opts.maxRetries]
   */
  constructor({ cookie, apiKey, maxRetries, fetchFn } = {}) {
    this._cookie = null;
    this.currentUser = null;
    this.http = new Requester({ getCookie: () => this._cookie, maxRetries, fetchFn });
    this.auth = new CookieAuth(this.http);
    this.openCloud = new OpenCloud(this.http, apiKey);
    this.users = users(this.http);
    this.groups = groups(this.http);
    this.thumbnails = thumbnails(this.http);
    this.rankings = rankings(this.groups);
    if (cookie) this._cookie = sanitizeCookie(cookie);
  }

  getCookie() { return this._cookie; }

  clearCookie() {
    this._cookie = null;
    this.currentUser = null;
    this.http.csrf.token = null;
  }

  async setCookie(cookie, { validate = true } = {}) {
    const previous = this._cookie;
    this._cookie = sanitizeCookie(cookie);
    this.http.csrf.token = null;
    if (!validate) return null;
    try {
      this.currentUser = await this.auth.getAuthenticatedUser();
      return this.currentUser;
    } catch (e) {
      this._cookie = previous;
      throw e;
    }
  }

  validateCookie() { return this.auth.validate(); }

  async refreshCookie() {
    const fresh = await this.auth.refresh();
    this._cookie = fresh;
    this.http.csrf.token = null;
    return fresh;
  }

  async getCurrentUser() { return this.currentUser || (this.currentUser = await this.auth.getAuthenticatedUser()); }
  getAuthenticatedUser() { return this.auth.getAuthenticatedUser(); }
  getUserInfo(id) { return this.users.getUserInfo(id); }
  getIdFromUsername(name) { return this.users.getIdFromUsername(name); }
  getUsernameFromId(id) { return this.users.getUsernameFromId(id); }
  getGroup(id) { return this.groups.getGroup(id); }
  getRoles(id) { return this.groups.getRoles(id); }
  getRankInGroup(g, u) { return this.rankings.getRankInGroup(g, u); }
  getRankNameInGroup(g, u) { return this.rankings.getRankNameInGroup(g, u); }
  setRank(g, u, rank) { return this.rankings.setRank(g, u, rank); }
  promote(g, u) { return this.rankings.promote(g, u); }
  demote(g, u) { return this.rankings.demote(g, u); }
  exile(g, u) { return this.groups.kick(g, u); }
  shout(g, msg) { return this.groups.shout(g, msg); }
  getJoinRequests(g, limit, cursor) { return this.groups.getJoinRequests(g, limit, cursor); }
  handleJoinRequest(g, u, accept) { return this.groups.handleJoinRequest(g, u, accept); }
  getPlayerThumbnail(ids, size, format) { return this.thumbnails.getPlayerThumbnail(ids, size, format); }
  getPlayerHeadshot(ids, size, format) { return this.thumbnails.getPlayerHeadshot(ids, size, format); }
}

module.exports = { Ember };
