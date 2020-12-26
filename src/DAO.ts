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
  nextID: number,
}

interface Comment{
  name: string,
  password: string,
  text: string,
}

interface CommentSchema extends Comment{
  _id: number,
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
    nextID: 0,
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

  private async updatePostSchema(postSchema: PostSchema): Promise<void> {
    const res = await this.posts.updateOne({ _id: postSchema._id }, {
      $set: postSchema,
    });
    if (res.result.ok === 0 || res.result.n === 0) {
      throw new Error(`result: ${res.result}`);
    }
  }

  async updatePost(post: Post): Promise<void> {
    const oldPostSchema = await this.readPost(post._id);
    const newPostSchema = Object.assign(oldPostSchema, post);
    newPostSchema.updatedAt = Date.now();
    await this.updatePostSchema(newPostSchema);
  }

  async publishPost(post: Post): Promise<void> {
    const oldPostSchema = await this.readPost(post._id);
    const newPostSchema = Object.assign(oldPostSchema, post);
    newPostSchema.publishedAt = Date.now();
    newPostSchema.published = true;
    await this.updatePostSchema(newPostSchema);
  }

  async withDrawPost(post: Post): Promise<void> {
    const oldPostSchema = await this.readPost(post._id);
    const newPostSchema = Object.assign(oldPostSchema, post);
    newPostSchema.published = false;
    await this.updatePostSchema(newPostSchema);
  }

  async deletePost(id: string): Promise<void> {
    const res = await this.posts.deleteOne({ _id: id });
    if (res.result.ok === 0 || res.deletedCount === 0) {
      throw new Error(`result: ${res}`);
    }
  }
}
