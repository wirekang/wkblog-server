import 'reflect-metadata';
import MyAuth from 'auth';
import Option from 'Option';
import { Auth } from 'interfaces';
import utils from 'utils';

describe('Auth', () => {
  const auth:Auth = new MyAuth();
  let hash = '';
  const option = Option.auth();
  auth.init(option);
  it('로그인', () => {
    hash = auth.login('id', 'pw');
    expect(auth.isLogin(hash)).toBeTruthy();
    auth.validate(hash);
  });
  it('잘못된 인증', () => {
    expect(auth.isLogin('w2ewwerasdfasdvw2ewfsscxv')).toBeFalsy();
    expect(auth.validate.bind(auth, 'asdfqwerksdfj')).toThrowError();
  });
  it('인증', async () => {
    auth.validate(hash);
  });
  it('수명 확인', async () => {
    await utils.wait(option.maxAge);
    expect(auth.validate.bind(auth, hash)).toThrowError();
  });
});
