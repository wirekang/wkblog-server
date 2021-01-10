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
  limiter.init({ max: 6, delay: 1000, retry: 60000 });
  await dao.init(Config);
  await server.init({ port: Config.serverPort });
  await dao.connect();
  await server.open();
})();
