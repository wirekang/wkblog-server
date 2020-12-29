import { getModelForClass, prop } from '@typegoose/typegoose';

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

export default getModelForClass(Comment, {
  schemaOptions: { versionKey: false, _id: false },
});
