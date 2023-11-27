import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Question } from '../question/question.entity';
import { Option } from '../option/option.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (question) => question.answers)
  question: Question;

  @ManyToOne(() => Option, (option) => option.answers)
  selectedOption: Option;
}
