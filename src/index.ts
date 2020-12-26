import Config from 'Config';
import Service from 'Service';
import readline from 'readline';
import path from 'path';
import Interactive from 'Interactive';

const DELAY_FIRST = 3;
const DELAY_ACTION = 3;

async function wait(mil: number):Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => (resolve()), mil);
  });
}

async function clearLine(repeat = 1):Promise<void> {
  return new Promise((resolve) => {
    readline.moveCursor(process.stdout, 0, -1 * repeat, () => {
      readline.clearScreenDown(process.stdout, () => (resolve()));
    });
  });
}

async function countDown(n:number):Promise<void> {
  for (let i = n; i > 0; i -= 1) {
    console.log(i);
    // eslint-disable-next-line no-await-in-loop
    await wait(1000);
    // eslint-disable-next-line no-await-in-loop
    await clearLine();
  }
  console.clear();
}

(async () => {
  const srcPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2]) : process.cwd();

  console.log(srcPath);

  try {
    Config.parse(srcPath);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  const service = new Service(srcPath);

  try {
    await service.connect();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  await countDown(DELAY_FIRST);

  const it = new Interactive();
  it.getFileList = () => (service.mds);
  it.select = async (action, file) => {
    console.log(file);
    if (action === 'create') {
      await service.create(file);
    }
    if (action === 'update') {
      await service.update(file);
    }
    if (action === 'publish') {
      await service.publish(file);
    }
    await countDown(DELAY_ACTION);
  };
})();
