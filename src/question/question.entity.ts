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

  @Field(() => Survey)
  @ManyToOne(() => Survey, (survey) => survey.questions)
  survey: Survey;

  @Field(() => [Option])
  @OneToMany(() => Option, (option) => option.question)
  options: Option[];

  @Field(() => [Answer])
  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}
