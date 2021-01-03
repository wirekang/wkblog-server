import 'reflect-metadata';
import Auth from 'auth';
import Config from 'Config';

describe('Auth', () => {
  Config.parse('.config');
  const auth = new Auth();
  it('login', () => {
    const hash = auth.login('qwer', 'asdffds');
    expect(auth.validate(hash)).toBe(false);
  });
});
