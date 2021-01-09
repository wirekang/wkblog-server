import { Tag } from 'interfaces';
import {
  Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tag')
export default class TagModel implements Tag {
  @PrimaryGeneratedColumn()
  id!:number;

  @Column()
  name!: string;
}
