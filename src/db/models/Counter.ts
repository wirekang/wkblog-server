import { getModelForClass, prop } from '@typegoose/typegoose';

export class Counter {
  @prop({ unique: true, index: true })
  coll!: string;

  @prop({ default: 0 })
  nextID!: number;
}

export default getModelForClass(Counter, {
  schemaOptions: { versionKey: false },
});
