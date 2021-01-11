import fs from 'fs';
import {
  AuthOption, DaoOption, LimiterOption, ServerOption,
} from 'interfaces';
import path from 'path';

interface Options{
  dao:DaoOption
  server:ServerOption
  limiter:LimiterOption
  auth:AuthOption
}

class Config {
  options!: Options;

  parse(configFilePath: string) {
    const cfg = fs.readFileSync(
      path.resolve(process.cwd(), configFilePath),
    );
    this.options = JSON.parse(cfg.toString());
    if (!(this.options && this.options.auth && this.options.dao
      && this.options.limiter && this.options.server)) {
      throw new Error(`Config: ${cfg.toString()}`);
    }
    console.log('Config loaded');
  }
}

export default new Config();
