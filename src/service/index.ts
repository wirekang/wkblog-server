import {
  Auth,
  CommentDeleteInput,
  CommentInput, CommentUpdateInput, DAO, Filter, PostInput, PostUpdateInput,
  Service, ServiceResult,
} from 'interfaces';
import { inject, injectable } from 'inversify';
import TYPES from 'Types';

enum Permission{
  Anyone,
  Both,
  Admin,
}

@injectable()
export default class MyService implements Service {
  @inject(TYPES.Filter) private filter!: Filter;

  @inject(TYPES.Auth) private auth!: Auth;

  @inject(TYPES.DAO) private dao!: DAO;

  private permMap!: Map<ActionType, Permission>;

  constructor() {
    this.permMap.set(ActionType.CreatePost, Permission.Admin);
    this.permMap.set(ActionType.UpdatePost, Permission.Admin);
    this.permMap.set(ActionType.DeletePost, Permission.Admin);
    this.permMap.set(ActionType.PublishPost, Permission.Admin);
    this.permMap.set(ActionType.Logout, Permission.Admin);
    this.permMap.set(ActionType.ReadPost, Permission.Both);
    this.permMap.set(ActionType.ReadPosts, Permission.Both);
    this.permMap.set(ActionType.CreateComment, Permission.Both);
    this.permMap.set(ActionType.UpdateComment, Permission.Both);
  }

  private getPermission(type: ActionType): Permission {
    return this.permMap.get(type) || Permission.Anyone;
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
