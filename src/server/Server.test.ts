import * as Server from 'server/Server';
import request from 'request-promise-native';

const port = 8081;

describe('Server', () => {
  test('open', async () => {
    await Server.open(port);
  });

  test('close', async () => {
    await Server.close();
  });
});
