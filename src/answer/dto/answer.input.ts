import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsNotEmpty, IsInt } from 'class-validator';

@InputType()
class AnswerInputBase {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  questionId?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  selectedOptionId?: number;
}

@InputType()
export class CreateAnswerInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  questionId: number;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  selectedOptionId: number;
}

@InputType()
export class UpdateAnswerInput extends AnswerInputBase {}
