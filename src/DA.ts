import mongodb from 'mongodb';
import Ignore from 'Ignore';
import utils from 'utils';

interface IComment {
  name: string,
  password: string,
  body: string,
}

interface Post{
  title: string,
  body: string,
  tags: string[],
  published: boolean,
}

interface IPost extends Post{
  _id: number,
  comments: IComment[],
  createdAt: number,
  publishedAt: number,
  updatedAt: number,
}

interface ICounter{
  _id: string,
  next: number,
}

function createEmptyIPost():IPost {
  return {
    _id: 0,
    comments: [],
    published: false,
    createdAt: 0,
    publishedAt: 0,
    updatedAt: 0,
    title: '',
    body: '',
    tags: [],
  };
}

export default class DA {
  private log;

  private client!: mongodb.MongoClient;

  private db!:mongodb.Db;

  private counters!: mongodb.Collection<ICounter>;

  private posts!:mongodb.Collection<IPost>;

  constructor() {
    this.log = utils.makeLog('DB');
    const uri = `mongodb://${Ignore.db.host}:${Ignore.db.port}/${Ignore.db.database}`;
    this.client = new mongodb.MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auth: {
        user: Ignore.db.user,
        password: Ignore.db.password,
      },
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.log('OK');
    this.db = this.client.db(Ignore.db.database);
    this.counters = this.db.collection<ICounter>('counters');
    this.posts = this.db.collection<IPost>('posts');
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async createPost(p:Post):Promise<number> {
    const post = Object.assign(createEmptyIPost(), p) as IPost;
    post._id = await this.getNextID('post');
    post.createdAt = Date.now();
    post.updatedAt = post.createdAt;
    if (post.published) {
      post.publishedAt = post.createdAt;
    }

    const result = await this.posts.insertOne(post);
    return result.insertedId;
  }

  async readPost(id:number): Promise<IPost> {
    const post = await this.posts.findOne({ _id: id });
    if (!post) {
      throw new Error(`There's no post with id ${id}.`);
    }
    return post;
  }

  async updatePost(id:number, post:Post): Promise<void> {
    const oldPost = await this.readPost(id);

    const result = await this.posts.updateOne({ _id: id }, {
      $set: {
        ...post,
        updatedAt: Date.now(),
        publishedAt:
        !oldPost.published && post.published ? Date.now() : oldPost.publishedAt,
      },
    });
    if (result.result.ok !== 1) {
      throw new Error(`The update has failed. result=${result}`);
    }
  }

  async deletePost(id:number): Promise<void> {
    const result = await this.posts.deleteOne({ _id: id });
    if (result.result.ok !== 1 || result.deletedCount !== 1) {
      throw new Error(`The result is not as expected. result=${result}`);
    }
  }

  async getNextID(name: string):Promise<number> {
    const result = await this.counters.findOneAndUpdate({
      _id: name,
    }, {
      $inc: { next: 1 },
    }, {
      upsert: true,
    });
    if (!result.value) {
      throw new Error(`The result is not as expeted. result=${result}`);
    }
    return result.value.next;
  }
}
