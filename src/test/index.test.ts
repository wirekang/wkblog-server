import 'reflect-metadata';
import Config from 'Config';
import {
  Auth,
  Converter, Dao, Filter, Limiter, Server, Service,
} from 'interfaces';
import container from 'inversify.config';
import TYPES from 'Types';

const dao = container.get<Dao>(TYPES.Dao);
const server = container.get<Server>(TYPES.Server);
const limiter = container.get<Limiter>(TYPES.Limiter);
const converter = container.get<Converter>(TYPES.Converter);
const auth = container.get<Auth>(TYPES.Auth);
const service = container.get<Service>(TYPES.Service);
const filter = container.get<Filter>(TYPES.Filter);
it('구동', async () => {
  const configPath = '.config.json';
  Config.parse(configPath);
  auth.init(Config.options.auth);
  limiter.init(Config.options.limiter);
  dao.init(Config.options.dao);
  server.init(Config.options.server);
  await dao.connect();
  await server.open();
});

it('종료', async () => {
  await server.close();
  await dao.close();
});
