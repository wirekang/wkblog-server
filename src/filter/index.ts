/* eslint-disable class-methods-use-this */
import { Filter as IFilter } from 'interfaces';
import escapeHtml from 'escape-html';

export default class Filter implements IFilter {
  escapeHTML(text: string): string {
    return escapeHtml(this.filter(text));
  }

  filter(text: string): string {
    return text;
  }
}
