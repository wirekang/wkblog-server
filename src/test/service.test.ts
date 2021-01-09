/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import 'reflect-metadata';
import Config from 'Config';
import * as I from 'interfaces';
import { Container } from 'inversify';
import MyService from 'service';
import TYPES from 'Types';
import { AuthMock, DaoMock } from 'test/mock';

describe('서비스', () => {
  Config.parse('.config.test.json');
  const container = new Container();
  container.bind<I.Service>(TYPES.Service).to(MyService);
  container.bind<I.Dao>(TYPES.Dao).to(DaoMock);
  container.bind<I.Auth>(TYPES.Auth).to(AuthMock);

  const service = container.get<I.Service>(TYPES.Service);
  const dao = container.get<I.Dao>(TYPES.Dao);
  const auth = container.get<I.Auth>(TYPES.Auth);

  it('잘못된 로그인 시도', async () => {
    try {
      await service.do<I.Login>(
        I.ActionType.Login, { id: 'vvv', pw: 'vvvvv' }, '',
      );
    } catch {
      return;
    }
    fail();
  });

  let hs = '';
  it('로그인', async () => {
    const { hash } = await service.do<I.Login>(
      I.ActionType.Login, { id: 'id', pw: 'pw' }, '',
    );
    hs = hash;
    auth.validate(hash);
  });

  it('잘못된 로그아웃 시도', async () => {
    try {
      await service.do<I.Logout>(I.ActionType.Logout, null, ' ');
    } catch {
      return;
    }
    fail();
  });

  it('비 권한', async () => {
    const result:any = await service.do<I.ReadPost>(I.ActionType.ReadPost, { id: 1 }, ' ');
    expect(result.type).toBe(I.ActionType.ReadPost);
    expect(result.input.id).toBe(1);
  });

  it('월권 행위', async () => {
    try {
      await service.do<I.UpdatePost>(I.ActionType.UpdatePost, { id: 1 } as any, ' ');
    } catch {
      return;
    }
    fail();
  });

  it('정당한 권한', async () => {
    const result:any = await service.do<I.CreatePost>(
      I.ActionType.CreatePost, { id: 1 } as any, hs,
    );
    expect(result.type).toBe(I.ActionType.CreatePost);
    expect(result.input.id).toBe(1);
  });
});
