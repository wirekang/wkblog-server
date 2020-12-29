import mongoose from 'mongoose';
import PostModel, { IPostInput, Post } from 'db/models/Post';
import { Comment, ICommentInput } from 'db/models/Comment';
import CounterModel from 'db/models/Counter';
import Config from 'Config';

const conn = mongoose.connection;

export async function connect():Promise<void> {
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

export async function disconnect(): Promise<void> {
  await conn.close();
}

export async function readCounter(coll: string):Promise<number> {
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

export async function deleteCounter(coll: string):Promise<void> {
  await CounterModel.deleteOne({ coll });
}

export async function createPost(input: IPostInput):Promise<Post['_id']> {
  const res = await PostModel.create({
    _id: await readCounter(PostModel.collection.name),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    publishedAt: 0,
    published: false,
    comments: [],
    ...input,
  });
  return res._id;
}

export async function readPost(_id: Post['_id']): Promise<Post> {
  const res = await PostModel.findOne({ _id });
  if (!res) {
    throw new Error(`Post not found: ${_id}`);
  }
  return res;
}

export async function updatePost(_id:Post['_id'], input: IPostInput): Promise<void> {
  const res = await PostModel.updateOne({ _id }, {
    $set: {
      ...input,
      updatedAt: Date.now(),
    },
  });
  validateResult(res);
}

export async function deletePost(_id: Post['_id']): Promise<void> {
  const res = await PostModel.deleteOne({ _id });
  validateResult(res);
}

export async function createComment(_id:Post['_id'], input: ICommentInput): Promise<void> {
  const res = await PostModel.updateOne({ _id }, {
    $push: {
      comments: {
        num: await readCommentCount(_id),
        updatedAt: 0,
        createdAt: Date.now(),
        ...input,
      },
    },
  });
  validateResult(res);
}

export async function readCommentCount(_id:Post['_id']): Promise<number> {
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

export async function readComments(_id:Post['_id']):Promise<Comment[]> {
  const res = await PostModel.findOne({ _id }, {
    comments: 1,
  });
  if (!res) {
    throw new Error(`Post not found: ${_id}`);
  }
  return res.comments;
}

export async function deleteComments(_id:Post['_id'], num: Comment['num']): Promise<void> {
  const res = await PostModel.updateOne({ _id }, {
    $pull: {
      comments: {
        num,
      },
    },
  });
  validateResult(res);
}

function validateResult(res: {n?:number, ok?:number}):void {
  if ((!res.n && !res.ok) || res.n === 0 || res.ok === 0) {
    throw new Error(JSON.stringify(res));
  }
}
