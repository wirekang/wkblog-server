import utils from 'utils';

test('makeLog', () => {
  const log = utils.makeLog('head');
  log('hello');
});

test('getHash', () => {
  const src = '동해물과 백두산이 마르고 닳ㅅㄷ마ㅓ;이ㅏㅓㅈㄷ;비ㅏㅓㅇㄹ;ㅣ';
  expect(utils.getHash(src)).toBe('179CB2F5681751096E1A4A3772C83E0082073B73'.toLowerCase());
});
