import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
class QuestionInputBase {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;
}
@InputType()
export class CreateQuestionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  surveyIds?: number[];
}
@InputType()
export class UpdateQuestionInput extends QuestionInputBase {}
