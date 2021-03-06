type IdOnly = {id: number };
type PostIdOnly = {postId: number};
type TagIdOnly = {tagId?: number};
type CommentIdOnly = {commentId: number};
type PasswordOnly = {password: string};
type Nothing = Record<string, never> | undefined | void;

export interface Post{
  id: number
  title: string
  description: string
  tags: Tag[]
  html: string
  markdown: string
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
 'title' | 'description' | 'markdown'> & {tagNames: string[]};
export type CreatePostOutput = IdOnly;

export type ReadPostInput = IdOnly;
export type ReadPostOutput = {post: Omit<Post, 'markdown'>};

export type ReadPostsInput = TagIdOnly & { offset: number, count: number };
export type ReadPostsOutput = {postSummaries: PostSummary[]};

export type ReadPostMarkdownInput = IdOnly;
export type ReadPostMarkdownOutput = Pick<Post, 'markdown'>;

export type UpdatePostInput = IdOnly & Partial<CreatePostInput>;
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
  parentId?: Comment['id'] | undefined
  admin: boolean
  name: string
  text: string
  updated: boolean
  whenCreated: number
  whenUpdated: number
}

export type CreateCommentInput = Pick<Comment,
'postId' | 'parentId' | 'name' | 'text'> & PasswordOnly;
export type CreateCommentOutput = IdOnly;

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

export interface Info{
  title: string
  description: string
  href: string
  links: Link[]
}

export interface Link{
  name: string
  href: string
}

export type UpdateInfoInput = Info;
export type UpdateInfoOutput = Nothing;

export type ReadInfoInput = Nothing;
export type ReadInfoOutput = {info: Info};

export enum ActionType{
  CreatePost,
  ReadPost,
  ReadPosts,
  ReadPostMarkdown,
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
  UpdateInfo,
  ReadInfo,
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
export type ReadPostMarkdown = Action<ActionType.ReadPostMarkdown,
  ReadPostMarkdownInput, ReadPostMarkdownOutput>;
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
export type UpdateInfo = Action<ActionType.UpdateInfo,
 UpdateInfoInput, UpdateInfoOutput>;
export type ReadInfo = Action<ActionType.ReadInfo,
 ReadInfoInput, ReadInfoOutput>;

export interface Service{
  do<A extends Action<ActionType, unknown, unknown>>(
    type:A['type'], input: A['input'], hash: string
    ): Promise<A['output']>
}

export interface DaoOption{
  host: string,
  port: number,
  username: string,
  password: string,
  database: string,
}

export interface Dao {
  init(option: DaoOption): void
  connect(): Promise<void>
  close(): Promise<void>
  do<A extends Action<ActionType, unknown, unknown>>(
    type:A['type'], input: A['input'], admin?: boolean
    ): Promise<A['output']>
}

export interface ServerOption{
  port: number
}

export interface Server {
  init(option:ServerOption):void
  open(): Promise<void>
  close(): Promise<void>
}

export interface Filter {
  badWord(str: string): string
  html(str: string): string
  commentName(str: string): string

}

export interface AuthOption{
  hash: string
  key: string
  maxAge: number
}

export interface Auth{
  init(option:AuthOption): void
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

export interface Converter{
  toHtml(markdown: string): string
}
