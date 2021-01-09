import {
  Action, ActionType, Auth, DAO, Filter, Service,
} from 'interfaces';
import { inject, injectable } from 'inversify';
import TYPES from 'Types';

enum Permission{
  Anyone,
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
