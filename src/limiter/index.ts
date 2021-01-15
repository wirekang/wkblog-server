import { Limiter, LimiterOption } from 'interfaces';
import { injectable } from 'inversify';
import utils from 'utils';

@injectable()
export default class MyLimiter implements Limiter {
  private ipMap!: Map<string, number>;

  private blockMap!: Map<string, boolean>;

  private option!: LimiterOption;

  init(option: LimiterOption): void {
    this.ipMap = new Map();
    this.blockMap = new Map();
    this.option = option;
  }

  validate(ip: string): void {
    if (this.blockMap.get(ip)) {
      utils.log('LimiterBlock', ip);
      throw Error();
    }

    setTimeout(() => {
      this.ipMap.delete(ip);
    }, this.option.delay);

    let point = this.ipMap.get(ip);
    if (!point) {
      this.ipMap.set(ip, 1);
      return;
    }
    point += 1;
    if (point > this.option.max) {
      this.blockMap.set(ip, true);
      setTimeout(() => {
        this.blockMap.delete(ip);
      }, this.option.retry);
      throw Error();
    }
    this.ipMap.set(ip, point);
  }
}
