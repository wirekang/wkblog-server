import fs from 'fs';
import path from 'path';

class Config {
  host!:string

  port!:number

  user!:string

  password!:string

  database!:string

  parse(srcPath: string) {
    const cfg = fs.readFileSync(path.join(srcPath, '.config'));
    Object.assign(this, JSON.parse(cfg.toString()));
    console.log('[Config] OK');
    if (!(this.host && this.port && this.user && this.password && this.database)) {
      throw new Error(`Config: ${this}`);
    }
  }
}

export default new Config();
