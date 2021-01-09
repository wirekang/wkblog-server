import * as I from 'interfaces';
import { inject, injectable } from 'inversify';
import TYPES from 'Types';

enum Permission{
  Anyone,
  Admin,
}

@injectable()
export default class MyService implements Service {
  @inject(TYPES.Auth) private auth!: Auth;

  @inject(TYPES.Dao) private dao!: Dao;

  private permMap!: Map<ActionType, Permission>;

  constructor() {
    this.permMap = new Map();
    this.permMap.set(ActionType.CreatePost, Permission.Admin);
    this.permMap.set(ActionType.UpdatePost, Permission.Admin);
    this.permMap.set(ActionType.DeletePost, Permission.Admin);
    this.permMap.set(ActionType.PublishPost, Permission.Admin);
    this.permMap.set(ActionType.Logout, Permission.Admin);
  }

  private getPermission(type: ActionType): Permission {
    return this.permMap.get(type) || Permission.Anyone;
  }

  do<A extends Action<ActionType, unknown, unknown>>(
    type: A['type'], input: A['input'], hash: string,
  ): Promise<A['output']> {
    if (this.getPermission(type) === Permission.Admin) {
      this.auth.validate(hash);
    }
    return this.dao.do(type, input, this.auth.isLogin(hash));
  }
}
