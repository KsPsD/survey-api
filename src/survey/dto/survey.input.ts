import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsInt,
} from 'class-validator';
import { CreateAnswerInput } from '../../answer/dto/answer.input';

@InputType()
class SurveyInputBase {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
@InputType()
export class CreateSurveyInput extends SurveyInputBase {
  @Field()
  @IsString()
  title: string;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  questionIds?: number[];
}
@InputType()
export class UpdateSurveyInput extends SurveyInputBase {}

@InputType()
export class CompleteSurveyInput extends SurveyInputBase {
  @Field(() => [CreateAnswerInput])
  answers: CreateAnswerInput[];
}
