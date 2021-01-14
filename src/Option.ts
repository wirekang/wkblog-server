/* eslint-disable class-methods-use-this */
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
  constructor() {
    if (process.env.CI) {
      return;
    }
    const result = dotenv.config();
    if (result.error || !result.parsed) {
      utils.log('NoDotEnv');
    }
  }

  auth():AuthOption {
    return {
      hash: str(process.env.AUTH_HASH),
      key: str(process.env.AUTH_KEY),
      maxAge: int(process.env.AUTH_MAX_AGE),
    };
  }

  dao():DaoOption {
    return {
      database: str(process.env.DB_DB),
      host: str(process.env.DB_HOST),
      password: str(process.env.DB_PASS),
      port: int(process.env.DB_PORT),
      username: str(process.env.DB_USER),
    };
  }

  limiter():LimiterOption {
    return {
      delay: int(process.env.LIMITER_DELAY),
      max: int(process.env.LIMITER_MAX),
      retry: int(process.env.LIMITER_RETRY),
    };
  }

  server():ServerOption {
    return {
      port: int(process.env.SERVER_PORT),
    };
  }
}

export default new Option();
