import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Question } from '../question/question.entity';
import { Option } from '../option/option.entity';
import { BaseEntity } from '../base/base.entity';
import { ObjectType, Field, Int } from '@nestjs/graphql';
@ObjectType()
@Entity()
export class Answer extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Question)
  @ManyToOne(() => Question, (question) => question.answers)
  question: Question;

  @Field(() => Option)
  @ManyToOne(() => Option, (option) => option.answers)
  selectedOption: Option;
}
