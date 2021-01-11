import * as I from 'interfaces';
import { inject, injectable } from 'inversify';
import TYPES from 'Types';

enum Permission{
  Anyone,
  Admin,
}

@injectable()
export default class MyService implements I.Service {
  @inject(TYPES.Auth) private auth!: I.Auth;

  @inject(TYPES.Dao) private dao!: I.Dao;

  private permMap!: Map<I.ActionType, Permission>;

  constructor() {
    this.permMap = new Map();
    this.permMap.set(I.ActionType.CreatePost, Permission.Admin);
    this.permMap.set(I.ActionType.UpdatePost, Permission.Admin);
    this.permMap.set(I.ActionType.DeletePost, Permission.Admin);
    this.permMap.set(I.ActionType.PublishPost, Permission.Admin);
    this.permMap.set(I.ActionType.Logout, Permission.Admin);
  }

  private getPermission(type: I.ActionType): Permission {
    return this.permMap.get(type) || Permission.Anyone;
  }

  async do<A extends I.Action<I.ActionType, unknown, unknown>>(
    type: A['type'], input: A['input'], hash: string,
  ): Promise<A['output']> {
    if (this.getPermission(type) === Permission.Admin) {
      this.auth.validate(hash);
    }
    switch (type) {
      case I.ActionType.Login: {
        const loginInput = input as I.LoginInput;
        const hash = this.auth.login(loginInput.id, loginInput.pw);
        const loginOutput:I.LoginOutput = { hash };
        return loginOutput;
      }
      case I.ActionType.Logout: {
        this.auth.logout(hash);
        return null;
      }
      default: {
        return this.dao.do(type, input, this.auth.isLogin(hash));
      }
    }
  }
}
