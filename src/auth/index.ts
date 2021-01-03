import Config from 'Config';
import { Auth as IAuth } from 'interfaces';
import { injectable } from 'inversify';
import utils from 'utils';

@injectable()
export default class Auth implements IAuth {
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
    if (Date.now() - this.when > Config.maxAge) {
      throw Error();
    }
    if (this.hash !== hash) {
      throw Error();
    }
  }
}
