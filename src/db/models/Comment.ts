import { prop } from '@typegoose/typegoose';

export class Comment {
  @prop()
  num!: number;

  @prop({ trim: true })
  name!: string;

  @prop()
  passwordHash!: string;

  @prop({ trim: true, maxlength: 1000 })
  text!: string;

  @prop()
  createdAt!: number;

  @prop()
  updatedAt!: number;
}

export interface ICommentInput {
  name: Comment['name'],
  passwordHash: Comment['passwordHash'],
  text: Comment['text'],
}
