import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from '../question/question.entity';
import { BaseEntity } from '../base/base.entity';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Survey extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @OneToMany(() => SurveyQuestion, (surveyQuestion) => surveyQuestion.survey)
  surveyQuestions: SurveyQuestion[];

  @Field()
  @Column({ default: false })
  isCompleted: boolean;
}

@Entity()
export class SurveyQuestion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Survey, (survey) => survey.surveyQuestions)
  @JoinColumn({ name: 'surveyId' })
  survey: Survey;

  @ManyToOne(() => Question, (question) => question.surveyQuestions)
  @JoinColumn({ name: 'questionId' })
  question: Question;
}
