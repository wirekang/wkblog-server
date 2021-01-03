import http from 'http';
import Koa from 'koa';
import Router from 'koa-router';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import { ServerOption, Server as IServer } from 'interfaces';

export default class Server implements IServer {
  private app:Koa;

  private router: Router;

  private server?: http.Server;

  constructor() {
    this.app = new Koa();
    this.router = new Router();
    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
    this.app.use(json({ pretty: false }));
    this.app.use(bodyParser({ enableTypes: ['json'] }));
    this.router.get('/posts', async (ctx) => {
      const { id } = ctx.request.query;
      if (Number.isInteger(id)) {
        ctx.body = await this.onReadPost(id);
        return;
      }
      ctx.body = await this.onReadPosts();
    });
  }

  async open(option:ServerOption):Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(option.port, () => {
        console.log(`Server open ${option.port}`);
        resolve();
      });
    });
  }

  async close():Promise<void> {
    return new Promise((r) => {
      if (!this.server) {
        throw new Error('undefined server');
      }
      this.server.close(() => { r(); });
    });
  }
}
