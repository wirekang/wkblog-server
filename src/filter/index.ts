/* eslint-disable class-methods-use-this */
import { Filter } from 'interfaces';
import escapeHtml from 'escape-html';

export default class MyFilter implements Filter {
  escapeHTML(text: string): string {
    return escapeHtml(this.filter(text));
  }

  filter(text: string): string {
    return text.trim().replaceAll('wirekang', '');
  }
}
