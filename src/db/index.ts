import {
  createConnection, Connection, Repository, getConnection,
} from 'typeorm';
import { injectable } from 'inversify';
import {
  Comment, CommentDeleteInput, CommentInput, CommentUpdateInput, DAO,
  DBOption, Post, PostInput, PostSummary, PostUpdateInput, Tag,
} from 'interfaces';
import { CommentModel, PostModel, TagModel } from 'db/models';
import { toComment, toPost, toTag } from 'db/convert';

@injectable()
export default class MyDAO implements DAO {
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

  async readPost(id: number, admin: boolean): Promise<Post> {
    const pm = await this.postRepo.findOne(id,
      {
        relations: ['comments', 'tags'],
        ...whereAdmin(admin),
      });
    if (!pm) {
      throw Error();
    }
    return toPost(pm);
  }

  async readPostCount(admin: boolean, tagId?:number): Promise<number> {
    const count = await this.postRepo.count({
      ...whereAdminAndTag(admin, tagId),
    });
    return count;
  }

  async readPosts(offset: number, count: number, admin: boolean, tagId?: number)
  : Promise<PostSummary[]> {
    const pms = await this.postRepo.createQueryBuilder('p')
      .select(['p.id', 'p.title', 'p.description', 'p.whenPublished'])
      .where(admin ? 'true' : 'p.published = 1')
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

  async createComment(input: CommentInput, admin: boolean): Promise<number> {
    const cm = await this.commentRepo.save({
      name: admin ? '-' : input.name,
      password: admin ? '-' : input.password,
      admin,
      text: input.text,
      postId: input.postId,
      parentId: input.parentId,
      whenCreated: Date.now(),
    });
    return cm.id;
  }

  async updateComment(input: CommentUpdateInput, admin: boolean): Promise<void> {
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
      text: input.text,
      updated: true,
      whenUpdated: Date.now(),
    });
  }

  async readComments(postId: number): Promise<Comment[]> {
    const cms = await this.commentRepo.find(
      { where: { postId }, order: { whenCreated: 'ASC' } },
    );
    return cms.map((c) => toComment(c));
  }

  async deleteComment(input:CommentDeleteInput, admin: boolean): Promise<void> {
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
  }

  async readTags(): Promise<Tag[]> {
    const tms = await this.tagRepo.find();
    return tms.map((tm) => toTag(tm));
  }
}

function whereAdmin(admin: boolean) {
  return admin ? {} : {
    where: { published: true },
  };
}

function whereTag(tagId?: number) {
  return tagId ? { where: { tagId } } : {};
}

function whereAdminAndTag(admin:boolean, tagId?: number) {
  return Object.assign(whereAdmin(admin), whereTag(tagId));
}

function orderPublished():{order:{whenPublished:'DESC'}} {
  return {
    order: {
      whenPublished: 'DESC',
    },
  };
}
