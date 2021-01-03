import 'reflect-metadata';
import Config from 'Config';
import DAO from 'db';
import { CommentInput, PostInput, PostUpdateInput } from 'interfaces';

describe('DB', () => {
  Config.parse('.test-config');
  const dao = new DAO();
  it('connect', async () => {
    await dao.connect(Config);
  });

  let pid = 0;

  it('createPost,readPost', async () => {
    const input:PostInput = {
      title: 'qwer',
      description: 'asdf',
      html: '<h1>asdf</h1>',
      tagNames: ['태그1', 'tag2', 'tag 3'],
    };
    pid = await dao.createPost(input);
    const post = await dao.readPost(pid, true);
    expect(post.id).toBe(pid);
    expect(post.title).toBe(input.title);
    expect(Date.now() - post.whenCreated).toBeLessThanOrEqual(1000);
    expect(post.tags.map((v) => v.name).sort()).toEqual(input.tagNames.sort());
  });

  it('포스트 수정', async () => {
    const input:PostUpdateInput = {
      id: pid,
      title: 't',
      description: 'a',
      html: '<h1></h1>',
      tagNames: ['태그1'],
    };
    await dao.updatePost(input);
    const post = await dao.readPost(pid, true);
    expect(post.id).toBe(pid);
    expect(Date.now() - post.whenUpdated).toBeLessThanOrEqual(1000);
    expect(post.tags.map((v) => v.name).sort()).toEqual(input.tagNames.sort());
  });

  it('포스트 공개', async () => {
    await dao.publishPost(pid);
    const post = await dao.readPost(pid, false);
    expect(post.published).toBe(true);
    expect(Date.now() - post.whenPublished).toBeLessThanOrEqual(1000);
  });

  it('포스트 비공개', async () => {
    await dao.hidePost(pid);
    const post = await dao.readPost(pid, true);
    expect(post.published).toBe(false);
  });

  it('댓글 생성 및 읽기', async () => {
    const createComment = (
      postId:number, parentId: number | null,
    ) => dao.createComment({
      name: 'thisiname',
      text: 'thisistext',
      password: 'pwd',
      parentId,
      postId,
    }, false);
    const c1 = await createComment(pid, null);
    const c2 = await createComment(pid, null);
    const c11 = await createComment(pid, c1);
    const c12 = await createComment(pid, c1);
    const c121 = await createComment(pid, c12);
    const c122 = await createComment(pid, c12);

    const comments = await dao.readComments(pid);
    expect(comments.length).toBe(6);
    expect(comments[0].id).toBe(c1);

    const post = await dao.readPost(pid, true);
    expect(post.comments).toEqual(comments);
  });

  it('포스트 삭제', async () => {
    await dao.deletePost(pid);
  });

  it('페이징, readPostCount', async () => {
    try {
      const createRecursive = async (i:number) => {
        if (i) {
          await createRecursive(i - 1);
          const input: PostInput = {
            description: `des${i}`,
            title: `tit${i}`,
            html: `htm${i}`,
            tagNames: [...new Array(3)].map((_, j) => `tag${(i + j) % 6}`),
          };
          const id = await dao.createPost(input);
        }
      };
      const COUNT = 100;
      await createRecursive(COUNT);
      const allCount = await dao.readPostCount(true);
      expect(allCount).toBe(COUNT);

      const print = [] as string[];
      const pageRecursive = async (
        offset:number, count:number, max:number, tagId?:number,
      ) => {
        if (offset < max) {
          print.push(`tag ${tagId || 'all'} ${offset} - ${offset + count}`);
          const pss = await dao.readPosts(offset, count, true, tagId);
          print.push(pss.map((ps) => ps.id).join(','));
          await pageRecursive(offset + count, count, max, tagId);
        }
      };
      await pageRecursive(0, 20, COUNT);
      print.push('\n');

      const TAGID = 4;
      const tagCount = await dao.readPostCount(true, TAGID);
      await pageRecursive(0, 10, tagCount, TAGID);
      console.log(`all:${allCount} ${TAGID}:${tagCount}`);
      console.log(print.join('\n'));
    } catch (e) {
      console.log(e);
    }
  });

  it('admin 댓글', async () => {
    const undef = undefined as any;
    const cid = await dao.createComment({
      name: undef,
      parentId: null,
      postId: 3,
      password: undef,
      text: 'I am admin',
    }, true);

    await dao.updateComment({
      id: cid, text: 'I am GOD', password: undef,
    }, true);

    await dao.deleteComment({ id: cid, password: undef }, true);
  });

  it('닫기', async () => {
    await dao.close();
  });
});
