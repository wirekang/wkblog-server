import 'reflect-metadata';
import fetch from 'node-fetch';
import { Container } from 'inversify';
import TYPES from 'Types';
import {
  Dao, Limiter, Server, Service,
} from 'interfaces';
import { DaoMock, LimiterMock, ServiceMock } from 'test/mock';
import MyServer from 'server';

const port = 8081;

describe('Server', () => {
  const container = new Container();
  container.bind<Dao>(TYPES.Dao).to(DaoMock);
  container.bind<Service>(TYPES.Service).to(ServiceMock);
  container.bind<Server>(TYPES.Server).to(MyServer);
  container.bind<Limiter>(TYPES.Limiter).to(LimiterMock);
  const server = container.get<Server>(TYPES.Server);
  it('open', async () => {
    server.init({ port });
    await server.open();
  });

  it('요청', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api`, {
      method: 'post',
      body: JSON.stringify({
        action: 'CreatePost',
        input: {
          title: 'ti', description: 'des', html: 'htmll', tagNames: ['t1', 't2'],
        },
        hash: 'asdf',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await res.json();
    expect(body.input.title).toBe('ti');
    expect(res.status).toBe(200);
  });

  it('잘못된 시도', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api`, {
      method: 'post',
    });
    expect(res.status).toBe(400);

    const res2 = await fetch(`http://127.0.0.1:${port}/api`, {
      method: 'get',
    });
    expect(res2.status).toBe(405);
  });

  it('close', async () => {
    await server.close();
  });
});
