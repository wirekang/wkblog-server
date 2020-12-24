import crypto from 'crypto';

export default {

  makeLog(head:string): (arg0: string)=>void {
    return (str:string) => (console.log(`[${head}] ${str}`));
  },

  getHash(str:string): string {
    return crypto.createHash('sha1').update(str).digest('hex');
  },
};
