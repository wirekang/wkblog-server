import 'reflect-metadata';
import MyAuth from 'auth';
import Config from 'Config';

describe('Auth', () => {
  Config.parse('.test-config');
  const auth = new MyAuth();
  it('login, validate expire', async () => {
    const hash = auth.login('idid', 'pwpw');
    expect(auth.isLogin(hash)).toBeTruthy();
    auth.validate(hash);
    await new Promise<void>((r) => setTimeout(() => r(), 4901));
    expect(auth.validate.bind(null, hash)).toThrowError();
  });
});
