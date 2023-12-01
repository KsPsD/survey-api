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
import { Answer } from '../answer/answer.entity';

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

  @Field(() => [SurveyQuestion], { nullable: true })
  @OneToMany(() => SurveyQuestion, (surveyQuestion) => surveyQuestion.survey)
  surveyQuestions: SurveyQuestion[];

  @Field()
  @Column({ default: false })
  isCompleted: boolean;

  @Field(() => [Answer], { nullable: true })
  @OneToMany(() => Answer, (answer) => answer.survey)
  answers: Answer[];
}

@ObjectType()
@Entity()
export class SurveyQuestion extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Survey)
  @ManyToOne(() => Survey, (survey) => survey.surveyQuestions)
  @JoinColumn({ name: 'surveyId' })
  survey: Survey;

  @Field(() => Question)
  @ManyToOne(() => Question, (question) => question.surveyQuestions)
  @JoinColumn({ name: 'questionId' })
  question: Question;
}
