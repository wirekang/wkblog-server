import DAO from 'DAO';
import crypto from 'crypto';

describe('CRUD', () => {
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
    await new Promise<void>((r) => { setTimeout(() => (r()), maxTimeGap + 500); });
  });

  test('Update', async () => {
    const newPost = createPost();
    await da.updatePost(newPost);

    const read = await da.readPost(newPost._id);

    expect(read.title).toBe(newPost.title);
    expect(read.tags).toEqual(newPost.tags);
    expect(read.html).toBe(newPost.html);
    expect(Date.now() - read.updatedAt).toBeLessThan(maxTimeGap);
  });

  test('Delete', async () => {
    await da.deletePost(post._id);
  });

  test('Disconnect', () => {
    da.disconnect();
  });
});
