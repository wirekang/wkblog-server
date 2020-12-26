import DAO from 'DAO';
import crypto from 'crypto';
import path from 'path';
import Config from 'Config';

describe('CRUD', () => {
  Config.parse(path.join(process.cwd(), 'example'));
  const da = new DAO();

  test('Connect', async () => {
    await da.connect();
  });

  const createPost = () => ({
    _id: 'test',
    title: `TEST:${Date.now()}`,
    html: crypto.randomBytes(10000).toString('hex'),
    tags: ['', '', '', '', ''].map(() => (crypto.randomBytes(5).toString('hex'))),
  });

  const post = createPost();

  test('Create', async () => {
    await da.createPost(post);
  });

  const maxTimeGap = 2000;

  test('Read', async () => {
    const read = await da.readPost(post._id);
    expect(read.tags).toEqual(post.tags);
    expect(read.html).toBe(post.html);
    expect(read.title).toBe(post.title);
    expect(Date.now() - read.createdAt).toBeLessThan(maxTimeGap);
    expect(Date.now() - read.updatedAt).toBeLessThan(maxTimeGap);
  });

  test('Wait', async () => {
    await new Promise<void>((r) => { setTimeout(() => (r()), maxTimeGap + 100); });
  });

  test('Update', async () => {
    const newPost = createPost();
    await da.updatePost(newPost);

    const read = await da.readPost(newPost._id);

    expect(read.title).toBe(newPost.title);
    expect(read.tags).toEqual(newPost.tags);
    expect(read.html).toBe(newPost.html);
    expect(Date.now() - read.createdAt).toBeGreaterThan(maxTimeGap);
    expect(Date.now() - read.updatedAt).toBeLessThan(maxTimeGap);
  });

  test('Wait', async () => {
    await new Promise<void>((r) => { setTimeout(() => (r()), maxTimeGap + 100); });
  });

  test('Publish', async () => {
    const newPost = createPost();
    await da.publishPost(newPost);

    const read = await da.readPost(newPost._id);

    expect(read.title).toBe(newPost.title);
    expect(read.tags).toEqual(newPost.tags);
    expect(read.html).toBe(newPost.html);
    expect(Date.now() - read.createdAt).toBeGreaterThan(maxTimeGap);
    expect(read.published).toBe(true);
    expect(Date.now() - read.publishedAt).toBeLessThan(maxTimeGap);
  });

  test('Wait', async () => {
    await new Promise<void>((r) => { setTimeout(() => (r()), maxTimeGap + 100); });
  });

  test('Withdraw', async () => {
    const newPost = createPost();
    await da.withDrawPost(newPost);

    const read = await da.readPost(newPost._id);

    expect(read.title).toBe(newPost.title);
    expect(read.tags).toEqual(newPost.tags);
    expect(read.html).toBe(newPost.html);
    expect(read.published).toBe(false);
    expect(Date.now() - read.createdAt).toBeGreaterThan(maxTimeGap);
  });

  test('Delete', async () => {
    await da.deletePost(post._id);
  });

  test('Disconnect', () => {
    da.disconnect();
  });
});
