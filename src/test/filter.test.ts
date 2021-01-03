import Filter from 'filter';

describe('Filter', () => {
  const filter = new Filter();
  it('escapeHTML', () => {
    const input = '<h1>Hello</h1>\n<p>let str = "I am wirekang"';
    expect(filter.escapeHTML(input)).toBe('&lt;h1&gt;Hello&lt;/h1&gt;\n'
    + '&lt;p&gt;let str = &quot;I am &quot;');
  });
});
