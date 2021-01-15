import http from 'http';
import * as I from 'interfaces';
import { inject, injectable } from 'inversify';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';
import json from 'koa-json';
import Router from 'koa-router';
import TYPES from 'Types';
import utils from 'utils';

@injectable()
export default class MyServer implements I.Server {
  @inject(TYPES.Service) private service!:I.Service;

  @inject(TYPES.Limiter) private limiter!:I.Limiter;

  private app!:Koa;

  private router!: Router;

  private server?: http.Server;

  private option!: I.ServerOption;

  init(option:I.ServerOption):void {
    this.option = option;
    this.router = new Router();
    this.setRoutes();

    this.app = new Koa();
    this.app.use(helmet());
    this.app.use(async (ctx, next) => {
      const forward = ctx.get('X-Forwarded-For').split(',')[0].trim();
      ctx.state.ip = forward || ctx.ip;
      try {
        this.limiter.validate(ctx.state.ip);
      } catch {
        utils.log('IpBlock', `ip: ${ctx.state.ip}`);
        ctx.status = 429;
      }
      await next();
    });
    this.app.use(json({ pretty: false }));
    this.app.use(this.router.allowedMethods());
    this.app.use(bodyParser({ enableTypes: ['json'] }));
    this.app.use(this.router.routes());
  }

  async open():Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.option.port, '0.0.0.0', () => {
        utils.log('ServerOpen');
        resolve();
      });
    });
  }

  async close():Promise<void> {
    return new Promise((r) => {
      if (!this.server) {
        utils.log('ServerClose');
        throw new Error();
      }
      this.server.close(() => { r(); });
    });
  }

  private setRoutes():void {
    this.router.post('/api', async (ctx) => {
      try {
        const body = ctx.request.body as Body;
        const action = I.ActionType[body.action];
        if (action === undefined) {
          utils.log('ActionUndef', `body: ${JSON.stringify(body)}`);
          throw Error();
        }
        const result = await this.service.do(action, body.input, body.hash);
        ctx.status = 200;
        ctx.body = result;
      } catch {
        ctx.status = 400;
        ctx.body = {};
      }
    });
  }
}

interface Body{
  action:keyof typeof I.ActionType
  input: unknown
  hash: string
}
