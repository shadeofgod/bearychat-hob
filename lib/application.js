const Emitter = require('events');
const chalk = require('chalk');
const HTTPClient = require('bearychat').HTTPClient;
const RTMClient = require('bearychat-rtm-client');
const WebSocket = require('ws');
const ora = require('ora');

const checkVersion = require('./checkVersion');
const compose = require('./compose');

module.exports = class Application extends Emitter {
  constructor(token) {
    super();

    checkVersion();

    this._spinner = ora('starting hubot...').start();

    if (!token) {
      console.log(chalk.red('\n[bearychat-hob]hubot token is required!'));
      process.exit(1);
    }

    this.token = token;
    this.middlewares = [];
    this.env = process.env.NODE_ENV || 'development';
    this.context = {
      message: {},
      reply: {},
      status: {},
    };

    this.createContext = this.createContext.bind(this);
    this.updateContextStatus = this.updateContextStatus.bind(this);
    this.handleRTMEvent = this.handleRTMEvent.bind(this);
  }

  use(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('[bearychat-hob]middlewares must be a function!');
    }

    this.middlewares.push(fn);
    return this;
  }

  createContext(message) {
    const ctx = this.context;
    ctx.message = message;
    ctx.status = this.updateContextStatus(ctx);
    ctx.reply = { text: '' };

    return ctx;
  }

  updateContextStatus(ctx) {
    if (ctx.message.type === 'message') {
      return {
        isMentioned: true,
      };
    }
    return {};
  }

  handleRTMEvent(message) {
    const ctx = this.createContext(message);

    const fnMiddleware = compose(this.middlewares);

    const handleReply = () => this.handleReply(ctx);
    return fnMiddleware(ctx).then(handleReply);
  }

  handleReply(ctx) {
    const reply = () => {
      if (ctx.reply.text && ctx.message.uid !== ctx.me.id) {
        ctx.rtm.send({
          type: 'message',
          vchannel_id: ctx.message.vchannel_id,
          ...ctx.reply,
        });
      }
    };

    return Promise.resolve(reply());
  }

  async start() {
    const httpClient = new HTTPClient(this.token);
    const rtm = new RTMClient({
      url() {
        return httpClient.rtm.start().then(data => data.ws_host);
      },
      WebSocket,
    });

    this.context.me = await httpClient.user.me();
    const Events = RTMClient.RTMClientEvents;

    rtm.on(Events.EVENT, this.handleRTMEvent);

    this.context.http = httpClient;
    this.context.rtm = rtm;

    if (this._spinner) {
      this._spinner.succeed('hubot started!');
    }
  }
};
