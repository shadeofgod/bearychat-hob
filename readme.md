# Installation

Hob requires node v7.6.0 or higher for ES2015 and async function support.

```shell
$ npm install bearychat-hob
```

# Hello Hob

```js
const Hob = require('bearychat-hob');

(async () => {
  const app = new Hob('pass your token here');

  app.use(ctx => {
    if (ctx.status.isMentioned) {
      ctx.reply.text = 'hello world!';
    }
  });

  await app.start();
})();
```
