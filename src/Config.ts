import fs from 'fs';
import path from 'path';

class Config {
  host!:string;

  port!:number;

  username!:string;

  password!:string;

  database!:string;

  key!:string;

  parse(configFilePath: string) {
    const cfg = fs.readFileSync(
      path.resolve(process.cwd(), configFilePath),
    );
    Object.assign(this, JSON.parse(cfg.toString()));
    console.log('Config loaded');
    if (!(this.host && this.port && this.username && this.password
      && this.database && this.key)) {
      throw new Error(`Config: ${this}`);
    }
  }
}

export default new Config();
