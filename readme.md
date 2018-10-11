# Installation

Hob requires node v7.6.0 or higher for ES2015 and async function support.

```shell
$ npm install bearychat-hob
```

# Hello Hob

```js
const Hob = require('hob');
const app = new Hob('pass your token here');

app.use(ctx => {

});

app.start();
```

ctx {
  message;
  status;
  reply;

  rtm;
  http;
}