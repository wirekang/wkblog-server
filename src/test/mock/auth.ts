/* eslint-disable class-methods-use-this */
import { Auth } from 'interfaces';
import { injectable } from 'inversify';

@injectable()
export default class AuthMock implements Auth {
  login(id: string, pw: string): string {
    if (id === 'id' && pw === 'pw') {
      return 'asdf';
    }
    throw Error();
  }

  validate(hash: string): void {
    if (hash !== 'asdf') {
      throw Error();
    }
  }

  isLogin(hash: string): boolean {
    try {
      this.validate(hash);
      return true;
    } catch {
      return false;
    }
  }

  logout(hash: string): void {
    const x = 1;
  }
}
