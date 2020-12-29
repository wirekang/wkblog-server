import { getModelForClass, prop } from '@typegoose/typegoose';
import { Comment } from 'db/models/Comment';

export class Post {
  @prop()
  _id!: number;

  @prop({ trim: true, maxlength: 50 })
  title!: string;

  @prop({ trim: true, maxlength: 200 })
  description!: string;

  @prop({ type: String, trim: true, maxlength: 20 })
  tags!: string[];

  @prop({ trim: true, maxlength: 10000 })
  html!: string;

  @prop({ type: Comment, _id: false })
  comments!: Comment[];

  @prop()
  published!: boolean;

  @prop()
  createdAt!: number;

  @prop()
  updatedAt!: number;

  @prop({ default: 0 })
  publishedAt!: number;
}

export default getModelForClass(Post, {
  schemaOptions: {
    versionKey: false,
  },
});
