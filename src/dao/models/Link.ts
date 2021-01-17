import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import * as I from 'interfaces';
import { InfoModel } from 'dao/models';

@Entity('link')
export default class LinkModel implements I.Link {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  href!: string;

  @ManyToOne(() => InfoModel, (im) => im.links,
    { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  info!: InfoModel;

  @Column()
  infoId!: number;
}
