import { Limiter, LimiterOption } from 'interfaces';
import { injectable } from 'inversify';

@injectable()
export default class MyLimiter implements Limiter {
  private ipMap!: Map<string, number>;

  private max!: number;

  private delay!: number;

  init(option: LimiterOption): void {
    this.ipMap = new Map();
    this.max = option.max;
    this.delay = option.delay;
  }

  validate(ip: string): void {
    setTimeout(() => {
      this.ipMap.delete(ip);
    }, this.delay);

    let point = this.ipMap.get(ip);
    if (!point) {
      this.ipMap.set(ip, 1);
      return;
    }
    point += 1;
    if (point > this.max) {
      throw Error();
    }
    this.ipMap.set(ip, point);
  }
}
