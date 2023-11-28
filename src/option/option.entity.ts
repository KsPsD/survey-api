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
import { ObjectType, Field, Int } from '@nestjs/graphql';
@ObjectType()
@Entity()
export class Option extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  content: string;

  @Field()
  @Column()
  score: number;

  @Field(() => Question)
  @ManyToOne(() => Question, (question) => question.options)
  question: Question;

  @Field(() => [Answer])
  @OneToMany(() => Answer, (answer) => answer.selectedOption)
  answers: Answer[];
}
