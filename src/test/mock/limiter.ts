/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Limiter, LimiterOption } from 'interfaces';
import { injectable } from 'inversify';

@injectable()
export default class LimiterMock implements Limiter {
  init(option: LimiterOption): void {

  }

  validate(ip: string): void {

  }
}
