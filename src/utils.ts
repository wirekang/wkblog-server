import Config from 'Config';
import crypto from 'crypto';

export default {
  makeHash(str: string):string {
    return crypto.createHmac('sha256', Config.key).update(str, 'utf8').digest('hex');
  },
};
