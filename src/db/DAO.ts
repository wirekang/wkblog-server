/* eslint-disable class-methods-use-this */
import mongoose from 'mongoose';
import PostModel, { Post } from 'db/models/Post';
import { Comment } from 'db/models/Comment';
import CounterModel from 'db/models/Counter';
import { IDAO, ICommentInput, IPostInput } from 'db/interfaces';
import Config from 'Config';

export default class DAO implements IDAO {
  async connect():Promise<void> {
    const uri = `mongodb://${Config.host}:${Config.port}/${Config.database}`;
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      auth: {
        user: Config.user,
        password: Config.password,
      },
    });
  }

  async disconnect(): Promise<void> {
    await mongoose.connection.close();
  }

  async readCounter(coll: string):Promise<number> {
    const res = await CounterModel.findOneAndUpdate({ coll },
      {
        $inc: {
          nextID: 1,
        },
      },
      {
        upsert: true,
      });
    return res?.nextID || 0;
  }

  async deleteCounter(coll: string):Promise<void> {
    await CounterModel.deleteOne({ coll });
  }

  async createPost(input: IPostInput):Promise<Post['_id']> {
    const res = await PostModel.create({
      _id: await this.readCounter(PostModel.collection.name),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      publishedAt: 0,
      published: false,
      comments: [],
      ...input,
    });
    return res._id;
  }

  async readPost(_id: Post['_id']): Promise<Post> {
    const res = await PostModel.findOne({ _id });
    if (!res) {
      throw new Error(`Post not found: ${_id}`);
    }
    return res;
  }

  async updatePost(_id:Post['_id'], input: IPostInput): Promise<void> {
    const res = await PostModel.updateOne({ _id }, {
      $set: {
        ...input,
        updatedAt: Date.now(),
      },
    });
    this.validateResult(res);
  }

  async deletePost(_id: Post['_id']): Promise<void> {
    const res = await PostModel.deleteOne({ _id });
    this.validateResult(res);
  }

  async createComment(_id:Post['_id'], input: ICommentInput): Promise<void> {
    const res = await PostModel.updateOne({ _id }, {
      $push: {
        comments: {
          num: await this.readCommentCount(_id),
          updatedAt: 0,
          createdAt: Date.now(),
          ...input,
        },
      },
    });
    this.validateResult(res);
  }

  async readCommentCount(_id:Post['_id']): Promise<number> {
    const res = await PostModel.aggregate([
      {
        $match: { _id },
      },
      {
        $project: {
          nComment: { $size: '$comments' },
        },
      },
    ]).exec();
    if (res.length !== 1) {
      throw new Error(`Not found. res = ${JSON.stringify(res)}`);
    }
    return res[0].nComment;
  }

  async readComments(_id:Post['_id']):Promise<Comment[]> {
    const res = await PostModel.findOne({ _id }, {
      comments: 1,
    });
    if (!res) {
      throw new Error(`Post not found: ${_id}`);
    }
    return res.comments;
  }

  async deleteComments(_id:Post['_id'], num: Comment['num']): Promise<void> {
    const res = await PostModel.updateOne({ _id }, {
      $pull: {
        comments: {
          num,
        },
      },
    });
    this.validateResult(res);
  }

  validateResult(res: {n?:number, ok?:number}):void {
    if ((!res.n && !res.ok) || res.n === 0 || res.ok === 0) {
      throw new Error(JSON.stringify(res));
    }
  }
}
