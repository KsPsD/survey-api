import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Question } from '../question/question.entity';
import { BaseEntity } from '../base/base.entity';

@Entity()
export class Survey extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Question, (question) => question.survey)
  questions: Question[];

  @Column({ default: false })
  isCompleted: boolean;
}
