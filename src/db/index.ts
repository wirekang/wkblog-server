import {
  createConnection, Connection, Repository, getConnection,
} from 'typeorm';
import { inject, injectable } from 'inversify';
import {
  Auth, Comment, CommentInput, CommentUpdateInput, DAO,
  DBOption, Filter, Post, PostInput, PostSummary, PostUpdateInput,
} from 'interfaces';
import { CommentModel, PostModel, TagModel } from 'db/models';
import { toComment, toPost, toTag } from 'db/convert';
import TYPES from 'Types';

@injectable()
export default class DB implements DAO {
  @inject(TYPES.Filter) private filter!: Filter;

  private connection!:Connection;

  private postRepo!:Repository<PostModel>;

  private tagRepo!:Repository<TagModel>;

  private commentRepo!:Repository<CommentModel>;

  async connect(option: DBOption): Promise<void> {
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

  async createPost(input: PostInput): Promise<number> {
    const tags = await this.validateTags(input.tagNames);
    const pm = await this.postRepo.save({
      title: input.title,
      description: input.description,
      html: input.html,
      tags,
      whenCreated: Date.now(),
      whenPublished: Date.now() * 2,
    });
    return pm.id;
  }

  async updatePost(input: PostUpdateInput): Promise<void> {
    const count = await this.postRepo.count({ id: input.id });
    if (!count) {
      throw Error();
    }
    const tags = await this.validateTags(input.tagNames);
    await this.postRepo.save({
      id: input.id,
      title: input.title,
      description: input.description,
      html: input.html,
      tags,
      whenUpdated: Date.now(),
    });
  }

  async publishPost(id: number): Promise<void> {
    await this.postRepo.save({
      id,
      published: true,
      whenPublished: Date.now(),
    });
  }

  async hidePost(id: number): Promise<void> {
    const res = await this.postRepo.update({ id }, {
      published: false,
      whenPublished: Date.now() * 2,
    });
    if (!res.affected) {
      throw Error();
    }
  }

  async readPost(id: number, withHide = false): Promise<Post> {
    const pm = await this.postRepo.findOne(id,
      {
        relations: ['comments', 'tags'],
        where: withHide ? {} : { published: true },
      });
    if (!pm) {
      throw Error();
    }
    return toPost(pm);
  }

  async readPostCount(tagId?:number, withHide = false): Promise<number> {
    const count = await this.postRepo.createQueryBuilder('p')
      .where(withHide ? 'true' : 'p.published = 1')
      .andWhere(tagId ? 'tag.id = :tagId' : 'true', tagId ? { tagId } : {})
      .leftJoinAndSelect('p.tags', 'tag')
      .getCount();
    return count;
  }

  async readPosts(offset: number, count: number, tagId?: number, withHide = false)
  : Promise<PostSummary[]> {
    const pms = await this.postRepo.createQueryBuilder('p')
      .select(['p.id', 'p.title', 'p.description', 'p.whenPublished'])
      .where(withHide ? 'true' : 'p.published = 1')
      .andWhere(tagId ? 'tag.id = :tagId' : 'true', tagId ? { tagId } : {})
      .leftJoinAndSelect('p.tags', 'tag')
      .orderBy('p.whenPublished', 'DESC')
      .skip(offset)
      .take(count)
      .getMany();
    return pms.map((pm) => (
      {
        id: pm.id,
        title: pm.title,
        whenPublished: pm.whenPublished,
        description: pm.description,
        tags: pm.tags.map((t) => toTag(t)),
        commentsCount: 0,
      }
    ));
  }

  async deletePost(id: number): Promise<void> {
    const pm = await this.postRepo.findOne(id);
    if (!pm) {
      throw Error();
    }
    await this.postRepo.remove(pm);
  }

  async createComment(input: CommentInput): Promise<number> {
    const cm = await this.commentRepo.save({
      name: input.name,
      passwordHash: input.password,
      text: input.text,
      postId: input.postId,
      whenCreated: Date.now(),
    });
    return cm.id;
  }

  async updateComment(input: CommentUpdateInput): Promise<void> {
    const count = await this.commentRepo.count({ id: input.id });
    if (!count) {
      throw Error();
    }
    await this.commentRepo.save({
      id: input.id,
      text: input.text,
      updated: true,
      whenUpdated: Date.now(),
    });
  }

  async readComments(postId: number): Promise<Comment[]> {
    const cms = await this.commentRepo.find({ where: { postId } });
    return cms.map((c) => toComment(c));
  }

  async deleteComment(id: number): Promise<void> {
    const cm = await this.commentRepo.findOne(id);
    if (!cm) {
      throw Error();
    }
    await this.commentRepo.remove(cm);
  }
}
