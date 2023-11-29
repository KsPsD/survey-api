import { Entity, PrimaryGeneratedColumn, Column, OneToMany, In } from 'typeorm';
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

  @Field(() => [Question], { nullable: true })
  @OneToMany(() => Question, (question) => question.survey, {
    cascade: true,
  })
  questions: Question[];

  @Field()
  @Column({ default: false })
  isCompleted: boolean;
}
