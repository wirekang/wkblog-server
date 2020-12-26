import mongodb from 'mongodb';
import utils from 'utils';
import Config from 'Config';

interface Post{
  _id: string,
  title: string,
  tags: string[],
  html: string,
}

interface PostSchema extends Post{
  published: boolean,
  createdAt: number,
  updatedAt: number,
  publishedAt: number,
  comments: CommentSchema[],
  htmlHash: string,
}

interface Comment{
  name: string,
  password: string,
  text: string,
}

interface CommentSchema extends Comment{
  createdAt: number,
}

function createEmptyPostSchema():PostSchema {
  return {
    _id: '',
    title: '',
    tags: [],
    published: false,
    createdAt: 0,
    updatedAt: 0,
    publishedAt: 0,
    html: '',
    comments: [],
    htmlHash: '',
  };
}

export default class DAO {
  private log;

  private client!: mongodb.MongoClient;

  private db!:mongodb.Db;

  private posts!:mongodb.Collection<PostSchema>;

  constructor() {
    this.log = utils.makeLog('DA');
    const uri = `mongodb://${Config.host}:${Config.port}/${Config.database}`;
    this.client = new mongodb.MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auth: {
        user: Config.user,
        password: Config.password,
      },
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.log('OK');
    this.db = this.client.db(Config.database);
    this.posts = this.db.collection<PostSchema>('posts');
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async createPost(post: Post): Promise<void> {
    const postSchema = Object.assign(createEmptyPostSchema(), post) as PostSchema;
    postSchema.createdAt = Date.now();
    postSchema.updatedAt = postSchema.createdAt;
    const res = await this.posts.insertOne(postSchema);
    if (res.result.n === 0) {
      throw new Error(`result: ${res}`);
    }
  }

  async readPost(id: string): Promise<PostSchema> {
    const res = await this.posts.findOne({ _id: id });
    if (!res) {
      throw new Error(`${id} not found`);
    }
    return res;
  }

  async updatePost(post: Post): Promise<void> {
    const oldPostSchema = await this.readPost(post._id);
    const newPostSchema = Object.assign(oldPostSchema, post);
    newPostSchema.updatedAt = Date.now();
    const res = await this.posts.updateOne({ _id: newPostSchema._id }, {
      $set: newPostSchema,
    });
    if (res.result.nModified === 0) {
      throw new Error(`result: ${res}`);
    }
  }

  async publishPost(post: Post): Promise<void> {
    const oldPostSchema = await this.readPost(post._id);
    const newPostSchema = Object.assign(oldPostSchema, post);
    newPostSchema.publishedAt = Date.now();
    newPostSchema.published = true;
    const res = await this.posts.updateOne({ _id: newPostSchema._id }, {
      $set: newPostSchema,
    });
    if (res.result.nModified === 0) {
      throw new Error(`result: ${res}`);
    }
  }

  async withDrawPost(post: Post): Promise<void> {
    const oldPostSchema = await this.readPost(post._id);
    const newPostSchema = Object.assign(oldPostSchema, post);
    newPostSchema.published = false;
    const res = await this.posts.updateOne({ _id: newPostSchema._id }, {
      $set: newPostSchema,
    });
    if (res.result.nModified === 0) {
      throw new Error(`result: ${res}`);
    }
  }

  async deletePost(id: string): Promise<void> {
    const res = await this.posts.deleteOne({ _id: id });
    if (res.deletedCount === 0) {
      throw new Error(`result: ${res}`);
    }
  }

  /* async createPost(p:Post):Promise<number> {
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

:
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
  } */
}
