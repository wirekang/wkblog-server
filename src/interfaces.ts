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
  childrenIds: Comment['id'][]
  name: string
  passwordHash: string
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

export interface DAO {
  connect(option: DBOption): Promise<void>
  close(): Promise<void>

  createPost(input: PostInput): Promise<Post['id']>
  updatePost(input: PostUpdateInput): Promise<void>
  publishPost(id: Post['id']): Promise<void>
  hidePost(id: Post['id']): Promise<void>
  readPost(id: Post['id']): Promise<Post>
  readPostCount(tagId?: Tag['id']): Promise<number>
  readPosts(offset:number, count:number, tagId?:Tag['id']): Promise<PostSummary[]>
  deletePost(id: Post['id']): Promise<void>

  createComment(input: CommentInput): Promise<Comment['id']>
  updateComment(input: CommentUpdateInput): Promise<void>
  readComments(postId:Post['id']): Promise<Comment[]>
  deleteComment(id:Comment['id']): Promise<void>

}
