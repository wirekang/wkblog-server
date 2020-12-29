import * as DB from 'db/DB';
import Config from 'Config';
import { IPostInput } from 'db/models/Post';
import { Comment, ICommentInput } from 'db/models/Comment';

test('Config.parse', () => {
  Config.parse('.config');
});

const maxTimeGap = 1000;

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~';

const makeString = (length: number) => (
  chars.repeat(Math.ceil(length / chars.length)).substring(0, length)
);

const makeArray = <T>(length:number, def:()=>T | T) => (
  new Array<T>(length).fill(0 as any).map(() => ((typeof (def) === 'function') ? def() : def))
);

const makeTags = (count: number, length:number) => makeArray<string>(
  count, makeString.bind(null, length),
);

const makePostInput = (
  titleLength:number,
  descriptionLength:number,
  tagCount:number, tagLength:number,
  htmlLength:number,
) => ({
  title: makeString(titleLength),
  description: makeString(descriptionLength),
  tags: makeTags(tagCount, tagLength),
  html: makeString(htmlLength),
} as IPostInput);

const makeCommentInput = (
  nameLength:number,
  passwordLength:number,
  textLength:number,
) => ({
  name: makeString(nameLength),
  passwordHash: makeString(passwordLength),
  text: makeString(textLength),
} as ICommentInput);

describe('DB', () => {
  test('connect', async () => {
    await DB.connect();
  });

  test('readCounter, deleteCounter', async () => {
    const f = async (which: string, loop:number) => {
      const get = () => DB.readCounter(which);
      const recursive = async (left:number) => {
        if (left !== 0) {
          const nextID = await get();
          expect(await get()).toBe(nextID + 1);
          await recursive(left - 1);
        }
      };
      await recursive(loop);
    };
    const newID = makeString(3);
    await f(newID, 2);
    await f('justfortest', 2);
    await DB.deleteCounter(newID);
  });

  let postID = 0;

  test('createPost', async () => {
    postID = await DB.createPost(makePostInput(10, 100, 5, 10, 1000));
    expect(Number.isInteger(postID)).toBe(true);
  });

  test('readPost', async () => {
    const post = await DB.readPost(postID);
    expect(post._id).toBe(postID);
    expect(Date.now() - post.createdAt).toBeLessThanOrEqual(maxTimeGap);
  });

  test('updatePost', async () => {
    await DB.updatePost(postID, makePostInput(20, 90, 4, 5, 2000));
    const post = await DB.readPost(postID);
    expect(Date.now() - post.updatedAt).toBeLessThanOrEqual(maxTimeGap);
  });

  const commentInputs = [] as ICommentInput[];

  test('createComment, readCommentCount', async () => {
    const readCount = () => DB.readCommentCount(postID);

    const recursive = async (n:number) => {
      if (n !== 0) { await recursive(n - 1); }
      const count = await readCount();
      expect(count).toBe(n);
      const commentInput = makeCommentInput(10, 10, 100);
      commentInputs.push(commentInput);
      await DB.createComment(postID, commentInput);
    };

    await recursive(3);
  });

  const comments = [] as Comment[];

  test('readComments', async () => {
    const post = await DB.readPost(postID);
    expect(post.comments.length).toBe(commentInputs.length);
    comments.push(...await DB.readComments(postID));
    expect(post.comments.length).toEqual(comments.length);
  });

  test('deleteComments', async () => {
    const ps = [] as Promise<void>[];
    comments.forEach((comment) => {
      ps.push(DB.deleteComments(postID, comment.num));
    });
    await Promise.all(ps);
    expect(await DB.readCommentCount(postID)).toBe(0);
  });

  test('deletePost', async () => {
    await DB.deletePost(postID);
  });

  test('disconnect', async () => {
    await DB.disconnect();
  });
});
