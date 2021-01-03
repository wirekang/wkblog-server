import {
  Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tag')
export default class TagModel {
  @PrimaryGeneratedColumn()
  id!:number;

  @Column()
  name!: string;
}
