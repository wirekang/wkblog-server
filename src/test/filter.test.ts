import 'reflect-metadata';
import Filter from 'filter';

describe('Filter', () => {
  const filter = new Filter();
  it('html', () => {
    const input = '<h1>Hello</h1>\n<p>let str = "I am "';
    expect(filter.html(input)).toBe('&lt;h1&gt;Hello&lt;/h1&gt;\n'
    + '&lt;p&gt;let str = &quot;I am &quot;');
  });

  it('commentName', () => {
    const input = 'zwirekangz';
    expect(filter.commentName(input)).toBe('zz');
  });
});
