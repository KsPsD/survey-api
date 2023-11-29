import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsNotEmpty, IsInt } from 'class-validator';

@InputType()
class OptionInputBase {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;
}

@InputType()
export class CreateOptionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  score: number;

  @Field(() => Int)
  @IsInt()
  questionId: number;
}

@InputType()
export class UpdateOptionInput extends OptionInputBase {}
