import utils from 'utils';
import fs from 'fs';
import path from 'path';
import DAO from 'DAO';
import showdown from 'showdown';

export default class Service {
  private log

  private srcPath:string;

  mds:string[];

  private dao:DAO;

  private converter: showdown.Converter;

  constructor(srcPath: string) {
    this.log = utils.makeLog('Service');
    this.srcPath = srcPath;

    this.dao = new DAO();

    this.converter = new showdown.Converter({
      noHeaderId: true,
    });

    this.mds = [];
    fs.readdirSync(this.srcPath).forEach((file) => {
      if (file.endsWith('.md')) {
        this.mds.push(file);
        this.log(file);
      }
    });
  }

  async connect():Promise<void> {
    await this.dao.connect();
  }

  private parseMD(file: string):{title:string, tags:string[], html:string} {
    let src = fs.readFileSync(path.join(this.srcPath, file)).toString('utf-8');
    const nlIndex = () => (src.indexOf('\n'));

    const title = src.substr(0, nlIndex());
    src = src.substr(nlIndex() + 1);

    const tags = src.substr(0, nlIndex()).split(',').map((v) => (v.trim()));
    src = src.substr(nlIndex() + 1);

    const html = this.converter.makeHtml(src);

    return { title, tags, html };
  }

  async create(file: string):Promise<void> {
    const { title, tags, html } = this.parseMD(file);
    this.log(`${file}: ${title}`);
    await this.dao.createPost({
      _id: file.replace('.md', ''),
      title,
      html,
      tags,
    });
  }

  async update(file: string):Promise<void> {
    const { title, tags, html } = this.parseMD(file);
    this.log(`${file}: ${title}`);
    await this.dao.updatePost({
      _id: file.replace('.md', ''),
      title,
      html,
      tags,
    });
  }

  async publish(file: string):Promise<void> {
    const { title, tags, html } = this.parseMD(file);
    this.log(`${file}: ${title}`);
    await this.dao.publishPost({
      _id: file.replace('.md', ''),
      title,
      html,
      tags,
    });
  }

  async withdraw(file: string):Promise<void> {
    const { title, tags, html } = this.parseMD(file);
    this.log(`${file}: ${title}`);
    await this.dao.withDrawPost({
      _id: file.replace('.md', ''),
      title,
      html,
      tags,
    });
  }
}
