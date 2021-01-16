import MyAuth from 'auth';
import MyConverter from 'converter';
import MyDao from 'dao';
import MyFilter from 'filter';
import * as I from 'interfaces';
import { Container } from 'inversify';
import MyLimiter from 'limiter';
import MyServer from 'server';
import MyService from 'service';
import TYPES from 'Types';
import Option from 'Option';

const container = new Container();
container.bind<I.Service>(TYPES.Service).to(MyService).inSingletonScope();
container.bind<I.Dao>(TYPES.Dao).to(MyDao).inSingletonScope();
container.bind<I.Server>(TYPES.Server).to(MyServer).inSingletonScope();
container.bind<I.Auth>(TYPES.Auth).to(MyAuth).inSingletonScope();
container.bind<I.Filter>(TYPES.Filter).to(MyFilter).inSingletonScope();
container.bind<I.Limiter>(TYPES.Limiter).to(MyLimiter).inSingletonScope();
container.bind<I.Converter>(TYPES.Converter).to(MyConverter).inSingletonScope();

const auth = container.get<I.Auth>(TYPES.Auth);
auth.init(Option.auth());

const dao = container.get<I.Dao>(TYPES.Dao);
dao.init(Option.dao());

const server = container.get<I.Server>(TYPES.Server);
server.init(Option.server());

const limiter = container.get<I.Limiter>(TYPES.Limiter);
limiter.init(Option.limiter());

export default container;
