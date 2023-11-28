import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Question } from '../question/question.entity';
import { Answer } from '../answer/answer.entity';
import { BaseEntity } from '../base/base.entity';

@Entity()
export class Option extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  score: number;

  @ManyToOne(() => Question, (question) => question.options)
  question: Question;

  @OneToMany(() => Answer, (answer) => answer.selectedOption)
  answers: Answer[];
}
