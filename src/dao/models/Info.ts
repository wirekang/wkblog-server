import {
  Column, Entity, OneToMany, PrimaryColumn,
} from 'typeorm';
import * as I from 'interfaces';
import { LinkModel } from 'dao/models';

@Entity('info')
export default class InfoModel implements I.Info {
  @PrimaryColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  href!: string;

  @OneToMany(() => LinkModel, (lm) => lm.info)
  links!: LinkModel[];
}
