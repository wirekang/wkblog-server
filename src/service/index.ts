import {
  Auth,
  CommentInput, CommentUpdateInput, DAO, Filter, PostInput, PostUpdateInput,
  Service as IService, ServiceResult,
} from 'interfaces';
import { inject, injectable } from 'inversify';
import TYPES from 'Types';

@injectable()
export default class Service implements IService {
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
      await this.dao.updatePost(input);
    } catch (e) {
      result.ok = 0;
      console.log(e);
    }
    return result;
  }

  async onPostRead(hash:string, id: number): Promise<ServiceResult> {
    const result = { ok: 1, result: 0 } as ServiceResult;
    try {
      this.auth.validate(hash);
      await this.dao.readPost(id);
    } catch (e) {
      result.ok = 0;
    }
    return result;
  }

  onPostCount(hash:string, tagId?: number): Promise<ServiceResult> {
    const result:ServiceResult;
    try {

    } catch (e) {

    }
    return result;
  }

  onPostsRead(hash:string, tagId?: number): Promise<ServiceResult> {
    const result:ServiceResult;
    try {

    } catch (e) {

    }
    return result;
  }

  onPostDelete(hash:string, id: number): Promise<ServiceResult> {
    const result:ServiceResult;
    try {

    } catch (e) {

    }
    return result;
  }

  onCommentCreate(input: CommentInput): Promise<ServiceResult> {
    const result:ServiceResult;
    try {

    } catch (e) {

    }
    return result;
  }

  onCommentUpdate(input: CommentUpdateInput): Promise<ServiceResult> {
    const result:ServiceResult;
    try {

    } catch (e) {

    }
    return result;
  }

  onCommentRead(postId: number): Promise<ServiceResult> {
    const result:ServiceResult;
    try {

    } catch (e) {

    }
    return result;
  }

  onCommentDelete(hash:string, id: number): Promise<ServiceResult> {
    const result:ServiceResult;
    try {

    } catch (e) {

    }
    return result;
  }
}
