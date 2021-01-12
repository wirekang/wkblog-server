import 'reflect-metadata';
import {
  Auth,
  Converter, Dao, Filter, Limiter, Server, Service,
} from 'interfaces';
import container from 'inversify.config';
import TYPES from 'Types';
import Option from 'Option';

const dao = container.get<Dao>(TYPES.Dao);
const server = container.get<Server>(TYPES.Server);
const limiter = container.get<Limiter>(TYPES.Limiter);
const converter = container.get<Converter>(TYPES.Converter);
const auth = container.get<Auth>(TYPES.Auth);
const service = container.get<Service>(TYPES.Service);
const filter = container.get<Filter>(TYPES.Filter);
it('구동', async () => {
  auth.init(Option.auth());
  limiter.init(Option.limiter());
  await dao.init(Option.dao());
  await server.init(Option.server());
  await dao.connect();
  await server.open();
});

it('종료', async () => {
  await server.close();
  await dao.close();
});
