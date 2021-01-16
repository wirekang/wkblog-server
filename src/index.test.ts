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
  let id = 0;
  it('글 작성', async () => {
    const input:I.CreatePostInput = {
      title: 't', description: 'd', markdown: '**hi**', tagNames: ['tag1'],
    };
    const res = await ff({
      action: 'CreatePost',
      input,
      hash,
    });
    id = res.id;
  });

  it('댓글 작성', async () => {
    const input:I.CreateCommentInput = {
      name: 'n', postId: id, text: 't', password: 'p',
    };
    const res = await ff({
      action: 'CreateComment',
      input,
    });
  });

  it('글 읽기', async () => {
    const input:I.ReadPostInput = {
      id,
    };
    const res = await ff({
      action: 'ReadPost',
      input,
      hash,
    });
    expect(res.post.id).toBe(id);
    expect(res.post.title).toBe('t');
  });

  it('태그 읽기', async () => {
    const res = await ff({
      action: 'ReadTags',
    });
    expect(res.tags[0].name).toBe('tag1');
  });

  it('종료', async () => {
    await server.close();
    await dao.close();
  });
});
