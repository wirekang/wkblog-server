import { PostSource } from 'interfaces';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('postSource')
export default class PostSourceModel implements PostSource {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  postId!: number;

  @Column({ type: 'text' })
  markdown!: string;

  @Column()
  tagNamesComma!: string;
}
