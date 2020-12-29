import { Comment } from 'db/models/Comment';
import { Post } from 'db/models/Post';

export interface IDAO {
  createPost(input: IPostInput):Promise<Post['_id']>,
  readPost(_id: Post['_id']): Promise<Post>,
  updatePost(_id:Post['_id'], input: IPostInput): Promise<void>,
  deletePost(_id: Post['_id']): Promise<void>,
  createComment(_id:Post['_id'], input: ICommentInput): Promise<void>,
  readCommentCount(_id:Post['_id']): Promise<number>,
  readComments(_id:Post['_id']):Promise<Comment[]>,
  deleteComments(_id:Post['_id'], num: Comment['num']): Promise<void>,
// eslint-disable-next-line semi
}

export interface ICommentInput {
  name: Comment['name'],
  passwordHash: Comment['passwordHash'],
  text: Comment['text'],
}

export interface IPostInput {
  title: Post['title'],
  description: Post['description'],
  tags: Post['tags'],
  html: Post['html'],
}
