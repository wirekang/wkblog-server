import {
  createConnection, Connection, Repository, getConnection,
} from 'typeorm';
import { inject, injectable } from 'inversify';
import * as I from 'interfaces';
import { CommentModel, PostModel, TagModel } from 'dao/models';
import TYPES from 'Types';

@injectable()
export default class MyDao implements I.Dao {
  @inject(TYPES.Filter) private filter!:I.Filter;

  private connection!:Connection;

  private postRepo!:Repository<PostModel>;

  private tagRepo!:Repository<TagModel>;

  private commentRepo!:Repository<CommentModel>;

  private doMap!: Map<I.ActionType, any>;

  constructor() {
    this.doMap = new Map();
    this.doMap.set(I.ActionType.CreatePost, this.createPost);
    this.doMap.set(I.ActionType.UpdatePost, this.updatePost);
    this.doMap.set(I.ActionType.ReadPost, this.readPosts);
    this.doMap.set(I.ActionType.ReadPosts, this.readPosts);
    this.doMap.set(I.ActionType.DeletePost, this.deletePost);
    this.doMap.set(I.ActionType.PublishPost, this.publishPost);
    this.doMap.set(I.ActionType.CountPosts, this.countPosts);
    this.doMap.set(I.ActionType.CreateComment, this.createComment);
    this.doMap.set(I.ActionType.UpdateComment, this.updateComment);
    this.doMap.set(I.ActionType.ReadComments, this.readComments);
    this.doMap.set(I.ActionType.DeleteComment, this.deleteComment);
    this.doMap.set(I.ActionType.ReadTags, this.readTags);
  }

  private getDo(type:I.ActionType): any {
    return this.doMap.get(type);
  }

  async connect(option: I.DBOption): Promise<void> {
    await createConnection({
      type: 'mariadb',
      ...option,
      entities: [PostModel, TagModel, CommentModel],
    });
    this.connection = getConnection();
    await this.connection.synchronize(option.database === 'test');
    this.postRepo = this.connection.getRepository(PostModel);
    this.tagRepo = this.connection.getRepository(TagModel);
    this.commentRepo = this.connection.getRepository(CommentModel);
  }

  async close(): Promise<void> {
    await this.connection.close();
  }

  do<A extends I.Action<I.ActionType, unknown, unknown>>(
    type: A['type'], input: A['input'], admin: boolean,
  ): Promise<A['output']> {
    return this.getDo(type)(input, admin);
  }

  private async validateTags(tagNames: string[]):Promise<TagModel[]> {
    const result = [] as TagModel[];
    const recursive = async (i:number) => {
      const name = tagNames[i];
      if (name) {
        let tm = await this.tagRepo.findOne({ where: { name } });
        if (!tm) {
          tm = new TagModel();
          tm.name = name;
          tm = await this.tagRepo.save(tm);
        }
        result.push(tm);
        await recursive(i + 1);
      }
    };
    await recursive(0);
    return result;
  }

  private async createPost(input: I.CreatePostInput): Promise<I.CreatePostOutput> {
    const tags = await this.validateTags(input.tagNames);
    const post = await this.postRepo.save({
      title: input.title,
      description: input.description,
      html: input.html,
      tags,
      whenCreated: Date.now(),
      whenPublished: Date.now() * 2,
    });
    return { postId: post.id };
  }

  private async updatePost(input: I.UpdatePostInput): Promise<I.UpdatePostOutput> {
    const count = await this.postRepo.count({ id: input.id });
    if (!count) {
      throw Error();
    }
    const tags = await this.validateTags(input.tagNames);
    const post = await this.postRepo.save({
      id: input.id,
      title: input.title,
      description: input.description,
      html: input.html,
      tags,
      whenUpdated: Date.now(),
    });
    return null;
  }

  private async publishPost(input: I.PublishPostInput): Promise<I.PublishPostOutput> {
    await this.postRepo.save({
      id: input.id,
      published: input.published,
      whenPublished: Date.now() * (input.published ? 1 : 2),
    });
    return null;
  }

  private selectPostTag(admin:boolean, tagId?: number) {
    return this.postRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where(tagId ? 'tag.id = :tagId' : 'true', tagId ? { tagId } : {})
      .andWhere(admin ? 'true' : 'post.published = 1');
  }

  private readPost(input:I.ReadPostInput, admin: boolean)
  : Promise<I.ReadPostOutput> {
    return this.selectPostTag(admin)
      .andWhere('post.id = :id', { id: input.id })
      .leftJoinAndSelect('post.comments', 'comment')
      .getOneOrFail();
  }

  private async countPosts(input:I.CountPostsInput, admin: boolean)
  : Promise<I.CountPostsOutput> {
    return {
      postsCount: await this.selectPostTag(admin, input.tagId)
        .getCount(),
    };
  }

  private async readPosts(input:I.ReadPostsInput, admin: boolean)
  : Promise<I.ReadPostsOutput> {
    const pms = await this.selectPostTag(admin, input.tagId)
      .skip(input.offset)
      .take(input.count)
      .getMany();

    const raws = await this.commentRepo.createQueryBuilder('cmt')
      .select('cmt.postId')
      .addSelect('count(*)', 'count')
      .groupBy('cmt.postId')
      .getRawMany();

    return pms.map((pm) => ({
      id: pm.id,
      title: pm.title,
      description: pm.description,
      tags: pm.tags,
      whenPublished: pm.whenPublished,
      commentsCount: Number(raws.find(
        (raw) => raw.cmt_postId === pm.id,
      )?.count || 0),
    }));
  }

  private async deletePost(input: I.DeletePostInput): Promise<I.DeletePostOutput> {
    const post = await this.postRepo.findOne(input.id);
    if (!post) {
      throw Error();
    }
    await this.postRepo.remove(post);
    return null;
  }

  private async createComment(input: I.CreateCommentInput, admin: boolean)
  : Promise<I.CreateCommentOutput> {
    const comment = await this.commentRepo.save({
      name: admin ? '-' : this.filter.commentName(input.name),
      password: admin ? '-' : input.password,
      admin,
      text: this.filter.html(input.text),
      postId: input.postId,
      parentId: input.parentId,
      whenCreated: Date.now(),
    });
    return { commentId: comment.id };
  }

  private async updateComment(input: I.UpdateCommentInput, admin: boolean)
  : Promise<I.UpdateCommentOutput> {
    const cm = await this.commentRepo.findOne(input.id, {
      select: ['admin', 'password'],
    });
    if (!cm) {
      throw Error();
    }
    if (admin !== cm.admin) {
      throw Error();
    }
    if (!admin && cm.password !== input.password) {
      throw Error();
    }
    await this.commentRepo.save({
      id: input.id,
      text: this.filter.html(input.text),
      updated: true,
      whenUpdated: Date.now(),
    });
    return null;
  }

  private async readComments(input:I.ReadCommentsInput): Promise<I.ReadCommentsOutput> {
    const comments = await this.commentRepo.find(
      { where: { postId: input.postId }, order: { whenCreated: 'ASC' } },
    );
    return comments;
  }

  private async deleteComment(input:I.DeleteCommentInput, admin: boolean)
  : Promise<I.DeleteCommentOutput> {
    const cm = await this.commentRepo.findOne(input.id,
      { select: ['id', 'password', 'admin'] });
    if (!cm) {
      throw Error();
    }
    if (admin !== cm.admin) {
      throw Error();
    }
    if (!admin && cm.password !== input.password) {
      throw Error();
    }
    await this.commentRepo.remove(cm);
    return null;
  }

  private readTags(): Promise<I.Tag[]> {
    return this.tagRepo.find();
  }
}
