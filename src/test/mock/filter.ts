/* eslint-disable class-methods-use-this */
import { Filter } from 'interfaces';
import { injectable } from 'inversify';

@injectable()
export default class FilterMock implements Filter {
  badWord(str: string): string {
    return str;
  }

  html(str: string): string {
    return str;
  }

  commentName(str: string): string {
    return str;
  }
}
