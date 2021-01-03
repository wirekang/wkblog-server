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

export interface PostInput{
  title: Post['title']
  description: Post['description']
  tagNames: string[]
  html: Post['html']
}

export interface PostUpdateInput{
  id: Post['id']
  title: Post['title']
  description: Post['description']
  tagNames: string[]
  html: Post['html']
}

export interface PostSummary{
  id: Post['id']
  title: Post['title']
  description: Post['description']
  tags: Post['tags']
  whenPublished: Post['whenPublished']
  commentsCount: number
}

export interface Comment{
  id: number
  postId: Post['id']
  parentId: Comment['id']
  name: string
  text: string
  updated: boolean
  whenCreated: number
  whenUpdated: number
}

export interface CommentInput{
  postId: Post['id']
  parentId: Comment['id'] | null,
  name: Comment['name']
  password: string
  text: Comment['text']
}

export interface CommentUpdateInput{
  id: Comment['id']
  password: string
  text: Comment['text']
}

export interface CommentDeleteInput{
  id: Comment['id']
  password: string
}

export interface Tag{
  id: number
  name: string
}

export interface DBOption{
  host: string,
  port: number,
  username: string,
  password: string,
  database: string,

}

export interface ServiceResult{
  ok: number
  result: any
}

export interface Service{
  onLogin(id:string, pw:string): Promise<ServiceResult>

  onPostCreate(hash:string, input: PostInput): Promise<ServiceResult>
  onPostUpdate(hash:string, input: PostUpdateInput): Promise<ServiceResult>
  onPostRead(hash:string, id: Post['id']): Promise<ServiceResult>
  onPostCount(hash:string, tagId?: Tag['id']): Promise<ServiceResult>
  onPostsRead(hash:string, offset:number, count:number, tagId?: Tag['id']): Promise<ServiceResult>
  onPostDelete(hash:string, id: Post['id']): Promise<ServiceResult>

  onCommentCreate(hash:string, input: CommentInput): Promise<ServiceResult>
  onCommentUpdate(hash:string, input:CommentUpdateInput): Promise<ServiceResult>
  onCommentRead(postId:Post['id']): Promise<ServiceResult>
  onCommentDelete(hash:string, input: CommentDeleteInput): Promise<ServiceResult>
}

export interface DAO {
  connect(option: DBOption): Promise<void>
  close(): Promise<void>

  createPost(input: PostInput): Promise<Post['id']>
  updatePost(input: PostUpdateInput): Promise<void>
  publishPost(id: Post['id']): Promise<void>
  hidePost(id: Post['id']): Promise<void>
  readPost(id: Post['id'], withHide:boolean): Promise<Post>
  readPostCount(withHide:boolean, tagId?: Tag['id']): Promise<number>
  readPosts(offset:number, count:number, withHide:boolean, tagId?:Tag['id']): Promise<PostSummary[]>
  deletePost(id: Post['id']): Promise<void>

  createComment(input: CommentInput): Promise<Comment['id']>
  updateComment(input: CommentUpdateInput): Promise<void>
  readComments(postId:Post['id']): Promise<Comment[]>
  deleteComment(id:Comment['id']): Promise<void>

}

export interface ServerOption{
  port: number
}

export interface Server {
  open(option: ServerOption): Promise<void>
  close(): Promise<void>
}

export interface Filter {
  escapeHTML(html: string): string
}

export interface Auth{
  login(id:string, pw:string):string
  validate(hash:string):void
  isLogin(hash:string):boolean
}
