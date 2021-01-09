import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
} from 'typeorm';
import { PostModel } from 'db/models';
import { Comment } from 'interfaces';

@Entity('comment')
export default class CommentModel implements Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ default: false })
  admin!: boolean;

  @Column()
  password!: string;

  @Column()
  text!: string;

  @Column({ default: false })
  updated!: boolean;

  @Column({ type: 'bigint' })
  whenCreated!: number;

  @Column({ type: 'bigint', default: 0 })
  whenUpdated!: number;

  @Column()
  postId!: number;

  @ManyToOne(() => PostModel, (pm) => pm.comments,
    { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  post!: PostModel;

  @Column({ nullable: true })
  parentId!: number | null;

  @ManyToOne(() => CommentModel, (cm) => cm.children,
    { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  parent!: CommentModel;

  @OneToMany(() => CommentModel, (cm) => cm.parent)
  children!: CommentModel[];
}
