/* eslint-disable class-methods-use-this */
import { Action, ActionType, Service } from 'interfaces';
import { injectable } from 'inversify';

@injectable()
export default class ServiceMock implements Service {
  do<A extends Action<ActionType, unknown, unknown>>(
    type: A['type'], input: A['input'], hash: string,
  ): Promise<A['output']> {
    return true as any;
  }
}
