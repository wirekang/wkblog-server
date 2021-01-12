import 'reflect-metadata';
import { Limiter } from 'interfaces';
import MyLimiter from 'limiter';
import utils from 'utils';
import Option from 'Option';

describe('Limiter', () => {
  const limiter:Limiter = new MyLimiter();
  const option = Option.limiter();
  it('init', () => {
    limiter.init(option);
  });

  it('정상', async () => {
    utils.repeat(() => { limiter.validate('127.0.0.1'); }, option.max);
    await utils.wait(option.delay);
    utils.repeat(() => { limiter.validate('127.0.0.1'); }, option.max);
    await utils.wait(option.delay);
    utils.repeat(() => { limiter.validate('127.0.0.1'); }, option.max);
    utils.repeat(() => { limiter.validate('127.0.0.2'); }, option.max);
  });

  it('비정상', async () => {
    try {
      utils.repeat(() => { limiter.validate('127.0.0.1'); }, option.max + 1);
    } catch {
      return;
    }
    fail();
  });

  it('차단', async () => {
    try {
      await utils.wait(option.delay);
      limiter.validate('127.0.0.1');
    } catch {
      return;
    }
    fail();
  });
  it('차단 해제', async () => {
    await utils.wait(option.retry);
    utils.repeat(() => { limiter.validate('127.0.0.1'); }, option.max);
  });
});
