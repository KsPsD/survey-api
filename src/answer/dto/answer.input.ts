import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsNotEmpty, IsInt, IsArray } from 'class-validator';

@InputType()
class AnswerInputBase {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  questionId?: number;

  @Field(() => [Int], { nullable: true })
  @IsArray()
  @IsOptional()
  selectedOptionIds?: number[];
}

@InputType()
export class CreateAnswerInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  questionId: number;

  @Field(() => [Int])
  @IsArray()
  @IsNotEmpty()
  selectedOptionIds: number[];
}

@InputType()
export class UpdateAnswerInput extends AnswerInputBase {}
