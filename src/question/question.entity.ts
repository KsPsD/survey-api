import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Survey, SurveyQuestion } from '../survey/survey.entity';
import { Option } from '../option/option.entity';
import { Answer } from '../answer/answer.entity';
import { BaseEntity } from '../base/base.entity';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Question extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  content: string;

  @OneToMany(() => SurveyQuestion, (surveyQuestion) => surveyQuestion.question)
  surveyQuestions: SurveyQuestion[];

  @Field(() => [Option], { nullable: true })
  @OneToMany(() => Option, (option) => option.question, {
    cascade: true,
  })
  options: Option[];

  @Field(() => [Answer], { nullable: true })
  @OneToMany(() => Answer, (answer) => answer.question, {
    cascade: true,
  })
  answers: Answer[];
}
