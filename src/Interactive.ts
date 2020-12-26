import fs from 'fs';
import readline from 'readline';
import utils from 'utils';

type Action = 'create' | 'update' | 'publish';

type State = 'main' | Action

export default class Interactive {
  getFileList!: ()=>string[];

  select!: (action: Action, file:string)=>Promise<void>;

  state: State = 'main';

  private log

  private msg;

  constructor() {
    this.msg = 'init';
    this.log = utils.makeLog('IT');
    readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    }).on('line', (input) => (this.onLine(input)));
    process.stdin.on('SIGINT', () => (process.exit(0)));
    this.print();
  }

  private getMenu():string {
    if (this.state === 'main') {
      return '1: create\n2: update\n3: publish';
    }
    return `0: all\n${this.getFileList().map((v, i) => (`${i + 1}: ${v}`)).join('\n')}`;
  }

  private print():void {
    console.clear();
    console.log(this.msg);
    console.log('------------');
    console.log(this.getMenu());
  }

  private onLine(input: string):void {
    try {
      console.clear();
      const n = parseInput(input);
      if (this.checkMainInput(n)) {
        this.print();
        return;
      }
      const list = this.getFileList();
      if (n === 0) {
        const recursive = async (i = list.length - 1) => {
          if (i > 0) {
            await recursive(i - 1);
          }
          await this.select(this.state as Action, list[i]);
        };
        recursive().then(() => (this.print()));
        return;
      }
      this.select(this.state as Action, list[n - 1]).then(() => (this.print()));
    } catch (e) {
      this.msg = String(e);
      this.state = 'main';
      this.print();
    }
  }

  private checkMainInput(n:number):boolean {
    if (this.state !== 'main') {
      return false;
    }
    if (n === 1) {
      this.state = 'create';
    }
    if (n === 2) {
      this.state = 'update';
    }
    if (n === 3) {
      this.state = 'publish';
    }
    this.msg = this.state;
    return true;
  }
}
function parseInput(input: string):number {
  const n = parseInt(input, 10);
  if (Number.isNaN(n)) {
    throw new Error('n = NaN');
  }
  if (n < 0) {
    throw new Error('n < 0');
  }
  return n;
}
