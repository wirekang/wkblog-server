type IdOnly = {id: number };
type PostIdOnly = {postId: number};
type TagIdOnly = {tagId?: number};
type CommentIdOnly = {commentId: number};
type PasswordOnly = {password: string};
type Nothing = Record<string, never> | undefined | null;

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
export type ReadPostOutput = {post: Post};

export type ReadPostsInput = TagIdOnly & { offset: number, count: number };
export type ReadPostsOutput = {postSummaries: PostSummary[]};

export type UpdatePostInput = IdOnly & CreatePostInput;
export type UpdatePostOutput = Nothing;

export type DeletePostInput = IdOnly;
export type DeletePostOutput = Nothing;

export type PublishPostInput = IdOnly & Pick<Post, 'published'>;
export type PublishPostOutput = Nothing;

export type CountPostsInput = TagIdOnly;
export type CountPostsOutput = {postsCount: number};

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
export type ReadCommentsOutput = {comments: Comment[]};

export type UpdateCommentInput = Pick<Comment,
'id' | 'text'> & PasswordOnly;
export type UpdateCommentOutput = Nothing;

export type DeleteCommentInput = IdOnly & PasswordOnly;
export type DeleteCommentOutput = Nothing;

export interface Tag{
  id: number
  name: string
}

export type ReadTagsInput = Nothing;
export type ReadTagsOutput= {tags: Tag[]};

export type LoginInput = {id:string, pw: string};
export type LoginOutput = {hash: string};
export type LogoutInput = Nothing;
export type LogoutOutput = Nothing;

export enum ActionType{
  CreatePost,
  ReadPost,
  ReadPosts,
  UpdatePost,
  DeletePost,
  PublishPost,
  CountPosts,
  CreateComment,
  ReadComments,
  UpdateComment,
  DeleteComment,
  ReadTags,
  Login,
  Logout,
}

export type Action<type extends ActionType, I, O> = {
  type: type
  input: I
  output: O
};
export type CreatePost = Action<ActionType.CreatePost,
 CreatePostInput, CreatePostOutput>;
export type ReadPost = Action<ActionType.ReadPost,
 ReadPostInput, ReadPostOutput>;
export type ReadPosts = Action<ActionType.ReadPosts,
 ReadPostsInput, ReadPostsOutput>;
export type UpdatePost = Action<ActionType.UpdatePost,
 UpdatePostInput, UpdatePostOutput>;
export type DeletePost = Action<ActionType.DeletePost,
 DeletePostInput, DeletePostOutput>;
export type PublishPost = Action<ActionType.PublishPost,
 PublishPostInput, PublishPostOutput>;
export type CountPosts = Action<ActionType.CountPosts,
 CountPostsInput, CountPostsOutput>;
export type CreateComment = Action<ActionType.CreateComment,
 CreateCommentInput, CreateCommentOutput>;
export type ReadComments = Action<ActionType.ReadComments,
 ReadCommentsInput, ReadCommentsOutput>;
export type UpdateComment = Action<ActionType.UpdateComment,
UpdateCommentInput, UpdateCommentOutput>;
export type DeleteComment = Action<ActionType.DeleteComment,
 DeleteCommentInput, DeleteCommentOutput>;
export type ReadTags = Action<ActionType.ReadTags,
 ReadTagsInput, ReadTagsOutput>;
export type Login = Action<ActionType.Login,
 LoginInput, LoginOutput>;
export type Logout = Action<ActionType.Logout,
 LogoutInput, LogoutOutput>;

export interface Service{
  do<A extends Action<ActionType, unknown, unknown>>(
    type:A['type'], input: A['input'], hash: string
    ): Promise<A['output']>
}

export interface DBOption{
  host: string,
  port: number,
  username: string,
  password: string,
  database: string,
}

export interface Dao {
  connect(option: DBOption): Promise<void>
  close(): Promise<void>
  do<A extends Action<ActionType, unknown, unknown>>(
    type:A['type'], input: A['input'], admin?: boolean
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
  logout(hash: string): void
}

export interface LimiterOption{
  max: number
  delay: number
  retry: number
}

export interface Limiter{
  init(option: LimiterOption):void
  validate(ip:string):void
}
