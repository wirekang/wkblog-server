import 'reflect-metadata';
import Option from 'Option';
import * as I from 'interfaces';
import container from 'inversify.config';
import TYPES from 'Types';

(async () => {
  const dao = container.get<I.Dao>(TYPES.Dao);
  const server = container.get<I.Server>(TYPES.Server);
  const limiter = container.get<I.Limiter>(TYPES.Limiter);
  const converter = container.get<I.Converter>(TYPES.Converter);
  const auth = container.get<I.Auth>(TYPES.Auth);
  const service = container.get<I.Service>(TYPES.Service);
  const filter = container.get<I.Filter>(TYPES.Filter);
  const configPath = process.argv[2] || '.config.json';

  auth.init(Option.auth());
  limiter.init(Option.limiter());
  dao.init(Option.dao());
  server.init(Option.server());

  await dao.connect();
  await server.open();
})();
