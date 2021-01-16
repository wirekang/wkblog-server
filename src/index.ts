import 'reflect-metadata';
import * as I from 'interfaces';
import container from 'inversify.config';
import TYPES from 'Types';

(async () => {
  const dao = container.get<I.Dao>(TYPES.Dao);
  await dao.connect();

  const server = container.get<I.Server>(TYPES.Server);
  await server.open();
})();
