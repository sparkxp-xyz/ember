class EmberError extends Error {
  constructor(message, extra = {}) {
    super(message);
    this.name = this.constructor.name;
    Object.assign(this, extra);
  }
}

class HttpError extends EmberError {
  constructor(status, message, body) {
    super(message || `HTTP ${status}`, { status, body });
  }
}

class AuthError extends EmberError {}

module.exports = { EmberError, HttpError, AuthError };
