import MyServer from 'server';
import request from 'request-promise-native';

const port = 8081;

describe('Server', () => {
  const server = new MyServer();
  test('open', async () => {
    await server.open({ port });
  });

  test('close', async () => {
    await server.close();
  });
});
