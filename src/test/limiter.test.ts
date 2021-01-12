import 'reflect-metadata';
import { Limiter } from 'interfaces';
import MyLimiter from 'limiter';
import Config from 'Config';
import utils from 'utils';

describe('Limiter', () => {
  const limiter:Limiter = new MyLimiter();
  Config.parse('.config.json');
  it('init', () => {
    limiter.init(Config.options.limiter);
  });

  it('정상', async () => {
    utils.repeat(() => { limiter.validate('127.0.0.1'); }, Config.options.limiter.max);
    await utils.wait(Config.options.limiter.delay);
    utils.repeat(() => { limiter.validate('127.0.0.1'); }, Config.options.limiter.max);
    await utils.wait(Config.options.limiter.delay);
    utils.repeat(() => { limiter.validate('127.0.0.1'); }, Config.options.limiter.max);
    utils.repeat(() => { limiter.validate('127.0.0.2'); }, Config.options.limiter.max);
  });

  it('비정상', async () => {
    try {
      utils.repeat(() => { limiter.validate('127.0.0.1'); }, Config.options.limiter.max + 1);
    } catch {
      return;
    }
    fail();
  });

  it('차단', async () => {
    try {
      await utils.wait(Config.options.limiter.delay);
      limiter.validate('127.0.0.1');
    } catch {
      return;
    }
    fail();
  });
  it('차단 해제', async () => {
    await utils.wait(Config.options.limiter.retry);
    utils.repeat(() => { limiter.validate('127.0.0.1'); }, Config.options.limiter.max);
  });
});
