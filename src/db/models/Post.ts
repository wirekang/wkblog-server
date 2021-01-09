import { TagModel, CommentModel } from 'db/models';
import { Post } from 'interfaces';
import {
  Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('post')
export default class PostModel implements Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  html!: string;

  @Column({ default: false })
  published!: boolean;

  @Column({ type: 'bigint' })
  whenCreated!: number;

  @Column({ type: 'bigint', default: 0 })
  whenUpdated!: number;

  @Column({ type: 'bigint' })
  whenPublished!: number;

  @ManyToMany(() => TagModel)
  @JoinTable({})
  tags!: TagModel[];

  @OneToMany(() => CommentModel, (cm) => cm.post)
  comments!: CommentModel[];
}
