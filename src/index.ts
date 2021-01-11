import 'reflect-metadata';
import container from 'inversify.config';
import TYPES from 'Types';
import { Dao, Limiter, Server } from 'interfaces';
import Config from 'Config';

(async () => {
  const dao = container.get<Dao>(TYPES.Dao);
  const server = container.get<Server>(TYPES.Server);
  const limiter = container.get<Limiter>(TYPES.Limiter);
  const configPath = process.argv[2] || '.config.json';
  Config.parse(configPath);
  limiter.init(Config.options.limiter);
  await dao.init(Config.options.dao);
  await server.init(Config.options.server);
  await dao.connect();
  await server.open();
})();
