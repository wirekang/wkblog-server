/* eslint-disable class-methods-use-this */
import escapeHtml from 'escape-html';
import { Filter } from 'interfaces';
import { injectable } from 'inversify';

@injectable()
export default class MyFilter implements Filter {
  badWord(str: string): string {
    return str;
  }

  html(str: string): string {
    return escapeHtml(this.badWord(str));
  }

  commentName(str: string): string {
    return this.html(str).replace(/wirekang/g, '');
  }
}
