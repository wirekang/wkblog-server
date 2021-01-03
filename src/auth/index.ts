import Config from 'Config';
import { Auth as IAuth } from 'interfaces';
import { injectable } from 'inversify';
import utils from 'utils';

@injectable()
export default class Auth implements IAuth {
  private hash?: string;

  login(id: string, pw: string): string {
    const hash = utils.makeHash(id + pw);
    if (Config.hash === hash) {
      this.hash = hash;
    }
    return hash;
  }

  validate(hash: string): boolean {
    return this.hash === hash;
  }
}
