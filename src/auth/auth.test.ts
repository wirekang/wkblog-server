import 'reflect-metadata';
import Auth from 'auth';
import Config from 'Config';

describe('Auth', () => {
  Config.parse('.config');
  const auth = new Auth();
  it('login', () => {
    expect(auth.login('qwer', 'asdffds')).toBeFalsy();
  });
});
