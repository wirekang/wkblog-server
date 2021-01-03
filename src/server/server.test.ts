import Server from 'server';
import request from 'request-promise-native';

const port = 8081;

describe('Server', () => {
  const server = new Server(port);
  test('open', async () => {
    await server.open();
  });

  test('close', async () => {
    await server.close();
  });
});
