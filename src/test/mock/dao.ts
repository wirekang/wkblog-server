/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Action, ActionType, Dao, DBOption,
} from 'interfaces';
import { injectable } from 'inversify';

@injectable()
export default class DaoMock implements Dao {
  connect(option: DBOption): Promise<void> {
    return 0 as any;
  }

  close(): Promise<void> {
    return 0 as any;
  }

  do<A extends Action<ActionType, unknown, unknown>>(
    type: A['type'], input: A['input'], admin: boolean,
  ): Promise<A['output']> {
    throw new Error('Method not implemented.');
  }
}
