import Config from 'Config';
import crypto from 'crypto';

export default {
  makeHash(str: string):string {
    return crypto.createHmac('sha256', Config.options.auth.key).update(str, 'utf8').digest('hex');
  },
  log(title:string, data?:string):void {
    const date = new Date();
    console.log(`${date.toLocaleString(undefined, { hour12: false })}\t${title}\t${data}`);
  },
};
