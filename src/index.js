const { Ember } = require('./client');
const { EmberError, HttpError, AuthError } = require('./http/errors');
const { sanitizeCookie } = require('./auth/cookie');

module.exports = { Ember, EmberError, HttpError, AuthError, sanitizeCookie };
