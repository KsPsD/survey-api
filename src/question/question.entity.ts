import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Survey } from '../survey/survey.entity';
import { Option } from '../option/option.entity';
import { Answer } from '../answer/answer.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => Survey, (survey) => survey.questions)
  survey: Survey;

  @OneToMany(() => Option, (option) => option.question)
  options: Option[];

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}
