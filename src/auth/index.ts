import Config from 'Config';
import { Auth } from 'interfaces';
import { injectable } from 'inversify';
import utils from 'utils';

@injectable()
export default class MyAuth implements Auth {
  private hash!: string;

  private when!: number;

  login(id: string, pw: string): string {
    this.when = Date.now();
    if (Config.hash === utils.makeHash(id + pw)) {
      this.hash = utils.makeHash(Config.hash + this.when.toString(10));
      return this.hash;
    }
    throw Error();
  }

  validate(hash: string): void {
    if (!this.hash || !this.when) {
      throw Error();
    }

    if (Date.now() - this.when > Config.maxAge) {
      throw Error();
    }
    if (this.hash !== hash) {
      throw Error();
    }
  }

  isLogin(hash: string): boolean {
    try {
      this.validate(hash);
      return true;
    } catch (e) {
      return false;
    }
  }
}
