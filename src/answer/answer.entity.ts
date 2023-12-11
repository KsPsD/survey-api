import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Question } from '../question/question.entity';
import { Option } from '../option/option.entity';
import { BaseEntity } from '../base/base.entity';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Survey } from '../survey/survey.entity';
@ObjectType()
@Entity()
export class Answer extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Question)
  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  question: Question;

  @Field(() => [Option])
  @ManyToMany(() => Option, (option) => option.answers)
  @JoinTable()
  selectedOptions: Option[];

  @Field(() => Survey)
  @ManyToOne(() => Survey, (survey) => survey.answers)
  @JoinColumn({ name: 'surveyId' })
  survey: Survey;
}
