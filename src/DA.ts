import mongodb from 'mongodb';
import Ignore from 'Ignore';
import makeLog from 'makeLog';

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

  private db!:mongodb.Db;

  private counters!: mongodb.Collection<ICounter>;

  private posts!:mongodb.Collection<IPost>;

  constructor() {
    this.log = makeLog('DB');
    const uri = `mongodb://${Ignore.db.host}:${Ignore.db.port}/${Ignore.db.database}`;
    new mongodb.MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auth: {
        user: Ignore.db.user,
        password: Ignore.db.password,
      },
    }).connect((err, client) => {
      if (err !== null) {
        this.log(err.message);
        process.exit(1);
      } else {
        this.log('OK');
        this.db = client.db(Ignore.db.database);
        this.counters = this.db.collection<ICounter>('counters');
        this.posts = this.db.collection<IPost>('posts');
      }
    });
  }

  async createPost(p:Post):Promise<boolean> {
    const post = Object.assign(createEmptyIPost(), p) as IPost;
    post._id = await this.getNextID('post');
    post.createdAt = Date.now();
    post.updatedAt = post.createdAt;
    if (post.published) {
      post.publishedAt = post.createdAt;
    }

    return (await this.posts.insertOne(post)).result.ok === 1;
  }

  async readPost(id:number): Promise<IPost|null> {
    const post = await this.posts.findOne({ _id: id });
    return post;
  }

  async updatePost(id:number, post:Post): Promise<boolean> {
    const oldPost = await this.readPost(id);
    if (oldPost === null) {
      return false;
    }
    const newPost = Object.assign(oldPost, post) as IPost;
    if (!oldPost.published && post.published) {
      newPost.publishedAt = Date.now();
    }
    newPost.updatedAt = Date.now();

    return (await this.posts.updateOne({ _id: id }, newPost)).result.ok === 1;
  }

  async deletePost(id:number): Promise<boolean> {
    const result = await this.posts.deleteOne({ _id: id });
    return result.result.ok === 1 && result.deletedCount === 1;
  }

  async getNextID(name: string):Promise<number> {
    const p = await this.counters.findOneAndUpdate({
      _id: name,
    }, {
      $inc: { next: 1 },
    }, {
      upsert: true,
    });
    return p.value?.next || 0;
  }
}
