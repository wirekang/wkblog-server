import MyAuth from 'auth';
import MyDao from 'dao';
import MyFilter from 'filter';
import {
  Auth, Dao, Filter, Limiter, Server, Service,
} from 'interfaces';
import { Container } from 'inversify';
import MyLimiter from 'limiter';
import MyServer from 'server';
import MyService from 'service';
import TYPES from 'Types';

const container = new Container();
container.bind<Auth>(TYPES.Auth).to(MyAuth);
container.bind<Dao>(TYPES.Dao).to(MyDao);
container.bind<Filter>(TYPES.Filter).to(MyFilter);
container.bind<Limiter>(TYPES.Limiter).to(MyLimiter);
container.bind<Server>(TYPES.Server).to(MyServer);
container.bind<Service>(TYPES.Service).to(MyService);
export default container;
