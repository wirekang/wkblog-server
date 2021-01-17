/* eslint-disable no-await-in-loop */
import MyDao from 'dao';
import * as I from 'interfaces';
import { Container } from 'inversify';
import Option from 'Option';
import 'reflect-metadata';
import { ConverterMock, FilterMock } from 'test/mock';
import TYPES from 'Types';

const MAX_DELAY = 20000;
const PAGE_COUNT = 3;
const PAGE_POST_COUNT = 2;

describe('DB', () => {
  const container = new Container();
  container.bind<I.Dao>(TYPES.Dao).to(MyDao);
  container.bind<I.Filter>(TYPES.Filter).to(FilterMock);
  container.bind<I.Converter>(TYPES.Converter).to(ConverterMock);
  const dao = container.get<I.Dao>(TYPES.Dao);

  const createPost = (input?: I.CreatePostInput) => (
    dao.do<I.CreatePost>(I.ActionType.CreatePost, input || {
      title: 't', description: 'd', markdown: 'm', tagNames: ['t1', 't2'],
    })
  );

  const updatePost = (input: I.UpdatePostInput) => (
    dao.do<I.UpdatePost>(I.ActionType.UpdatePost, input)
  );

  const readPost = (input: I.ReadPostInput, admin:boolean) => (
    dao.do<I.ReadPost>(I.ActionType.ReadPost, input, admin)
  );
  const readPostMd = (input: I.ReadPostMarkdownInput) => (
    dao.do<I.ReadPostMarkdown>(I.ActionType.ReadPostMarkdown, input)
  );

  const readPosts = (input: I.ReadPostsInput, admin:boolean) => (
    dao.do<I.ReadPosts>(I.ActionType.ReadPosts, input, admin)
  );

  const deletePost = (input: I.DeletePostInput) => (
    dao.do<I.DeletePost>(I.ActionType.DeletePost, input)
  );

  const publishPost = (input: I.PublishPostInput) => (
    dao.do<I.PublishPost>(I.ActionType.PublishPost, input)
  );

  const countPosts = (input: I.CountPostsInput, admin: boolean) => (
    dao.do<I.CountPosts>(I.ActionType.CountPosts, input, admin)
  );

  const createCmt = (input: Partial<I.CreateCommentInput>, admin:boolean) => (
    dao.do<I.CreateComment>(I.ActionType.CreateComment, {
      name: input.name || 'n',
      parentId: input.parentId,
      password: input.password || 'pw',
      postId: input.postId || 0,
      text: input.text || 'te',
    }, admin)
  );

  const updateCmt = (input: I.UpdateCommentInput, admin:boolean) => (
    dao.do<I.UpdateComment>(I.ActionType.UpdateComment, input, admin)
  );

  const readCmts = (input: I.ReadCommentsInput) => (
    dao.do<I.ReadComments>(I.ActionType.ReadComments, input)
  );

  const deleteCmt = (input: I.DeleteCommentInput, admin:boolean) => (
    dao.do<I.DeleteComment>(I.ActionType.DeleteComment, input, admin)
  );

  dao.init(Option.dao());
  it('접속', async () => {
    await dao.connect();
  });

  it('포스트 생성, 읽기', async () => {
    const input:I.CreatePostInput = {
      description: 'd',
      markdown: 'm',
      tagNames: ['tag1', 'tag 2', 't a g 3'],
      title: 't',
    };
    const { id } = await createPost(input);
    const { post } = await readPost({ id }, true);
    expect(post.id).toBe(id);
    expect(post.title).toBe(input.title);
    expect(post.description).toBe(input.description);
    expect(post.html).toBe(input.markdown);
    expect(post.tags.map((tag) => tag.name).sort())
      .toEqual(input.tagNames.sort());
    expect(Date.now() - post.whenCreated)
      .toBeLessThanOrEqual(MAX_DELAY);
    const { markdown } = await readPostMd({ id });
    expect(markdown).toBe(input.markdown);
  });

  it('포스트 수정', async () => {
    const { id } = await createPost();
    const input:I.UpdatePostInput = {
      id,
      description: 'dd',
      markdown: 'mm',
      tagNames: ['tag4', 'tag5', 't6'],
      title: 'tt',
    };
    await updatePost(input);
    const { post } = await readPost({ id }, true);
    expect(post.id).toBe(id);
    expect(post.title).toBe(input.title);
    expect(post.description).toBe(input.description);
    expect(post.html).toBe(input.markdown);
    expect(Date.now() - post.whenUpdated)
      .toBeLessThanOrEqual(MAX_DELAY);
    expect(post.tags.map((tag) => tag.name).sort())
      .toEqual(input.tagNames?.sort());
    const { markdown } = await readPostMd({ id });
    expect(markdown).toBe(input.markdown);
  });

  it('포스트 일부 수정', async () => {
    const { id } = await createPost();
    const postBefore = (await readPost({ id }, true)).post;
    await updatePost({ id, description: '수정' });
    const { post } = await readPost({ id }, true);
    expect(postBefore.id).toBe(id);
    expect(post.id).toBe(id);
    expect(post.title).toBe(postBefore.title);
    expect(post.description).toBe('수정');
    expect(post.html).toBe(postBefore.html);
    expect(Date.now() - post.whenUpdated)
      .toBeLessThanOrEqual(MAX_DELAY);
    expect(post.tags.sort())
      .toEqual(postBefore.tags.sort());
  });

  it('포스트 삭제', async () => {
    const { id } = await createPost();
    await deletePost({ id });
    try {
      await readPost({ id }, true);
    } catch {
      return;
    }
    fail();
  });

  it('비공개 포스트 접근 확인', async () => {
    const { id } = await createPost();
    try {
      await readPost({ id }, false);
    } catch (e) {
      return;
    }
    fail();
  });

  it('포스트 공개 후 접근 확인', async () => {
    const { id } = await createPost();
    await publishPost({ id, published: true });
    const { post } = await readPost({ id }, false);
    expect(post.published).toBe(true);
    expect(Date.now() - post.whenPublished)
      .toBeLessThanOrEqual(MAX_DELAY);
  });

  it('포스트 비공개 후 접근 확인', async () => {
    const { id } = await createPost();
    await publishPost({ id, published: false });
    try {
      await readPost({ id }, false);
    } catch {
      return;
    }
    fail();
  });

  it('포스트 삭제 후 count 변화 확인', async () => {
    const { id } = await createPost();
    const { postsCount: before } = await countPosts({}, true);
    await deletePost({ id });
    const { postsCount: after } = await countPosts({}, true);
    expect(before - after).toBe(1);
  });

  it('포스트 공개 후 count 변화 확인', async () => {
    const { id } = await createPost();
    const { postsCount: before } = await countPosts({}, false);
    const { postsCount: beforeAdmin } = await countPosts({}, true);
    await publishPost({ id, published: true });
    const { postsCount: after } = await countPosts({}, false);
    const { postsCount: afterAdmin } = await countPosts({}, true);
    expect(after - before).toBe(1);
    expect(afterAdmin).toBe(beforeAdmin);
  });

  it('포스트 요약 읽기', async () => {
    const { postsCount } = await countPosts({}, true);
    const { postSummaries } = await readPosts({ count: postsCount, offset: 0 }, true);
    expect(postSummaries.length).toBe(postsCount);
    const ps = postSummaries[0];
    const { id } = ps;
    const { post } = await readPost({ id }, true);
    expect(post.title).toBe(ps.title);
    expect(post.description).toBe(ps.description);
    expect(post.tags.sort()).toEqual(ps.tags.sort());
    expect(post.whenPublished).toBe(ps.whenPublished);
    expect(post.comments.length).toBe(ps.commentsCount);
  });

  it('태그 읽기', async () => {
    const { tags } = await dao.do<I.ReadTags>(I.ActionType.ReadTags, undefined);
    expect(tags).not.toBeUndefined();
    expect(tags.length).not.toBe(0);
  });

  it('포스트 태그 필터 및 페이징', async () => {
    const input = (i:number) => ({
      title: `title${i}`,
      description: `des${i}`,
      markdown: `mark${i}`,
      tagNames: ['tagforpaging'],
    });
    const { id: id0 } = await createPost(input(0));
    for (let i = 1; i < PAGE_COUNT * PAGE_POST_COUNT; i += 1) {
      await createPost(input(i));
    }
    const { post: post0 } = await readPost({ id: id0 }, true);
    expect(post0.tags.length).toBe(1);
    expect(post0.tags[0].name).toBe(input(0).tagNames[0]);
    const tagId = post0.tags[0].id;
    const { postSummaries: psAll } = await readPosts(
      { count: PAGE_COUNT * PAGE_POST_COUNT, offset: 0, tagId }, true,
    );
    expect(psAll.length).toBe(PAGE_COUNT * PAGE_POST_COUNT);
    const result = [] as I.PostSummary[];
    for (let i = 0; i < PAGE_COUNT; i += 1) {
      const { postSummaries: ps } = await readPosts(
        { count: PAGE_POST_COUNT, offset: PAGE_POST_COUNT * i, tagId }, true,
      );
      expect(ps.length).toBe(PAGE_POST_COUNT);
      result.push(...ps);
    }
    expect(psAll).toEqual(result);
  });

  it('댓글 생성 및 읽기', async () => {
    const { id: postId } = await createPost();
    const c0 = await createCmt({ postId }, false);
    const c0s0 = await createCmt({ postId, parentId: c0.id }, false);
    const c1 = await createCmt({ postId }, false);
    const c1s0 = await createCmt({ postId, parentId: c1.id }, false);
    const c0s1 = await createCmt({ postId, parentId: c0.id }, false);
    const c1s0s0 = await createCmt({ postId, parentId: c1s0.id }, false);

    const { comments } = await readCmts({ postId });
    const fnd = (id:number) => {
      const result = comments.find((c) => c.id === id);
      if (!result) {
        fail();
      }
      return result;
    };
    expect(comments.length).toBe(6);
    expect(fnd(c0s0.id).parentId).toBe(c0.id);
    expect(fnd(c0s1.id).parentId).toBe(c0.id);
    expect(fnd(c1s0.id).parentId).toBe(c1.id);
    expect(fnd(c1s0s0.id).parentId).toBe(c1s0.id);

    const { post } = await readPost({ id: postId }, true);
    expect(post.comments).toEqual(comments);
  });

  it('admin 댓글 생성/확인/강제 삭제', async () => {
    const { id: postId } = await createPost();
    const { id } = await createCmt({ postId }, true);

    const { comments } = await readCmts({ postId });

    expect(comments.find((cm) => cm.id === id)?.admin).toBeTruthy();
    await deleteCmt({ id, password: 'wrong password' }, true);
  });

  it('비 권한으로 admin 댓글 수정 시도', async () => {
    const { id: postId } = await createPost();
    const { id } = await createCmt({ postId }, true);
    try {
      await updateCmt({ id, password: '-', text: 'asdf' }, false);
    } catch {
      return;
    }
    fail();
  });

  it('비 권한으로 admin 댓글 삭제 시도', async () => {
    const { id: postId } = await createPost();
    const { id } = await createCmt({ postId }, true);
    try {
      await deleteCmt({ id, password: '-' }, false);
    } catch {
      return;
    }
    fail();
  });

  it('정보 수정', async () => {
    const input = {
      title: 't',
      description: 'd',
      href: 'https://0',
      links: [{ name: 'l1', href: 'https://1' }, { name: 'l2', href: 'https://2' }],
    };
    await dao.do<I.UpdateInfo>(I.ActionType.UpdateInfo, input);
    const { info } = await dao.do<I.ReadInfo>(I.ActionType.ReadInfo, undefined);
    expect(info.href).toBe(input.href);
    expect(info.title).toBe(input.title);
    expect(info.description).toBe(input.description);
    expect(info.links.map((l) => ({ href: l.href, name: l.name }))).toEqual(input.links);
  });

  it('닫기', async () => {
    await dao.close();
  });
});
