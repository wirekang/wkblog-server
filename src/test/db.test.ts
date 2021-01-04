import 'reflect-metadata';
import Config from 'Config';
import DAO from 'db';
import { CommentInput, PostInput, PostUpdateInput } from 'interfaces';

const POST_COUNT = 10;
const MAX_DELAY = 5000;

describe('DB', () => {
  Config.parse('.test-config');
  const dao = new DAO();
  it('접속', async () => {
    await dao.connect(Config);
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
        const id = await dao.createPost({
          html: 'h',
          description: 'd',
          title: `t${i}`,
          tagNames,
        });
        ids.push(id);
        tagNamess.push(tagNames);
      }
    };
    await createRecursive(POST_COUNT);
  });

  const readCount = Math.ceil(POST_COUNT / 20);
  it(`${readCount}개만 읽으면서 id,whenCreated,tags 확인`, async () => {
    const readRecursive = async (i:number) => {
      if (i >= 0) {
        await readRecursive(i - 1);
        const id = ids[i];
        const post = await dao.readPost(id, true);
        expect(post.id).toBe(id);
        expect(Date.now() - post.whenCreated)
          .toBeLessThanOrEqual(MAX_DELAY);
        expect(post.tags.length).toBe(tagLength(i));
        expect(post.tags.map((tag) => tag.name).sort())
          .toEqual(tagNamess[i].sort());
      }
    };
    await readRecursive(readCount);
  });

  it('첫 번째 포스트 수정 후 확인', async () => {
    const id = ids[0];
    await dao.updatePost({
      id,
      description: '수정',
      html: '수정',
      title: 'tnwjd',
      tagNames: tagNamess[5],
    });
    const post = await dao.readPost(id, true);
    expect(post.id).toBe(id);
    expect(Date.now() - post.whenUpdated)
      .toBeLessThanOrEqual(MAX_DELAY);
    expect(post.tags.map((tag) => tag.name).sort())
      .toEqual(tagNamess[5].sort());
  });

  it('비공개 포스트 접근 확인', async () => {
    // eslint-disable-next-line no-return-await
    try {
      await dao.readPost(ids[0], false);
    } catch (e) {
      return;
    }
    fail();
  });

  it('포스트 공개 후 접근 확인', async () => {
    await dao.publishPost(ids[0]);
    const post = await dao.readPost(ids[0], false);
    expect(post.published).toBe(true);
    expect(Date.now() - post.whenPublished)
      .toBeLessThanOrEqual(MAX_DELAY);
  });

  it('포스트 비공개 후 접근 확인', async () => {
    await dao.hidePost(ids[0]);
    const post = await dao.readPost(ids[0], true);
    expect(post.published).toBeFalsy();
    try {
      await dao.readPost(ids[0], false);
    } catch (e) {
      return;
    }
    fail();
  });

  it('댓글 생성 및 읽기', async () => {
    const createComment = (
      parentId: number | null,
    ) => dao.createComment({
      name: 'thisiname',
      text: 'thisistext',
      password: 'pwd',
      parentId,
      postId: ids[0],
    }, false);
    const c1 = await createComment(null);
    const c2 = await createComment(null);
    const c11 = await createComment(c1);
    const c12 = await createComment(c1);
    const c121 = await createComment(c12);
    const c122 = await createComment(c12);

    const comments = await dao.readComments(ids[0]);
    expect(comments.length).toBe(6);
    expect(comments[0].id).toBe(c1);

    const post = await dao.readPost(ids[0], true);
    expect(post.comments).toEqual(comments);
  });

  it('포스트 삭제, count 변화 확인', async () => {
    const before = await dao.readPostCount(true);
    await dao.deletePost(ids[1]);
    const after = await dao.readPostCount(true);
    expect(before - after).toBe(1);
  });

  it('포스트 일부 공개 후 권한없이 count 확인', async () => {
    await dao.publishPost(ids[5]);
    await dao.publishPost(ids[6]);
    await dao.publishPost(ids[7]);
    await dao.publishPost(ids[8]);
    expect(await dao.readPostCount(false)).toBe(4);
  });

  it('필터 없이 페이징', async () => {
    const pss = await dao.readPosts(0, 10, true);
    console.log(pss);
  });

  it('태그 목록 확인', async () => {
    const tags = await dao.readTags();
    const tagNames = [] as string[];
    tagNamess.forEach((tns) => {
      tagNames.push(...tns);
    });
    const uniques = Array.from(new Set(tagNames));
    expect(tags.map((tag) => tag.name).sort()).toEqual(uniques.sort());
  });

  // it('태그 필터 확인', async () => {
  //   const tags = await dao.readTags();
  //   const tag = tags[2];
  //   const count = await dao.readPostCount(true, tag.id);
  //   const pss = await dao.readPosts(0, count + 1, true, tag.id);
  //   expect(count).toBe(pss.length);
  // });

  //     const pageRecursive = async (
  //       offset:number, count:number, max:number, tagId?:number,
  //     ) => {
  //       if (offset < max) {
  //         print.push(`tag ${tagId || 'all'} ${offset} - ${offset + count}`);
  //         const pss = await dao.readPosts(offset, count, true, tagId);
  //         print.push(pss.map((ps) => ps.id).join(','));
  //         await pageRecursive(offset + count, count, max, tagId);
  //       }
  //     };
  //     await pageRecursive(0, 20, COUNT);
  //     print.push('\n');

  //     const TAGID = 4;
  //     const tagCount = await dao.readPostCount(true, TAGID);
  //     await pageRecursive(0, 10, tagCount, TAGID);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // });

  // it('admin 댓글', async () => {
  //   const undef = undefined as any;
  //   const cid = await dao.createComment({
  //     name: undef,
  //     parentId: null,
  //     postId: 3,
  //     password: undef,
  //     text: 'I am admin',
  //   }, true);

  //   await dao.updateComment({
  //     id: cid, text: 'I am GOD', password: undef,
  //   }, true);

  //   await dao.deleteComment({ id: cid, password: undef }, true);
  // });

  it('닫기', async () => {
    await dao.close();
  });
});
