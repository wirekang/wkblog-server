import DA from 'DA';
import crypto from 'crypto';

describe('CRUD', () => {
  const da = new DA();
  test('Connect', async () => {
    await da.connect();
  });

  let postID = 0;
  const createPost = () => ({
    title: `TEST:${Date.now()}`,
    body: crypto.randomBytes(10000).toString('hex'),
    tags: ['', '', '', '', ''].map(() => (crypto.randomBytes(5).toString('hex'))),
    published: false,
  });

  const post = createPost();

  test('Create', async () => {
    postID = await da.createPost(post);
  });

  const maxTimeGap = 2000;

  test('Read', async () => {
    const read = await da.readPost(postID);
    expect(read.tags).toEqual(post.tags);
    expect(read.body).toBe(post.body);
    expect(read.title).toBe(post.title);
    expect(Date.now() - read.createdAt).toBeLessThan(maxTimeGap);
    expect(Date.now() - read.updatedAt).toBeLessThan(maxTimeGap);
  });

  test('Wait', async () => {
    await new Promise<void>((r) => { setTimeout(() => (r()), maxTimeGap + 500); });
  });

  test('Update', async () => {
    const newPost = createPost();
    await da.updatePost(postID, newPost);

    const read = await da.readPost(postID);

    expect(read.title).toBe(newPost.title);
    expect(read.tags).toEqual(newPost.tags);
    expect(read.body).toBe(newPost.body);
    expect(Date.now() - read.updatedAt).toBeLessThan(maxTimeGap);
  });

  test('Update published', async () => {
    const newPost = createPost();
    newPost.published = true;
    await da.updatePost(postID, newPost);

    const read = await da.readPost(postID);

    expect(read.tags).toEqual(newPost.tags);
    expect(read.body).toBe(newPost.body);
    expect(read.title).toBe(newPost.title);

    expect(Date.now() - read.updatedAt).toBeLessThan(maxTimeGap);
    expect(Date.now() - read.publishedAt).toBeLessThan(maxTimeGap);
  });

  test('Delete', async () => {
    await da.deletePost(postID);
  });

  test('Disconnect', () => {
    da.disconnect();
  });
});

// todo
// create 할 때 boolean이 아니라 IPost를 반환하거나 id를 반환해서
// 테스트 하는데 쓸 수 있게
