/* eslint-disable class-methods-use-this */
import { Converter } from 'interfaces';
import { injectable } from 'inversify';

@injectable()
export default class ConverterMock implements Converter {
  toHtml(markdown: string): string {
    return markdown;
  }
}
