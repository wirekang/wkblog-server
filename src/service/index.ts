import {
  Auth,
  CommentDeleteInput,
  CommentInput, CommentUpdateInput, DAO, Filter, PostInput, PostUpdateInput,
  Service, ServiceResult,
} from 'interfaces';
import { inject, injectable } from 'inversify';
import TYPES from 'Types';

@injectable()
export default class MyService implements Service {
  @inject(TYPES.Filter) private filter!: Filter;

  @inject(TYPES.Auth) private auth!: Auth;

  @inject(TYPES.DAO) private dao!: DAO;

  async onLogin(id: string, pw: string): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      result.result = this.auth.login(id, pw);
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onPostCreate(hash:string, input: PostInput): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      this.auth.validate(hash);
      result.result = await this.dao.createPost(input);
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onPostUpdate(hash:string, input: PostUpdateInput): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      this.auth.validate(hash);
      await this.dao.updatePost(input);
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onPostPublish(hash: string, id: number): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      this.auth.validate(hash);
      await this.dao.publishPost(id);
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onPoshHide(hash: string, id: number): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      this.auth.validate(hash);
      await this.dao.hidePost(id);
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onPostRead(hash:string, id: number): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      result.result = await this.dao.readPost(id, this.auth.isLogin(hash));
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onPostCount(hash:string, tagId?: number): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      result.result = await this.dao.readPostCount(
        this.auth.isLogin(hash), tagId,
      );
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onPostsRead(hash:string, offset:number, count:number,
    tagId?: number): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      result.result = this.dao.readPosts(
        offset, count, this.auth.isLogin(hash), tagId,
      );
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onPostDelete(hash:string, id: number): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      this.auth.validate(hash);
      await this.dao.deletePost(id);
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onCommentCreate(hash:string, input: CommentInput): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      result.result = await this.dao.createComment({
        name: this.filter.escapeHTML(input.name),
        parentId: input.parentId,
        password: input.password,
        postId: input.postId,
        text: this.filter.escapeHTML(input.text),
      }, this.auth.isLogin(hash));
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onCommentUpdate(hash:string, input: CommentUpdateInput): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      await this.dao.updateComment({
        id: input.id,
        password: input.password,
        text: this.filter.escapeHTML(input.text),
      }, this.auth.isLogin(hash));
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onCommentsRead(postId: number): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      result.result = await this.dao.readComments(postId);
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onCommentDelete(hash:string, input: CommentDeleteInput): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      await this.dao.deleteComment({
        id: input.id,
        password: input.password,
      }, this.auth.isLogin(hash));
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onTagsRead(): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      result.result = await this.dao.readTags();
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }
}
