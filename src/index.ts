import 'reflect-metadata';
import container from 'inversify.config';
import TYPES from 'Types';
import { Dao, Server } from 'interfaces';
import Config from 'Config';
import utils from 'utils';

(async () => {
  const dao = container.get<Dao>(TYPES.Dao);
  const server = container.get<Server>(TYPES.Server);
  const configPath = process.argv[2] || '.config.json';
  Config.parse(configPath);
  await dao.init(Config);
  await server.init({ port: Config.serverPort });
  await dao.connect();
  await server.open();
})();
