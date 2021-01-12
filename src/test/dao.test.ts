import MyDao from 'dao';
import * as I from 'interfaces';
import { Container } from 'inversify';
import Option from 'Option';
import 'reflect-metadata';
import { ConverterMock, FilterMock } from 'test/mock';
import TYPES from 'Types';

const POST_COUNT = 10;
const MAX_DELAY = 5000;

describe('DB', () => {
  const container = new Container();
  container.bind<I.Dao>(TYPES.Dao).to(MyDao);
  container.bind<I.Filter>(TYPES.Filter).to(FilterMock);
  container.bind<I.Converter>(TYPES.Converter).to(ConverterMock);
  const dao = container.get<I.Dao>(TYPES.Dao);
  dao.init(Option.dao());
  it('접속', async () => {
    await dao.connect();
  });

  const ids = [] as number[];
  const tagNamess = [] as string[][];

  const tagLength = (i:number) => ((i % 3) + 1);
  const tagName = (i:number, j:number) => `tag${tagLength(i) + j}`;

  it(`포스트 ${POST_COUNT}개 생성`, async () => {
    const createRecursive = async (i:number) => {
      if (i >= 0) {
        await createRecursive(i - 1);
        const tagNames = [...new Array(tagLength(i))].map((_, j) => tagName(i, j));
        const id = await dao.do<I.CreatePost>(I.ActionType.CreatePost, {
          markdown: 'h',
          description: 'd',
          title: `t${i}`,
          tagNames,
        });
        ids.push(id.postId);
        tagNamess.push(tagNames);
      }
    };
    await createRecursive(POST_COUNT);
  });

  it('id,whenCreated,tags 확인', async () => {
    const which = 0;
    const id = ids[which];
    const { post } = await dao.do<I.ReadPost>(I.ActionType.ReadPost, { id }, true);
    expect(post.id).toBe(id);
    expect(Date.now() - post.whenCreated)
      .toBeLessThanOrEqual(MAX_DELAY);
    expect(post.tags.length).toBe(tagLength(which));
    expect(post.tags.map((tag) => tag.name).sort())
      .toEqual(tagNamess[which].sort());
  });

  it('포스트 수정 후 확인', async () => {
    const id = ids[0];
    await dao.do<I.UpdatePost>(I.ActionType.UpdatePost, {
      id,
      description: '수정',
      markdown: '수정',
      title: 'tnwjd',
      tagNames: tagNamess[5],
    });
    const { post } = await dao.do<I.ReadPost>(I.ActionType.ReadPost, { id }, true);
    expect(post.id).toBe(id);
    expect(Date.now() - post.whenUpdated)
      .toBeLessThanOrEqual(MAX_DELAY);
    expect(post.tags.map((tag) => tag.name).sort())
      .toEqual(tagNamess[5].sort());
  });

  it('비공개 포스트 접근 확인', async () => {
    try {
      await dao.do<I.ReadPost>(I.ActionType.ReadPost, { id: ids[0] }, false);
    } catch (e) {
      return;
    }
    fail();
  });

  it('포스트 공개 후 접근 확인', async () => {
    await dao.do<I.PublishPost>(I.ActionType.PublishPost, { id: ids[0], published: true });
    const { post } = await dao.do<I.ReadPost>(I.ActionType.ReadPost, { id: ids[0] }, false);
    expect(post.published).toBe(true);
    expect(Date.now() - post.whenPublished)
      .toBeLessThanOrEqual(MAX_DELAY);
  });

  it('포스트 비공개 후 접근 확인', async () => {
    await dao.do<I.PublishPost>(I.ActionType.PublishPost, { id: ids[0], published: false });
    const { post } = await dao.do<I.ReadPost>(I.ActionType.ReadPost, { id: ids[0] }, true);
    expect(post.published).toBeFalsy();
    try {
      await dao.do<I.ReadPost>(I.ActionType.ReadPost, { id: ids[0] }, false);
    } catch (e) {
      return;
    }
    fail();
  });

  it('댓글 생성 및 읽기', async () => {
    const createComment = (
      parentId: number | null,
    ) => dao.do<I.CreateComment>(I.ActionType.CreateComment, {
      name: 'thisiname',
      text: 'thisistext',
      password: 'pwd',
      parentId,
      postId: ids[0],
    }, false);
    const c1 = await createComment(null);
    const c2 = await createComment(null);
    const c11 = await createComment(c1.commentId);
    const c12 = await createComment(c1.commentId);
    const c121 = await createComment(c12.commentId);
    const c122 = await createComment(c12.commentId);

    const { comments } = await dao.do<I.ReadComments>(
      I.ActionType.ReadComments, { postId: ids[0] },
    );
    expect(comments.length).toBe(6);
    expect(comments[0].id).toBe(c1.commentId);

    const { post } = await dao.do<I.ReadPost>(I.ActionType.ReadPost, { id: ids[0] }, true);
    expect(post.comments).toEqual(comments);
  });

  it('포스트 삭제, count 변화 확인', async () => {
    const before = await dao.do<I.CountPosts>(I.ActionType.CountPosts, {}, true);
    await dao.do<I.DeletePost>(I.ActionType.DeletePost, { id: ids[1] });
    const after = await dao.do<I.CountPosts>(I.ActionType.CountPosts, {}, true);
    expect(before.postsCount - after.postsCount).toBe(1);
  });

  it('포스트 3개 공개 후 권한없이 count 확인', async () => {
    await dao.do<I.PublishPost>(I.ActionType.PublishPost, { id: ids[5], published: true });
    await dao.do<I.PublishPost>(I.ActionType.PublishPost, { id: ids[6], published: true });
    await dao.do<I.PublishPost>(I.ActionType.PublishPost, { id: ids[7], published: true });
    const { postsCount } = await dao.do<I.CountPosts>(I.ActionType.CountPosts, {}, false);
    expect(postsCount).toBe(3);
  });

  const getPage = (offset:number, count: number, tagId?:number) => dao.do<I.ReadPosts>(
    I.ActionType.ReadPosts, { offset, count, tagId }, true,
  );
  const getPageRecursive = async (
    arr:I.PostSummary[], offset:number, count:number, max: number, tagId?:number,
  ) => {
    if (offset <= max) {
      const { postSummaries } = await getPage(offset, count, tagId);
      arr.push(...postSummaries);
      await getPageRecursive(arr, offset + count, count, max, tagId);
    }
  };

  it('필터 없이 페이징', async () => {
    const PAGE_COUNT = 3;
    const POST_PER_PAGE = Math.round(POST_COUNT / PAGE_COUNT);
    const arr = [] as I.PostSummary[];
    const { postsCount } = await dao.do<I.CountPosts>(I.ActionType.CountPosts, {}, true);
    await getPageRecursive(arr, 0, POST_PER_PAGE, postsCount);
    expect(arr.length).toBe(postsCount);
    expect(arr[0].commentsCount).toBe(6);
  });

  it('태그 목록 확인', async () => {
    const { tags } = await dao.do<I.ReadTags>(I.ActionType.ReadTags, null);
    const tagNames = [] as string[];
    tagNamess.forEach((tns) => {
      tagNames.push(...tns);
    });
    const uniques = Array.from(new Set(tagNames));
    expect(tags.map((tag) => tag.name).sort()).toEqual(uniques.sort());
  });

  it('태그 필터 확인', async () => {
    const { tags } = await dao.do<I.ReadTags>(I.ActionType.ReadTags, null);
    const tag = tags[2];
    const { postsCount } = await dao.do<I.CountPosts>(
      I.ActionType.CountPosts, { tagId: tag.id }, true,
    );
    const { postSummaries } = await getPage(0, postsCount, tag.id);
    expect(postsCount).toBe(postSummaries.length);
  });

  let cid = 0;
  it('admin 댓글 생성/확인/강제 삭제', async () => {
    const undef = undefined as any;
    const { commentId } = await dao.do<I.CreateComment>(I.ActionType.CreateComment, {
      name: undef,
      parentId: null,
      postId: 3,
      password: undef,
      text: 'I am admin',
    }, true);
    cid = commentId;

    const { comments } = await dao.do<I.ReadComments>(
      I.ActionType.ReadComments, { postId: 3 }, true,
    );
    expect(comments.find((cm) => cm.id === cid)?.admin).toBeTruthy();
    await dao.do<I.DeleteComment>(
      I.ActionType.DeleteComment, { id: comments[0].id, password: ' ' }, true,
    );
  });

  it('비 권한으로 admin 댓글 수정 시도', async () => {
    try {
      await dao.do<I.UpdateComment>(
        I.ActionType.UpdateComment, { id: cid, password: '-', text: 'asdf' }, false,
      );
    } catch {
      return;
    }
    fail();
  });

  it('비 권한으로 admin 댓글 삭제 시도', async () => {
    try {
      await dao.do<I.DeleteComment>(I.ActionType.DeleteComment, { id: cid, password: '-' }, false);
    } catch {
      return;
    }
    fail();
  });

  it('닫기', async () => {
    await dao.close();
  });
});
