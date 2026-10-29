# ember
SparkXP's lightweight Roblox API wrapper and handler. 

```js
const { Ember } = require('ember');
const ember = new Ember();                 
await ember.setCookie(process.env.ROBLOSECURITY); 
const id = await ember.getIdFromUsername('Roblox');
await ember.setRank(1234, id, 5);
```

Cookie ops: `setCookie`, `getCookie`, `clearCookie`, `validateCookie`, `refreshCookie`.
CSRF tokens, 429/5xx retries are handled automatically. Namespaced access: `ember.users`, `ember.groups`, `ember.rankings`, `ember.thumbnails`, `ember.openCloud`.
