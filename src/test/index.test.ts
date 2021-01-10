import 'reflect-metadata';
import container from 'inversify.config';
import TYPES from 'Types';
import { Dao, Server } from 'interfaces';
import Config from 'Config';

const dao = container.get<Dao>(TYPES.Dao);
const server = container.get<Server>(TYPES.Server);
it('구동', (async () => {
  const configPath = '.config.test.json';
  Config.parse(configPath);
  await dao.init(Config);
  await server.init({ port: Config.serverPort });
  await dao.connect();
  await server.open();
}));

it('종료', async () => {
  await server.close();
  await dao.close();
});
