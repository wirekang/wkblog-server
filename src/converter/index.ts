import * as I from 'interfaces';
import { injectable } from 'inversify';
import showdown, { Converter } from 'showdown';

@injectable()
export default class MyConverter implements I.Converter {
  private converter:Converter;

  constructor() {
    this.converter = new showdown.Converter({
      noHeaderId: true,
      openLinksInNewWindow: true,
    });
  }

  toHtml(markdown: string): string {
    return this.converter.makeHtml(markdown);
  }
}
