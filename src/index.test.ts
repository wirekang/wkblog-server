import 'reflect-metadata';
import Option from 'Option';
import fetch from 'node-fetch';
import container from 'inversify.config';
import * as I from 'interfaces';
import TYPES from 'Types';

const PORT = Option.server().port;
const ff = async (body: any) => {
  const res = await fetch(`http://127.0.0.1:${PORT}/api`,
    {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  expect(res.status).toBe(200);
  return res.json();
};

const dao = container.get<I.Dao>(TYPES.Dao);
const server = container.get<I.Server>(TYPES.Server);

describe('프로그램 작동 테스트', () => {
  it('시작', async () => {
    await dao.connect();
    await server.open();
  });
  let hash = '';
  it('로그인', async () => {
    const input: I.LoginInput = { id: 'id', pw: 'pw' };
    const res = await ff({
      action: 'Login',
      input,
    });
    hash = res.hash;
  });

  it('글 작성,읽기', async () => {
    const inCp:I.CreatePostInput = {
      title: 't', description: 'd', markdown: '**hi**', tagNames: ['tag1'],
    };
    const resCp = await ff({
      action: 'CreatePost',
      input: inCp,
      hash,
    });
    const { id } = resCp;
    const inRp:I.ReadPostInput = {
      id,
    };
    const resRp = await ff({
      action: 'ReadPost',
      input: inRp,
      hash,
    });
    expect(resRp.post.id).toBe(id);
    expect(resRp.post.title).toBe(inCp.title);
  });

  it('종료', async () => {
    await server.close();
    await dao.close();
  });
});
