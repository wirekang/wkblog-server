import dotenv from 'dotenv';
import {
  AuthOption, DaoOption, LimiterOption, ServerOption,
} from 'interfaces';
import utils from 'utils';

function str(a:any): string {
  if (!a) {
    throw Error();
  }
  return a;
}

function int(i:any): number {
  if (!i) {
    throw Error();
  }
  return parseInt(i as string, 10);
}

class Option {
  private env!: NodeJS.ProcessEnv | dotenv.DotenvParseOutput;

  constructor() {
    this.loadConfig();
  }

  loadConfig(path?: string) {
    const result = dotenv.config({ path });
    this.env = process.env;
    if (result.error || !result.parsed) {
      utils.log('NoDotEnv');
      return;
    }
    this.env = result.parsed;
  }

  auth():AuthOption {
    return {
      hash: str(this.env.AUTH_HASH),
      key: str(this.env.AUTH_KEY),
      maxAge: int(this.env.AUTH_MAX_AGE),
    };
  }

  dao():DaoOption {
    return {
      database: str(this.env.DB_DB),
      host: str(this.env.DB_HOST),
      password: str(this.env.DB_PASS),
      port: int(this.env.DB_PORT),
      username: str(this.env.DB_USER),
    };
  }

  limiter():LimiterOption {
    return {
      delay: int(this.env.LIMITER_DELAY),
      max: int(this.env.LIMITER_MAX),
      retry: int(this.env.LIMITER_RETRY),
    };
  }

  server():ServerOption {
    return {
      port: int(this.env.SERVER_PORT),
    };
  }
}

export default new Option();
