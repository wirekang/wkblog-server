/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import 'reflect-metadata';
import Config from 'Config';
import {
  Action,
  ActionType,
  Auth,
  Comment, CommentDeleteInput, CommentInput,
  CommentUpdateInput, Dao, DBOption, Filter, Post, PostInput,
  PostSummary, PostUpdateInput, Service,
} from 'interfaces';
import { Container, injectable } from 'inversify';
import MyService from 'service';
import TYPES from 'Types';

@injectable()
class DAO4Test implements DAO {
  async connect(option: DBOption): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async close(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async createPost(input: PostInput): Promise<number> {
    return 1;
  }

  updatePost(input: PostUpdateInput): Promise<void> {
    throw new Error('Method not implemented.');
  }

  publishPost(id: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  hidePost(id: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  readPost(id: number, admin: boolean): Promise<Post> {
    throw new Error('Method not implemented.');
  }

  readPostCount(admin: boolean, tagId?: number): Promise<number> {
    throw new Error('Method not implemented.');
  }

  readPosts(offset: number, count: number, admin: boolean, tagId?: number): Promise<PostSummary[]> {
    throw new Error('Method not implemented.');
  }

  deletePost(id: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  createComment(input: CommentInput, admin: boolean): Promise<number> {
    throw new Error('Method not implemented.');
  }

  updateComment(input: CommentUpdateInput, admin: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }

  readComments(postId: number): Promise<Comment[]> {
    throw new Error('Method not implemented.');
  }

  deleteComment(input: CommentDeleteInput, admin: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

@injectable()
class Filter4Test implements Filter {
  escapeHTML(html: string): string {
    return html;
  }
}

@injectable()
class Auth4Test implements Auth {
  login(id: string, pw: string): string {
    return 'z';
  }

  validate(hash: string): void {
    console.log(hash);
  }

  isLogin(hash: string): boolean {
    return hash === 'z';
  }
}

describe('서비스', () => {
  Config.parse('.test-config');
  const container = new Container();
  container.bind<Service>(TYPES.Service).to(MyService);
  container.bind<Dao>(TYPES.Dao).to(DAO4Test);
  container.bind<Auth>(TYPES.Auth).to(Auth4Test);
  container.bind<Filter>(TYPES.Filter).to(Filter4Test);

  const service = container.get<Service>(TYPES.Service);
  const dao = container.get<Dao>(TYPES.Dao);
  const auth = container.get<Auth>(TYPES.Auth);
  const filter = container.get<Filter>(TYPES.Filter);

  it('', async () => {
    const result = await service.onLogin('z', 'z');
    console.log(result);
  });
});

/*
테스트용 객체들이 리턴하는 값을 서비스가 똑바로 리턴하는지,
논리적인 단계?도 다 맞는지 확인

*/
