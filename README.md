# ember

SparkXP's lightweight Roblox API wrapper. Zero dependencies, Node 18+, built to be a drop-in replacement for the common `noblox.js` calls.

## Install

```sh
npm install sparkxp-xyz/ember
```

## Quick start

```js
const { Ember } = require('ember');

// Option 1: create, then log in
const ember = new Ember();
const user = await ember.login(process.env.ROBLOSECURITY);
console.log(`Logged in as ${user.name}`);

// Option 2: one line
const ember2 = await Ember.login(process.env.ROBLOSECURITY);

// Use it like noblox
const id = await ember.getIdFromUsername('Roblox');
await ember.setRank(1234567, id, 5);
```

`login()` with no argument reads the `ROBLOSECURITY` environment variable. It accepts the bare cookie, `.ROBLOSECURITY=...;`, or a quoted string, validates it against Roblox, and throws `AuthError` if it is invalid (your previous session is kept). CSRF tokens are fetched and retried automatically.

> Never commit your cookie. Keep it in an environment variable or secrets store.

## Constructor

```js
new Ember({ cookie, apiKey, maxRetries, fetchFn })
```

| Option | Description |
|---|---|
| `cookie` | `.ROBLOSECURITY` value (set without validation; use `login` to validate) |
| `apiKey` | Open Cloud API key |
| `maxRetries` | Retries for 429/5xx responses (default `3`) |
| `fetchFn` | Custom `fetch` implementation (default global `fetch`) |

## Authentication / cookies

| Method | Returns | Description |
|---|---|---|
| `ember.login([cookie])` | `Promise<User>` | Sanitize, validate and store the cookie |
| `Ember.login(cookie, [opts])` | `Promise<Ember>` | Create a client and log in |
| `ember.logout()` | `void` | Clear the cookie and cached user |
| `ember.loggedIn` | `boolean` | Whether a cookie is set |
| `ember.setCookie(cookie, { validate })` | `Promise<User\|null>` | Lower-level `login`; `validate: false` skips the check |
| `ember.getCookie()` | `string\|null` | Current cookie |
| `ember.clearCookie()` | `void` | Same as `logout` |
| `ember.validateCookie()` | `Promise<boolean>` | Is the cookie still valid? |
| `ember.refreshCookie()` | `Promise<string>` | Rotate the cookie via an auth ticket; the old one is invalidated, so store the returned value |
| `ember.getCurrentUser()` | `Promise<User>` | Cached logged-in user |
| `ember.getAuthenticatedUser()` | `Promise<User>` | Fresh logged-in user lookup |

## Users

| Method | Description |
|---|---|
| `getIdFromUsername(name)` | User ID or `null` |
| `getUsernameFromId(id)` | Username |
| `getUserInfo(id)` | Full user object |
| `ember.users.searchUsers(keyword, limit)` | Search users |

## Groups and ranks

Auth required for everything that modifies a group.

| Method | Description |
|---|---|
| `getGroup(groupId)` | Group info |
| `getRoles(groupId)` | List of roles |
| `getRankInGroup(groupId, userId)` | Rank number (`0` if not a member) |
| `getRankNameInGroup(groupId, userId)` | Role name (`'Guest'` if not a member) |
| `setRank(groupId, userId, rank)` | Set by rank number (0-255); returns the role |
| `promote(groupId, userId)` | Move up one role; returns `{ oldRank, newRank, role }` |
| `demote(groupId, userId)` | Move down one role |
| `exile(groupId, userId)` | Remove from group |
| `shout(groupId, message)` | Update group shout |
| `getJoinRequests(groupId, [limit], [cursor])` | Pending requests |
| `handleJoinRequest(groupId, userId, accept)` | Accept (`true`) or decline |

## Thumbnails

| Method | Description |
|---|---|
| `getPlayerThumbnail(ids, [size='150x150'], [format='png'])` | Full avatar; `ids` is a number or array |
| `getPlayerHeadshot(ids, [size], [format])` | Headshot |

## Open Cloud

```js
const ember = new Ember({ apiKey: process.env.OC_KEY });
await ember.openCloud.request('/cloud/v2/users/123');
```

## Namespaced access

The same functions are available as `ember.users`, `ember.groups`, `ember.rankings`, `ember.thumbnails`, `ember.openCloud`, and `ember.auth`. The low-level `ember.http.request(url, { method, query, json, headers, auth, raw })` handles cookies, CSRF and retries for any Roblox endpoint not wrapped yet.

## Errors

| Class | When |
|---|---|
| `EmberError` | Base class |
| `AuthError` | Missing/invalid cookie, 401 |
| `HttpError` | Other non-2xx responses; has `.status` and `.body` |

```js
const { AuthError } = require('ember');
try { await ember.login(cookie); } catch (e) { if (e instanceof AuthError) console.error('Bad cookie'); }
```

## Tests

```sh
npm test
```

## License

MIT
