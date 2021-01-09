type IdOnly = {id: number };
type PostIdOnly = {postId: number};
type TagIdOnly = {tagId?: number};
type CommentIdOnly = {commentId: number};
type PasswordOnly = {password: string};

export interface Post{
  id: number
  title: string
  description: string
  tags: Tag[]
  html: string
  comments: Comment[]
  published:boolean
  whenCreated: number
  whenUpdated: number
  whenPublished: number
}

export type PostSummary = Pick<Post,
'id' | 'title' | 'description' | 'tags' | 'whenPublished'> &
{commentsCount: number};

export type CreatePostInput = Pick<Post,
 'title' | 'description' | 'html'> & {tagNames: string[]};
export type CreatePostOutput = PostIdOnly;

export type ReadPostInput = IdOnly;
export type ReadPostOutput = Post;

export type ReadPostsInput = TagIdOnly;
export type ReadPostsOutput = PostSummary[];

export type UpdatePostInput = IdOnly & CreatePostInput;
export type UpdatePostOutput = PostIdOnly;

export type DeletePostInput = IdOnly;
export type DeletePostOutput = PostIdOnly;

export type PublishPostInput = IdOnly & Pick<Post, 'published'>;
export type PublishPostOutput = PostIdOnly;

export type CountPostsInput = TagIdOnly;
export type CountPostsOutput = {postCount: number};

export interface Comment{
  id: number
  postId: Post['id']
  parentId: Comment['id'] | null
  admin: boolean
  name: string
  text: string
  updated: boolean
  whenCreated: number
  whenUpdated: number
}

export type CreateCommentInput = Pick<Comment,
'postId' | 'parentId' | 'name' | 'text'> & PasswordOnly;
export type CreateCommentOutput = CommentIdOnly;

export type ReadCommentsInput = PostIdOnly;
export type ReadCommentsOutput = Comment[];

export type UpdateCommentInput = Pick<Comment,
'id' | 'text'> & PasswordOnly;
export type UpdateCommentOutput = CommentIdOnly;

export type DeleteCommentInput = IdOnly & PasswordOnly;
export type DeleteCommentOutput = CommentIdOnly;

export interface Tag{
  id: number
  name: string
}

export type ReadTagsInput = Record<string, never>;
export type ReadTagsOutput= Tag[];

export type LoginInput = {id:string, pw: string};
export type LoginOutput = {hash: string};

export type ActionType = 'createPost' | 'readPost' | 'readPosts' | 'updatePost' |
'deletePost' | 'publishPost' | 'countPosts' | 'createComment' | 'readComments' |
'updateComment' | 'deleteComment' | 'readTags' | 'login';

export type Action<type extends ActionType, I, O> = {
  type: type
  input: I
  output: O
};
export type CreatePost = Action<'createPost', CreatePostInput, CreatePostOutput>;
export type ReadPost = Action<'readPost', ReadPostInput, ReadPostOutput>;
export type ReadPosts = Action<'readPosts', ReadPostsInput, ReadPostsOutput>;
export type UpdatePost = Action<'updatePost', UpdatePostInput, UpdatePostOutput>;
export type DeletePost = Action<'deletePost', DeletePostInput, DeletePostOutput>;
export type PublishPost = Action<'publishPost', PublishPostInput, PublishPostOutput>;
export type CountPosts = Action<'countPosts', CountPostsInput, CountPostsOutput>;
export type CreateComment = Action<'createComment', CreateCommentInput, CreateCommentOutput>;
export type ReadComments = Action<'readComments', ReadCommentsInput, ReadCommentsOutput>;
export type UpdateComment = Action<'updateComment', UpdateCommentInput, UpdateCommentOutput>;
export type DeleteComment = Action<'deleteComment', DeleteCommentInput, DeleteCommentOutput>;
export type ReadTags = Action<'readTags', ReadTagsInput, ReadTagsOutput>;
export type Login = Action<'login', LoginInput, LoginOutput>;

export interface Service{
  do<A extends Action<ActionType, unknown, unknown>>(
    type:A['type'], input: A['input'], hash: string
    ): Promise<A>
}

export interface DBOption{
  host: string,
  port: number,
  username: string,
  password: string,
  database: string,
}

export interface DAO {
  connect(option: DBOption): Promise<void>
  close(): Promise<void>
  do<A extends Action<ActionType, unknown, unknown>>(
    type:A['type'], input: A['input'], admin: boolean
    ): Promise<A['output']>
}

export interface ServerOption{
  port: number
}

export interface Server {
  open(option: ServerOption): Promise<void>
  close(): Promise<void>
}

export interface Filter {
  badWord(str: string): string
  html(str: string): string
  commentName(str: string): string

}

export interface Auth{
  login(id:string, pw:string):string
  validate(hash:string):void
  isLogin(hash:string):boolean
}
