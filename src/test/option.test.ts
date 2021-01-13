import Option from 'Option';

describe('Option 테스트', () => {
  it('CI환경 아닐경우 파일 읽기', async () => {
    if (process.env.CI) {
      return;
    }
    expect(Option.dao()).not.toBeUndefined();
  });

  it('없는 파일 읽기', async () => {
    process.env.SERVER_PORT = '12341234';
    Option.loadConfig('notexistsfile123');
    expect(Option.server().port).toBe(12341234);
  });
});
