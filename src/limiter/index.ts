import { Limiter, LimiterOption } from 'interfaces';
import { injectable } from 'inversify';

@injectable()
export default class MyLimiter implements Limiter {
  private ipMap!: Map<string, number>;

  private blockMap!: Map<string, boolean>;

  private max!: number;

  private delay!: number;

  private retry!: number;

  init(option: LimiterOption): void {
    this.ipMap = new Map();
    this.blockMap = new Map();
    this.max = option.max;
    this.delay = option.delay;
    this.retry = option.retry;
  }

  validate(ip: string): void {
    if (this.blockMap.get(ip)) {
      throw Error();
    }

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
      this.blockMap.set(ip, true);
      setTimeout(() => {
        this.blockMap.delete(ip);
      }, this.retry);
      throw Error();
    }
    this.ipMap.set(ip, point);
  }
}
